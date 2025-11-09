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
 * @param filters Optional filters to apply to the search
 */
export async function getToyotaInventory(filters?: {
  priceRange?: { min: number; max: number }
  yearRange?: { min: number; max: number }
  year?: number
  model?: string
  trim?: string
  fuelType?: string
  bodyStyle?: string
  color?: string
  condition?: "new" | "used"
}): Promise<ToyotaVehicle[]> {
  try {
    // Build inventoryParameters from filters - map directly to Toyota API format
    const inventoryParameters: any = {}

    // Determine page alias and config based on condition
    const isNew = filters?.condition !== "used"
    const pageAlias = isNew
      ? "INVENTORY_LISTING_DEFAULT_AUTO_NEW"
      : "INVENTORY_LISTING_DEFAULT_AUTO_USED"
    const pageId = isNew
      ? "toyotaofplanogst_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_NEW_V1_1"
      : "toyotaofplanogst_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_USED_V1_1"
    const listingConfigId = isNew ? "auto-new" : "auto-used"

    // Map filters directly to inventoryParameters (exact format from example)
    if (filters?.model) {
      inventoryParameters.model = filters.model
    }

    if (filters?.trim) {
      inventoryParameters.trim = filters.trim
    }

    if (filters?.year) {
      // Year as string (e.g., "2026")
      inventoryParameters.year = String(filters.year)
    } else if (filters?.yearRange) {
      // Fallback to year range if single year not provided
      if (filters.yearRange.min && filters.yearRange.max) {
        inventoryParameters.year = `${filters.yearRange.min}-${filters.yearRange.max}`
      } else if (filters.yearRange.min) {
        inventoryParameters.year = `${filters.yearRange.min}-2025`
      }
    }

    if (filters?.fuelType) {
      // Map our fuel types to Toyota API values
      const fuelTypeMap: Record<string, string> = {
        gasoline: "Gas",
        hybrid: "Hybrid",
        electric: "Electric",
      }
      inventoryParameters.fuelType = fuelTypeMap[filters.fuelType] || filters.fuelType
    }

    if (filters?.bodyStyle) {
      inventoryParameters.bodyStyle = filters.bodyStyle
    }

    if (filters?.color) {
      inventoryParameters.exteriorColor = filters.color
    }

    if (filters?.priceRange) {
      inventoryParameters.internetPrice = `${filters.priceRange.min}-${filters.priceRange.max}`
    }

    if (filters?.condition) {
      inventoryParameters.type = filters.condition === "new" ? "new" : "used"
    }

    // Log inventoryParameters for debugging
    console.log("[Toyota API] inventoryParameters:", JSON.stringify(inventoryParameters, null, 2))

    const payload = {
      siteId: "toyotaofplanogst",
      locale: "en_US",
      device: "DESKTOP",
      pageAlias: pageAlias,
      pageId: pageId,
      windowId: "inventory-data-bus2",
      widgetName: "ws-inv-data",
      inventoryParameters: inventoryParameters,
      preferences: {
        widgetClasses: "spacing-reset",
        pageSize: "50",
        "listing.config.id": listingConfigId,
        "listing.boost.order": "account,make,model,bodyStyle,trim,optionCodes,modelCode,fuelType",
        removeEmptyFacets: "true",
        removeEmptyConstraints: "true",
        displayerInstanceId: "INVENTORY_LISTING_DEFAULT_AUTO_NEW:inventory-data-bus1_1673036815",
        "required.display.sets":
          "TITLE,IMAGE_ALT,IMAGE_TITLE,PRICE,FEATURED_ITEMS,CALLOUT,LISTING,HIGHLIGHTED_ATTRIBUTES",
        "required.display.attributes":
          "accountCity,accountCountry,accountId,accountName,accountState,accountZipcode,askingPrice,attributes,autodataCaId_att_data,bed,bodyStyle,cab,carfaxIconUrl,carfaxIconUrlBlackWhite,carfaxUrl,carfaxValueBadgeAltText,categoryName,certified,chromeId_att_data,cityMpg,classification,classificationName,comments,courtesy,cpoChecklistUrl,daysOnLot,dcpaisVideoToken_att_data,deliveryDateRange,doors,driveLine,ebayAuctionId,eleadPrice,eleadPriceLessOEMCash,engine,engineSize,equipment,extColor,exteriorColor,fuelType,globalVehicleTrimId,gvLongTrimDescription,gvTrim,hasCarFaxReport,hideInternetPrice,highwayMpg,id,incentives,intColor,interiorColor,interiorColorCode,internetComments,internetPrice,inventoryDate,invoicePrice,isElectric_att_b,key,location,make,marketingTitle,mileage,model,modelCode,msrp,normalExteriorColor,normalFuelType,normalInteriorColor,numSaves,odometer,oemSerialNumber,oemSourcedMerchandisingStatus,optionCodes,options,packageCode,packages_internal,parent,parentId,paymentMonthly,payments,primary_image,propertyDescription,retailValue,saleLease,salePrice,sharedVehicle,status,stockNumber,transmission,trim,trimLevel,type,uuid,video,vin,warrantyDescription,wholesalePrice,year,cpoTier",
        "required.display.attributes.extra": "",
        facetInstanceId: "INVENTORY_LISTING_DEFAULT_AUTO_NEW:inventory-data-bus1_1684257599",
        geoLocationEnabled: "false",
        defaultGeoDistRadius: "0",
        geoRadiusValues: "0,5,25,50,100,250,500,1000",
        showCertifiedFranchiseVehiclesOnly: "false",
        showFranchiseVehiclesOnly: "true",
        extraFranchisesForUsedWindowStickers: "",
        suppressAllConditions: "compliant",
        violateUsedCompliance: "false",
        showOffSiteInventoryBanner: "true",
        showPhotosViewer: "true",
        offsetSharedVehicleImageByOne: "false",
        certifiedLogoColor: "",
        certifiedDefaultPath: "",
        certifiedDefaultLogoOnly: "false",
        transferBadgeImage: "",
        transferBadgeType: "DARK",
        transferLinkHref: "",
        certifiedBadgeLinkHref: "",
        certifiedBadgeTooltip: "",
        certifiedBadgeLinkTarget: "_self",
        inTransitStatuses: "",
        customInTransitLogoUrl: "",
        carfaxLogoBlackWhite: "false",
        hideCertifiedDefaultLogo: "false",
        sorts: "year,normalBodyStyle,normalExteriorColor,odometer,internetPrice",
        sortsTitles: "YEAR,BODYSTYLE,COLOR,MILEAGE,PRICE",
        inventoryDateFormat: "MM_DD_YYYY_FORMAT",
        offsiteInventoryMarkup: "0",
        geoLocationEnhanced: "false",
        showLocationTab: "true",
        showEffectiveStartDate: "true",
        showIncentiveTitleSubText: "true",
        showIncentiveAmountAndLabel: "true",
        showIncentiveDisclaimer: "true",
        showIncentiveEffectiveDates: "true",
        newCarBoostEnable: "false",
        newCarBoostListingConfigId: "auto-new",
        numberOfSpotlightVehicles: "0",
        disableGeodistSort: "false",
        linkToDealCentralVDP: "false",
        removeOdometerOnNew: "true",
        finalPriceOverrideField: "",
      },
      includePricing: true,
      flags: {
        "vcda-js-environment": "live",
        "ws-scripts-concurrency-limits-concurrency": 16,
        "ws-scripts-concurrency-limits-queue": 16,
        "ws-scripts-concurrency-limits-enabled": true,
        "ws-itemlist-service-version": "v5",
        "ws-itemlist-model-version": "v1",
        "ws-scripts-inline-css": true,
        "ws-inv-data-fetch-timeout": 30000,
        "ws-inv-data-fetch-retries": 2,
        "ws-inv-data-use-wis": true,
        "ws-inv-data-wis-fetch-timeout": 5000,
        "srp-track-fetch-resource-timing": false,
        "ws-inv-data-location-service-fetch-timeout": 3000,
        "ws-inv-data-location-service-fetch-retries": 2,
        "enable-client-side-geolocation-ws-inv-data": true,
        "ws-inv-data-spellcheck-proxy-timeout": 5000,
        "ws-inv-data-spellcheck-server-timeout": 1500,
        "ws-inv-data-spellcheck-server-retries": 0,
        "srp-toggle-databus-editor": true,
        "srp-send-ws-inv-data-prefs-to-wis": true,
        "ddc-ab-testing": "CONTROL",
        "ws-inv-data-toggle-refactor": false,
      },
    }

    // Log the full payload for debugging
    console.log("[Toyota API] ===== FULL PAYLOAD START =====")
    console.log(JSON.stringify(payload, null, 2))
    console.log("[Toyota API] ===== FULL PAYLOAD END =====")

    const response = await fetch("https://www.toyotaofplano.com/api/widget/ws-inv-data/getInventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://www.toyotaofplano.com",
        Referer: "https://www.toyotaofplano.com/new-inventory/index.htm",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error("[Toyota API] Response error:", response.status, response.statusText)
      const errorText = await response.text().catch(() => "")
      console.error("[Toyota API] Error details:", errorText)
      throw new Error(`Toyota API error: ${response.status}`)
    }

    const data = await response.json()

    // Log the API response structure for debugging
    console.log("[Toyota API] ===== API RESPONSE START =====")
    console.log("Response keys:", Object.keys(data))
    console.log("Response structure sample:", JSON.stringify(data, null, 2).substring(0, 2000))
    console.log("[Toyota API] ===== API RESPONSE END =====")

    // Transform the API response to our vehicle format
    const vehicles = transformToyotaResponse(data)
    return vehicles
  } catch (error) {
    console.error("[Toyota API] Error fetching inventory:", error)
    throw error
  }
}

