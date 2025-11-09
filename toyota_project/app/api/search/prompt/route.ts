import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { CarFilters, Car } from "@/types"
import { getToyotaInventory } from "@/lib/toyota-api"

/**
 * API Route: POST /api/search/prompt
 *
 * Accepts a natural language description and uses Gemini API to generate
 * car search filters, then fetches matching vehicles from Toyota API.
 *
 * Environment variables needed:
 * - GEMINI_API_KEY: Your Google Gemini API key
 */

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.error("[Prompt Search] GEMINI_API_KEY not found in environment variables")
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set GEMINI_API_KEY environment variable." },
        { status: 500 },
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Create prompt for Gemini to extract car search filters
    const prompt = createExtractionPrompt(description)

    console.log("[Prompt Search] ===== GEMINI PROMPT START =====")
    console.log(prompt)
    console.log("[Prompt Search] ===== GEMINI PROMPT END =====")
    console.log("[Prompt Search] Calling Gemini API with description:", description.substring(0, 100))

    // Call Gemini API
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Log the full Gemini response for debugging
    console.log("[Prompt Search] ===== GEMINI FULL RESPONSE START =====")
    console.log(text)
    console.log("[Prompt Search] ===== GEMINI FULL RESPONSE END =====")

    // Parse Gemini's JSON response
    const filters = parseGeminiResponse(text)
    
    // Log parsed filters for debugging
    console.log("[Prompt Search] Parsed filters:", JSON.stringify(filters, null, 2))

    // Prepare filters for Toyota API - map directly to inventoryParameters format
    const toyotaFilters = {
      priceRange: filters.priceRange,
      year: filters.year, // Pass year directly as single value (will be converted to string)
      yearRange: filters.year ? undefined : undefined, // Only use if year not provided
      model: filters.model,
      trim: filters.trim,
      fuelType: filters.fuelType,
      bodyStyle: filters.model, // Model filter might be body style
      color: filters.color,
      condition: filters.condition || "new", // Default to new if not specified
    }

    // Fetch cars from Toyota API using extracted filters (server-side filtering)
    console.log("[Prompt Search] Fetching cars with filters:", toyotaFilters)
    const filtered = await getToyotaInventory(toyotaFilters)
    console.log("[Prompt Search] Retrieved", filtered.length, "vehicles from Toyota API")

    // Transform to Car format
    const cars: Car[] = filtered.map((vehicle) => ({
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
    }))

    return NextResponse.json({
      success: true,
      filters: filters,
      cars: cars.slice(0, 50), // Limit to 50 results
      totalResults: cars.length,
      message: `Found ${cars.length} vehicles matching your description`,
    })
  } catch (error) {
    console.error("[Prompt Search Error]", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * Creates a prompt for Gemini to extract car search filters from natural language
 */
function createExtractionPrompt(description: string): string {
  return `You are a car search assistant. Analyze the following user description and extract car search filter criteria. Return ONLY a valid JSON object with the following structure (use null for missing values):

{
  "priceRange": { "min": number, "max": number } | null,
  "year": number | null,
  "condition": "new" | "used" | null,
  "fuelType": "gasoline" | "hybrid" | "electric" | null,
  "model": string | null,
  "trim": string | null,
  "color": string | null,
  "mileage": { "min": number, "max": number } | null
}

Guidelines:
- Extract price ranges from mentions like "$30,000", "under $40k", "around $25,000" - create a range ±20% of mentioned price
- Extract year as a single number (e.g., "2024", "2025", "2026") - if user says "2024 or newer", use 2024
- Determine condition: "new", "used", "pre-owned" → "used", otherwise default to "new"
- Extract fuel type: "hybrid", "electric", "EV", "gas", "gasoline", "diesel"
- Extract vehicle model: "Camry", "RAV4", "Highlander", "Tacoma", "Corolla", "Prius", "4Runner", "Sienna", "Tundra", "Sequoia", "Crown", "bZ4X", "GR86", "Supra", "Venza", "Avalon", etc.
- Extract trim level if mentioned: "LE", "XLE", "SE", "XSE", "Limited", "TRD", "Platinum", "SR5", "SR", etc.
- Extract color preferences if mentioned (e.g., "red", "blue", "black", "white")
- Extract mileage preferences if mentioned (e.g., "under 50k miles", "low mileage")

The user might give you a description of the type of car they want, for example they might say: "I want a sporty sedan that's fun to drive but also fuel efficient." Your job is to give them the 
models of toyota cars that matches their description. It is important that you provide a variety of car models for the user to choose from as long as they match the user's description. So if they ask
for SUV's make sure they only get SUV's and not sedans as well.

User description: "${description}"

Return ONLY the JSON object, no additional text or markdown formatting.`
}

/**
 * Parses Gemini's response to extract JSON filters
 */
function parseGeminiResponse(response: string): CarFilters {
  try {
    // Remove markdown code blocks if present
    let jsonText = response.trim()
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()

    // Parse JSON
    const parsed = JSON.parse(jsonText)

    // Validate and normalize the filters
    const filters: CarFilters = {}

    if (parsed.priceRange && parsed.priceRange.min && parsed.priceRange.max) {
      filters.priceRange = {
        min: Math.max(Number(parsed.priceRange.min), 0),
        max: Math.min(Number(parsed.priceRange.max), 200000),
      }
    }

    if (parsed.year) {
      const year = Number(parsed.year)
      if (year >= 2010 && year <= 2025) {
        filters.year = year
      }
    }

    if (parsed.condition === "new" || parsed.condition === "used") {
      filters.condition = parsed.condition
    }

    if (parsed.fuelType === "gasoline" || parsed.fuelType === "hybrid" || parsed.fuelType === "electric") {
      filters.fuelType = parsed.fuelType
    }

    if (parsed.model && typeof parsed.model === "string") {
      filters.model = parsed.model.trim()
    }

    if (parsed.trim && typeof parsed.trim === "string") {
      filters.trim = parsed.trim.trim()
    }

    if (parsed.color && typeof parsed.color === "string") {
      filters.color = parsed.color.trim()
    }

    if (parsed.mileage && parsed.mileage.min !== undefined && parsed.mileage.max !== undefined) {
      filters.mileage = {
        min: Math.max(Number(parsed.mileage.min), 0),
        max: Math.min(Number(parsed.mileage.max), 500000),
      }
    }

    return filters
  } catch (error) {
    console.error("[Prompt Search] Failed to parse Gemini response:", error)
    console.error("[Prompt Search] Raw response:", response)
    // Return empty filters as fallback
    return {}
  }
}

/**
 * Calculates eco rating based on fuel type and MPG
 */
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
