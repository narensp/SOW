import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const GEMINI_API_KEY = "AIzaSyDJCdB3wdqEYL8dnTtdvPsAlkPlWly5UJc"

export async function GET(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is missing." }, { status: 500 })
    }

    // Create Google AI instance with API key
    const google = createGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
    })

    const model = google("gemini-2.0-flash-exp")

    // Make a simple test request to check if the API key works
    const startTime = Date.now()

    try {
      const { text, usage } = await generateText({
        model: model,
        prompt:
          "Hello, this is a test to check Gemini 2.0 Flash API quota. Please respond with 'Gemini 2.0 Flash API key is working'.",
        maxTokens: 50,
      })

      const responseTime = Date.now() - startTime

      return NextResponse.json({
        status: "success",
        message: "Gemini 2.0 Flash API key is working",
        model: "gemini-2.0-flash-exp",
        response: text,
        responseTime: `${responseTime}ms`,
        usage: usage || "Usage data not available",
        apiKey: `${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      const errorMessage = String(error?.message || error || "Unknown error")

      // Check for specific quota/rate limit errors
      const quotaRegex = /quota[_\s-]?exceeded|exceeded.*quota|current\s+quota/i
      const rateRegex = /rate[_\s-]?limit|rate.*exceeded/i
      const authRegex = /invalid[_\s-]?api|authentication/i

      if (quotaRegex.test(errorMessage)) {
        return NextResponse.json(
          {
            status: "quota_exceeded",
            error: "Gemini 2.0 Flash API quota has been exceeded",
            model: "gemini-2.0-flash-exp",
            details: errorMessage,
            apiKey: `${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`,
            timestamp: new Date().toISOString(),
          },
          { status: 429 },
        )
      }
      if (rateRegex.test(errorMessage)) {
        return NextResponse.json(
          {
            status: "rate_limited",
            error: "Gemini 2.0 Flash API rate limit exceeded",
            model: "gemini-2.0-flash-exp",
            details: errorMessage,
            apiKey: `${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`,
            timestamp: new Date().toISOString(),
          },
          { status: 429 },
        )
      }
      if (authRegex.test(errorMessage)) {
        return NextResponse.json(
          {
            status: "invalid_key",
            error: "Invalid API key",
            model: "gemini-2.0-flash-exp",
            details: errorMessage,
            apiKey: `${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`,
            timestamp: new Date().toISOString(),
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          status: "error",
          error: "Gemini 2.0 Flash API request failed",
          model: "gemini-2.0-flash-exp",
          details: errorMessage,
          apiKey: `${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Gemini 2.0 Flash quota check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Failed to check Gemini 2.0 Flash API quota",
        model: "gemini-2.0-flash-exp",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
