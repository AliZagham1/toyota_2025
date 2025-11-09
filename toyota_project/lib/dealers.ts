export type DealerConfig = {
  key: string
  displayName: string
  siteId: string
  domain: string
  pageIdNew: string
  pageIdUsed: string
  refererNew: string
  refererUsed: string
  flags?: {
    offsetSharedVehicleImageByOne?: boolean
  }
}

// Registry of supported dealerships. Add new dealers here.
const DEALERS: DealerConfig[] = [
    {
      key: "plano",
      displayName: "Toyota of Plano",
      siteId: "toyotaofplanogst",
      domain: "https://www.toyotaofplano.com",
      pageIdNew: "toyotaofplanogst_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_NEW_V1_1",
      pageIdUsed: "toyotaofplanogst_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_USED_V1_1",
      refererNew: "https://www.toyotaofplano.com/new-inventory/index.htm",
      refererUsed: "https://www.toyotaofplano.com/used-inventory/index.htm",
    },
    {
      key: "dallas",
      displayName: "Toyota of Dallas",
      siteId: "toyotadallasvtg",
      domain: "https://www.toyotaofdallas.com",
      pageIdNew: "toyotadallasvtg_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_NEW_V1_1",
      pageIdUsed: "toyotadallasvtg_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_USED_V1_1",
      refererNew: "https://www.toyotaofdallas.com/new-inventory/index.htm",
      refererUsed: "https://www.toyotaofdallas.com/used-inventory/index.htm",
      flags: { offsetSharedVehicleImageByOne: true },
    },
    {
      key: "richardson",
      displayName: "Toyota of Richardson",
      siteId: "toyotarichardsonvtg",
      domain: "https://www.toyotaofrichardson.com",
      pageIdNew: "toyotarichardsonvtg_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_NEW_V1_2",
      pageIdUsed: "toyotarichardsonvtg_SITEBUILDER_INVENTORY_SEARCH_RESULTS_AUTO_USED_V1_2",
      refererNew: "https://www.toyotaofrichardson.com/new-inventory/index.htm",
      refererUsed: "https://www.toyotaofrichardson.com/used-inventory/index.htm",
      flags: { offsetSharedVehicleImageByOne: true },
    },
  ]

export function listDealers(): DealerConfig[] {
  return DEALERS.slice()
}

export function getDealersMap(): Record<string, DealerConfig> {
  return DEALERS.reduce((acc, d) => {
    acc[d.key] = d
    return acc
  }, {} as Record<string, DealerConfig>)
}

export function getDealerByKey(key: string | undefined | null): DealerConfig | undefined {
  if (!key) return undefined
  const map = getDealersMap()
  return map[key]
}


