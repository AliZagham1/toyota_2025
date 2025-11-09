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

  // Limit cars context to 12 to keep prompt compact
  const carsContext: Car[] = Array.isArray(cars) ? cars.slice(0, 12) : []
  const userConversation = Array.isArray(messages) ? messages : []
  const userTurns = userConversation.filter((m: any) => m?.role === "user").length

  // Check if user is asking about price (cheapest, most expensive, etc.)
  const lastUserMessage = userConversation
    .filter((m: any) => m?.role === "user")
    .pop()?.content?.toLowerCase() || ""
  const isPriceQuery = lastUserMessage.includes("cheapest") || 
                       lastUserMessage.includes("most expensive") || 
                       lastUserMessage.includes("lowest price") ||
                       lastUserMessage.includes("highest price") ||
                       lastUserMessage.includes("affordable") ||
                       lastUserMessage.includes("budget")

  const systemInstructions = buildSystemContext(originalQuery || "", carsContext, userTurns, isPriceQuery)

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Build chat content: system context + prior messages
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

    // Non-streaming fallback
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error("[Chat] Error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}

function buildSystemContext(originalQuery: string, cars: Car[], userTurns: number, isPriceQuery: boolean = false): string {
  const header = `You are Toyo, a friendly, decisive Toyota dealership assistant embedded in a results page.
Tone: warm, encouraging, and concise. Avoid jargon. Use short sentences.
Goal: help the user choose confidently by providing clear recommendations and answers.
Context: You only know the vehicles shown in this results page. If asked beyond this list, say you only know what's displayed and suggest adjusting filters.
Style:
- ALWAYS answer in one short paragraph (2–5 simple sentences). No bullet points unless explicitly requested.
- Act as a decisive expert. Do not explain definitions or teach concepts unless asked; focus on recommendations and direct answers.
- ANSWER questions directly. Provide recommendations based on available information.
- Never make up specs not present; use what's in the list (year, model, price, mileage, fuel type, MPG, trim hints).
- Keep it positive and helpful.`

  const queryLine = originalQuery
    ? `User original description: "${originalQuery}"`
    : "User original description: (not provided)"

  // Sort cars by price if it's a price-related query
  const sortedCars = isPriceQuery 
    ? [...cars].sort((a, b) => (a.price || 0) - (b.price || 0))
    : cars

  const carsLines = sortedCars
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

  const priceQueryInstructions = isPriceQuery
    ? `\n\nCRITICAL: The user is asking about price (cheapest/most expensive/affordable).
- The vehicles above are sorted by price (lowest to highest).
- The FIRST vehicle listed (#1) is the CHEAPEST option.
- The LAST vehicle listed is the MOST EXPENSIVE option.
- When asked "what's the cheapest", identify the FIRST vehicle in the list above.
- When asked "what's the most expensive", identify the LAST vehicle in the list above.
- ALWAYS check the actual price numbers to confirm - do not guess or assume.
- State the exact price and vehicle details from the list above.`
    : ""

  const guidance = `CRITICAL ANSWER POLICY:
- ALWAYS provide a direct answer or recommendation. Do NOT ask questions unless absolutely necessary.
- When the user asks a question, ANSWER IT directly using the vehicle information provided.
- When comparing vehicles, provide a clear recommendation based on the user's stated needs.
- Only ask ONE clarifying question if you genuinely cannot answer without a critical piece of information (and this should be rare).
- Prioritize giving answers over asking questions. Be decisive and helpful.
- If the user asks "which is better" or "what should I choose", recommend the best option from the list with a brief reason.
- Only discuss the vehicles listed above; suggest changing filters to see more.`

  const finalization =
    userTurns >= 1
      ? `You have information from the user. Provide a direct answer or recommendation now. Be decisive. Only ask a question if you absolutely cannot answer without a critical detail that is completely missing.`
      : `Provide helpful information and be ready to answer questions directly.`

  return `${header}\n\n${queryLine}\n\nDisplayed vehicles (${sortedCars.length}):\n${carsLines}${priceQueryInstructions}\n\n${guidance}\n\n${finalization}`
}

function formatConversation(messages: Array<{ role: string; content: string }>): string {
  return messages
    .map((m) => {
      const role = m.role === "assistant" ? "Assistant" : "User"
      return `${role}: ${m.content}`
    })
    .join("\n")
}


