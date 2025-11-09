export interface CarFilters {
  make?: string
  model?: string
  trim?: string
  priceRange?: {
    min: number
    max: number
  }
  year?: number
  condition?: "new" | "used"
  mileage?: {
    min: number
    max: number
  }
  color?: string
  fuelType?: "gasoline" | "hybrid" | "electric"
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
