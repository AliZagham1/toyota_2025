"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { Loader2, Keyboard, Mic, NotebookPen, ChevronLeft, Sparkles } from "lucide-react"

const examplePrompts = [
  "I want a sporty sedan that's fun to drive but also fuel efficient.",
  "Looking for a budget-friendly pickup truck for work and weekend trips.",
  "Need a luxury vehicle with all the latest tech and comfort features.",
  "Eco-conscious shopper looking for a hybrid with low emissions.",
  "I am looking for a 2023 Corolla.",
  "Show me 2024 Camry options with good fuel economy.",
  "I want to see 2023 RAV4 models in my area.",
  "Looking for a 2024 Highlander with third-row seating.",
  "Find me a 2023 Prius with low mileage.",
  "I need a 2024 Tacoma for off-road adventures."
]

export default function PromptPage() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // Voice input mode state - toggle between text and voice input
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  /**
   * Process the description (either from text input or voice)
   * Sends the description to the Gemini API and navigates to results
   */
  const processDescription = async (description: string) => {
    if (!description.trim()) return

    setLoading(true)
    setError("")

    try {
      // Call Gemini API to generate car suggestions based on description
      const response = await fetch("/api/search/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to search")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to process your request")
      }

      // Store filters from Gemini response and navigate to results, also include original description
      router.push(
        `/results?filters=${encodeURIComponent(JSON.stringify(data.filters))}&desc=${encodeURIComponent(input)}`,
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process your request. Please try again."
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle form submission for text input
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await processDescription(input)
  }

  /**
   * Handle voice transcript
   * Automatically processes the description when speech is recognized
   */
  const handleVoiceTranscript = async (transcript: string) => {
    console.log("[PromptPage] Voice transcript received:", transcript)
    // Automatically process the voice input
    await processDescription(transcript)
  }

  /**
   * Handle voice input errors
   */
  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage)
  }

  /**
   * Toggle between voice and text input modes
   */
  const toggleInputMode = () => {
    setIsVoiceMode(!isVoiceMode)
    setError("") // Clear any errors when switching modes
  }

  /**
   * Typing animation effect for example prompts
   */
  useEffect(() => {
    const currentPrompt = examplePrompts[currentIndex]
    let timeoutId: NodeJS.Timeout

    if (typedText.length < currentPrompt.length) {
      timeoutId = setTimeout(() => {
        setTypedText(currentPrompt.slice(0, typedText.length + 1))
      }, 50)
    } else {
      // Wait before moving to next prompt
      timeoutId = setTimeout(() => {
        setTypedText("")
        setCurrentIndex((prev) => (prev + 1) % examplePrompts.length)
      }, 3000)
    }

    return () => clearTimeout(timeoutId)
  }, [typedText, currentIndex])

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-2xl px-6 py-12 space-y-10">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              disabled={loading}
              className="gap-2 text-muted-foreground hover:bg-[#D32F2F] hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Describe Your Dream Car</h1>
          <p className="text-muted-foreground">Tell us what you are looking for</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Share a few details</h2>
          <p className="text-sm text-muted-foreground">
            A short description about how you plan to use the vehicle and the features that matter will help us narrow
            in on the right Toyota.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Input mode</span>
            <Button
              type="button"
              variant="ghost"
              onClick={toggleInputMode}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-semibold text-foreground hover:bg-[#D32F2F] hover:text-white"
            >
              {isVoiceMode ? (
                <>
                  <Keyboard className="h-4 w-4" />
                  Switch to text
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Switch to voice
                </>
              )}
            </Button>
          </div>
        </section>

        {isVoiceMode ? (
          <section className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Tap the microphone and describe your ideal Toyota. We will process the transcript automatically.
            </p>
            <div className="flex justify-center">
              <VoiceRecorder onTranscript={handleVoiceTranscript} onError={handleVoiceError} disabled={loading} />
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Processing your request...</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-[#D32F2F] hover:text-white"
              >
                Back
              </Button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <NotebookPen className="h-4 w-4" />
                Description
              </div>
              <label htmlFor="description" className="text-lg font-semibold text-foreground">
                What features matter most to you?
              </label>
              <p className="text-sm text-muted-foreground">
                Mention things like seating needs, fuel economy goals, technology must-haves, or budget guidance.
              </p>
            </div>
            <textarea
              id="description"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g., "I need a reliable family SUV with great fuel efficiency, plenty of cargo room, and advanced safety tech. My budget is around $35,000."'
              className="min-h-36 w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Helpful hint: include how you will use the vehicle day-to-day.</span>
              <span>{input.trim().length} chars</span>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-[#D32F2F] hover:text-white"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex items-center gap-2 rounded-full bg-[#D32F2F] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D32F2F] hover:text-white disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Find my Toyota
              </Button>
            </div>
          </form>
        )}

        <section className="space-y-3 text-sm text-muted-foreground">
          <h3 className="text-sm font-semibold text-foreground">Example prompts</h3>
          <div className="flex items-start gap-3 pt-2">
            <div className="mt-0.5">
              <Sparkles className="w-4 h-4 text-[#D32F2F] animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground min-h-[1.5em]">
                &quot;{typedText}
                <span className="inline-block w-0.5 h-4 bg-[#D32F2F] ml-1 animate-pulse align-middle"></span>
                &quot;
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
