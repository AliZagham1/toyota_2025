"use client"

import React, { useState, useEffect, useRef } from "react"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WaveAnimation } from "./WaveAnimation"



interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export function VoiceRecorder({ onTranscript, onError, disabled = false }: VoiceRecorderProps) {
  // State management for recording
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  // Reference to the speech recognition instance
  const recognitionRef = useRef<any>(null)

 
  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      onError?.("Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.")
      return
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition()

    // Configure recognition settings
    recognition.continuous = false // Stop after one phrase
    recognition.interimResults = false // Only final results
    recognition.lang = "en-US" // Language setting
    recognition.maxAlternatives = 1 // Number of alternative transcripts

    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("[VoiceRecorder] Transcript:", transcript)

      // Pass transcript to parent component
      onTranscript(transcript)
      setIsListening(false)
    }

    
    recognition.onerror = (event: any) => {
     
      if (event.error === "aborted") {
        console.warn("[VoiceRecorder] Recording aborted (normal behavior)")
        setIsListening(false)
        return // Don't show error message to user
      }

      // Log actual errors for debugging
      console.error("[VoiceRecorder] Error:", event.error)

      let errorMessage = "Voice input failed. Please try again."

      // Provide specific error messages for real errors
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again."
          break
        case "audio-capture":
          errorMessage = "Microphone not found. Please check your audio settings."
          break
        case "not-allowed":
          errorMessage = "Microphone access denied. Please allow microphone permissions."
          break
        case "network":
          errorMessage = "Network error. Please check your connection."
          break
      }

      // Only show error message for real errors
      onError?.(errorMessage)
      setIsListening(false)
    }

   
    recognition.onend = () => {
      setIsListening(false)
    }

    // Store recognition instance
    recognitionRef.current = recognition

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript, onError])

  
  const toggleRecording = () => {
    if (!isSupported || !recognitionRef.current) return

    if (isListening) {
      // Stop recording
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      // Start recording
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("[VoiceRecorder] Start error:", error)
        onError?.("Failed to start recording. Please try again.")
      }
    }
  }

  // Don't render if browser doesn't support speech recognition
  if (!isSupported) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4">
    
      <WaveAnimation isActive={isListening} />

    
      <Button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        variant="outline"
        size="lg"
        className={`rounded-full w-16 h-16 transition-all border-2 ${
          isListening
            ? "bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse shadow-lg shadow-red-600/50"
            : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground hover:border-primary"
        }`}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </Button>

     
      {isListening && (
        <p className="text-sm text-red-600 font-medium animate-pulse">Listening... Speak now</p>
      )}
    </div>
  )
}
