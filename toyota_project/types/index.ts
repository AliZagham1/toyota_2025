export interface CarFilters {
  make?: string
  model?: string
  models?: string[]
  trim?: string
  dealership?: string
  dealerships?: string[]
  priceRange?: {
    min: number
    max: number
  }
  priceRanges?: Array<{
    min: number
    max: number
  }>
  year?: number
  condition?: "new" | "used" | "both"
  mileage?: {
    min: number
    max: number
  }
  color?: string
  fuelType?: "gasoline" | "hybrid" | "electric"
  bodyStyle?: string
  interiorColor?: string
  transmission?: string
  options?: string[]
  highwayMpg?: number // Minimum highway MPG (e.g., 35 means 35+)
  cityMpg?: number // Minimum city MPG (e.g., 25 means 25+)
  overallMpg?: number // Minimum overall/average MPG (e.g., 30 means 30+)
  interiorMaterial?: string
  engine?: string
  driveLine?: string
  vehicleStatus?: "In Stock" | "In Transit" | "Build Phase"
}

export interface Car {
  id: string
  name: string
  model: string
  make: string
  price: number
  year: number
  mileage: number
  color: string
  fuelType: string
  mpg: number
  imageUrl: string
  specs: {
    transmission: string
    engine: string
    seats: number
  }
  ecoRating?: number
  isNew: boolean
  dealer?: string
  dealerKey?: string
}

export interface AffordabilityInput {
  downPayment: number
  creditScore: number
  loanType: "lease" | "finance"
  loanTerm: number
}

export interface AffordabilityResult {
  monthlyPayment: number
  totalPayment: number
  interestRate: number
}
