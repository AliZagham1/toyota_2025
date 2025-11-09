"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function ComparisonPage() {
  const router = useRouter()
  const { comparedCars, clearComparison } = useStore()

  if (comparedCars.length === 0) {
    return (
      <div>
        <Header title="Compare Vehicles" />
        <main className="max-w-6xl mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-6">No vehicles selected for comparison</p>
          <Button onClick={() => router.back()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Go Back
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header title="Compare Vehicles" subtitle={`Comparing ${comparedCars.length} vehicles`} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="overflow-x-auto mb-8">
          <div className="grid gap-4 pb-4" style={{ gridTemplateColumns: `repeat(${comparedCars.length}, 300px)` }}>
            {comparedCars.map((car) => (
              <Card key={car.id} className="border border-border overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="h-40 bg-muted overflow-hidden">
                  <img src={car.imageUrl || "/placeholder.svg"} alt={car.name} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{car.name}</h3>
                    <p className="text-sm text-muted-foreground">{car.year}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold text-primary">${car.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">MPG</span>
                      <span className="font-semibold">{car.mpg}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fuel Type</span>
                      <span className="font-semibold capitalize">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mileage</span>
                      <span className="font-semibold">{car.mileage > 0 ? `${car.mileage.toLocaleString()} mi` : "New"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Seats</span>
                      <span className="font-semibold">{car.specs.seats}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(`/car/${car.id}`)}
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <Card className="border border-border p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Detailed Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-semibold text-foreground py-3 pr-4">Feature</th>
                  {comparedCars.map((car) => (
                    <th key={car.id} className="text-center font-semibold text-foreground py-3 px-4">
                      {car.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Price</td>
                  {comparedCars.map((car) => (
                    <td key={car.id} className="py-3 px-4 text-center text-primary font-semibold">
                      ${car.price.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Year</td>
                  {comparedCars.map((car) => (
                    <td key={car.id} className="py-3 px-4 text-center text-foreground">
                      {car.year}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 pr-4 font-medium text-foreground">MPG</td>
                  {comparedCars.map((car) => (
                    <td key={car.id} className="py-3 px-4 text-center text-foreground">
                      {car.mpg} MPG
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Fuel Type</td>
                  {comparedCars.map((car) => (
                    <td key={car.id} className="py-3 px-4 text-center text-foreground capitalize">
                      {car.fuelType}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Transmission</td>
                  {comparedCars.map((car) => (
                    <td key={car.id} className="py-3 px-4 text-center text-foreground">
                      {car.specs.transmission}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 pr-4 font-medium text-foreground">Seats</td>
                  {comparedCars.map((car) => (
                    <td key={car.id} className="py-3 px-4 text-center text-foreground">
                      {car.specs.seats}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={clearComparison} className="border-border bg-transparent">
            Clear Comparison
          </Button>
          <Button
            onClick={() => router.push("/results")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Back to Results
          </Button>
        </div>
      </main>
    </div>
  )
}
