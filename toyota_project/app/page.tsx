"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Filter,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Car,
  Zap,
  TrendingUp,
  CheckCircle2,
  Play
} from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Models", href: "/form" },
    { label: "Compare", href: "/comparison" },
    { label: "Eco Impact", href: "/form" },
    { label: "Affordability", href: "/affordability" },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D32F2F]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-r from-[#D32F2F]/3 via-transparent to-accent/3 rounded-full blur-3xl"></div>
      </div>

      {/* Minimal Header with Enhanced Styling */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled 
            ? "bg-background/98 backdrop-blur-xl shadow-lg border-b border-border/30" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#D32F2F]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-10 h-10 text-[#D32F2F] transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 relative z-10">
                  <Image
                    src="/toyota.png"
                    alt="ToyoMatch"
                    width={40}
                    height={40}
                    className="w-full h-full"
                  />
                </div>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-[#D32F2F] via-[#B71C1C] to-[#D32F2F] bg-clip-text text-transparent bg-size-[200%_auto]group-hover:animate-gradient transition-all duration-300">
                ToyoMatch
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="relative text-sm text-foreground/70 hover:text-[#D32F2F] transition-all duration-300 font-medium group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#D32F2F] to-[#B71C1C] transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
              <Button
                onClick={() => router.push("/prompt")}
                className="bg-linear-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#D32F2F] text-white shadow-lg hover:shadow-xl hover:shadow-[#D32F2F]/50 transition-all duration-300 hover:scale-105"
                size="sm"
              >
                Get Started
              </Button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-fade-in">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className="text-left text-foreground/80 hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 transition-all duration-200 py-2 px-4 rounded-lg"
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    router.push("/prompt")
                    setMobileMenuOpen(false)
                  }}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white w-full mt-2"
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero - Enhanced with Unique Elements */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Unique Geometric Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-64 h-64 border-2 border-[#D32F2F]/10 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 border-2 border-accent/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-[#D32F2F]/5 rotate-45"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 z-10 w-full">
          <div className="grid lg:grid-cols-5 gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-3 space-y-10 animate-fade-in-up">
              {/* Badge with Animation */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#D32F2F]/10 to-[#D32F2F]/5 border border-[#D32F2F]/20 rounded-full backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
                <div className="w-2 h-2 bg-[#D32F2F] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-[#D32F2F] uppercase tracking-wider">
                  AI-Powered Discovery
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="block text-foreground mb-2">Find Your</span>
                <span className="block bg-linear-to-r from-[#D32F2F] via-[#B71C1C] to-[#D32F2F] bg-clip-text text-transparent bg-size-[200%_auto]">
                  Perfect Match
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Tell us what you need. Our AI finds the perfect Toyota vehicle for your lifestyle, budget, and preferences.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => router.push("/prompt")}
                  className="group relative overflow-hidden bg-linear-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#D32F2F] text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:shadow-[#D32F2F]/50 transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    Start Searching
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Button>
              </div>

              {/* Enhanced Stats with Icons */}
              <div className="flex items-center gap-12 pt-10 border-t border-border/50">
                {[
                  { value: "10K+", label: "Happy Customers", icon: "👥" },
                  { value: "500+", label: "Vehicles", icon: "🚗" },
                  { value: "4.9/5", label: "Rating", icon: "⭐" }
                ].map((stat, index) => (
                  <div key={index} className="group animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s`, opacity: 0, animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
                      <div className="text-3xl font-bold text-foreground group-hover:text-[#D32F2F] transition-colors">{stat.value}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual - Enhanced */}
            <div className="lg:col-span-2 relative lg:translate-y-12 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <div className="relative group">
                {/* Main Image Container with Glow Effect */}
                <div className="relative aspect-3/4 rounded-3xl overflow-hidden bg-linear-to-br from-[#D32F2F]/10 via-muted/50 to-accent/10 border border-border/50 shadow-2xl group-hover:shadow-[#D32F2F]/20 transition-all duration-500">
                  <div className="absolute inset-0 bg-linear-to-br from-[#D32F2F]/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative">
                      <Car className="w-24 h-24 text-[#D32F2F]/30 mb-4 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-[#D32F2F]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <p className="text-lg font-semibold text-foreground/60">Vehicle Image</p>
                    <p className="text-sm text-muted-foreground">Placeholder</p>
                  </div>
                </div>

                {/* Floating Badge - Enhanced */}
                <div className="absolute -bottom-6 -left-6 bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 p-5 animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#D32F2F] to-[#B71C1C] flex items-center justify-center shadow-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">AI Match</div>
                      <div className="text-xs text-muted-foreground">98% Accurate</div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 border-2 border-[#D32F2F]/20 rounded-full opacity-50"></div>
                <div className="absolute top-1/2 -right-8 w-16 h-16 border border-accent/20 rounded-lg rotate-45 opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Starting Point - Fresh New Approach */}
      <section className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          {/* Minimal Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-foreground">How Would You</span>
              <br />
              <span className="text-[#D32F2F]">Like to Start?</span>
            </h2>
          </div>

          {/* Two Large Interactive Panels */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Prompt Option */}
            <div
              onClick={() => router.push("/prompt")}
              className="group relative aspect-4/5 rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-[#D32F2F] via-[#B71C1C] to-[#D32F2F] opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }}></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-10 text-white">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">AI-Powered</div>
                    <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                      Describe Your Dream Car
                    </h3>
                    <p className="text-white/80 leading-relaxed text-lg">
                      Tell us what you need in natural language. Our AI understands and finds perfect matches.
                    </p>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center gap-3 group-hover:gap-5 transition-all duration-300">
                  <span className="font-semibold">Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Filter Form Option */}
            <div
              onClick={() => router.push("/form")}
              className="group relative aspect-4/5 rounded-3xl overflow-hidden cursor-pointer border-2 border-border hover:border-accent/50 transition-all duration-500"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-linear-to-br from-background via-muted/30 to-background"></div>
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(45deg, transparent 48%, currentColor 49%, currentColor 51%, transparent 52%)`,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-10">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                    <Filter className="w-8 h-8 text-accent group-hover:text-white transition-colors duration-500" />
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Advanced Filters</div>
                    <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-foreground">
                      Filter by Specifications
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Use precise filters for price, model, features, and more. Perfect when you know what you want.
                    </p>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center gap-3 text-accent font-semibold group-hover:gap-5 transition-all duration-300">
                  <span>Browse Filters</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Subtle Bottom Text */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Choose the method that works best for you
            </p>
          </div>
        </div>
      </section>

      {/* Process - Enhanced Timeline */}
      <section className="py-32 px-6 bg-muted/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-linear-to-b from-transparent via-[#D32F2F] to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-linear-to-r from-transparent via-[#D32F2F] to-transparent"></div>
              <span className="text-xs font-semibold text-[#D32F2F] uppercase tracking-widest">Process</span>
              <div className="w-8 h-px bg-linear-to-l from-transparent via-[#D32F2F] to-transparent"></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-foreground">How It</span>
              <br />
              <span className="text-[#D32F2F]">Works</span>
            </h2>
          </div>

          {/* Enhanced Timeline */}
          <div className="relative">
            {/* Animated Connecting Line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1">
              <div className="h-full bg-linear-to-r from-[#D32F2F] via-accent to-[#D32F2F] relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>

            <div className="space-y-20">
              {[
                { num: "01", title: "Tell Us What You Need", desc: "Describe your ideal vehicle in natural language or use our advanced filters." },
                { num: "02", title: "AI Finds Perfect Matches", desc: "Our intelligent system searches and matches vehicles based on your preferences." },
                { num: "03", title: "Compare & Decide", desc: "Review detailed specs, compare options, and make your choice with confidence." }
              ].map((step, index) => (
                <div key={index} className="relative flex flex-col md:flex-row md:items-center gap-8 group animate-fade-in-up" style={{ animationDelay: `${0.15 * index}s`, opacity: 0, animationFillMode: 'forwards' }}>
                  {/* Enhanced Number Badge */}
                  <div className="shrink-0 relative">
                    <div className="absolute inset-0 bg-linear-to-br from-[#D32F2F] to-[#B71C1C] rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-[#D32F2F] to-[#B71C1C] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold text-white">{step.num}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 group-hover:translate-x-2 transition-transform duration-300">
                    <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-[#D32F2F] transition-colors">{step.title}</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - Enhanced */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-linear-to-r from-transparent via-[#D32F2F] to-transparent"></div>
                  <span className="text-sm font-semibold text-[#D32F2F] uppercase tracking-wider">Why Choose Us</span>
                  <div className="w-8 h-px bg-linear-to-l from-transparent via-[#D32F2F] to-transparent"></div>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-foreground">Everything You</span>
                <br />
                <span className="text-[#D32F2F]">Need to Decide</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We've built the most comprehensive platform for finding your perfect Toyota. From AI-powered search to detailed comparisons and affordability calculators.
              </p>
            </div>

            {/* Right - Enhanced Feature List */}
            <div className="space-y-4">
              {[
                { icon: Sparkles, text: "AI-powered natural language search" },
                { icon: TrendingUp, text: "Real-time price comparisons" },
                { icon: CheckCircle2, text: "Side-by-side vehicle comparison" },
                { icon: Zap, text: "Instant affordability calculations" },
                { icon: Car, text: "Comprehensive vehicle specifications" }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="group flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 animate-fade-in-up cursor-pointer" 
                  style={{ animationDelay: `${0.1 * index}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#D32F2F]/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#D32F2F]/10 to-[#D32F2F]/5 flex items-center justify-center group-hover:bg-linear-to-br group-hover:from-[#D32F2F]/20 group-hover:to-[#D32F2F]/10 transition-all duration-300 shrink-0 relative z-10 group-hover:scale-110">
                      <feature.icon className="w-6 h-6 text-[#D32F2F] group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <span className="text-base text-foreground group-hover:text-[#D32F2F] transition-colors duration-300">{feature.text}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-[#D32F2F]/10 via-accent/10 to-[#D32F2F]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 animate-scale-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-px bg-linear-to-r from-transparent via-[#D32F2F] to-transparent"></div>
            <span className="text-xs font-semibold text-[#D32F2F] uppercase tracking-widest">Ready to Start?</span>
            <div className="w-12 h-px bg-linear-to-l from-transparent via-[#D32F2F] to-transparent"></div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="text-foreground">Ready to Find</span>
            <br />
            <span className="bg-linear-to-r from-[#D32F2F] to-[#B71C1C] bg-clip-text text-transparent">
              Your Perfect Toyota?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands who found their dream car with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => router.push("/prompt")}
              className="group relative overflow-hidden bg-linear-to-r from-[#D32F2F] to-[#B71C1C] hover:from-[#B71C1C] hover:to-[#D32F2F] text-white px-10 py-7 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:shadow-[#D32F2F]/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                Get Started Now
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 text-[#D32F2F] transition-transform duration-300 group-hover:rotate-12">
                <Image
                  src="/toyota.png"
                  alt="ToyoMatch"
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <span className="text-lg font-bold bg-linear-to-r from-[#D32F2F] to-[#B71C1C] bg-clip-text text-transparent">
                ToyoMatch
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              {[
                { label: "Models", href: "/form" },
                { label: "Compare", href: "/comparison" },
                { label: "Affordability", href: "/affordability" }
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => router.push(item.href)} 
                  className="hover:text-[#D32F2F] transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D32F2F] group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ToyoMatch
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
