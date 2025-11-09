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
  dealer?: string
}

type DealerKey = "plano" | "dallas"
type DealerConfig = {
  key: DealerKey
  siteId: string
  domain: string // e.g., https://www.toyotaofplano.com
  pageIdNew: string
  pageIdUsed: string
  refererNew: string
  refererUsed: string
}

const DEALERS: Record<DealerKey, DealerConfig> = {
  plano: {
    key: "plano",
    siteId: "toyotaofplanogst",
    domain: "https://www.toyotaofplano.com",
    pageIdNew: "toyotaofplanogst_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_NEW_V1_1",
    pageIdUsed: "toyotaofplanogst_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_USED_V1_1",
    refererNew: "https://www.toyotaofplano.com/new-inventory/index.htm",
    refererUsed: "https://www.toyotaofplano.com/used-inventory/index.htm",
  },
  dallas: {
    key: "dallas",
    siteId: "toyotadallasvtg",
    domain: "https://www.toyotaofdallas.com",
    pageIdNew: "toyotadallasvtg_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_NEW_V1_1",
    pageIdUsed: "toyotadallasvtg_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_USED_V1_1",
    refererNew: "https://www.toyotaofdallas.com/new-inventory/index.htm",
    refererUsed: "https://www.toyotaofdallas.com/used-inventory/index.htm",
  },
}
/**
 * Helper function to build payload for a specific condition (new or used)
 */
