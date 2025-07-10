"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, TrendingUp, AlertTriangle, CheckCircle, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { EmploymentRecord } from "./dashboard"

interface AIFinancialAnalyzerProps {
  employmentRecords: EmploymentRecord[]
  jurisdiction: string
  prospectName?: string
  onAnalysisComplete?: (analysis: any) => void
}

export default function AIFinancialAnalyzer({
  employmentRecords,
  jurisdiction,
  prospectName,
  onAnalysisComplete,
}: AIFinancialAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState("")

  const runAnalysis = async () => {
    if (employmentRecords.length === 0) {
      setError("No employment records to analyze")
      return
    }

    setAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/calculate-financials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employmentRecords,
          jurisdiction,
          prospectProfile: {
            name: prospectName,
            recordCount: employmentRecords.length,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Gemini 2.0 Flash Financial Analysis:", result)

      setAnalysis(result)
      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
    } catch (err) {
      console.error("Financial analysis error:", err)
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const getCurrencySymbol = (jurisdiction: string): string => {
    const currencies = {
      US: "$",
      UK: "£",
      CA: "C$",
      AU: "A$",
      DE: "€",
      FR: "€",
      CH: "CHF",
      SG: "S$",
      HK: "HK$",
      JP: "¥",
    }
    return currencies[jurisdiction] || "$"
  }

  const currency = getCurrencySymbol(jurisdiction)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI Financial Analysis</span>
          <Badge variant="outline" className="ml-2">
            <Zap className="h-3 w-3 mr-1" />
            Gemini 2.0 Flash
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Get AI-powered wealth analysis using Gemini 2.0 Flash for the fastest and most accurate tax calculations
              and wealth projections.
            </p>
            <Button
              onClick={runAnalysis}
              disabled={analyzing || employmentRecords.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing with Gemini 2.0 Flash...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Financial Profile
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Wealth Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Estimated Wealth</p>
                  <p className="text-2xl font-bold text-green-700">
                    {currency}
                    {analysis.wealthProjection?.totalEstimatedWealth?.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Savings Rate</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.round((analysis.wealthProjection?.savingsRate || 0) * 100)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Tax Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {Math.round((analysis.taxOptimization?.effectiveTaxRate || 0) * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Confidence & Methodology */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">AI Confidence</span>
                <Badge variant="outline">
                  <Zap className="h-3 w-3 mr-1" />
                  2.0 Flash
                </Badge>
              </div>
              <Badge variant={analysis.confidenceLevel > 0.8 ? "default" : "secondary"}>
                {Math.round(analysis.confidenceLevel * 100)}%
              </Badge>
            </div>

            {/* Methodology */}
            {analysis.wealthProjection?.methodology && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>Analysis Methodology:</strong>
                  <br />
                  {analysis.wealthProjection.methodology}
                </AlertDescription>
              </Alert>
            )}

            {/* Tax Optimization */}
            {analysis.taxOptimization?.suggestions?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tax Optimization Opportunities</h4>
                <div className="space-y-2">
                  {analysis.taxOptimization.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {analysis.riskFactors?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-orange-700">Key Assumptions & Limitations</h4>
                <div className="space-y-2">
                  {analysis.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm text-orange-600">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={runAnalysis} variant="outline" className="w-full bg-transparent" disabled={analyzing}>
              <Brain className="h-4 w-4 mr-2" />
              Re-analyze with Updated Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
