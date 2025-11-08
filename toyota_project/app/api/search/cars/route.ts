import { type NextRequest, NextResponse } from "next/server"
import type { CarFilters, Car } from "@/types"
import { getToyotaInventory, filterVehicles } from "@/lib/toyota-api"

/**
 * API Route: POST /api/search/cars
 *
 * Accepts filter criteria and returns matching Toyota vehicles from the Plano dealership.
 * Integrates with Toyota of Plano API for real-time inventory data.
 */

export async function POST(request: NextRequest) {
  try {
    const filters: CarFilters = await request.json()

    console.log("[v0] Searching cars with filters:", filters)

    const toyotaVehicles = await getToyotaInventory()
    console.log("[v0] Retrieved", toyotaVehicles.length, "vehicles from Toyota API")

    // Filter vehicles based on criteria
    const filtered = filterVehicles(toyotaVehicles, {
      priceRange: filters.priceRange,
      yearRange: filters.year ? { min: filters.year, max: 2025 } : undefined,
      model: filters.model,
      fuelType: filters.fuelType,
      bodyStyle: filters.model, // Assuming model filter might be body style
      color: filters.color,
      condition: filters.condition,
    })

    console.log("[v0] Filtered to", filtered.length, "vehicles")

    // Transform to Car format for the app
    const cars: Car[] = filtered.map((vehicle) => ({
      id: vehicle.id,
      name: `${vehicle.year} Toyota ${vehicle.model}${vehicle.trim ? " " + vehicle.trim : ""}`,
      model: vehicle.model,
      make: vehicle.make,
      price: vehicle.internetPrice || vehicle.askingPrice,
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
      cars: cars.slice(0, 50), // Limit to 50 results
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
