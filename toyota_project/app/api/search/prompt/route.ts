import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { CarFilters, Car } from "@/types"
import { getToyotaInventory } from "@/lib/toyota-api"
import { getDealerByKey } from "@/lib/dealers"


export async function POST(request: NextRequest) {
  console.log("[API Route] ===== REQUEST RECEIVED =====")
  console.log("[API Route] Timestamp:", new Date().toISOString())

  try {
    // Step 1: Parse request body
    console.log("[API Route] Step 1: Parsing request body...")
    const body = await request.json()
    console.log("[API Route] Request body:", JSON.stringify(body, null, 2))

    const { description } = body

    if (!description || description.trim().length === 0) {
      console.error("[API Route] Error: Description is missing or empty")
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    console.log("[API Route] ✓ Description received:", description.substring(0, 100) + "...")

    // Step 2: Check for Gemini API key
    console.log("[API Route] Step 2: Checking Gemini API key...")
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.error("[API Route] ✗ GEMINI_API_KEY not found in environment variables")
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable." },
        { status: 500 },
      )
    }
    console.log("[API Route] ✓ Gemini API key found")

    // Step 3: Initialize Gemini AI
    console.log("[API Route] Step 3: Initializing Gemini AI...")
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    console.log("[API Route] ✓ Gemini AI initialized")

    // Step 4: Create prompt for Gemini
    console.log("[API Route] Step 4: Creating extraction prompt...")
    const prompt = createExtractionPrompt(description)
    console.log("[API Route] ✓ Prompt created")
    console.log("[API Route] ===== GEMINI PROMPT START =====")
    console.log(prompt)
    console.log("[API Route] ===== GEMINI PROMPT END =====")

    // Step 5: Call Gemini API
    console.log("[API Route] Step 5: Calling Gemini API...")
    console.log("[API Route] Description preview:", description.substring(0, 100))

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("[API Route] ✓ Gemini API response received")
    console.log("[API Route] ===== GEMINI FULL RESPONSE START =====")
    console.log(text)
    console.log("[API Route] ===== GEMINI FULL RESPONSE END =====")

    // Step 6: Parse Gemini's JSON response
    console.log("[API Route] Step 6: Parsing Gemini response...")
    const filters = parseGeminiResponse(text)
    
    // Log parsed filters for debugging
    console.log("[Prompt Search] Parsed filters:", JSON.stringify(filters, null, 2))

    // Heuristic: detect dealership from raw description if Gemini did not set it
    const descLower = description.toLowerCase()
    if (!(filters as any).dealership && !(filters as any).dealerships) {
      if (descLower.includes("dallas")) {
        ;(filters as any).dealership = "dallas"
        console.log("[Prompt Search] Heuristic set dealership to dallas based on description")
      } else if (descLower.includes("plano")) {
        ;(filters as any).dealership = "plano"
        console.log("[Prompt Search] Heuristic set dealership to plano based on description")
      } else if (descLower.includes("richardson")) {
        ;(filters as any).dealership = "richardson"
        console.log("[Prompt Search] Heuristic set dealership to richardson based on description")
      }
    }

    // Step 7: Prepare filters for Toyota API
    console.log("[API Route] Step 7: Preparing filters for Toyota API...")
    // Use extracted condition if provided, otherwise default to "both" to show all vehicles
    const condition = filters.condition || "both"

    const toyotaBaseFilters = {
      priceRange: filters.priceRange,
      priceRanges: filters.priceRanges, 
      year: filters.year, 
      yearRange: filters.year ? undefined : undefined, 
      trim: filters.trim,
      fuelType: filters.fuelType,
      bodyStyle: filters.bodyStyle,
      color: filters.color,
      mileage: filters.mileage, 
      condition: condition as "new" | "used" | "both",
      interiorColor: filters.interiorColor,
      transmission: filters.transmission,
      options: filters.options,
      highwayMpg: filters.highwayMpg,
      cityMpg: filters.cityMpg,
      overallMpg: filters.overallMpg,
      interiorMaterial: filters.interiorMaterial,
      engine: filters.engine,
      driveLine: filters.driveLine,
      vehicleStatus: filters.vehicleStatus,
      // Pass-through for dealer selection (if provided via query in the future)
      dealership: (filters as any).dealership,
      dealerships: (filters as any).dealerships,
    }

    console.log("[API Route] ✓ Condition filter:", condition, filters.condition ? "(from Gemini)" : "(defaulting to both)")
    
    // Decide models to query: prefer models[] if present. If generic + sedan, expand to multiple sedan models.
    const lowerDesc = description.toLowerCase()
    const explicitModels = [
      "camry",
      "corolla",
      "prius",
      "crown",
      "rav4",
      "highlander",
      "4runner",
      "sequoia",
      "venza",
      "tacoma",
      "tundra",
      "sienna",
      "bz4x",
      "supra",
      "gr86",
    ]
    const userMentionedSpecificModel = explicitModels.some((m) => lowerDesc.includes(m))

    const candidateSedanModels = ["Camry", "Corolla", "Prius", "Crown"]

    let modelsToQuery =
      (filters.models && filters.models.length > 0 && filters.models.slice(0, 5)) ||
      (filters.model ? [filters.model] : [null])

    
    // expanding to several sedan models to diversify results.
    if (
      !userMentionedSpecificModel &&
      (((filters.bodyStyle || "").toLowerCase() === "sedan") || lowerDesc.includes("sedan")) &&
      modelsToQuery.filter(Boolean).length <= 1
    ) {
      const seed = modelsToQuery[0] ? [modelsToQuery[0] as string] : []
      modelsToQuery = Array.from(new Set([...seed, ...candidateSedanModels])).slice(0, 5)
    }

    console.log("[API Route] ✓ Models to query:", modelsToQuery)

    //  Fetch cars from Toyota API
    console.log("[API Route] Step 8: Fetching cars from Toyota API...")
    console.log("[API Route] Number of models to query:", modelsToQuery.length)

    const fetches = modelsToQuery.map((mdl) =>
      getToyotaInventory({
        ...toyotaBaseFilters,
        model: mdl || undefined,
      }),
    )
    const results = await Promise.all(fetches)
    const combined = results.flat()
    console.log("[API Route] ✓ Retrieved", combined.length, "vehicles from Toyota API (combined)")

    // Transform to Car format
    console.log("[API Route] Step 9: Transforming vehicles to Car format...")
    const cars: Car[] = combined
      .map((vehicle) => ({
        id: vehicle.id,
        name: `${vehicle.year} Toyota ${vehicle.model}${vehicle.trim ? " " + vehicle.trim : ""}`,
        model: vehicle.model,
        make: vehicle.make,
        price: vehicle.internetPrice || vehicle.askingPrice || 0,
        year: vehicle.year,
        mileage: vehicle.mileage,
        color: vehicle.exteriorColor,
        fuelType: vehicle.fuelType,
        mpg: Math.round((vehicle.cityMpg + vehicle.highwayMpg) / 2),
        imageUrl:
          vehicle.imageUrl || `/placeholder.svg?height=300&width=400&query=Toyota ${vehicle.model} ${vehicle.year}`,
        specs: {
          transmission: vehicle.transmission,
          engine: vehicle.engine,
          seats: vehicle.seats || 5,
        },
        ecoRating: calculateEcoRating(vehicle.fuelType, vehicle.cityMpg, vehicle.highwayMpg),
        isNew: vehicle.isNew,
        dealer: (() => {
          const key = (vehicle as any).dealer as string | undefined
          const dealer = getDealerByKey(key)
          return dealer?.displayName
        })(),
        dealerKey: (vehicle as any).dealer as string | undefined,
      }))
      .filter((car) => car.price > 0) 

    console.log("[API Route] ✓ Transformed", cars.length, "vehicles")

    //  Score and diversify results
    console.log("[API Route] Step 10: Scoring and diversifying results...")
    const scored = scoreAndSortCars(cars, filters)
    const diversified = diversifyByModel(scored, { maxPerModel: 3, limit: 10 })
    console.log("[API Route] ✓ Final results:", diversified.length, "vehicles")

    //  Return success response
    console.log("[API Route] Step 11: Returning success response...")
    const successResponse = {
      success: true,
      filters: filters,
      cars: diversified, 
      totalResults: cars.length,
      message: `Found ${cars.length} vehicles matching your description`,
    }

    console.log("[API Route] ===== SUCCESS RESPONSE =====")
    console.log("[API Route] Response summary:", {
      success: true,
      totalResults: cars.length,
      returnedCars: diversified.length,
      filtersApplied: Object.keys(filters).length,
    })
    console.log("[API Route] ===== REQUEST COMPLETE =====")

    return NextResponse.json(successResponse, { status: 200 })
  } catch (error) {
    console.error("[API Route] ===== ERROR OCCURRED =====")
    console.error("[API Route] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[API Route] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[API Route] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[API Route] Full error object:", error)

    const errorResponse = {
      error: error instanceof Error ? error.message : "Failed to process request",
      details: error instanceof Error ? error.stack : String(error),
    }

    console.log("[API Route] Returning error response:", errorResponse)
    console.log("[API Route] ===== REQUEST FAILED =====")

    return NextResponse.json(errorResponse, { status: 500 })
  }
}


