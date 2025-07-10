"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Save, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"

export default function ApiKeyManager() {
  const [newApiKey, setNewApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const updateApiKey = async () => {
    if (!newApiKey.trim()) {
      setResult({ status: "error", message: "Please enter an API key" })
      return
    }

    if (!newApiKey.startsWith("AIza")) {
      setResult({ status: "error", message: "Invalid API key format. Should start with 'AIza'" })
      return
    }

    setUpdating(true)
    setResult(null)

    try {
      // Test the new API key first
      const testResponse = await fetch("/api/test-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: newApiKey }),
      })

      const testResult = await testResponse.json()

      if (testResponse.ok && testResult.status === "success") {
        // If test successful, update the key
        const updateResponse = await fetch("/api/update-api-key", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey: newApiKey }),
        })

        const updateResult = await updateResponse.json()

        if (updateResponse.ok) {
          setResult({
            status: "success",
            message: "API key updated successfully!",
            details: `Key ending in ...${newApiKey.slice(-4)} is now active`,
          })
          setNewApiKey("")
        } else {
          setResult({
            status: "error",
            message: "Failed to update API key",
            details: updateResult.error,
          })
        }
      } else {
        setResult({
          status: "error",
          message: "API key test failed",
          details: testResult.details || testResult.error,
        })
      }
    } catch (error) {
      setResult({
        status: "error",
        message: "Failed to update API key",
        details: error.message,
      })
    } finally {
      setUpdating(false)
    }
  }

  const getCurrentKey = () => {
    // This would normally come from your environment or state
    return "AIzaSyDJCdB3wdqEYL8dnTtdvPsAlkPlWly5UJc"
  }

  const currentKey = getCurrentKey()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-blue-600" />
          <span>Gemini API Key Manager</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Current API Key</Label>
          <div className="flex items-center space-x-2">
            <Input
              value={showKey ? currentKey : `${currentKey.substring(0, 10)}...${currentKey.slice(-4)}`}
              readOnly
              className="font-mono text-sm"
            />
            <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)} className="flex-shrink-0">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-api-key">New API Key</Label>
          <Input
            id="new-api-key"
            type={showKey ? "text" : "password"}
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="font-mono text-sm"
          />
        </div>

        <Button onClick={updateApiKey} disabled={updating || !newApiKey.trim()} className="w-full">
          {updating ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-pulse" />
              Testing & Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Update API Key
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.status === "success" ? "default" : "destructive"}>
            {result.status === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">{result.message}</p>
                {result.details && <p className="text-sm">{result.details}</p>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• API key will be tested before updating</p>
          <p>• Changes take effect immediately</p>
          <p>• Get your API key from Google AI Studio</p>
        </div>
      </CardContent>
    </Card>
  )
}
