"use client"

import React from "react"

/**
 * WaveAnimation Component
 *
 * Displays a smooth, pulsating wave animation while voice recording is active.
 * Uses pure Tailwind CSS classes with custom keyframes defined in globals.css.
 * No external dependencies required.
 *
 * Props:
 * - isActive: boolean - Controls whether the animation is visible and animated
 *
 * Design:
 * - Five vertical bars animated with staggered delays
 * - Toyota red color (using bg-primary which is Toyota Red)
 * - Smooth ease-in-out animation for natural pulsing effect
 */

interface WaveAnimationProps {
  isActive: boolean
}

export function WaveAnimation({ isActive }: WaveAnimationProps) {
  // Don't render anything if not active
  if (!isActive) return null

  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
      {/* Five animated bars creating a wave effect with staggered animation delays */}
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