function createExtractionPrompt(description: string): string {
  return `You are a Toyota car search assistant. Analyze the following user description and extract car search filter criteria. Your job is to recommend specific Toyota models that match the user's needs, even if they don't explicitly mention model names.

Return ONLY a valid JSON object with the following structure (use null for missing values):

{
  "dealership": "plano" | "dallas" | null,
  "dealerships": ["plano" | "dallas"] | null,
  "priceRange": { "min": number, "max": number } | null,
  "priceRanges": [{ "min": number, "max": number }] | null,
  "year": number | null,
  "condition": "new" | "used" | null,
  "fuelType": "gasoline" | "hybrid" | "electric" | null,
  "model": string | null,
  "models": [string] | null,
  "trim": string | null,
  "color": string | null,
  "mileage": { "min": number, "max": number } | null,
  "bodyStyle": string | null,
  "interiorColor": string | null,
  "transmission": string | null,
  "options": [string] | null,
  "highwayMpg": number | null,
  "cityMpg": number | null,
  "overallMpg": number | null,
  "interiorMaterial": string | null,
  "engine": string | null,
  "driveLine": string | null,
  "vehicleStatus": "In Stock" | "In Transit" | "Build Phase" | null
}

IMPORTANT - MODEL RECOMMENDATION GUIDELINES:
When the user describes what they want (e.g., "sporty sedan", "family SUV", "fuel efficient car"), you MUST recommend specific Toyota models that match their description. Use the "model" field for a single model, or "models" array for multiple matching models.
If the user does not name a specific model and the description is generic, ALWAYS provide a "models" array with 3-5 diverse options that match the body style and attributes. Also include "bodyStyle" when the user mentions sedan/SUV/truck/minivan.

DEALERSHIP SELECTION:
- Map dealership/location mentions to:
  * "Dallas" or "at dallas" → "dallas"
  * "Plano" or "at plano" → "plano"
  * "Richardson" or "at richardson" → "richardson"
- If user explicitly names a dealership/city, set "dealership" to that value and do NOT set the other.
- If user asks for both or doesn't specify, leave "dealership" null (or use "dealerships": ["plano","dallas","richardson"] when multiple are desired).

Toyota Model Guide:
- SEDANS:
  * Sporty/Fun to Drive: Camry (especially SE/XSE trims), Corolla (SE/XSE), GR86, Supra
  * Fuel Efficient: Corolla, Camry Hybrid, Prius, Crown
  * Luxury/Comfort: Camry (XLE/Limited), Crown, Avalon (if available)
  * Compact/Budget: Corolla
  * Midsize: Camry, Crown

- SUVs:
  * Compact SUV: RAV4, Venza
  * Midsize SUV: Highlander, 4Runner
  * Large SUV: Sequoia, Grand Highlander
  * Fuel Efficient SUV: RAV4 Hybrid, Venza, Highlander Hybrid
  * Off-Road: 4Runner, RAV4 (Adventure/TRD), Sequoia

- TRUCKS:
  * Midsize: Tacoma
  * Full-Size: Tundra
  * Off-Road: Tacoma TRD, Tundra TRD

- MINIVANS:
  * Family/Minivan: Sienna (hybrid only)

- ELECTRIC:
  * Electric SUV: bZ4X

- SPORTS CARS:
  * Sports Car: GR86, Supra

Examples:
- "camrys at dallas" → model: "Camry", dealership: "dallas"
- "camry at richardson" → model: "Camry", dealership: "richardson"
- "sporty sedan that's fun to drive but fuel efficient" → bodyStyle: "sedan", models: ["Camry", "Corolla", "Prius", "Crown"], condition: null (show both)
- "I want a brand new 2025 Camry" → model: "Camry", year: 2025, condition: "new"
- "Looking for a used RAV4 under $30,000" → model: "RAV4", priceRange: {min: 0, max: 30000}, condition: "used"
- "Pre-owned Highlander with low mileage" → model: "Highlander", condition: "used", mileage: {min: 0, max: 50000}
- "Camry with under 40000" → model: "Camry", mileage: {min: 0, max: 40000} (no dollar sign = mileage, not price)
- "Camry under $40000" → model: "Camry", priceRange: {min: 0, max: 40000} (dollar sign = price)
- "Used Camry under 40k miles" → model: "Camry", condition: "used", mileage: {min: 0, max: 40000}
- "RAV4 with leather seats and AWD" → model: "RAV4", interiorMaterial: "Leather", driveLine: "AWD"
- "Camry with Apple CarPlay and automatic transmission" → model: "Camry", options: ["Apple CarPlay"], transmission: "Automatic"
- "Highlander with gray interior and at least 30 MPG highway" → model: "Highlander", interiorColor: "Gray", highwayMpg: 30
- "4Runner with 4WD and V6 engine" → model: "4Runner", driveLine: "4WD", engine: "V6 Engine"
- "Sequoia with 3rd row seat and over 20 MPG" → model: "Sequoia", options: ["3rd Row Seat"], overallMpg: 20
- "RAV4 in stock with sunroof and heated seats" → model: "RAV4", vehicleStatus: "In Stock", options: ["Sunroof / Moonroof", "Heated Seats"]
- "Prius with over 40 MPG and LED headlights" → model: "Prius", overallMpg: 40, options: ["LED Headlights"]
- "Tacoma in transit with tow package" → model: "Tacoma", vehicleStatus: "In Transit", options: ["Tow Hitch/Tow Package"]
- "Latest model year Prius" → model: "Prius", condition: "new"
- "Certified Toyota Camry" → model: "Camry", condition: "used" (certified = used)
- "2019 Tacoma" → model: "Tacoma", year: 2019, condition: "used" (older year = used)
- "Family SUV with good cargo space" → models: ["Highlander", "RAV4", "Sequoia"], condition: null (show both)
- "Fuel efficient hybrid" → models: ["Prius", "Camry", "RAV4", "Highlander"], condition: null (show both)
- "Luxury sedan" → models: ["Crown", "Camry"], condition: null (show both)
- "Off-road capable vehicle" → models: ["4Runner", "Tacoma", "RAV4"], condition: null (show both)
- "Compact and affordable" → models: ["Corolla", "RAV4"], condition: null (show both)

OTHER GUIDELINES:
- Extract price ranges from mentions like "$30,000", "under $40k", "around $25,000", "$20k-$30k", "between $25,000 and $35,000"
- IMPORTANT: Distinguish between PRICE and MILEAGE:
  * If user says "under $X" or "below $X" with dollar sign or "price" → PRICE filter
  * If user says "under X miles" or "under Xk miles" or "under X" without dollar sign and context suggests mileage → MILEAGE filter
  * If ambiguous (e.g., "under 40000" without context), prefer MILEAGE if user mentions "miles", "mileage", "odometer", or if they're asking about used cars
- For "under $X" or "below $X": create range from 0 to X (e.g., "under $45,000" → min: 0, max: 45000)
- For "over $X" or "above $X": create range from X to 200000 (e.g., "over $30,000" → min: 30000, max: 200000)
- For single price mentions: create a range ±20% of mentioned price (e.g., "$30,000" → min: 24000, max: 36000)
- For explicit ranges: use the exact range (e.g., "$20k-$30k" → min: 20000, max: 30000)
- Round prices to nearest 1000 for cleaner ranges
- Extract year as a single number (e.g., "2024", "2025", "2026")
- Determine condition based on user's description:
  * Set to "new" if user mentions: "new", "brand new", "latest", "recent model", "2024", "2025", "2026", "current year", "latest model year", "just released", "newest"
  * Set to "used" if user mentions: "used", "pre-owned", "certified", "CPO", "second-hand", "previously owned", "older model", "with mileage", "with miles", "has been driven"
  * If user mentions a specific older year (e.g., "2020", "2019") without saying "new", assume "used"
  * If user mentions budget constraints or "affordable" without specifying, they might be open to used - but leave as null to show both
  * If not specified and no clear indicators, leave as null (will show both new and used vehicles)
- Extract fuel type: "hybrid", "electric", "EV", "gas", "gasoline", "diesel"
- Extract body style: "sedan", "SUV", "truck", "coupe", "hatchback", "minivan" based on description
- Extract trim level if mentioned: "LE", "XLE", "SE", "XSE", "Limited", "TRD", "Platinum", "SR5", "SR", etc.
- Extract color preferences if mentioned (e.g., "red", "blue", "black", "white")
- Extract mileage preferences if mentioned:
  * "under X miles" or "less than X miles" → mileage: {min: 0, max: X}
  * "over X miles" or "more than X miles" → mileage: {min: X, max: 500000}
  * "low mileage" → mileage: {min: 0, max: 30000}
  * "high mileage" → mileage: {min: 100000, max: 500000}
  * "between X and Y miles" → mileage: {min: X, max: Y}
  * "X miles or less" → mileage: {min: 0, max: X}
  * Examples: "under 50k miles" → {min: 0, max: 50000}, "low mileage" → {min: 0, max: 30000}
- Extract interior color if mentioned (e.g., "gray interior", "black interior", "beige", "tan", "brown"):
  * Common values: "Gray", "Black", "Beige", "Tan", "Brown", "Ivory", "Cream"
  * Use capitalized first letter format (e.g., "Gray" not "gray")
- Extract transmission type if mentioned:
  * "automatic" or "auto" → transmission: "Automatic"
  * "manual" or "stick shift" → transmission: "Manual"
  * "CVT" → transmission: "CVT"
- Extract vehicle options/features if mentioned (use "options" array):
  * "3rd row seat" or "third row" → options: ["3rd Row Seat"]
  * "alloy wheels" → options: ["Alloy Wheels"]
  * "Apple CarPlay" or "CarPlay" → options: ["Apple CarPlay"]
  * "Android Auto" → options: ["Android Auto"]
  * "automatic climate control" → options: ["Automatic Climate Control"]
  * "automatic cruise control" or "adaptive cruise control" → options: ["Automatic Cruise Control"]
  * "bed liner" → options: ["Bed Liner"]
  * "emergency communication" or "SOS" → options: ["Emergency Communication System"]
  * "fog lights" → options: ["Fog Lights"]
  * "hands-free liftgate" or "power liftgate" → options: ["Hands-Free Liftgate"]
  * "heated seats" → options: ["Heated Seats"]
  * "heated mirrors" or "heated side mirrors" → options: ["Heated Side Mirrors"]
  * "heated steering wheel" → options: ["Heated Steering Wheel"]
  * "lane assist" or "lane keeping assist" → options: ["Lane Assist"]
  * "lane departure warning" → options: ["Lane Departure Warning"]
  * "LED headlights" → options: ["LED Headlights"]
  * "memory seats" → options: ["Memory Seats"]
  * "navigation" or "GPS" or "navigation system" → options: ["Navigation System"]
  * "parking sensors" or "parking assist" → options: ["Parking Sensors / Assist"]
  * "power seats" → options: ["Power Seats"]
  * "premium audio" or "premium sound" → options: ["Premium Audio"]
  * "push button start" or "keyless start" → options: ["Push Button Starting"]
  * "rain sensing wipers" → options: ["Rain Sensing Wipers"]
  * "rear air conditioning" → options: ["Rear Air Conditioning"]
  * "rear heated seats" → options: ["Rear Heated Seats"]
  * "rear sunshade" → options: ["Rear Sunshade"]
  * "backup camera" or "rearview camera" → options: ["Rearview Camera"]
  * "roof rack" → options: ["Roof Rack"]
  * "running boards" → options: ["Running Boards"]
  * "steering wheel controls" → options: ["Steering Wheel Controls"]
  * "sunroof" or "moonroof" → options: ["Sunroof / Moonroof"]
  * "tow hitch" or "tow package" → options: ["Tow Hitch/Tow Package"]
  * "ventilated seats" or "cooled seats" → options: ["Ventilated/Cooled Seats"]
  * "wireless charging" or "wireless phone charging" → options: ["Wireless Phone Charging"]
  * Multiple options: options: ["Apple CarPlay", "Sunroof / Moonroof", "Navigation System"]
- Extract MPG requirements if mentioned:
  * Highway MPG: "highway MPG over X" or "at least X MPG highway" or "X+ highway MPG" → highwayMpg: X
  * City MPG: "city MPG over X" or "at least X MPG city" or "X+ city MPG" → cityMpg: X
  * Overall/Average MPG: "over X MPG" or "at least X MPG" or "X+ MPG" (without specifying city/highway) → overallMpg: X
  * Common overall MPG thresholds: "over 20 MPG" → overallMpg: 20, "over 25 MPG" → overallMpg: 25, "over 30 MPG" → overallMpg: 30, "over 35 MPG" → overallMpg: 35, "over 40 MPG" → overallMpg: 40
  * Examples: 
    - "at least 35 MPG highway" → highwayMpg: 35
    - "highway MPG over 30" → highwayMpg: 30
    - "over 30 MPG" → overallMpg: 30
    - "at least 25 MPG city" → cityMpg: 25
- Extract interior material if mentioned:
  * "leather" or "leather seats" → interiorMaterial: "Leather"
  * "cloth" or "fabric" → interiorMaterial: "Cloth"
  * "synthetic leather" or "leatherette" → interiorMaterial: "Synthetic"
  * Common values: "Leather", "Cloth", "Synthetic"
- Extract engine type/size if mentioned:
  * "4 cylinder" or "4-cyl" or "4 cyl" → engine: "4-Cyl. Engine"
  * "V6" or "6 cylinder" → engine: "V6 Engine"
  * "V8" or "8 cylinder" → engine: "V8 Engine"
  * "turbo" or "turbocharged" → engine: "Turbo Engine" (may need to combine with size)
  * Examples: "4 cylinder engine" → engine: "4-Cyl. Engine", "V6" → engine: "V6 Engine"
- Extract drive type if mentioned:
  * "front wheel drive" or "FWD" → driveLine: "FWD"
  * "all wheel drive" or "AWD" → driveLine: "AWD"
  * "rear wheel drive" or "RWD" → driveLine: "RWD"
  * "4 wheel drive" or "4WD" or "four wheel drive" → driveLine: "4WD"
  * Examples: "AWD" → driveLine: "AWD", "all wheel drive" → driveLine: "AWD"
- Extract vehicle status if mentioned:
  * "in stock" or "available now" or "ready to buy" → vehicleStatus: "In Stock"
  * "in transit" or "coming soon" or "on the way" → vehicleStatus: "In Transit"
  * "build phase" or "being built" or "factory order" → vehicleStatus: "Build Phase"
  * Examples: "show me cars in stock" → vehicleStatus: "In Stock", "vehicles in transit" → vehicleStatus: "In Transit"

CRITICAL: If the user describes characteristics (sporty, fuel efficient, family-friendly, luxury, etc.) without mentioning specific models, you MUST recommend matching Toyota models using the "model" or "models" field. Always match the body style they describe (sedan, SUV, truck, etc.) and ensure models align with their requirements.

User description: "${description}"

Return ONLY the JSON object, no additional text or markdown formatting.`
}


