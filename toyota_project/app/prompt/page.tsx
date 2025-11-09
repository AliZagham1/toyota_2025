"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { Loader2, Keyboard } from "lucide-react"

export default function PromptPage() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // Voice input mode state - toggle between text and voice input
  const [isVoiceMode, setIsVoiceMode] = useState(false)

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

  return (
    <div>
      <Header title="Describe Your Dream Car" subtitle="Tell us what you are looking for" />

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Mode Toggle Button */}
        <div className="flex justify-center mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={toggleInputMode}
            disabled={loading}
            className="gap-2"
          >
            <Keyboard className="w-4 h-4" />
            {isVoiceMode ? "Switch to Text Input" : "Switch to Voice Input"}
          </Button>
        </div>

        {/* Voice Input Mode */}
        {isVoiceMode ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm font-medium text-foreground">Click the microphone to start speaking</p>

              {/* Voice Recorder Component */}
              <VoiceRecorder
                onTranscript={handleVoiceTranscript}
                onError={handleVoiceError}
                disabled={loading}
              />

              {loading && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processing your request...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          /* Text Input Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                What features matter most to you?
              </label>
              <textarea
                id="description"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'I need a reliable family SUV with great fuel efficiency, good cargo space, and modern tech features. Around $35,000 budget.'"
                className="w-full h-32 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Back
              </Button>
              <Button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Search
              </Button>
            </div>
          </form>
        )}

        {/* Examples Section */}
        <div className="mt-12 pt-12 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Examples of what you can say:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• "I want a sporty sedan that's fun to drive but also fuel efficient"</li>
            <li>• "Looking for a budget-friendly pickup truck for work and weekend trips"</li>
            <li>• "Need a luxury vehicle with all the latest tech and comfort features"</li>
            <li>• "Eco-conscious shopper looking for a hybrid with low emissions"</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
