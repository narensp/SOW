import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const GEMINI_API_KEY = "AIzaSyDJCdB3wdqEYL8dnTtdvPsAlkPlWly5UJc"

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is missing." }, { status: 500 })
    }

    const { content, fileName } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 })
    }

    // Create Google AI instance with API key
    const google = createGoogleGenerativeAI({
      apiKey: GEMINI_API_KEY,
    })

    const model = google("gemini-2.0-flash-exp")

    try {
      console.log("Starting Gemini 2.0 Flash analysis for:", fileName)

      const { text } = await generateText({
        model: model,
        system: `You are an expert career and financial analyst. Analyze documents (resumes, CVs, LinkedIn exports) to extract employment history and estimate compensation.

Your task is to:
1. Extract person's full name
2. Identify all employment positions with companies, roles, dates, and locations
3. Estimate annual salaries based on role, company, location, and time period
4. Determine the person's jurisdiction for tax purposes
5. Provide confidence scores for extracted information

Return a JSON object with this exact structure:
{
  "name": "Full Name",
  "currentRole": "Current Position at Company",
  "location": "City, State/Province, Country",
  "jurisdiction": "US|UK|CA|AU|DE|FR|CH|SG|HK|JP", 
  "employmentRecords": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startYear": 2020,
      "endYear": 2023, // or null if current
      "annualIncome": 150000,
      "location": "City, State/Country",
      "confidence": 0.9,
      "reasoning": "Why this salary estimate"
    }
  ],
  "summary": "Brief career summary",
  "totalExperience": "Number of years",
  "confidenceScore": 0.85
}

Consider these factors for salary estimation:
- Company tier (FAANG, Big 4, Fortune 500, etc.)
- Role seniority and responsibilities  
- Geographic location and cost of living
- Industry standards and time period
- Career progression and promotions
- Academic background and certifications

Be conservative but realistic with salary estimates. Use market data and industry knowledge.`,
        prompt: `Analyze this document and extract employment information:

File: ${fileName}
Content: ${content}

Please extract the person's career history and provide salary estimates based on roles, companies, locations, and time periods. Focus on accuracy and provide reasoning for estimates.`,
      })

      console.log("Gemini 2.0 Flash response received:", text.substring(0, 200) + "...")

      // Parse the JSON response from Gemini
      let analysisResult
      try {
        // Extract JSON from the response if it's wrapped in markdown or other text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        const jsonString = jsonMatch ? jsonMatch[0] : text
        analysisResult = JSON.parse(jsonString)
        console.log("Successfully parsed Gemini 2.0 Flash analysis:", analysisResult)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text)
        throw new Error("Failed to parse AI analysis result")
      }

      return NextResponse.json(analysisResult)
    } catch (error: any) {
      const msg = String(error?.message || "")
      console.error("Gemini 2.0 Flash API error details:", {
        message: msg,
        error: error,
        stack: error?.stack,
      })

      // Detect real quota / rate-limit problems from Google
      const quotaRegex = /quota[_\s-]?exceeded|exceeded.*quota|current\s+quota/i
      const rateRegex = /rate[_\s-]?limit|rate.*exceeded/i
      const authRegex = /invalid[_\s-]?api|authentication/i

      if (quotaRegex.test(msg) || (msg.includes("429") && msg.includes("quota"))) {
        console.warn("Gemini 2.0 Flash quota exceeded – falling back:", msg)
        return NextResponse.json({ quotaExceeded: true, error: "Gemini 2.0 Flash quota exceeded" }, { status: 429 })
      }

      if (rateRegex.test(msg) || (msg.includes("429") && rateRegex.test(msg))) {
        console.warn("Gemini 2.0 Flash rate limit exceeded – falling back:", msg)
        return NextResponse.json(
          { quotaExceeded: true, error: "Gemini 2.0 Flash rate limit exceeded" },
          { status: 429 },
        )
      }

      if (authRegex.test(msg)) {
        return NextResponse.json({ error: "Invalid API key", details: msg }, { status: 401 })
      }

      // For other errors, don't fall back - return the actual error
      console.error("Gemini 2.0 Flash analysis failed with error:", msg)
      return NextResponse.json(
        {
          error: "Gemini 2.0 Flash analysis failed",
          details: msg,
          geminiError: true,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Document analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze document", details: error.message }, { status: 500 })
  }
}
