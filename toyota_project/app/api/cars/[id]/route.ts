import { type NextRequest, NextResponse } from "next/server"
import type { Car } from "@/types"
import { getToyotaInventory } from "@/lib/toyota-api"



export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    console.log("[v0] Fetching car details for ID:", id)

    const vehicles = await getToyotaInventory()
    const vehicle = vehicles.find((v) => v.id === id)

    if (!vehicle) {
      console.log("[v0] Vehicle not found:", id)
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const car: Car = {
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
    }

    return NextResponse.json({
      success: true,
      car: car,
    })
  } catch (error) {
    console.error("[v0] Car Detail Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch car details", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}


function calculateEcoRating(fuelType: string, cityMpg: number, highwayMpg: number): number {
  const avgMpg = (cityMpg + highwayMpg) / 2
  let baseRating = 5

  if (fuelType === "hybrid") baseRating += 2
  else if (fuelType === "electric") baseRating += 3
  else if (fuelType === "diesel") baseRating += 1

  if (avgMpg > 35) baseRating += 2
  else if (avgMpg > 25) baseRating += 1
  else if (avgMpg < 15) baseRating -= 1

  return Math.min(Math.max(baseRating, 1), 10)
}
