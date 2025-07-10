import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export async function POST(req: NextRequest) {
  const GEMINI_API_KEY = "AIzaSyDJCdB3wdqEYL8dnTtdvPsAlkPlWly5UJc"

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key is missing." }, { status: 500 })
  }

  // Create Google AI instance with API key
  const google = createGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
  })

  const model = google("gemini-2.0-flash-exp")

  try {
    const { employmentRecords, jurisdiction, prospectProfile } = await req.json()

    console.log("Starting Gemini 2.0 Flash financial analysis...")

    const { text } = await generateText({
      model: model,
      system: `You are a senior private banking analyst specializing in wealth estimation and tax calculations. 

Your task is to:
1. Calculate accurate annual financial breakdowns including taxes, deductions, and net income
2. Estimate wealth accumulation considering savings rates, investments, and lifestyle
3. Provide jurisdiction-specific tax calculations
4. Consider career progression and income growth patterns
5. Account for bonuses, equity compensation, and other benefits

Return a JSON object with this structure:
{
  "yearlyBreakdowns": [
    {
      "year": 2023,
      "grossIncome": 200000,
      "incomeTax": 45000,
      "socialContributions": 15000, 
      "deductions": 12000,
      "netIncome": 152000,
      "estimatedSavings": 30000,
      "companies": ["Company A"],
      "notes": "Calculation reasoning"
    }
  ],
  "wealthProjection": {
    "totalEstimatedWealth": 500000,
    "savingsRate": 0.20,
    "investmentReturns": 0.07,
    "liquidAssets": 200000,
    "illiquidAssets": 300000,
    "methodology": "How wealth was calculated"
  },
  "taxOptimization": {
    "suggestions": ["Tax optimization opportunities"],
    "jurisdiction": "US",
    "effectiveTaxRate": 0.28
  },
  "riskFactors": ["Key assumptions and limitations"],
  "confidenceLevel": 0.85
}

Use accurate tax rates and rules for the specified jurisdiction. Consider:
- Progressive tax brackets
- Social security/pension contributions  
- Standard vs itemized deductions
- State/provincial taxes where applicable
- International tax implications
- Industry-specific compensation patterns`,
      prompt: `Calculate comprehensive financial analysis for this employment history:

Jurisdiction: ${jurisdiction}
Employment Records: ${JSON.stringify(employmentRecords, null, 2)}
Prospect Profile: ${JSON.stringify(prospectProfile, null, 2)}

Provide detailed year-by-year financial breakdowns with accurate tax calculations for ${jurisdiction}. Consider career progression, industry standards, and wealth accumulation patterns. Be thorough and explain your methodology.`,
    })

    console.log("Gemini 2.0 Flash financial analysis completed")

    let financialAnalysis
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text
      financialAnalysis = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("Failed to parse financial analysis:", text)
      throw new Error("Failed to parse financial analysis result")
    }

    return NextResponse.json(financialAnalysis)
  } catch (error) {
    console.error("Gemini 2.0 Flash financial calculation error:", error)

    const msg = String(error?.message || "")
    const quotaRegex = /quota[_\s-]?exceeded|exceeded.*quota|current\s+quota/i

    if (quotaRegex.test(msg) || error.message.includes("429")) {
      return NextResponse.json(
        {
          error: "Gemini 2.0 Flash quota exceeded. Please try again later.",
          quotaExceeded: true,
        },
        {
          status: 429,
        },
      )
    }

    return NextResponse.json({ error: "Failed to calculate financials", details: error.message }, { status: 500 })
  }
}