function buildToyotaPayload(
  inventoryParameters: any,
  condition: "new" | "used",
  dealer: DealerConfig,
): any {
  const isNew = condition === "new"
  const pageAlias = isNew
    ? "INVENTORY_LISTING_DEFAULT_AUTO_NEW"
    : "INVENTORY_LISTING_DEFAULT_AUTO_USED"
  const pageId = isNew ? dealer.pageIdNew : dealer.pageIdUsed
  const listingConfigId = isNew ? "auto-new" : "auto-used"

  return {
    siteId: dealer.siteId,
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
      displayerInstanceId: isNew
        ? "INVENTORY_LISTING_DEFAULT_AUTO_NEW:inventory-data-bus1_1673036815"
        : "",
      "required.display.sets":
        "TITLE,IMAGE_ALT,IMAGE_TITLE,PRICE,FEATURED_ITEMS,CALLOUT,LISTING,HIGHLIGHTED_ATTRIBUTES",
      "required.display.attributes":
        "accountCity,accountCountry,accountId,accountName,accountState,accountZipcode,askingPrice,attributes,autodataCaId_att_data,bed,bodyStyle,cab,carfaxIconUrl,carfaxIconUrlBlackWhite,carfaxUrl,carfaxValueBadgeAltText,categoryName,certified,chromeId_att_data,cityMpg,classification,classificationName,comments,courtesy,cpoChecklistUrl,daysOnLot,dcpaisVideoToken_att_data,deliveryDateRange,doors,driveLine,ebayAuctionId,eleadPrice,eleadPriceLessOEMCash,engine,engineSize,equipment,extColor,exteriorColor,fuelType,globalVehicleTrimId,gvLongTrimDescription,gvTrim,hasCarFaxReport,hideInternetPrice,highwayMpg,id,incentives,intColor,interiorColor,interiorColorCode,internetComments,internetPrice,inventoryDate,invoicePrice,isElectric_att_b,key,location,make,marketingTitle,mileage,model,modelCode,msrp,normalExteriorColor,normalFuelType,normalInteriorColor,numSaves,odometer,oemSerialNumber,oemSourcedMerchandisingStatus,optionCodes,options,packageCode,packages_internal,parent,parentId,paymentMonthly,payments,primary_image,propertyDescription,retailValue,saleLease,salePrice,sharedVehicle,status,stockNumber,transmission,trim,trimLevel,type,uuid,video,vin,warrantyDescription,wholesalePrice,year,cpoTier",
      "required.display.attributes.extra": "",
      facetInstanceId: isNew
        ? "INVENTORY_LISTING_DEFAULT_AUTO_NEW:inventory-data-bus1_1684257599"
        : "listing",
      geoLocationEnabled: "false",
      defaultGeoDistRadius: "0",
      geoRadiusValues: "0,5,25,50,100,250,500,1000",
      showCertifiedFranchiseVehiclesOnly: "false",
      showFranchiseVehiclesOnly: "true",
      extraFranchisesForUsedWindowStickers: "",
      suppressAllConditions: "compliant",
      violateUsedCompliance: "false",
      showOffSiteInventoryBanner: isNew ? "true" : "false",
      showPhotosViewer: "true",
      offsetSharedVehicleImageByOne: dealer.key === "dallas" ? "true" : "false",
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
}

/**
 * Fetches inventory from Toyota of plano API
 * @param filters Optional filters to apply to the search
 */
export async function getToyotaInventory(filters?: {
  priceRange?: { min: number; max: number }
  priceRanges?: Array<{ min: number; max: number }>
  yearRange?: { min: number; max: number }
  year?: number
  model?: string
  trim?: string
  fuelType?: string
  bodyStyle?: string
  color?: string
  condition?: "new" | "used" | "both"
  mileage?: { min: number; max: number }
  interiorColor?: string
  transmission?: string
  options?: string[]
  highwayMpg?: number
  cityMpg?: number
  overallMpg?: number
  interiorMaterial?: string
  engine?: string
  driveLine?: string
  vehicleStatus?: "In Stock" | "In Transit" | "Build Phase"
  dealership?: DealerKey
  dealerships?: DealerKey[]
}): Promise<ToyotaVehicle[]> {
  try {
    // Build inventoryParameters from filters - map directly to Toyota API format
    const inventoryParameters: any = {}

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
      // Use normalExteriorColor for better matching (Toyota API uses normalized colors)
      inventoryParameters.normalExteriorColor = filters.color
    }

    // Interior color filter
    if (filters?.interiorColor) {
      inventoryParameters.normalInteriorColor = filters.interiorColor
    }

    // Transmission filter
    if (filters?.transmission) {
      inventoryParameters.normalTransmission = filters.transmission
    }

    // Vehicle options/features filter (e.g., "Apple CarPlay", "Android Auto", "Sunroof")
    if (filters?.options && filters.options.length > 0) {
      // Toyota API accepts single option, so use the first one
      // Multiple options could be handled by making multiple API calls if needed
      inventoryParameters.gvOption = filters.options[0]
    }

    // Highway MPG filter (minimum highway MPG)
    if (filters?.highwayMpg) {
      // Format as "35-" for 35+ MPG
      inventoryParameters.highwayFuelEconomy = `${filters.highwayMpg}-`
    }

    // City MPG filter (minimum city MPG)
    if (filters?.cityMpg) {
      // Format as "25-" for 25+ MPG
      inventoryParameters.cityFuelEconomy = `${filters.cityMpg}-`
    }

    // Interior material filter
    if (filters?.interiorMaterial) {
      inventoryParameters.normalInteriorMaterial = filters.interiorMaterial
    }

    // Engine filter
    if (filters?.engine) {
      inventoryParameters.engine = filters.engine
    }

    // Drive line filter (FWD, AWD, RWD, 4WD)
    if (filters?.driveLine) {
      inventoryParameters.normalDriveLine = filters.driveLine
    }

    // Handle price ranges - Toyota API expects array of strings like ["30000-39999", "20000-29999"]
    console.log("[Toyota API] Price filter check:")
    console.log("  - priceRanges:", filters?.priceRanges)
    console.log("  - priceRange:", filters?.priceRange)
    
    if (filters?.priceRanges && filters.priceRanges.length > 0) {
      inventoryParameters.internetPrice = filters.priceRanges.map(
        (range) => `${range.min}-${range.max}`
      )
      console.log("[Toyota API] Using priceRanges:", inventoryParameters.internetPrice)
    } else if (filters?.priceRange) {
      // Fallback to single price range
      inventoryParameters.internetPrice = [`${filters.priceRange.min}-${filters.priceRange.max}`]
      console.log("[Toyota API] Using priceRange:", inventoryParameters.internetPrice)
    } else {
      console.log("[Toyota API] No price filter applied")
    }

    // Determine which conditions to fetch
    const conditionsToFetch: ("new" | "used")[] = []
    if (!filters?.condition || filters.condition === "both") {
      // Fetch both new and used
      conditionsToFetch.push("new", "used")
    } else {
      // Fetch only the specified condition
      conditionsToFetch.push(filters.condition)
    }

    // Don't add type filter if fetching both
    if (conditionsToFetch.length === 1) {
      inventoryParameters.type = conditionsToFetch[0]
    }

    // Handle mileage/odometer filter - Toyota API uses odometer
    // Only apply odometer filter for used cars (new cars typically have 0 miles and API may ignore it)
    // We'll also apply client-side filtering as a fallback
    if (filters?.mileage) {
      // Only add odometer filter if we're fetching used cars
      // If fetching both, we'll filter client-side after fetching
      if (conditionsToFetch.length === 1 && conditionsToFetch[0] === "used") {
        inventoryParameters.odometer = `${filters.mileage.min}-${filters.mileage.max}`
        console.log("[Toyota API] Using mileage filter (odometer) for used cars:", inventoryParameters.odometer)
      } else {
        console.log("[Toyota API] Mileage filter will be applied client-side after fetching (fetching both new/used or new only)")
      }
    }

    // Log inventoryParameters for debugging
    console.log("[Toyota API] inventoryParameters:", JSON.stringify(inventoryParameters, null, 2))
    console.log("[Toyota API] Fetching conditions:", conditionsToFetch)

    // Determine dealers to fetch
    let dealersToFetch: DealerKey[] = []
    if (filters?.dealerships && filters.dealerships.length > 0) {
      dealersToFetch = filters.dealerships.filter((d): d is DealerKey => d === "plano" || d === "dallas")
    } else if (filters?.dealership) {
      if (filters.dealership === "plano" || filters.dealership === "dallas") {
        dealersToFetch = [filters.dealership]
      }
    }
    // Default to both if none specified
    if (dealersToFetch.length === 0) {
      dealersToFetch = ["plano", "dallas"]
    }
    console.log("[Toyota API] Dealers to fetch:", dealersToFetch.join(", "))

    // Fetch from all specified dealers and conditions in parallel
    const fetchPromises = dealersToFetch.flatMap((dealerKey) =>
      conditionsToFetch.map(async (condition) => {
        const dealer = DEALERS[dealerKey]
        const payload = buildToyotaPayload(inventoryParameters, condition, dealer)
        const referer = condition === "new" ? dealer.refererNew : dealer.refererUsed

        console.log(`[Toyota API] Fetching ${condition} vehicles from ${dealer.domain} ...`)

        const response = await fetch(`${dealer.domain}/api/widget/ws-inv-data/getInventory`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            Origin: dealer.domain,
            Referer: referer,
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          console.error(`[Toyota API] ${dealerKey}/${condition} response error:`, response.status, response.statusText)
          const errorText = await response.text().catch(() => "")
          console.error(`[Toyota API] ${dealerKey}/${condition} error details:`, errorText)
          // Don't throw, just return empty array for this condition
          return []
        }

        const data = await response.json()
        console.log(
          `[Toyota API] ${dealerKey}/${condition} vehicles fetched:`,
          data?.inventory?.length || data?.results?.length || 0,
        )

        // Transform the API response to our vehicle format
        return transformToyotaResponse(data, dealer.domain, dealer.key)
      }),
    )

    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises)
    
    // Combine all vehicles from different conditions
    let allVehicles = results.flat()
    console.log(
      `[Toyota API] Total vehicles fetched before filtering: ${allVehicles.length} (${dealersToFetch.join(
        " + ",
      )} x ${conditionsToFetch.join(" + ")})`,
    )

    // Enforce dealership filter as a safety net (in case of future changes)
    if (filters?.dealership || (filters?.dealerships && filters.dealerships.length > 0)) {
      const allowed = new Set<string>(
        (filters.dealerships as string[]) ||
          (filters.dealership ? [filters.dealership as string] : []),
      )
      const before = allVehicles.length
      allVehicles = allVehicles.filter((v: ToyotaVehicle & { dealer?: string }) =>
        v.dealer ? allowed.has(v.dealer) : true,
      )
      console.log(
        `[Toyota API] Dealer filter applied: ${allVehicles.length} remain (removed ${before - allVehicles.length})`,
      )
    }

    // Apply client-side mileage filter if provided (as fallback since API may not respect it)
    if (filters?.mileage) {
      const beforeCount = allVehicles.length
      allVehicles = allVehicles.filter((vehicle) => {
        const vehicleMileage = vehicle.mileage || 0
        const inRange = vehicleMileage >= filters.mileage!.min && vehicleMileage <= filters.mileage!.max
        if (!inRange) {
          console.log(`[Toyota API] Filtering out vehicle: ${vehicle.year} ${vehicle.model} with ${vehicleMileage} miles (outside range ${filters.mileage!.min}-${filters.mileage!.max})`)
        }
        return inRange
      })
      console.log(`[Toyota API] After mileage filter: ${allVehicles.length} vehicles (removed ${beforeCount - allVehicles.length})`)
    }

    // Apply client-side overall MPG filter (average of city and highway)
    if (filters?.overallMpg) {
      const beforeCount = allVehicles.length
      allVehicles = allVehicles.filter((vehicle) => {
        const avgMpg = (vehicle.cityMpg + vehicle.highwayMpg) / 2
        const meetsMpg = avgMpg >= filters.overallMpg!
        if (!meetsMpg) {
          console.log(`[Toyota API] Filtering out vehicle: ${vehicle.year} ${vehicle.model} with ${avgMpg.toFixed(1)} avg MPG (below ${filters.overallMpg})`)
        }
        return meetsMpg
      })
      console.log(`[Toyota API] After overall MPG filter: ${allVehicles.length} vehicles (removed ${beforeCount - allVehicles.length})`)
    }

    // Apply client-side vehicle status filter (if API response includes status field)
    // Note: This will filter based on status field in the API response if available
    // Vehicle status filtering may need to be done based on API response structure
    if (filters?.vehicleStatus) {
      console.log(`[Toyota API] Vehicle status filter requested: ${filters.vehicleStatus} (may need API response structure check)`)
      // TODO: Implement status filtering once we know the exact field name in API response
    }

    // Apply client-side filtering for year (as fallback since API may not respect it)
    if (filters?.year) {
      const beforeCount = allVehicles.length
      allVehicles = allVehicles.filter((vehicle) => {
        const matchesYear = vehicle.year === filters.year!
        if (!matchesYear) {
          console.log(`[Toyota API] Filtering out vehicle: ${vehicle.year} ${vehicle.model} (doesn't match year ${filters.year})`)
        }
        return matchesYear
      })
      console.log(`[Toyota API] After year filter: ${allVehicles.length} vehicles (removed ${beforeCount - allVehicles.length})`)
    }

    // Apply client-side filtering for trim (as fallback since API may not respect it exactly)
    if (filters?.trim) {
      const beforeCount = allVehicles.length
      const trimFilter = filters.trim.trim().toUpperCase()
      allVehicles = allVehicles.filter((vehicle) => {
        const vehicleTrim = (vehicle.trim || "").trim().toUpperCase()
        // Exact match: "LE" should match "LE" but not "XLE"
        // Allow matches like "LE", "LE Premium", "LE Hybrid" but not "XLE", "SE", etc.
        // Match if trim equals filter exactly, or starts with filter followed by a space
        const matchesTrim = vehicleTrim === trimFilter || vehicleTrim.startsWith(trimFilter + " ")
        
        if (!matchesTrim) {
          console.log(`[Toyota API] Filtering out vehicle: ${vehicle.year} ${vehicle.model} ${vehicle.trim} (trim "${vehicleTrim}" doesn't match "${trimFilter}")`)
        }
        return matchesTrim
      })
      console.log(`[Toyota API] After trim filter: ${allVehicles.length} vehicles (removed ${beforeCount - allVehicles.length})`)
    }

    return allVehicles
  } catch (error) {
    console.error("[Toyota API] Error fetching inventory:", error)
    throw error
  }
}

