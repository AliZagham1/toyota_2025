"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Fuel, DollarSign, Calendar, MessageSquare } from "lucide-react"
import type { Car } from "@/types"
import { useStore } from "@/lib/store"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedCar, toggleComparisonCar, comparedCars } = useStore()

  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [originalDesc, setOriginalDesc] = useState<string>("")

  type ChatMessage = { role: "user" | "assistant"; content: string }
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant" as const,
      content:
        "Hey there! I’m Toyo. I can compare these cars, suggest best fits, and help you decide. What would you like to know?",
    },
  ])
  const [originalInHistory, setOriginalInHistory] = useState(false)

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
        // Keep API order (already ranked)
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

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: chatInput.trim() } as ChatMessage]
    setMessages(nextMessages)
    setChatInput("")
    setChatLoading(true)
    try {
      // Include the original description as the very first user message in the conversation history (API side),
      // but do not duplicate it or show it in the UI bubbles.
      const messagesForApi: ChatMessage[] =
        originalDesc && !originalInHistory
          ? [{ role: "user", content: originalDesc } as ChatMessage, ...nextMessages]
          : nextMessages
      if (originalDesc && !originalInHistory) {
        setOriginalInHistory(true)
      }
      // Try streaming first
      const res = await fetch("/api/chat?stream=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi,
          cars: cars,
          originalQuery: originalDesc || "",
          stream: true,
        }),
      })
      if (!res.ok) throw new Error("Chat failed")
      if (res.body) {
        // Create a placeholder assistant message to stream into
        setMessages((prev) => [...prev, { role: "assistant", content: "" } as ChatMessage])
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ""
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages((prev) => {
            const copy = [...prev]
            const lastIdx = copy.length - 1
            if (lastIdx >= 0 && copy[lastIdx].role === "assistant") {
              copy[lastIdx] = { role: "assistant", content: accumulated } as ChatMessage
            }
            return copy
          })
        }
      } else {
        // Fallback to non-streaming JSON
        const data = await res.json()
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "Sorry, I couldn't respond." } as ChatMessage,
        ])
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble replying. Please try again." } as ChatMessage,
      ])
    } finally {
      setChatLoading(false)
    }
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
            {/* Sorting */}
            <div className="mb-6 p-3 bg-muted/30 border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "best" | "priceAsc" | "priceDesc" | "mileageAsc" | "yearDesc" | "mpgDesc",
                    )
                  }
                  className="px-2 py-1 rounded-md border border-border bg-background text-foreground text-sm"
                >
                  <option value="best">Best</option>
                  <option value="priceAsc">Price ↑</option>
                  <option value="priceDesc">Price ↓</option>
                  <option value="mileageAsc">Mileage ↑</option>
                  <option value="yearDesc">Year ↓</option>
                  <option value="mpgDesc">MPG ↓</option>
                </select>
              </div>
            </div>

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
              {displayedCars.map((car) => (
                <Card
                  key={car.id}
                  onClick={() => handleViewInfo(car)}
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
                    {car.dealer && (
                      <div className="mb-4">
                        <span className="inline-block text-xs px-2 py-1 rounded-full bg-muted border border-border text-foreground">
                          {car.dealer}
                        </span>
                      </div>
                    )}

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
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
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

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <Button
            onClick={() => setChatOpen(true)}
            className="rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat with Toyo
          </Button>
        ) : (
          <div className="w-[380px] h-[560px] bg-background border border-border rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-3">
                <img src="/toyo.png" alt="Toyo" className="w-9 h-9 rounded-full border border-border" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Toyo</div>
                  <div className="text-xs text-muted-foreground">Friendly help with the cars in this list</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setChatOpen(false)}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, idx) =>
                m.role === "assistant" ? (
                  <div key={idx} className="flex items-start gap-2">
                    <img src="/toyo.png" alt="Toyo" className="w-8 h-8 rounded-full border border-border mt-0.5" />
                    <div className="max-w-[80%] text-sm whitespace-pre-wrap rounded-lg px-3 py-2 bg-muted text-foreground leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[80%] text-sm whitespace-pre-wrap rounded-lg px-3 py-2 bg-primary text-primary-foreground">
                      {m.content}
                    </div>
                  </div>
                ),
              )}
              {chatLoading && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendChat()
                    }
                  }}
                  placeholder="Ask to compare models, trims, MPG, price..."
                  className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>
                  Send
                </Button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Press Enter to send</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