function parseGeminiResponse(response: string): CarFilters {
  try {
   
    let jsonText = response.trim()
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()

   
    const parsed = JSON.parse(jsonText)

    
    const filters: CarFilters = {}

   
    if (parsed.dealership && typeof parsed.dealership === "string") {
      const d = parsed.dealership.toString().toLowerCase()
      if (d === "dallas" || d === "plano") {
        ;(filters as any).dealership = d
        console.log("[Parse] Extracted dealership:", d)
      }
    }
    if (parsed.dealerships && Array.isArray(parsed.dealerships) && parsed.dealerships.length > 0) {
      const ds = parsed.dealerships
        .map((x: any) => (typeof x === "string" ? x.toLowerCase() : ""))
        .filter((x: string) => x === "plano" || x === "dallas")
      if (ds.length > 0) {
        ;(filters as any).dealerships = ds
        console.log("[Parse] Extracted dealerships:", ds)
      }
    }

    
    if (parsed.priceRanges && Array.isArray(parsed.priceRanges) && parsed.priceRanges.length > 0) {
      filters.priceRanges = parsed.priceRanges
        .filter((range: any) => range.min !== undefined && range.max !== undefined)
        .map((range: any) => ({
          min: Math.max(Math.round(Number(range.min) / 1000) * 1000, 0), 
          max: Math.min(Math.round(Number(range.max) / 1000) * 1000, 200000), 
        }))
        .filter((range: any) => range.min < range.max) 
      
      console.log("[Parse] Extracted priceRanges:", filters.priceRanges)
    }
   
    else if (parsed.priceRange && parsed.priceRange.min !== undefined && parsed.priceRange.max !== undefined) {
      filters.priceRange = {
        min: Math.max(Math.round(Number(parsed.priceRange.min) / 1000) * 1000, 0),
        max: Math.min(Math.round(Number(parsed.priceRange.max) / 1000) * 1000, 200000),
      }
      console.log("[Parse] Extracted priceRange:", filters.priceRange)
    } else {
      console.log("[Parse] No price range found in parsed data")
    }

    if (parsed.year) {
      const year = Number(parsed.year)
      if (year >= 2010 && year <= 2025) {
        filters.year = year
      }
    }

    // Handle condition - validate it's a valid value
    if (parsed.condition === "new" || parsed.condition === "used" || parsed.condition === "both") {
      filters.condition = parsed.condition
      console.log("[Parse] Extracted condition:", filters.condition)
    } else if (parsed.condition === null || parsed.condition === undefined) {
      // Explicitly null/undefined means show both - don't set condition
      console.log("[Parse] No condition specified - will show both new and used")
    } else {
      console.log("[Parse] Invalid condition value:", parsed.condition, "- will show both")
    }

    if (parsed.fuelType === "gasoline" || parsed.fuelType === "hybrid" || parsed.fuelType === "electric") {
      filters.fuelType = parsed.fuelType
    }

  
    if (parsed.models && Array.isArray(parsed.models) && parsed.models.length > 0) {
      const cleaned = parsed.models
        .filter((m: any) => typeof m === "string")
        .map((m: string) => m.trim())
        .filter((m: string) => m.length > 0)
      if (cleaned.length > 0) {
        filters.models = cleaned
        // Also set the first model for compatibility with single-model flows
        filters.model = cleaned[0]
        console.log("[Parse] Extracted models array:", cleaned)
        console.log("[Parse] Using first model:", filters.model)
      }
    } else if (parsed.model && typeof parsed.model === "string") {
      filters.model = parsed.model.trim()
      console.log("[Parse] Extracted single model:", filters.model)
    }

    // Extract body style if provided
    if (parsed.bodyStyle && typeof parsed.bodyStyle === "string") {
      filters.bodyStyle = parsed.bodyStyle.trim()
      console.log("[Parse] Extracted bodyStyle:", filters.bodyStyle)
    }

    if (parsed.trim && typeof parsed.trim === "string") {
      filters.trim = parsed.trim.trim()
    }

    if (parsed.color && typeof parsed.color === "string") {
      filters.color = parsed.color.trim()
    }

    // Handle mileage filter
    if (parsed.mileage && parsed.mileage.min !== undefined && parsed.mileage.max !== undefined) {
      filters.mileage = {
        min: Math.max(Number(parsed.mileage.min), 0),
        max: Math.min(Number(parsed.mileage.max), 500000),
      }
      console.log("[Parse] Extracted mileage filter:", filters.mileage)
    } else {
      console.log("[Parse] No mileage filter found")
    }

    // Handle interior color
    if (parsed.interiorColor && typeof parsed.interiorColor === "string") {
      filters.interiorColor = parsed.interiorColor.trim()
      console.log("[Parse] Extracted interiorColor:", filters.interiorColor)
    }

    // Handle transmission
    if (parsed.transmission && typeof parsed.transmission === "string") {
      filters.transmission = parsed.transmission.trim()
      console.log("[Parse] Extracted transmission:", filters.transmission)
    }

    // Handle vehicle options
    if (parsed.options && Array.isArray(parsed.options) && parsed.options.length > 0) {
      filters.options = parsed.options
        .filter((opt: any) => typeof opt === "string")
        .map((opt: string) => opt.trim())
        .filter((opt: string) => opt.length > 0)
      console.log("[Parse] Extracted options:", filters.options)
    }

    // Handle highway MPG
    if (parsed.highwayMpg !== null && parsed.highwayMpg !== undefined) {
      const mpg = Number(parsed.highwayMpg)
      if (mpg > 0 && mpg <= 100) {
        filters.highwayMpg = mpg
        console.log("[Parse] Extracted highwayMpg:", filters.highwayMpg)
      }
    }

    // Handle city MPG
    if (parsed.cityMpg !== null && parsed.cityMpg !== undefined) {
      const mpg = Number(parsed.cityMpg)
      if (mpg > 0 && mpg <= 100) {
        filters.cityMpg = mpg
        console.log("[Parse] Extracted cityMpg:", filters.cityMpg)
      }
    }

    // Handle overall MPG
    if (parsed.overallMpg !== null && parsed.overallMpg !== undefined) {
      const mpg = Number(parsed.overallMpg)
      if (mpg > 0 && mpg <= 100) {
        filters.overallMpg = mpg
        console.log("[Parse] Extracted overallMpg:", filters.overallMpg)
      }
    }

    // Handle interior material
    if (parsed.interiorMaterial && typeof parsed.interiorMaterial === "string") {
      filters.interiorMaterial = parsed.interiorMaterial.trim()
      console.log("[Parse] Extracted interiorMaterial:", filters.interiorMaterial)
    }

    // Handle engine
    if (parsed.engine && typeof parsed.engine === "string") {
      filters.engine = parsed.engine.trim()
      console.log("[Parse] Extracted engine:", filters.engine)
    }

    // Handle drive line
    if (parsed.driveLine && typeof parsed.driveLine === "string") {
      filters.driveLine = parsed.driveLine.trim().toUpperCase()
      console.log("[Parse] Extracted driveLine:", filters.driveLine)
    }

    // Handle vehicle status
    if (parsed.vehicleStatus && typeof parsed.vehicleStatus === "string") {
      const status = parsed.vehicleStatus.trim()
      if (status === "In Stock" || status === "In Transit" || status === "Build Phase") {
        filters.vehicleStatus = status as "In Stock" | "In Transit" | "Build Phase"
        console.log("[Parse] Extracted vehicleStatus:", filters.vehicleStatus)
      }
    }

    return filters
  } catch (error) {
    console.error("[Prompt Search] Failed to parse Gemini response:", error)
    console.error("[Prompt Search] Raw response:", response)

    return {}
  }
}


