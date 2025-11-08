"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Worm as Form } from "lucide-react"

export default function StartPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<"prompt" | "form" | null>(null)

  const handleNavigate = (type: "prompt" | "form") => {
    router.push(`/${type}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">T</span>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-4 text-balance">Find Your Ideal Toyota</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Discover the perfect Toyota vehicle for your lifestyle. Use our AI-powered search to explore options tailored
          to your needs.
        </p>
      </div>

      {/* Choice Options */}
      <div className="w-full max-w-4xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-2">How would you like to get started?</h2>
          <p className="text-muted-foreground">Choose your preferred method to find your dream car</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Prompt Option */}
          <div
            className={`p-8 border-2 rounded-xl cursor-pointer transition-all ${
              selected === "prompt" ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/50"
            }`}
            onClick={() => setSelected("prompt")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Describe Your Dream Car</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us what you are looking for in natural language and let our AI find matches
                </p>
              </div>
            </div>
          </div>

          {/* Form Option */}
          <div
            className={`p-8 border-2 rounded-xl cursor-pointer transition-all ${
              selected === "form" ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/50"
            }`}
            onClick={() => setSelected("form")}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Form className="w-6 h-6 text-accent" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">Filter by Specifications</h3>
                <p className="text-sm text-muted-foreground">
                  Use detailed filters to narrow down your search by specific criteria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {selected && (
          <div className="flex justify-center animate-in fade-in">
            <Button
              size="lg"
              onClick={() => handleNavigate(selected)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
