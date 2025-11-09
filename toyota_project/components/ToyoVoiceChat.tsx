"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WaveAnimation } from "@/components/WaveAnimation"
import { Mic, MicOff, Loader2 } from "lucide-react"
import type { Car } from "@/types"

interface ToyoVoiceChatProps {
  cars: Car[]
  originalQuery: string
}

interface VoiceMessage {
  role: "user" | "assistant"
  content: string
}

export function ToyoVoiceChat({ cars, originalQuery }: ToyoVoiceChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<VoiceMessage[]>([])

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Build system context using the same logic as text chat
  const buildSystemContext = (query: string, carsList: Car[]): string => {
    const header = `You are Toyo, a friendly, upbeat Toyota dealership assistant embedded in a results page.
    Tone: warm, encouraging, and concise. Avoid jargon. Use short sentences.
    Goal: help the user choose confidently. Celebrate good fits. Offer kind guidance.
    Context: You only know the vehicles shown in this results page. If asked beyond this list, say you only know what's displayed and suggest adjusting filters.
    Style:
    - ALWAYS answer in one short paragraph (2-5 simple sentences). No bullet points unless explicitly requested.
    - Act as a decisive expert. Do not explain definitions or teach concepts unless asked; focus on recommendations.
    - Ask a gentle clarifying question when it helps them decide.
    - Never make up specs not present; use what's in the list (year, model, price, mileage, fuel type, MPG, trim hints).
    - Keep it positive and helpful.`

    const queryLine = query ? `User original search: "${query}"` : "User original search: (not provided)"

    const carsLines = carsList
      .slice(0, 12)
      .map((c, i) => {
        const price = (c.price || 0).toLocaleString()
        const miles = c.mileage > 0 ? `${c.mileage.toLocaleString()} miles` : "New"
        const mpg = c.mpg ? `${c.mpg} MPG` : ""
        const ft = c.fuelType ? `, ${c.fuelType}` : ""
        return `${i + 1}. ${c.year} ${c.model} — $${price}, ${miles}${ft}${mpg ? `, ${mpg}` : ""}`
      })
      .join("\n")

    const guidance = `Answer policy:
- Prioritize the user's needs (budget, fuel type, MPG, mileage).
- Recommend the single best option or ask a quick clarifying question.
- Be concise and natural in your speech (2-3 sentences max).
- Highlight key differences briefly (trim, MPG, price).
- Only discuss vehicles listed above.`

    return `${header}\n\n${queryLine}\n\nAvailable vehicles (${Math.min(carsList.length, 12)}):\n${carsLines}\n\n${guidance}`
  }

  // Initialize Speech Recognition
  const initializeSpeechRecognition = () => {
    if (typeof window === "undefined") return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      console.log("[Voice] Speech recognition started")
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("[Voice] Recognized:", transcript)

      // Add user message immediately
      const userMessage: VoiceMessage = { role: "user", content: transcript }
      setMessages((prev) => [...prev, userMessage])
      setIsListening(false)
      setIsProcessing(true)

      try {
        // Pass the updated messages array (including the new user message)
        await sendToGemini(transcript, [...messages, userMessage])
      } catch (err: any) {
        console.error("[Voice] Error sending to Gemini:", err)
        setError(err.message || "Failed to get response")
        setIsProcessing(false)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("[Voice] Recognition error:", event.error)
      setIsListening(false)

      if (event.error === "no-speech") {
        setError("No speech detected. Please try again.")
      } else if (event.error === "not-allowed") {
        setError("Microphone access denied. Please enable it in browser settings.")
      } else {
        setError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      console.log("[Voice] Speech recognition ended")
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }

  const startListening = () => {
    if (isSpeaking) {
      stopSpeaking() // Stop current speech before listening
    }

    if (!recognitionRef.current) {
      initializeSpeechRecognition()
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (err: any) {
        console.error("[Voice] Start error:", err)
        setError("Failed to start listening. Please try again.")
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  // Send transcript to Gemini via chat API
  const sendToGemini = async (userMessage: string, currentMessages: VoiceMessage[]) => {
    const systemContext = buildSystemContext(originalQuery, cars)

    try {
      // ✅ FIX: Send the full conversation history with system context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages, // ✅ Include full conversation history
          systemContext, // ✅ Send system context
          cars: cars.slice(0, 12),
          originalQuery,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response from Gemini")
      }

      const data = await response.json()
      const assistantMessage = data.reply || data.message || data.text

      if (!assistantMessage) {
        throw new Error("No response received from Gemini")
      }

      console.log("[Voice] Gemini response:", assistantMessage)

      // Add assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])
      speakText(assistantMessage)
    } catch (err: any) {
      console.error("[Voice] API Error:", err)
      const errorMsg = "Sorry, I couldn't process that. Please try again."
      setError(errorMsg)
      speakText(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  // ✅ IMPROVED: Better voice selection
  const speakText = (text: string) => {
    if (typeof window === "undefined") return

    window.speechSynthesis.cancel()

    // Get available voices
    const voices = window.speechSynthesis.getVoices()
    
    // Try to find a high-quality voice (prefer Google, Microsoft, or native voices)
    const preferredVoice = 
      voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Microsoft") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Samantha")) || // macOS
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"))

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 1.1 // Slightly faster for more natural conversation
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
      console.log("[Voice] Using voice:", preferredVoice.name)
    }

    utterance.onstart = () => {
      console.log("[Voice] Speaking started")
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      console.log("[Voice] Speaking ended")
      setIsSpeaking(false)
    }

    utterance.onerror = (event: any) => {
      console.error("[Voice] Speech synthesis error:", event.error)
      setIsSpeaking(false)
    }

    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const stopAll = () => {
    stopListening()
    stopSpeaking()
    setIsProcessing(false)
  }

  // ✅ Load voices when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load voices
      window.speechSynthesis.getVoices()
      
      // Some browsers need this event to load voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
      if (typeof window !== "undefined") window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (isOpen) initializeSpeechRecognition()
  }, [isOpen])

  return (
    <>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2 ml-3"
        >
          <Mic className="w-4 h-4" />
          Talk to Toyo
        </Button>
      ) : (
        <div className="w-[380px] bg-background border border-border rounded-xl shadow-xl overflow-hidden ml-3">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-3">
              <img src="/toyo.png" alt="Toyo" className="w-9 h-9 rounded-full border border-border" />
              <div>
                <div className="text-sm font-semibold text-foreground">Toyo Voice</div>
                <div className="text-xs text-muted-foreground">
                  {isListening
                    ? "Listening..."
                    : isSpeaking
                    ? "Speaking..."
                    : isProcessing
                    ? "Thinking..."
                    : "Ready to chat"}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopAll()
                setIsOpen(false)
                setMessages([]) // Clear messages when closing
              }}
            >
              Close
            </Button>
          </div>

          <div className="h-[280px] overflow-y-auto p-3 space-y-3 bg-muted/10">
            {messages.length === 0 && !error && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Click the microphone button below to start talking with Toyo!
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm rounded-lg px-3 py-2 ${
                  msg.role === "assistant"
                    ? "bg-muted text-foreground max-w-[90%]"
                    : "bg-primary text-primary-foreground max-w-[90%] ml-auto"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isProcessing && (
              <div className="bg-muted text-foreground max-w-[90%] rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/30">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {isListening && (
            <div className="border-t border-border bg-background py-2">
              <WaveAnimation isActive={isListening} />
            </div>
          )}

          <div className="p-4 border-t border-border bg-background">
            {!isListening ? (
              <Button
                onClick={startListening}
                disabled={isProcessing || isSpeaking}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : isSpeaking ? (
                  <>
                    <Mic className="w-4 h-4" />
                    Toyo is speaking... (Click to interrupt)
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Voice Chat
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={stopListening} className="w-full bg-destructive hover:bg-destructive/90 gap-2">
                <MicOff className="w-4 h-4" />
                Stop Listening
              </Button>
            )}
            <div className="text-[10px] text-muted-foreground mt-2 text-center">
              {isListening
                ? "Listening... Speak now"
                : isSpeaking
                ? "Toyo is speaking (click button to interrupt)"
                : isProcessing
                ? "Processing your request"
                : "Click to start voice conversation"}
            </div>
          </div>
        </div>
      )}
    </>
  )
}