/**
 * Transforms Toyota API response into our vehicle format
 */
function transformToyotaResponse(data: any): ToyotaVehicle[] {
  // Log the data structure to understand what we're receiving
  console.log("[Transform] Data structure check:")
  console.log("  - data exists:", !!data)
  console.log("  - data.searchResults exists:", !!data?.searchResults)
  console.log("  - data.results exists:", !!data?.results)
  console.log("  - data.items exists:", !!data?.items)
  console.log("  - data.inventory exists:", !!data?.inventory)
  console.log("  - data.vehicles exists:", !!data?.vehicles)
  console.log("  - Top level keys:", data ? Object.keys(data) : "no data")

  // Try different possible response structures
  let results = data?.searchResults || data?.results || data?.items || data?.inventory || data?.vehicles || []

  if (!results || !Array.isArray(results)) {
    console.error("[Transform] Invalid API response structure - no array found")
    console.error("[Transform] Full response:", JSON.stringify(data, null, 2).substring(0, 1000))
    return []
  }

  console.log(`[Transform] Found ${results.length} results to process`)
  
  // Log first result structure if available
  if (results.length > 0) {
    console.log("[Transform] First result structure:", JSON.stringify(results[0], null, 2).substring(0, 1000))
  }

  // Helper function to extract value from trackingAttributes array
  const getTrackingAttribute = (trackingAttributes: any[], name: string): string | undefined => {
    if (!trackingAttributes || !Array.isArray(trackingAttributes)) return undefined
    const attr = trackingAttributes.find((a: any) => a.name === name)
    return attr?.value
  }

  const vehicles: ToyotaVehicle[] = results
    .map((result: any, index: number) => {
      // Extract data directly from result object (API structure has data at top level)
      const trackingAttributes = result.trackingAttributes || []
      const trackingPricing = result.trackingPricing || {}
      const pricing = result.pricing || {}
      const images = result.images || []

      // Extract image URL - check multiple possible locations
      let imageUrl: string | undefined
      
      // First, check for primary_image field directly on result
      if (result.primary_image) {
        imageUrl = typeof result.primary_image === 'string' 
          ? result.primary_image 
          : result.primary_image.url || result.primary_image.src || result.primary_image.href
      }
      
      // Then check images array
      if (!imageUrl && images && images.length > 0) {
        // Log image structure for first item to debug
        if (index === 0) {
          console.log("[Transform] Images array structure:", JSON.stringify(images.slice(0, 2), null, 2))
        }
        
        // Try different possible image structures
        const primaryImage = images.find((img: any) => img.primary) || 
                           images.find((img: any) => img.isPrimary) ||
                           images[0]
        
        // Try different URL properties - Toyota API uses "uri"
        imageUrl = primaryImage?.uri || 
                  primaryImage?.url || 
                  primaryImage?.src || 
                  primaryImage?.href ||
                  primaryImage?.imageUrl ||
                  (typeof primaryImage === 'string' ? primaryImage : undefined)
      }
      
      // Normalize image URL - ensure it's a full URL
      if (imageUrl) {
        // If it's a relative URL, prepend the domain
        if (!imageUrl.startsWith('http')) {
          imageUrl = imageUrl.startsWith('/') 
            ? `https://www.toyotaofplano.com${imageUrl}`
            : `https://www.toyotaofplano.com/${imageUrl}`
        }
        // URLs from pictures.dealer.com are already full URLs, no need to modify
      }
      
      // Log first image URL for debugging
      if (index === 0) {
        console.log("[Transform] primary_image field:", result.primary_image)
        console.log("[Transform] images array length:", images?.length)
        console.log("[Transform] Final extracted imageUrl:", imageUrl)
      }

      // Extract values from trackingAttributes or directly from result
      const exteriorColor = getTrackingAttribute(trackingAttributes, "exteriorColor") || 
                           getTrackingAttribute(trackingAttributes, "extColor") ||
                           result.exteriorColor || "Unknown"
      
      const interiorColor = getTrackingAttribute(trackingAttributes, "interiorColor") || 
                           getTrackingAttribute(trackingAttributes, "intColor") ||
                           result.interiorColor || "Unknown"
      
      const transmission = getTrackingAttribute(trackingAttributes, "transmission") || 
                          result.transmission || "Automatic"
      
      const engine = getTrackingAttribute(trackingAttributes, "engine") || 
                    result.engine || "Unknown"
      
      const fuelType = getTrackingAttribute(trackingAttributes, "fuelType") || 
                      getTrackingAttribute(trackingAttributes, "normalFuelType") ||
                      result.fuelType || "gasoline"

      // Extract pricing - prefer trackingPricing, fallback to pricing object
      // Convert string prices to numbers
      const internetPrice = Number(trackingPricing.internetPrice) || 
                           Number(pricing.internetPrice) || 
                           Number(result.internetPrice) || 
                           0
      
      // Asking price (MSRP) - fallback to internetPrice if not available
      const askingPrice = Number(trackingPricing.msrp) || 
                         Number(pricing.msrp) || 
                         Number(pricing.askingPrice) ||
                         Number(result.askingPrice) || 
                         internetPrice || 
                         0

      // Extract mileage/odometer
      const mileage = Number(result.odometer) || 
                     Number(result.mileage) || 
                     0

      // Extract MPG - check trackingAttributes first, then attributes array, then direct fields
      let cityMpg = Number(getTrackingAttribute(trackingAttributes, "cityMpg") || 
                          getTrackingAttribute(trackingAttributes, "mpgCity") ||
                          result.cityMpg || 
                          result.mpgCity || 
                          0)
      
      let highwayMpg = Number(getTrackingAttribute(trackingAttributes, "highwayMpg") || 
                              getTrackingAttribute(trackingAttributes, "mpgHighway") ||
                              result.highwayMpg || 
                              result.mpgHighway || 
                              0)
      
      // If still no MPG, try attributes array
      if ((cityMpg === 0 || highwayMpg === 0) && result.attributes && Array.isArray(result.attributes)) {
        result.attributes.forEach((attr: any) => {
          if (attr.cityMpg && !cityMpg) cityMpg = Number(attr.cityMpg)
          if (attr.mpgCity && !cityMpg) cityMpg = Number(attr.mpgCity)
          if (attr.highwayMpg && !highwayMpg) highwayMpg = Number(attr.highwayMpg)
          if (attr.mpgHighway && !highwayMpg) highwayMpg = Number(attr.mpgHighway)
        })
      }

      return {
        id: result.uuid || result.id || `${result.vin || result.stockNumber || Date.now()}-${index}`,
        year: Number(result.year) || 2024,
        make: result.make || "Toyota",
        model: result.model || "Unknown",
        trim: result.trim || result.trimLevel || "",
        bodyStyle: result.bodyStyle || "Sedan",
        exteriorColor: exteriorColor,
        interiorColor: interiorColor,
        transmission: transmission,
        engine: engine,
        fuelType: normalizeFuelType(fuelType),
        cityMpg: cityMpg,
        highwayMpg: highwayMpg,
        mileage: mileage,
        askingPrice: askingPrice || internetPrice || 0,
        internetPrice: internetPrice || askingPrice || 0,
        imageUrl: imageUrl,
        vin: result.vin,
        stockNumber: result.stockNumber,
        isNew: result.type === "new" || result.condition === "new" || mileage < 100,
        seats: Number(result.seats) || 5,
      }
    })
    .filter((v: ToyotaVehicle) => v.year > 2010 && v.model !== "Unknown") // Filter out invalid vehicles

  // Log first transformed vehicle for debugging
  if (vehicles.length > 0) {
    console.log("[Transform] First transformed vehicle:", JSON.stringify(vehicles[0], null, 2))
  }

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
