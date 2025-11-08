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
    <div className="border-b border-border bg-card sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-2">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
