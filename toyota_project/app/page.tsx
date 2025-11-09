"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Worm as Form,
  Sparkles,
  Scale,
  Leaf,
  DollarSign,
  ChevronRight,
  Menu,
  X
} from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Navigation items
  const navItems = [
    { label: "Models", href: "/form" },
    { label: "Compare", href: "/comparison" },
    { label: "Eco Impact", href: "/form" },
    { label: "Affordability", href: "/affordability" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 text-[#D32F2F]">
                <Image
                  src="/toyota-logo.svg"
                  alt="Toyota"
                  width={48}
                  height={48}
                  className="w-full h-full"
                />
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">
                Toyotify
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="text-foreground/80 hover:text-[#D32F2F] transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => router.push("/prompt")}
                className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
              >
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className="text-left text-foreground/80 hover:text-[#D32F2F] transition-colors font-medium py-2"
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    router.push("/prompt")
                    setMobileMenuOpen(false)
                  }}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white w-full"
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D32F2F]/5 via-transparent to-accent/5 -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Smarter Car Shopping —{" "}
              <span className="text-[#D32F2F]">Powered by AI.</span>
              <br />
              <span className="text-3xl md:text-5xl text-muted-foreground">
                Inspired by Toyota.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of car shopping. Our AI-powered platform helps you discover
              the perfect Toyota vehicle tailored to your unique needs and lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/prompt")}
                className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-lg px-8 py-6 group"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/form")}
                className="border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F]/5 text-lg px-8 py-6"
              >
                Browse Models
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cutting-edge technology meets Toyota excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: AI Search */}
            <div className="group p-8 bg-background rounded-2xl border border-border hover:border-[#D32F2F] transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-[#D32F2F]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D32F2F]/20 transition-colors">
                <Sparkles className="w-7 h-7 text-[#D32F2F]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI-Powered Search</h3>
              <p className="text-muted-foreground">
                Describe your dream car in natural language and let our AI find perfect matches instantly.
              </p>
            </div>

            {/* Feature 2: Comparison Tools */}
            <div className="group p-8 bg-background rounded-2xl border border-border hover:border-[#D32F2F] transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-[#D32F2F]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D32F2F]/20 transition-colors">
                <Scale className="w-7 h-7 text-[#D32F2F]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Smart Comparison</h3>
              <p className="text-muted-foreground">
                Compare multiple vehicles side-by-side with detailed specs and real-time insights.
              </p>
            </div>

            {/* Feature 3: Eco Impact */}
            <div className="group p-8 bg-background rounded-2xl border border-border hover:border-[#D32F2F] transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-[#D32F2F]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D32F2F]/20 transition-colors">
                <Leaf className="w-7 h-7 text-[#D32F2F]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Eco Impact Analysis</h3>
              <p className="text-muted-foreground">
                Understand the environmental impact of your choices with our sustainability ratings.
              </p>
            </div>

            {/* Feature 4: Financial Planning */}
            <div className="group p-8 bg-background rounded-2xl border border-border hover:border-[#D32F2F] transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-[#D32F2F]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D32F2F]/20 transition-colors">
                <DollarSign className="w-7 h-7 text-[#D32F2F]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Affordability Calculator</h3>
              <p className="text-muted-foreground">
                Plan your budget with precision using our advanced financial planning tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Toyota Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-1000">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                The Toyota Difference
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                For decades, Toyota has been synonymous with reliability, innovation, and excellence.
                Our commitment to quality engineering and customer satisfaction sets us apart.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#D32F2F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-[#D32F2F] rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Unmatched Reliability</h4>
                    <p className="text-muted-foreground">Industry-leading quality and longevity in every vehicle</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#D32F2F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-[#D32F2F] rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Hybrid Innovation</h4>
                    <p className="text-muted-foreground">Pioneers in eco-friendly automotive technology</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#D32F2F]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-[#D32F2F] rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Customer First</h4>
                    <p className="text-muted-foreground">Dedicated to delivering exceptional value and service</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative h-96 bg-gradient-to-br from-[#D32F2F]/10 to-accent/10 rounded-2xl flex items-center justify-center animate-in fade-in slide-in-from-right duration-1000">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 text-[#D32F2F]">
                  <Image
                    src="/toyota-logo.svg"
                    alt="Toyota"
                    width={128}
                    height={128}
                    className="w-full h-full opacity-50"
                  />
                </div>
                <p className="text-2xl font-bold text-[#D32F2F]">Let's Go Places</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Start Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How Would You Like to Start?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your preferred method to find your dream Toyota
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Option 1: AI Prompt */}
            <div
              onClick={() => router.push("/prompt")}
              className="group p-10 bg-background rounded-2xl border-2 border-border hover:border-[#D32F2F] cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-[#D32F2F]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#D32F2F]/20 transition-colors">
                  <MessageCircle className="w-8 h-8 text-[#D32F2F]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Describe Your Dream Car</h3>
                  <p className="text-muted-foreground mb-6">
                    Tell us what you're looking for in natural language. Our AI will understand
                    your needs and find the perfect matches.
                  </p>
                  <div className="inline-flex items-center gap-2 text-[#D32F2F] font-semibold group-hover:gap-3 transition-all">
                    Start with AI
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: Filter Form */}
            <div
              onClick={() => router.push("/form")}
              className="group p-10 bg-background rounded-2xl border-2 border-border hover:border-[#D32F2F] cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Form className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Filter by Specifications</h3>
                  <p className="text-muted-foreground mb-6">
                    Use our detailed filters to narrow down your search by price, model,
                    features, and more specific criteria.
                  </p>
                  <div className="inline-flex items-center gap-2 text-accent font-semibold group-hover:gap-3 transition-all">
                    Browse with Filters
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D32F2F]/10 via-transparent to-accent/10 -z-10" />
        <div className="max-w-4xl mx-auto text-center animate-in fade-in zoom-in duration-1000">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Find Your Perfect Toyota?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of satisfied customers who found their dream car with our AI-powered platform.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/prompt")}
            className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-lg px-12 py-6 group"
          >
            Get Started Now
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Toyota AI Finder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
