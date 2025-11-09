"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import type { CarFilters } from "@/types"

// Available options/features
const VEHICLE_OPTIONS = [
  "3rd Row Seat",
  "Alloy Wheels",
  "Android Auto",
  "Apple CarPlay",
  "Automatic Climate Control",
  "Automatic Cruise Control",
  "Bed Liner",
  "Emergency Communication System",
  "Fog Lights",
  "Hands-Free Liftgate",
  "Heated Seats",
  "Heated Side Mirrors",
  "Heated Steering Wheel",
  "Lane Assist",
  "Lane Departure Warning",
  "LED Headlights",
  "Memory Seats",
  "Navigation System",
  "Parking Sensors / Assist",
  "Power Seats",
  "Premium Audio",
  "Push Button Starting",
  "Rain Sensing Wipers",
  "Rear Air Conditioning",
  "Rear Heated Seats",
  "Rear Sunshade",
  "Rearview Camera",
  "Roof Rack",
  "Running Boards",
  "Steering Wheel Controls",
  "Sunroof / Moonroof",
  "Tow Hitch/Tow Package",
  "Ventilated/Cooled Seats",
  "Wireless Phone Charging",
]

export default function FormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<CarFilters>({
    condition: "both",
    fuelType: undefined,
  })
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const handleChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handlePriceRangeChange = (field: "min" | "max", value: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        min: field === "min" ? value : prev.priceRange?.min || 0,
        max: field === "max" ? value : prev.priceRange?.max || 100000,
      },
    }))
  }

  const handleMileageChange = (field: "min" | "max", value: number) => {
    setFilters((prev) => ({
      ...prev,
      mileage: {
        ...prev.mileage,
        min: field === "min" ? value : prev.mileage?.min || 0,
        max: field === "max" ? value : prev.mileage?.max || 200000,
      },
    }))
  }

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare filters with options
      const finalFilters: CarFilters = {
        ...filters,
        options: selectedOptions.length > 0 ? selectedOptions : undefined,
      }

      // Remove undefined values
      Object.keys(finalFilters).forEach((key) => {
        const value = finalFilters[key as keyof CarFilters]
        if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
          delete finalFilters[key as keyof CarFilters]
        }
      })

      // Send filters to results page
      router.push(`/results?filters=${encodeURIComponent(JSON.stringify(finalFilters))}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Header title="Filter by Specifications" subtitle="Specify your preferences" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          {/* Basic Information */}
          <div className="space-y-6 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#D32F2F] rounded-full"></div>
              Basic Information
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Make</label>
                <Input
                  placeholder="e.g., Toyota"
                  value={filters.make || ""}
                  onChange={(e) => handleChange("make", e.target.value || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Model</label>
                <Input
                  placeholder="e.g., Camry"
                  value={filters.model || ""}
                  onChange={(e) => handleChange("model", e.target.value || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Trim</label>
                <Input
                  placeholder="e.g., XLE"
                  value={filters.trim || ""}
                  onChange={(e) => handleChange("trim", e.target.value || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={filters.year || ""}
                  onChange={(e) => handleChange("year", Number(e.target.value) || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Body Style</label>
                <select
                  value={filters.bodyStyle || ""}
                  onChange={(e) => handleChange("bodyStyle", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="">Any</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Minivan">Minivan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Condition</label>
                <select
                  value={filters.condition || "both"}
                  onChange={(e) => handleChange("condition", e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="both">Both</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Mileage */}
          <div className="space-y-6 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#D32F2F] rounded-full"></div>
              Pricing & Mileage
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Price Range ($)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Min Price</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.priceRange?.min || ""}
                      onChange={(e) => handlePriceRangeChange("min", Number(e.target.value))}
                      className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Max Price</label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={filters.priceRange?.max || ""}
                      onChange={(e) => handlePriceRangeChange("max", Number(e.target.value))}
                      className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Mileage (miles)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Min Mileage</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.mileage?.min || ""}
                      onChange={(e) => handleMileageChange("min", Number(e.target.value))}
                      className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Max Mileage</label>
                    <Input
                      type="number"
                      placeholder="200000"
                      value={filters.mileage?.max || ""}
                      onChange={(e) => handleMileageChange("max", Number(e.target.value))}
                      className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance & Interior */}
          <div className="space-y-6 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#D32F2F] rounded-full"></div>
              Appearance & Interior
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Exterior Color</label>
                <Input
                  placeholder="e.g., Black"
                  value={filters.color || ""}
                  onChange={(e) => handleChange("color", e.target.value || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Interior Color</label>
                <select
                  value={filters.interiorColor || ""}
                  onChange={(e) => handleChange("interiorColor", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="">Any</option>
                  <option value="Gray">Gray</option>
                  <option value="Black">Black</option>
                  <option value="Beige">Beige</option>
                  <option value="Tan">Tan</option>
                  <option value="Brown">Brown</option>
                  <option value="Ivory">Ivory</option>
                  <option value="Cream">Cream</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Interior Material</label>
                <select
                  value={filters.interiorMaterial || ""}
                  onChange={(e) => handleChange("interiorMaterial", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="">Any</option>
                  <option value="Leather">Leather</option>
                  <option value="Cloth">Cloth</option>
                  <option value="Synthetic">Synthetic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance & Drivetrain */}
          <div className="space-y-6 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#D32F2F] rounded-full"></div>
              Performance & Drivetrain
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fuel Type</label>
                <select
                  value={filters.fuelType || ""}
                  onChange={(e) => handleChange("fuelType", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="">Any</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Transmission</label>
                <select
                  value={filters.transmission || ""}
                  onChange={(e) => handleChange("transmission", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="">Any</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Engine</label>
                <select
                  value={filters.engine || ""}
                  onChange={(e) => handleChange("engine", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="">Any</option>
                  <option value="4-Cyl. Engine">4-Cyl. Engine</option>
                  <option value="V6 Engine">V6 Engine</option>
                  <option value="V8 Engine">V8 Engine</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Drive Line</label>
                <select
                  value={filters.driveLine || ""}
                  onChange={(e) => handleChange("driveLine", e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="">Any</option>
                  <option value="FWD">FWD</option>
                  <option value="AWD">AWD</option>
                  <option value="RWD">RWD</option>
                  <option value="4WD">4WD</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Highway MPG (min)</label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={filters.highwayMpg || ""}
                  onChange={(e) => handleChange("highwayMpg", Number(e.target.value) || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City MPG (min)</label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={filters.cityMpg || ""}
                  onChange={(e) => handleChange("cityMpg", Number(e.target.value) || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Overall MPG (min)</label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={filters.overallMpg || ""}
                  onChange={(e) => handleChange("overallMpg", Number(e.target.value) || undefined)}
                  className="bg-background transition-all duration-200 focus:ring-2 focus:ring-[#D32F2F] hover:border-[#D32F2F]/50"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="space-y-6 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#D32F2F] rounded-full"></div>
              Availability
            </h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Vehicle Status</label>
              <select
                value={filters.vehicleStatus || ""}
                onChange={(e) =>
                  handleChange("vehicleStatus", (e.target.value || undefined) as CarFilters["vehicleStatus"])
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                <option value="In Stock">In Stock</option>
                <option value="In Transit">In Transit</option>
                <option value="Build Phase">Build Phase</option>
              </select>
            </div>
          </div>

          {/* Features/Options */}
          <div className="space-y-6 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#D32F2F] rounded-full"></div>
              Features & Options
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 border border-border rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-300">
              {VEHICLE_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={() => handleOptionToggle(option)}
                  />
                  <label
                    htmlFor={option}
                    className="text-sm text-foreground cursor-pointer flex-1"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-between pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Search Vehicles
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
