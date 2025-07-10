import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 })
    }

    // Create Google AI instance with API key
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    })

    const model = google("gemini-2.0-flash-exp")

    // Make a simple test request
    const startTime = Date.now()

    try {
      const { text } = await generateText({
        model: model,
        prompt: "Test message. Please respond with 'Gemini 2.0 Flash API key is working correctly'.",
        maxTokens: 20,
      })

      const responseTime = Date.now() - startTime

      return NextResponse.json({
        status: "success",
        message: "Gemini 2.0 Flash API key is valid and working",
        model: "gemini-2.0-flash-exp",
        response: text,
        responseTime: `${responseTime}ms`,
        keyPreview: `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`,
      })
    } catch (error: any) {
      const errorMessage = String(error?.message || error || "Unknown error")

      return NextResponse.json(
        {
          status: "error",
          error: "Gemini 2.0 Flash API key test failed",
          model: "gemini-2.0-flash-exp",
          details: errorMessage,
          keyPreview: `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to test Gemini 2.0 Flash API key", details: error.message },
      { status: 500 },
    )
  }
}
