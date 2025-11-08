"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import type { CarFilters } from "@/types"

export default function FormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<CarFilters>({
    condition: "new",
    fuelType: "gasoline",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Send filters to results page
      router.push(`/results?filters=${encodeURIComponent(JSON.stringify(filters))}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="Filter by Specifications" subtitle="Specify your preferences" />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Make and Model */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Make</label>
              <Input
                placeholder="e.g., Toyota"
                value={filters.make || ""}
                onChange={(e) => handleChange("make", e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Model</label>
              <Input
                placeholder="e.g., Camry"
                value={filters.model || ""}
                onChange={(e) => handleChange("model", e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Price Range</label>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Min Price ($)</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={filters.priceRange?.min || ""}
                  onChange={(e) => handlePriceRangeChange("min", Number(e.target.value))}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Max Price ($)</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={filters.priceRange?.max || ""}
                  onChange={(e) => handlePriceRangeChange("max", Number(e.target.value))}
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          {/* Year and Condition */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Year</label>
              <Input
                type="number"
                placeholder="2024"
                value={filters.year || ""}
                onChange={(e) => handleChange("year", Number(e.target.value) || undefined)}
                className="bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => handleChange("condition", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Mileage (miles)</label>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Min Mileage</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.mileage?.min || ""}
                  onChange={(e) => handleMileageChange("min", Number(e.target.value))}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Max Mileage</label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={filters.mileage?.max || ""}
                  onChange={(e) => handleMileageChange("max", Number(e.target.value))}
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          {/* Color and Fuel Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Color</label>
              <Input
                placeholder="e.g., Black"
                value={filters.color || ""}
                onChange={(e) => handleChange("color", e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Fuel Type</label>
              <select
                value={filters.fuelType}
                onChange={(e) => handleChange("fuelType", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="gasoline">Gasoline</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
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
