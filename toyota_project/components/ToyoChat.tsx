"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WaveAnimation } from "@/components/WaveAnimation"
import { Mic, MicOff, Loader2, MessageSquare, Send } from "lucide-react"
import type { Car } from "@/types"

interface ToyoChatProps {
  cars: Car[]
  originalQuery: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function ToyoChat({ cars, originalQuery }: ToyoChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hey there! I'm Toyo. I can compare these cars, suggest best fits, and help you decide. What would you like to know?",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [originalInHistory, setOriginalInHistory] = useState(false)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

      // Add user message immediately and use functional update to get latest messages
      const userMessage: ChatMessage = { role: "user", content: transcript }
      let updatedMessages: ChatMessage[] = []
      setMessages((prev) => {
        updatedMessages = [...prev, userMessage]
        return updatedMessages
      })
      setIsListening(false)
      setIsProcessing(true)

      try {
        // Use the updated messages array to ensure conversation continuity
        await sendToGemini(transcript, updatedMessages, true) // true = voice mode
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
      setIsProcessing(false)
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

  // Send message to Gemini (supports both text and voice)
  const sendToGemini = async (userMessage: string, currentMessages: ChatMessage[], isVoice: boolean = false) => {
    try {
      // Include the original description as the very first user message in the conversation history (API side),
      // but do not duplicate it or show it in the UI bubbles.
      const messagesForApi: ChatMessage[] =
        originalQuery && !originalInHistory
          ? [{ role: "user", content: originalQuery } as ChatMessage, ...currentMessages]
          : currentMessages
      
      if (originalQuery && !originalInHistory) {
        setOriginalInHistory(true)
      }

      // Use streaming for text, non-streaming for voice (since we need complete response for TTS)
      const shouldStream = !isVoice
      const url = shouldStream ? "/api/chat?stream=1" : "/api/chat"
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi,
          cars: cars.slice(0, 12),
          originalQuery: originalQuery || "",
          stream: shouldStream,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to get response from Gemini")
      }

      if (isVoice) {
        // Non-streaming for voice (need complete response for TTS)
        const data = await res.json()
        const assistantMessage = data.reply || data.message || data.text

        if (!assistantMessage) {
          throw new Error("No response received from Gemini")
        }

        console.log("[Voice] Gemini response:", assistantMessage)
        setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])
        speakText(assistantMessage)
      } else {
        // Streaming for text
        if (res.body) {
          // Create a placeholder assistant message to stream into
          setMessages((prev) => [...prev, { role: "assistant", content: "" }])
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let accumulated = ""
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            accumulated += decoder.decode(value, { stream: true })
            setMessages((prev) => {
              const copy = [...prev]
              const lastIdx = copy.length - 1
              if (lastIdx >= 0 && copy[lastIdx].role === "assistant") {
                copy[lastIdx] = { role: "assistant", content: accumulated }
              }
              return copy
            })
          }
        } else {
          // Fallback to non-streaming JSON
          const data = await res.json()
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply || "Sorry, I couldn't respond." },
          ])
        }
      }
    } catch (err: any) {
      console.error("[Chat] API Error:", err)
      const errorMsg = isVoice
        ? "Sorry, I couldn't process that. Please try again."
        : "Sorry, I had trouble replying. Please try again."
      setError(errorMsg)
      if (isVoice) {
        speakText(errorMsg)
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }])
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Text input handler
  const sendTextMessage = async () => {
    if (!chatInput.trim() || isProcessing) return
    
    const userMessage = chatInput.trim()
    // Use functional update to ensure we have the latest messages
    let nextMessages: ChatMessage[] = []
    setMessages((prev) => {
      nextMessages = [...prev, { role: "user", content: userMessage }]
      return nextMessages
    })
    setChatInput("")
    setIsProcessing(true)
    
    try {
      // Use the updated messages array to ensure conversation continuity
      await sendToGemini(userMessage, nextMessages, false) // false = text mode
    } catch (err: any) {
      console.error("[Text] Error:", err)
      setError(err.message || "Failed to send message")
      setIsProcessing(false)
    }
  }

  // Text-to-speech
  const speakText = (text: string) => {
    if (typeof window === "undefined") return

    window.speechSynthesis.cancel()

    // Get available voices
    const voices = window.speechSynthesis.getVoices()

    // Try to find a high-quality voice
    const preferredVoice =
      voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Microsoft") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Samantha")) || // macOS
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"))

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 1.1
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

  const handleClose = () => {
    stopAll()
    setIsOpen(false)
    setMessages([
      {
        role: "assistant",
        content: "Hey there! I'm Toyo. I can compare these cars, suggest best fits, and help you decide. What would you like to know?",
      },
    ])
    setChatInput("")
    setError(null)
    setOriginalInHistory(false)
  }

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.getVoices()
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
    if (isOpen) {
      initializeSpeechRecognition()
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const getStatusText = () => {
    if (isListening) return "Listening..."
    if (isSpeaking) return "Speaking..."
    if (isProcessing) return "Thinking..."
    return "Ready to chat"
  }

  return (
    <>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Chat with Toyo
        </Button>
      ) : (
        <div className="w-[380px] h-[560px] bg-background border border-border rounded-xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-3">
              <img src="/toyo.png" alt="Toyo" className="w-9 h-9 rounded-full border border-border" />
              <div>
                <div className="text-sm font-semibold text-foreground">Toyo</div>
                <div className="text-xs text-muted-foreground">{getStatusText()}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/10">
            {messages.map((m, idx) =>
              m.role === "assistant" ? (
                <div key={idx} className="flex items-start gap-2">
                  <img src="/toyo.png" alt="Toyo" className="w-8 h-8 rounded-full border border-border mt-0.5" />
                  <div className="max-w-[80%] text-sm whitespace-pre-wrap rounded-lg px-3 py-2 bg-muted text-foreground leading-relaxed">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex justify-end">
                  <div className="max-w-[80%] text-sm whitespace-pre-wrap rounded-lg px-3 py-2 bg-primary text-primary-foreground">
                    {m.content}
                  </div>
                </div>
              ),
            )}
            {isProcessing && !isListening && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/30">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice listening indicator */}
          {isListening && (
            <div className="border-t border-border bg-background py-2">
              <WaveAnimation isActive={isListening} />
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-background space-y-2">
            {/* Text Input */}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendTextMessage()
                  }
                }}
                placeholder="Type your message..."
                disabled={isListening || isProcessing || isSpeaking}
                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
              <Button
                onClick={sendTextMessage}
                disabled={isProcessing || !chatInput.trim() || isListening || isSpeaking}
                size="sm"
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Voice Input */}
            <div className="flex items-center gap-2">
              {!isListening ? (
                <Button
                  onClick={startListening}
                  disabled={isProcessing || isSpeaking || isListening}
                  variant={isSpeaking ? "outline" : "default"}
                  className={`flex-1 gap-2 ${isSpeaking ? "border-primary" : ""}`}
                >
                  {isSpeaking ? (
                    <>
                      <MicOff className="w-4 h-4" />
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
                <Button
                  onClick={stopListening}
                  className="flex-1 bg-destructive hover:bg-destructive/90 gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Listening
                </Button>
              )}
            </div>

            {/* Helper Text */}
            <div className="text-[10px] text-muted-foreground text-center">
              {isListening
                ? "Listening... Speak now"
                : isSpeaking
                ? "Toyo is speaking (click button to interrupt)"
                : isProcessing
                ? "Processing your request"
                : "Type a message or click to use voice"}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

