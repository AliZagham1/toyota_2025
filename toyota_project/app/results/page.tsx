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
import { ToyoAssistant } from "@/components/ui/ToyoAssistant"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedCar, toggleComparisonCar, comparedCars } = useStore()

  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [originalDesc, setOriginalDesc] = useState<string>("")

  // Sorting
  const [sortBy, setSortBy] = useState<"best" | "priceAsc" | "priceDesc" | "mileageAsc" | "yearDesc" | "mpgDesc">("best")

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError("")

      try {
        const filtersParam = searchParams.get("filters")
        const filters = filtersParam ? JSON.parse(decodeURIComponent(filtersParam)) : {}
        const descParam = searchParams.get("desc")
        setOriginalDesc(descParam ? decodeURIComponent(descParam) : "")

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

  // Derived sorted list
  const displayedCars = (() => {
    let list = [...cars]
    // Sorting
    switch (sortBy) {
      case "priceAsc":
        list.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "priceDesc":
        list.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "mileageAsc":
        list.sort((a, b) => (a.mileage || 0) - (b.mileage || 0))
        break
      case "yearDesc":
        list.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      case "mpgDesc":
        list.sort((a, b) => (b.mpg || 0) - (a.mpg || 0))
        break
      case "best":
      default:
        
        break
    }
    return list
  })()

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
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <Header title="Search Results" subtitle={`Showing ${displayedCars.length} vehicles`} />

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
         
            <div className="mb-6 p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "best" | "priceAsc" | "priceDesc" | "mileageAsc" | "yearDesc" | "mpgDesc",
                    )
                  }
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F] transition-all duration-200 hover:border-[#D32F2F]/50"
                >
                  <option value="best">Best Match</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="mileageAsc">Mileage: Low to High</option>
                  <option value="yearDesc">Year: Newest First</option>
                  <option value="mpgDesc">MPG: Highest First</option>
                </select>
              </div>
            </div>

           
            {comparedCars.length > 0 && (
              <div className="mb-8 p-4 bg-linear-to-r from-[#D32F2F]/10 to-accent/10 border-2 border-[#D32F2F]/30 rounded-xl flex items-center justify-between shadow-sm animate-scale-in">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#D32F2F] rounded-full animate-pulse"></span>
                  {comparedCars.length} vehicle{comparedCars.length !== 1 ? "s" : ""} selected for comparison
                </span>
                <Button
                  onClick={() => router.push("/comparison")}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="sm"
                >
                  Compare Now
                </Button>
              </div>
            )}

            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCars.map((car, index) => (
                <Card
                  key={car.id}
                  onClick={() => handleViewInfo(car)}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-border hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  
                  <div className="relative overflow-hidden bg-muted h-48 group-hover:opacity-90 transition-all duration-300">
                    <img
                      src={car.imageUrl || "/placeholder.svg"}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-[#D32F2F] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {car.year}
                      </div>
                    </div>
                    {car.ecoRating && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-accent/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <span>🌱</span>
                          {car.ecoRating}/10
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-[#D32F2F] transition-colors duration-300">{car.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{car.color}</p>
                    {car.dealer && (
                      <div className="mb-3">
                        <span className="inline-block text-xs px-3 py-1 rounded-full bg-muted/80 border border-border text-foreground hover:bg-[#D32F2F]/10 hover:border-[#D32F2F]/30 transition-colors duration-200">
                          {car.dealer}
                        </span>
                      </div>
                    )}

                    {/* Key Stats */}
                    <div className="space-y-2 mb-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <DollarSign className="w-4 h-4 text-[#D32F2F]" />
                        <span className="font-semibold text-lg">${(car.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Fuel className="w-4 h-4 text-[#D32F2F]" />
                        <span className="capitalize">{car.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="w-4 h-4 text-[#D32F2F]" />
                        <span>{car.mileage > 0 ? `${car.mileage.toLocaleString()} miles` : "New"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleViewInfo(car)}
                        className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                        <Checkbox
                          id={`compare-${car.id}`}
                          checked={comparedCars.some((c) => c.id === car.id)}
                          onCheckedChange={() => handleCompare(car)}
                        />
                        <label
                          htmlFor={`compare-${car.id}`}
                          className="text-xs text-muted-foreground cursor-pointer flex-1 hover:text-foreground transition-colors"
                        >
                          Add to Compare
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

      
      {cars.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
        {cars.length > 0 && <ToyoAssistant cars={cars} originalQuery={originalDesc} />}
      </div>
      )}
    </div>
  )
}