/**
 * Transforms Toyota API response into our vehicle format
 */
function transformToyotaResponse(data: any, baseDomain: string, dealerKey: DealerKey): ToyotaVehicle[] {
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

  // Helper function to extract value from attributes array (different structure)
  const getAttribute = (attributes: any[], name: string): string | undefined => {
    if (!attributes || !Array.isArray(attributes)) return undefined
    const attr = attributes.find((a: any) => a.name === name)
    return attr?.value
  }

  const vehicles: ToyotaVehicle[] = results
    .map((result: any, index: number) => {
      // Extract data directly from result object (API structure has data at top level)
      const trackingAttributes = result.trackingAttributes || []
      const attributes = result.attributes || [] // Attributes array with name/value pairs
      const trackingPricing = result.trackingPricing || {}
      const pricing = result.pricing || {}
      const images = result.images || []
      
      // Log attributes structure for first item to debug
      if (index === 0) {
        console.log("[Transform] Attributes array sample:", JSON.stringify(attributes.slice(0, 5), null, 2))
      }

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
            ? `${baseDomain}${imageUrl}`
            : `${baseDomain}/${imageUrl}`
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

      // Extract mileage/odometer - check attributes array first (has name="odometer" with value="X miles")
      let mileage = 0
      
      // Try to get odometer from attributes array
      const odometerValue = getAttribute(attributes, "odometer")
      if (odometerValue) {
        // Parse string like "3 miles" or "15000 miles" to extract number
        const mileageMatch = odometerValue.toString().match(/(\d+(?:,\d+)?)/)
        if (mileageMatch) {
          mileage = Number(mileageMatch[1].replace(/,/g, ""))
        }
      }
      
      // Fallback to direct fields if not found in attributes
      if (mileage === 0) {
        mileage = Number(result.odometer) || 
                 Number(result.mileage) || 
                 0
      }
      
      // Log mileage extraction for first item
      if (index === 0) {
        console.log("[Transform] Odometer from attributes:", odometerValue)
        console.log("[Transform] Extracted mileage:", mileage)
      }

      // Extract MPG - check trackingAttributes first, then attributes array, then direct fields
      let cityMpg = Number(getTrackingAttribute(trackingAttributes, "cityMpg") || 
                          getTrackingAttribute(trackingAttributes, "mpgCity") ||
                          getAttribute(attributes, "cityMpg") ||
                          getAttribute(attributes, "mpgCity") ||
                          result.cityMpg || 
                          result.mpgCity || 
                          0)
      
      let highwayMpg = Number(getTrackingAttribute(trackingAttributes, "highwayMpg") || 
                              getTrackingAttribute(trackingAttributes, "mpgHighway") ||
                              getAttribute(attributes, "highwayMpg") ||
                              getAttribute(attributes, "mpgHighway") ||
                              result.highwayMpg || 
                              result.mpgHighway || 
                              0)

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
        dealer: dealerKey,
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
