export interface ToyotaVehicle {
  id: string
  year: number
  make: string
  model: string
  trim: string
  bodyStyle: string
  exteriorColor: string
  interiorColor: string
  transmission: string
  engine: string
  fuelType: string
  cityMpg: number
  highwayMpg: number
  mileage: number
  askingPrice: number
  internetPrice?: number
  imageUrl?: string
  vin?: string
  stockNumber?: string
  isNew: boolean
  seats?: number
}

/**
 * Fetches inventory from Toyota of Plano API
 */
export async function getToyotaInventory(): Promise<ToyotaVehicle[]> {
  try {
    const payload = {
      siteId: "toyotaofplanogst",
      locale: "en_US",
      device: "DESKTOP",
      pageAlias: "INVENTORY_LISTING_DEFAULT_AUTO_NEW",
      pageId: "toyotaofplanogst_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_NEW_V1_1",
      windowId: "inventory-data-bus2",
      widgetName: "ws-inv-data",
      inventoryParameters: {},
      preferences: {
        widgetClasses: "spacing-reset",
        pageSize: "50",
        "listing.config.id": "auto-new",
        "listing.boost.order": "account,make,model,bodyStyle,trim,optionCodes,modelCode,fuelType",
        removeEmptyFacets: "true",
        removeEmptyConstraints: "true",
        displayerInstanceId: "INVENTORY_LISTING_DEFAULT_AUTO_NEW:inventory-data-bus1_1673036815",
        "required.display.sets":
          "TITLE,IMAGE_ALT,IMAGE_TITLE,PRICE,FEATURED_ITEMS,CALLOUT,LISTING,HIGHLIGHTED_ATTRIBUTES",
        "required.display.attributes": [
          "year",
          "make",
          "model",
          "trim",
          "bodyStyle",
          "exteriorColor",
          "interiorColor",
          "transmission",
          "engine",
          "engineSize",
          "fuelType",
          "cityMpg",
          "highwayMpg",
          "mileage",
          "odometer",
          "askingPrice",
          "internetPrice",
          "vin",
          "stockNumber",
          "certified",
          "doors",
          "seats",
          "driveLine",
          "type",
          "primary_image",
        ].join(","),
      },
    }

    const response = await fetch("https://www.toyotaofplano.com/api/widget/ws-inv-data/getInventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error("[v0] Toyota API response error:", response.status)
      throw new Error(`Toyota API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the API response to our vehicle format
    const vehicles = transformToyotaResponse(data)
    return vehicles
  } catch (error) {
    console.error("[v0] Error fetching Toyota inventory:", error)
    throw error
  }
}

/**
 * Transforms Toyota API response into our vehicle format
 */
function transformToyotaResponse(data: any): ToyotaVehicle[] {
  if (!data || !data.searchResults) {
    console.error("[v0] Invalid API response structure")
    return []
  }

  const vehicles: ToyotaVehicle[] = data.searchResults
    .map((result: any) => {
      // Extract vehicle data from API response
      const listing = result.listing || {}
      const attributes = result.attributes || {}

      // Build image URL if available
      let imageUrl: string | undefined
      if (result.primaryImage) {
        imageUrl = result.primaryImage.url || result.primaryImage
      }

      return {
        id: listing.id || listing.uuid || `${listing.vin}-${Date.now()}`,
        year: Number(attributes.year) || listing.year || 2024,
        make: attributes.make || listing.make || "Toyota",
        model: attributes.model || listing.model || "Unknown",
        trim: attributes.trim || attributes.trimLevel || listing.trim || "",
        bodyStyle: attributes.bodyStyle || listing.bodyStyle || "Sedan",
        exteriorColor: attributes.exteriorColor || attributes.extColor || "Unknown",
        interiorColor: attributes.interiorColor || attributes.intColor || "Unknown",
        transmission: attributes.transmission || "Automatic",
        engine: attributes.engine || "Unknown",
        fuelType: normalizeFuelType(attributes.fuelType || "gasoline"),
        cityMpg: Number(attributes.cityMpg) || Number(attributes.mpgCity) || 0,
        highwayMpg: Number(attributes.highwayMpg) || Number(attributes.mpgHighway) || 0,
        mileage: Number(attributes.mileage) || Number(attributes.odometer) || 0,
        askingPrice: Number(attributes.askingPrice) || Number(listing.price) || 0,
        internetPrice: Number(attributes.internetPrice) || Number(attributes.salePrice),
        imageUrl: imageUrl,
        vin: attributes.vin || listing.vin,
        stockNumber: attributes.stockNumber || listing.stockNumber,
        isNew: attributes.type === "new" || (attributes.mileage || attributes.odometer || 0) < 100,
        seats: Number(attributes.seats) || 5,
      }
    })
    .filter((v: ToyotaVehicle) => v.year > 2010) // Filter out invalid vehicles

  return vehicles
}

/**
 * Normalizes fuel type to standard format
 */
function normalizeFuelType(fuel: string): string {
  const normalized = fuel.toLowerCase()
  if (normalized.includes("hybrid")) return "hybrid"
  if (normalized.includes("electric") || normalized.includes("ev")) return "electric"
  if (normalized.includes("diesel")) return "diesel"
  return "gasoline"
}

/**
 * Filters Toyota vehicles based on criteria
 */
export function filterVehicles(
  vehicles: ToyotaVehicle[],
  filters: {
    priceRange?: { min: number; max: number }
    yearRange?: { min: number; max: number }
    model?: string
    fuelType?: string
    bodyStyle?: string
    color?: string
    condition?: "new" | "used"
  },
): ToyotaVehicle[] {
  return vehicles.filter((vehicle) => {
    // Price filter
    if (filters.priceRange) {
      const price = vehicle.internetPrice || vehicle.askingPrice
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false
      }
    }

    // Year filter
    if (filters.yearRange) {
      if (vehicle.year < filters.yearRange.min || vehicle.year > filters.yearRange.max) {
        return false
      }
    }

    // Model filter
    if (filters.model && !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) {
      return false
    }

    // Fuel type filter
    if (filters.fuelType && vehicle.fuelType !== filters.fuelType.toLowerCase()) {
      return false
    }

    // Body style filter
    if (filters.bodyStyle && !vehicle.bodyStyle.toLowerCase().includes(filters.bodyStyle.toLowerCase())) {
      return false
    }

    // Color filter
    if (filters.color) {
      const colorMatch =
        vehicle.exteriorColor.toLowerCase().includes(filters.color.toLowerCase()) ||
        vehicle.interiorColor.toLowerCase().includes(filters.color.toLowerCase())
      if (!colorMatch) return false
    }

    // Condition filter
    if (filters.condition) {
      const isNew = vehicle.isNew || vehicle.mileage < 100
      if (filters.condition === "new" && !isNew) return false
      if (filters.condition === "used" && isNew) return false
    }

    return true
  })
}
