"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Fuel, DollarSign, Calendar } from "lucide-react"
import type { Car } from "@/types"
import { useStore } from "@/lib/store"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedCar, toggleComparisonCar, comparedCars } = useStore()

  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError("")

      try {
        const filtersParam = searchParams.get("filters")
        const filters = filtersParam ? JSON.parse(decodeURIComponent(filtersParam)) : {}

        // Call API to fetch cars based on filters
        const response = await fetch("/api/search/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        })

        if (!response.ok) throw new Error("Failed to fetch results")

        const data = await response.json()
        setCars(data.cars || [])
      } catch (err) {
        setError("Failed to load search results. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  const handleCompare = (car: Car) => {
    toggleComparisonCar(car)
  }

  const handleViewInfo = (car: Car) => {
    setSelectedCar(car)
    router.push(`/car/${car.id}`)
  }

  if (loading) {
    return (
      <div>
        <Header title="Search Results" />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading vehicles...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header title="Search Results" subtitle={`Found ${cars.length} vehicles matching your criteria`} />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive mb-6">
            {error}
          </div>
        )}

        {cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No vehicles found matching your criteria</p>
            <Button onClick={() => router.back()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Adjust Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Comparison Bar */}
            {comparedCars.length > 0 && (
              <div className="mb-8 p-4 bg-accent/10 border border-accent rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {comparedCars.length} vehicle{comparedCars.length !== 1 ? "s" : ""} selected for comparison
                </span>
                <Button
                  onClick={() => router.push("/comparison")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="sm"
                >
                  Compare
                </Button>
              </div>
            )}

            {/* Car Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Card
                  key={car.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border border-border"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-muted h-48 group-hover:opacity-80 transition-opacity">
                    <img
                      src={car.imageUrl || "/placeholder.svg"}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                        {car.year}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-1">{car.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{car.color}</p>

                    {/* Key Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-semibold">${(car.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Fuel className="w-4 h-4 text-primary" />
                        <span className="capitalize">{car.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{car.mileage > 0 ? `${car.mileage.toLocaleString()} miles` : "New"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleViewInfo(car)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="sm"
                      >
                        View Info
                      </Button>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Checkbox
                          id={`compare-${car.id}`}
                          checked={comparedCars.some((c) => c.id === car.id)}
                          onCheckedChange={() => handleCompare(car)}
                        />
                        <label
                          htmlFor={`compare-${car.id}`}
                          className="text-xs text-muted-foreground cursor-pointer flex-1"
                        >
                          Compare
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
