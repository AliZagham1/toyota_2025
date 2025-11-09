import { type NextRequest, NextResponse } from "next/server"
import type { CarFilters, Car } from "@/types"
import { getToyotaInventory } from "@/lib/toyota-api"
import { getDealerByKey } from "@/lib/dealers"

export async function POST(request: NextRequest) {
  try {
    const filters: CarFilters = await request.json()

    console.log("[Cars Search] Searching cars with filters:", filters)

    // Prepare base filters for Toyota API (server-side filtering) - exclude model here
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
      condition: (filters.condition || "both") as "new" | "used" | "both", 
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
      dealership: filters.dealership as any,
      dealerships: (filters.dealerships as any) || undefined,
    }


    const modelsToQuery =
      (filters.models && filters.models.length > 0 && filters.models.slice(0, 5)) ||
      (filters.model ? [filters.model] : [null])

    console.log("[Cars Search] Models to query:", modelsToQuery)

   
    const fetches = modelsToQuery.map((mdl) =>
      getToyotaInventory({
        ...toyotaBaseFilters,
        model: mdl || undefined,
      }),
    )
    let vehicleLists = await Promise.all(fetches)
    let filtered = vehicleLists.flat()
    console.log("[Cars Search] Retrieved", filtered.length, "vehicles from Toyota API (combined)")
    
    
    // do an extra fetch without model to broaden results by body style.
    const uniqueModels = new Set(filtered.map((v) => v.model))
    if (uniqueModels.size <= 1 && (filters.bodyStyle || "").length > 0) {
      console.log("[Cars Search] Low model diversity detected, fetching by bodyStyle only for variety")
      const bodyStyleOnly = await getToyotaInventory({
        ...toyotaBaseFilters,
        model: undefined,
      })
      filtered = [...filtered, ...bodyStyleOnly]
      console.log("[Cars Search] After bodyStyle-only fetch, total vehicles:", filtered.length)
    }
    
    // Log sample of returned vehicles for debugging
    if (filtered.length > 0) {
      console.log("[Cars Search] Sample vehicle:", {
        year: filtered[0].year,
        model: filtered[0].model,
        trim: filtered[0].trim,
      })
    }

    // Transform to Car format for the app
    const cars: Car[] = filtered
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

    // Score cars based on how well they match the filters, sort by score desc
    const scored = scoreAndSortCars(cars, filters)

    // Diversify results across different models (avoid showing many of the same model), limit to 10
    const diversified = diversifyByModel(scored, { maxPerModel: 3, limit: 10 })

    return NextResponse.json({
      success: true,
      cars: diversified, 
      totalResults: cars.length,
    })
  } catch (error) {
    console.error("[v0] Cars Search Error:", error)
    return NextResponse.json(
      { error: "Failed to search cars", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
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


function scoreAndSortCars(cars: Car[], filters: CarFilters): Car[] {
  const hasPriceRanges = Array.isArray(filters.priceRanges) && filters.priceRanges.length > 0
  const models = (filters.models || (filters.model ? [filters.model] : []) || []).map((m) => (m || "").toLowerCase())
  const preferFirstModel = models.length > 0 ? models[0] : undefined

  const scored = cars.map((car) => {
    let score = 0

 
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
      
        if (car.mileage <= filters.mileage.min + (filters.mileage.max - filters.mileage.min) * 0.25) score += 1
      }
    } else {
     
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
        score += 5 + Math.floor(rel * 3) // up to +8
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
