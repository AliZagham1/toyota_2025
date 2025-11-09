import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Car } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { messages, cars, originalQuery } = await request.json()

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Limit cars context to 12 to keep prompt compact
    const carsContext: Car[] = Array.isArray(cars) ? cars.slice(0, 12) : []

    const systemInstructions = buildSystemContext(originalQuery || "", carsContext)

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Build chat content: system context + prior messages
    const userConversation = Array.isArray(messages) ? messages : []
    const prompt = `${systemInstructions}\n\nConversation:\n${formatConversation(userConversation)}\n\nAssistant:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error("[Chat] Error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}

function buildSystemContext(originalQuery: string, cars: Car[]): string {
  const header = `You are a friendly, upbeat Toyota dealership assistant embedded in a results page.
Tone: warm, encouraging, and concise. Avoid jargon. Use short sentences and bullets when helpful.
Goal: help the user choose confidently. Celebrate good fits. Offer kind guidance.
Context: You only know the vehicles shown in this results page. If asked beyond this list, say you only know what's displayed and suggest adjusting filters.
Style:
- Be brief (under ~8 sentences unless asked for detail).
- Prefer bullets for comparisons and pros/cons.
- Ask a gentle clarifying question when it helps them decide.
- Never make up specs not present; use what's in the list (year, model, price, mileage, fuel type, MPG, trim hints).
- Keep it positive and helpful.`

  const queryLine = originalQuery
    ? `User original description: "${originalQuery}"`
    : "User original description: (not provided)"

  const carsLines = cars
    .map((c, i) => {
      const price = (c.price || 0).toLocaleString()
      const miles = c.mileage > 0 ? `${c.mileage.toLocaleString()} miles` : "New"
      const mpg = c.mpg ? `${c.mpg} MPG` : ""
      const ft = c.fuelType ? `, ${c.fuelType}` : ""
      const trim = c.specs?.engine ? `, ${c.specs.engine}` : ""
      return `${i + 1}. ${c.year} ${c.model}${c.name.includes(c.model) ? "" : " "}${c.name.replace(
        `${c.year} Toyota ${c.model}`,
        "",
      )} — $${price}, ${miles}${ft}${mpg ? `, ${mpg}` : ""}${trim ? `, ${trim}` : ""}`
    })
    .join("\n")

  const guidance = `Answer policy:
- Prioritize the user's needs (budget fit, fuel type, MPG, mileage, condition).
- Give concise comparisons of 2–4 top matches with reasons.
- For differences, highlight trims, powertrain, MPG, price/mileage gaps.
- If the user seems undecided, ask a kind clarifying question (budget, mpg priority, features).
- Only discuss the vehicles listed above; suggest changing filters to see more.`

  return `${header}\n\n${queryLine}\n\nDisplayed vehicles (${cars.length}):\n${carsLines}\n\n${guidance}`
}

function formatConversation(messages: Array<{ role: string; content: string }>): string {
  return messages
    .map((m) => {
      const role = m.role === "assistant" ? "Assistant" : "User"
      return `${role}: ${m.content}`
    })
    .join("\n")
}


