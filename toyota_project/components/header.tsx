"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
}

export function Header({ title, subtitle, showBack = true }: HeaderProps) {
  const router = useRouter()

  return (
    <div className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-10 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-2">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 text-muted-foreground hover:text-[#D32F2F] transition-colors duration-200 hover:bg-[#D32F2F]/10"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>
        <h1 className="text-3xl font-bold text-foreground animate-fade-in-up">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>{subtitle}</p>}
      </div>
    </div>
  )
}
