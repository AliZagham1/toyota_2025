"use client"

import React from "react"



interface WaveAnimationProps {
  isActive: boolean
}

export function WaveAnimation({ isActive }: WaveAnimationProps) {
  // No rendering anything if not active
  if (!isActive) return null

  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
     
      <div
        className="w-1.5 bg-primary rounded-full"
        style={{ animation: "wave 1.2s ease-in-out infinite", animationDelay: "0s" }}
      />
      <div
        className="w-1.5 bg-primary rounded-full"
        style={{ animation: "wave 1.2s ease-in-out infinite", animationDelay: "0.1s" }}
      />
      <div
        className="w-1.5 bg-primary rounded-full"
        style={{ animation: "wave 1.2s ease-in-out infinite", animationDelay: "0.2s" }}
      />
      <div
        className="w-1.5 bg-primary rounded-full"
        style={{ animation: "wave 1.2s ease-in-out infinite", animationDelay: "0.3s" }}
      />
      <div
        className="w-1.5 bg-primary rounded-full"
        style={{ animation: "wave 1.2s ease-in-out infinite", animationDelay: "0.4s" }}
      />
    </div>
  )
}
