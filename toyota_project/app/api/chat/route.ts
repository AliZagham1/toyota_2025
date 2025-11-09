import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Car } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const streamParam = url.searchParams.get("stream")
    const { messages, cars, originalQuery, stream: streamInBody } = await request.json()
    const shouldStream = streamParam === "1" || streamParam === "true" || streamInBody === true

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Limit the context
    const carsContext: Car[] = Array.isArray(cars) ? cars.slice(0, 12) : []
    const userConversation = Array.isArray(messages) ? messages : []
    const userTurns = userConversation.filter((m: any) => m?.role === "user").length

    const systemInstructions = buildSystemContext(originalQuery || "", carsContext, userTurns)

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    
    const prompt = `${systemInstructions}\n\nConversation:\n${formatConversation(userConversation)}\n\nAssistant:`

    if (shouldStream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          ;(async () => {
            const result = await model.generateContentStream(prompt)
            for await (const chunk of result.stream) {
              const textChunk = chunk.text()
              if (textChunk) {
                controller.enqueue(encoder.encode(textChunk))
              }
            }
            controller.close()
          })().catch((err) => {
            console.error("[Chat] Streaming error:", err)
            controller.error(err)
          })
        },
      })
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      })
    }

    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error("[Chat] Error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}

function buildSystemContext(originalQuery: string, cars: Car[], userTurns: number): string {
  const header = `You are Toyo, a friendly, upbeat Toyota dealership assistant embedded in a results page.
Tone: warm, encouraging, and concise. Avoid jargon. Use short sentences.
Goal: help the user choose confidently. Celebrate good fits. Offer kind guidance.
Context: You only know the vehicles shown in this results page. If asked beyond this list, say you only know what's displayed and suggest adjusting filters.
Style:
- ALWAYS answer in one short paragraph (2–5 simple sentences). No bullet points unless explicitly requested.
- Act as a decisive expert. Do not explain definitions or teach concepts unless asked; focus on recommendations.
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
- Default to recommending the single best option right now; only ask a question if a critical detail is missing.
- Provide concise comparisons and recommendations in a single short paragraph.
- Highlight key differences (trim, powertrain, MPG, price/mileage) briefly.
- If the user seems undecided, ask a kind clarifying question (budget, mpg priority, features).
- Only discuss the vehicles listed above; suggest changing filters to see more.`

  const acknowledgement = `Before asking a question, briefly acknowledge what the user already told you and what you understand from their description, then ask one short clarifying question to build on it. Keep it natural and friendly.`

  const finalization =
    userTurns >= 2
      ? `Finalization rule: You have enough information. Now provide your final recommendation in one short paragraph. Start with "Best match:" and name the single best vehicle (or two only if it's a clear tie) from the list, with a brief reason (fit to needs like MPG/price/mileage/trim). Do not ask more questions. Invite the user to view details next.`
      : `Progress rule: Keep the conversation brief. If you need exactly one more detail to make a strong recommendation, ask one short question. Otherwise, suggest your top pick now.`

  return `${header}\n\n${queryLine}\n\nDisplayed vehicles (${cars.length}):\n${carsLines}\n\n${guidance}\n\n${acknowledgement}\n\n${finalization}`
}

function formatConversation(messages: Array<{ role: string; content: string }>): string {
  return messages
    .map((m) => {
      const role = m.role === "assistant" ? "Assistant" : "User"
      return `${role}: ${m.content}`
    })
    .join("\n")
}