function calculateEcoRating(fuelType: string, cityMpg: number, highwayMpg: number): number {
  const avgMpg = (cityMpg + highwayMpg) / 2

  let baseRating = 5

  // Adjust based on fuel type
  if (fuelType === "hybrid") baseRating += 2
  else if (fuelType === "electric") baseRating += 3
  else if (fuelType === "diesel") baseRating += 1

  // Adjust based on MPG
  if (avgMpg > 35) baseRating += 2
  else if (avgMpg > 25) baseRating += 1
  else if (avgMpg < 15) baseRating -= 1

  return Math.min(Math.max(baseRating, 1), 10)
}


function scoreAndSortCars(cars: Car[], filters: CarFilters): Car[] {
  const hasPriceRanges = Array.isArray(filters.priceRanges) && filters.priceRanges.length > 0
  const models = (filters.models || (filters.model ? [filters.model] : []) || []).map((m) => (m || "").toLowerCase())
  const preferFirstModel = models.length > 0 ? models[0] : undefined

  const scored = cars.map((car) => {
    let score = 0

    // Model preference
    if (models.length > 0) {
      const cm = (car.model || "").toLowerCase()
      if (cm === preferFirstModel) score += 6
      if (models.includes(cm)) score += 4
    }

    // Condition match
    if (filters.condition) {
      const isNew = car.isNew
      if ((filters.condition === "new" && isNew) || (filters.condition === "used" && !isNew)) {
        score += 3
      }
    }

    // Fuel type match
    if (filters.fuelType && car.fuelType) {
      if (car.fuelType.toLowerCase() === filters.fuelType.toLowerCase()) score += 3
    }

    // Year match
    if (typeof filters.year === "number") {
      if (car.year === filters.year) score += 2
      // Slightly reward being within +/-1 year if exact not available
      if (Math.abs(car.year - filters.year) === 1) score += 1
    }

    // MPG requirements
    if (typeof filters.overallMpg === "number") {
      const delta = (car.mpg || 0) - filters.overallMpg
      if (delta >= 0) score += Math.min(4, 1 + Math.floor(delta / 5)) // reward exceeding target
    } else {
     
      if (car.mpg >= 35) score += 2
      else if (car.mpg >= 30) score += 1
    }

    // Mileage preference
    if (filters.mileage) {
      const within =
        car.mileage >= Math.max(0, filters.mileage.min) && car.mileage <= Math.max(filters.mileage.max, 0)
      if (within) {
        score += 2
        // Prefer lower mileage within the range
        if (car.mileage <= filters.mileage.min + (filters.mileage.max - filters.mileage.min) * 0.25) score += 1
      }
    } else {
      // If no mileage specified, prefer new or lower mileage slightly
      if (car.isNew) score += 1
      else if (car.mileage <= 30000) score += 1
    }

    // Price closeness to user's range(s)
    const price = car.price || 0
    if (hasPriceRanges) {
      let best = 0
      for (const r of filters.priceRanges!) {
        const min = Math.max(0, r.min)
        const max = Math.max(min, r.max)
        if (price >= min && price <= max) {
          // Reward being inside range, closer to lower end usually more "affordable"
          const span = Math.max(1, max - min)
          const rel = (max - price) / span 
          best = Math.max(best, 3 + Math.floor(rel * 3)) 
        } else {
          // Penalize distance outside the range lightly
          const d = price < min ? min - price : price - max
          best = Math.max(best, Math.max(0, 2 - Math.floor(d / 5000)))
        }
      }
      score += best
    } else if (filters.priceRange) {
      const min = Math.max(0, filters.priceRange.min)
      const max = Math.max(min, filters.priceRange.max)
      if (price >= min && price <= max) {
        const span = Math.max(1, max - min)
        const rel = (max - price) / span
        score += 5 + Math.floor(rel * 3) 
      } else {
        const d = price < min ? min - price : price - max
        score += Math.max(0, 2 - Math.floor(d / 5000))
      }
    }

    return { car, score }
  })

  scored.sort((a, b) => b.score - a.score || (a.car.price || 0) - (b.car.price || 0))
  return scored.map((s) => s.car)
}


function diversifyByModel(
  cars: Car[],
  opts: { maxPerModel: number; limit: number } = { maxPerModel: 5, limit: 50 },
): Car[] {
  const { maxPerModel, limit } = opts
  const buckets = new Map<string, Car[]>()
  for (const car of cars) {
    const key = (car.model || "").toLowerCase()
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(car)
  }
  
  const taken = new Map<string, number>()
  const keys = Array.from(buckets.keys())
  const result: Car[] = []
  let added = true
  while (result.length < limit && added) {
    added = false
    for (const key of keys) {
      if (result.length >= limit) break
      const used = taken.get(key) || 0
      if (used >= maxPerModel) continue
      const bucket = buckets.get(key)!
      if (bucket.length === 0) continue
      const next = bucket.shift()!
      result.push(next)
      taken.set(key, used + 1)
      added = true
    }
  }
 
  if (result.length < limit) {
    const remaining = Array.from(buckets.values()).flat()
    // Preserve original order for remaining as well
    for (const car of remaining) {
      if (result.length >= limit) break
      result.push(car)
    }
  }
  return result
}
