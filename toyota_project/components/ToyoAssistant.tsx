"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WaveAnimation } from "@/components/WaveAnimation"
import { Mic, MicOff, MessageSquare, Loader2, Send } from "lucide-react"
import type { Car } from "@/types"

interface ToyoAssistantProps {
  cars: Car[]
  originalQuery: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

type AssistantMode = "chat" | "voice"


export function ToyoAssistant({ cars, originalQuery }: ToyoAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<AssistantMode>("chat")

  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hey there! I'm Toyo. I can compare these cars, suggest best fits, and help you decide. What would you like to know?",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [originalInHistory, setOriginalInHistory] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [voiceMessages, setVoiceMessages] = useState<ChatMessage[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const voiceEndRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    if (mode === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } else {
      voiceEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages, voiceMessages, mode])


  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content: chatInput.trim() }]
    setChatMessages(nextMessages)
    setChatInput("")
    setChatLoading(true)

    try {
      
      const messagesForApi: ChatMessage[] =
        originalQuery && !originalInHistory
          ? [{ role: "user", content: originalQuery }, ...nextMessages]
          : nextMessages

      if (originalQuery && !originalInHistory) {
        setOriginalInHistory(true)
      }

      // Try streaming
      const res = await fetch("/api/chat?stream=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi,
          cars: cars,
          originalQuery: originalQuery || "",
          stream: true,
        }),
      })

      if (!res.ok) throw new Error("Chat failed")

      if (res.body) {
        // Create placeholder for streaming
        setChatMessages((prev) => [...prev, { role: "assistant", content: "" }])
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setChatMessages((prev) => {
            const copy = [...prev]
            const lastIdx = copy.length - 1
            if (lastIdx >= 0 && copy[lastIdx].role === "assistant") {
              copy[lastIdx] = { role: "assistant", content: accumulated }
            }
            return copy
          })
        }
      } else {
        // Fallback to non-streaming
        const data = await res.json()
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't respond." }])
      }
    } catch (e) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble replying. Please try again." }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

 

  const initializeSpeechRecognition = () => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser. Try Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onstart = () => {
      console.log("[Voice] Speech recognition started")
      setIsListening(true)
      setVoiceError(null)
    }

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("[Voice] Recognized:", transcript)

      const userMessage: ChatMessage = { role: "user", content: transcript }
      setVoiceMessages((prev) => [...prev, userMessage])
      setIsListening(false)
      setIsProcessing(true)

      try {
        await sendToGemini(transcript, [...voiceMessages, userMessage])
      } catch (err: any) {
        console.error("[Voice] Error sending to Gemini:", err)
        setVoiceError(err.message || "Failed to get response")
        setIsProcessing(false)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("[Voice] Recognition error:", event.error)
      setIsListening(false)

      if (event.error === "no-speech") {
        setVoiceError("No speech detected. Please try again.")
      } else if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied. Please enable it in browser settings.")
      } else {
        setVoiceError(`Speech recognition error: ${event.error}`)
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
      stopSpeaking()
    }

    if (!recognitionRef.current) {
      initializeSpeechRecognition()
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (err: any) {
        console.error("[Voice] Start error:", err)
        setVoiceError("Failed to start listening. Please try again.")
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const sendToGemini = async (userMessage: string, currentMessages: ChatMessage[]) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
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

      setVoiceMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }])
      speakText(assistantMessage)
    } catch (err: any) {
      console.error("[Voice] API Error:", err)
      const errorMsg = "Sorry, I couldn't process that. Please try again."
      setVoiceError(errorMsg)
      speakText(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const speakText = (text: string) => {
    if (typeof window === "undefined") return

    window.speechSynthesis.cancel()

    const processedText = text
      .replace(/\.\s/g, ". ")
      .replace(/,\s/g, ", ")
      .replace(/!\s/g, "! ")
      .replace(/\?\s/g, "? ")
      .replace(/\n/g, ". ")

    const voices = window.speechSynthesis.getVoices()

    const preferredVoice =
      voices.find((v) => v.name.includes("Samantha") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Google US English") && !v.name.includes("Male")) ||
      voices.find((v) => v.name.includes("Microsoft Aria") || v.name.includes("Microsoft Zira")) ||
      voices.find((v) => v.name.includes("Alex") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Google UK English Male")) ||
      voices.find((v) => v.name.includes("Microsoft David")) ||
      voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
      voices.find((v) => v.name.includes("Microsoft") && v.lang.startsWith("en")) ||
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en"))

    const utterance = new SpeechSynthesisUtterance(processedText)
    utterance.lang = "en-US"
    utterance.rate = 0.92
    utterance.pitch = 1.05
    utterance.volume = 0.95

    if (preferredVoice) {
      utterance.voice = preferredVoice
      console.log("[Voice] Using voice:", preferredVoice.name, "| Rate:", utterance.rate, "| Pitch:", utterance.pitch)
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

  const stopAllVoice = () => {
    stopListening()
    stopSpeaking()
    setIsProcessing(false)
  }

  // Load voices on mount
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

  // Initialize recognition when voice mode is opened
  useEffect(() => {
    if (isOpen && mode === "voice") {
      initializeSpeechRecognition()
    }
  }, [isOpen, mode])

  

  return (
    <>
      
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-6 py-6"
        >
          <MessageSquare className="w-5 h-5" />
          Ask Toyo
        </Button>
      ) : (
        <div className="w-[420px] bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
          
          <div className="px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/toyo.png" alt="Toyo" className="w-9 h-9 rounded-full border border-border" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Toyo Assistant</div>
                  <div className="text-xs text-muted-foreground">
                    {mode === "chat"
                      ? chatLoading
                        ? "Typing..."
                        : "Ready to help"
                      : isListening
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
                  stopAllVoice()
                  setIsOpen(false)
                }}
              >
                Close
              </Button>
            </div>

           
            <div className="flex gap-2 mt-3">
              <Button
                variant={mode === "chat" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("chat")}
                className="flex-1 gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </Button>
              <Button
                variant={mode === "voice" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  stopAllVoice()
                  setMode("voice")
                }}
                className="flex-1 gap-2"
              >
                <Mic className="w-3.5 h-3.5" />
                Voice
              </Button>
            </div>
          </div>

       
          {mode === "chat" && (
            <>
             
              <div className="h-[320px] overflow-y-auto p-4 space-y-3 bg-muted/5">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-sm rounded-lg px-3 py-2 ${
                      msg.role === "assistant"
                        ? "bg-muted text-foreground max-w-[85%]"
                        : "bg-primary text-primary-foreground max-w-[85%] ml-auto"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="bg-muted text-foreground max-w-[85%] rounded-lg px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

            
              <div className="p-4 border-t border-border bg-background">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                    placeholder="Ask me anything about these cars..."
                    disabled={chatLoading}
                    className="flex-1"
                  />
                  <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

        
          {mode === "voice" && (
            <>
              
              <div className="h-[320px] overflow-y-auto p-4 space-y-3 bg-muted/5">
                {voiceMessages.length === 0 && !voiceError && (
                  <div className="text-center text-sm text-muted-foreground py-12">
                    Click the microphone button below to start talking with Toyo!
                  </div>
                )}
                {voiceMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-sm rounded-lg px-3 py-2 ${
                      msg.role === "assistant"
                        ? "bg-muted text-foreground max-w-[85%]"
                        : "bg-primary text-primary-foreground max-w-[85%] ml-auto"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isProcessing && (
                  <div className="bg-muted text-foreground max-w-[85%] rounded-lg px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                {voiceError && (
                  <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/30">
                    {voiceError}
                  </div>
                )}
                <div ref={voiceEndRef} />
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
            </>
          )}
        </div>
      )}
    </>
  )
}
