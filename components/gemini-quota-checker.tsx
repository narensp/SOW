"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react"

export default function GeminiQuotaChecker() {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const checkQuota = async () => {
    setChecking(true)
    setResult(null)

    try {
      const response = await fetch("/api/check-gemini-quota")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        status: "error",
        error: "Failed to check quota",
        details: error.message,
      })
    } finally {
      setChecking(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "quota_exceeded":
      case "rate_limited":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "invalid_key":
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Zap className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "quota_exceeded":
      case "rate_limited":
        return "secondary"
      case "invalid_key":
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Gemini 2.0 Flash API Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkQuota} disabled={checking} className="w-full">
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking Gemini 2.0 Flash API Status...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Check Gemini 2.0 Flash API Quota
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.status)}
                <span className="font-medium">API Status</span>
                {result.model && (
                  <Badge variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    {result.model}
                  </Badge>
                )}
              </div>
              <Badge variant={getStatusColor(result.status)}>{result.status.replace("_", " ").toUpperCase()}</Badge>
            </div>

            {result.status === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>✅ Gemini 2.0 Flash API Key is working!</strong>
                    </p>
                    <p>
                      <strong>Response:</strong> {result.response}
                    </p>
                    <p>
                      <strong>Response Time:</strong> {result.responseTime}
                    </p>
                    {result.usage && (
                      <p>
                        <strong>Usage Info:</strong> {JSON.stringify(result.usage)}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {result.status === "quota_exceeded" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>❌ Gemini 2.0 Flash Quota Exceeded</strong>
                    </p>
                    <p>Your Gemini 2.0 Flash API quota has been exceeded. This could mean:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Daily quota limit reached</li>
                      <li>Rate limit exceeded (requests per minute)</li>
                      <li>Monthly usage cap reached</li>
                    </ul>
                    <p className="text-xs">
                      <strong>Details:</strong> {result.details}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {result.status === "rate_limited" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>⏱️ Gemini 2.0 Flash Rate Limited</strong>
                    </p>
                    <p>Too many requests in a short time. Wait a moment and try again.</p>
                    <p className="text-xs">
                      <strong>Details:</strong> {result.details}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {result.status === "invalid_key" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>🔑 Invalid API Key</strong>
                    </p>
                    <p>The API key appears to be invalid or expired.</p>
                    <p className="text-xs">
                      <strong>Details:</strong> {result.details}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {result.status === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>❌ Gemini 2.0 Flash API Error</strong>
                    </p>
                    <p className="text-xs">
                      <strong>Details:</strong> {result.details}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>API Key:</strong> {result.apiKey}
              </p>
              <p>
                <strong>Timestamp:</strong> {result.timestamp}
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• This will make a small test request to check Gemini 2.0 Flash API availability</p>
          <p>• Gemini 2.0 Flash is the latest and most advanced Flash model</p>
          <p>• Enhanced reasoning capabilities with improved speed and efficiency</p>
          <p>• Check Google AI Studio for detailed usage statistics</p>
        </div>
      </CardContent>
    </Card>
  )
}
