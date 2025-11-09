"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Users, Fuel, Zap, MapPin, Star } from "lucide-react"
import type { Car } from "@/types"
import { useStore } from "@/lib/store"

interface Dealer {
  name: string
  address: string
  rating: number
}

export default function CarDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { selectedCar } = useStore()

  const [car, setCar] = useState<Car | null>(selectedCar || null)
  const [loading, setLoading] = useState(!selectedCar)
  const [findingDealers, setFindingDealers] = useState(false);
const [dealers, setDealers] = useState<
  { name: string; address: string; rating: number | null; place_id: string; location?: any; isOpen: boolean | null }[]
>([]);
const [dealerError, setDealerError] = useState<string | null>(null);


  useEffect(() => {
    if (selectedCar) {
      setCar(selectedCar)
      setLoading(false)
      return
    }

    // Fetch car details by ID if not in store
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/cars/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch car")
        const data = await response.json()
        setCar(data.car)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [params.id, selectedCar])

  if (loading) {
    return (
      <div>
        <Header title="Vehicle Details" />
        <main className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!car) {
    return (
      <div>
        <Header title="Vehicle Not Found" />
        <main className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground mb-6">We could not find the vehicle details.</p>
          <Button onClick={() => router.back()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Go Back
          </Button>
        </main>
      </div>
    )
  }

  async function handleFindDealers() {
    setDealerError(null);
    setDealers([]);
    setFindingDealers(true);
  
    try {
      // --- ADD THIS CHECK ---
      if (!car) {
        throw new Error("Car details are not available.");
      }
      // --------------------

      // Get browser location
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      // Try browser geolocation first with reasonable options
      let lat: number | null = null
      let lng: number | null = null
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false, // faster / less power, better chance to resolve indoors
            timeout: 20000, // extend timeout to reduce spurious timeouts
            maximumAge: 60000, // allow a cached position up to 1 min old
          });
        });
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch (geoErr) {
        // Fallback: approximate by dealership city if available, else Dallas center
        const dealerName = car.dealer || ""
        if (dealerName.includes("Dallas")) {
          lat = 32.7767; lng = -96.7970
        } else if (dealerName.includes("Plano")) {
          lat = 33.0198; lng = -96.6989
        } else {
          // DFW metro fallback
          lat = 32.8998; lng = -97.0403
        }
      }
      if (lat == null || lng == null) {
        throw new Error("Location unavailable")
      }
  
      // Call our API
      const res = await fetch("/api/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // --- UPDATE THIS LINE ---
        body: JSON.stringify({ lat, lng, make: car.make }),
        // ------------------------
      });
  
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to find dealers");
      }
      console.log("Dealer API response:", data);
  
      setDealers(data.dealers || []);
    } catch (err: any) {
      setDealerError(err?.message ?? "Failed to get location or dealers");
    } finally {
      setFindingDealers(false);
    }
  }

  return (
    <div>
      <Header title={car.name} subtitle={`${car.year} ${car.make} ${car.model}`} />

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Image and Key Info */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-muted rounded-lg overflow-hidden h-96">
            <img src={car.imageUrl || "/placeholder.svg"} alt={car.name} className="w-full h-full object-cover" />
          </div>

          {/* Key Information */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Price</p>
              <p className="text-4xl font-bold text-primary">${car.price.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Fuel Type</p>
                <div className="flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-primary" />
                  <p className="font-semibold text-foreground capitalize">{car.fuelType}</p>
                </div>
              </Card>

              <Card className="p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Mileage</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="font-semibold text-foreground">
                    {car.mileage > 0 ? `${car.mileage.toLocaleString()} mi` : "New"}
                  </p>
                </div>
              </Card>

              <Card className="p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Color</p>
                <p className="font-semibold text-foreground">{car.color}</p>
              </Card>
            </div>

            {car.ecoRating && (
              <Card className="p-4 border border-accent bg-accent/5">
                <p className="text-xs text-muted-foreground mb-2">Eco Rating</p>
                <p className="text-2xl font-bold text-accent">{car.ecoRating}/10</p>
              </Card>
            )}
          </div>
        </div>

        {/* Detailed Specs */}
        <Card className="p-6 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Specifications</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Drivetrain</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p className="text-foreground font-medium">{car.specs.transmission}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engine</p>
                  <p className="text-foreground font-medium">{car.specs.engine}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Comfort</h3>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Seats: {car.specs.seats}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 border-t border-border pt-8">
          <Button
            onClick={() => router.push(`/affordability?carId=${car.id}&price=${car.price}`)}
            variant="outline"
            className="border-border"
          >
            Check Affordability
          </Button>
          <Button
            onClick={() => router.push("/results")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Find More Vehicles
          </Button>
          <Button
    onClick={handleFindDealers}
    className="bg-primary hover:bg-primary/90 text-primary-foreground"
    disabled={findingDealers}
  >
    {findingDealers ? "Finding Dealers..." : "Find Nearby Dealers"}
  </Button>
        </div>
      </main>
      {/* Dealer Search Results */}
{dealerError && (
  <p className="text-sm text-red-500 mt-4">Error: {dealerError}</p>
)}

{dealers.length > 0 && (
  <Card className="p-6 mt-6 border border-border">
    <h2 className="text-2xl font-bold text-foreground mb-4">Nearby Toyota Dealers</h2>
    <div className="space-y-3">
      {dealers.map((d) => (
        <div
          key={d.place_id}
          className="p-4 rounded-lg border border-border flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {d.name}
            </p>
            <p className="text-sm text-muted-foreground">{d.address}</p>
            {typeof d.rating === "number" && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {d.rating.toFixed(1)}
              </p>
            )}
            {d.isOpen !== null && (
              <p
                className={`text-xs ${
                  d.isOpen ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {d.isOpen ? "Open now" : "Closed now"}
              </p>
            )}
          </div>

          {/* Quick link to Google Maps */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              d.name + " " + d.address
            )}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 md:mt-0 inline-flex items-center px-3 py-2 rounded-md border border-border text-sm hover:bg-muted"
          >
            Open in Maps
          </a>
        </div>
      ))}
    </div>
  </Card>
)}

    </div>
  )
}
