"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, FileText, Calendar } from "lucide-react"

interface ProspectNotesProps {
  prospectId?: string
  initialNotes?: string
  onSave?: (notes: string) => void
}

export default function ProspectNotes({ prospectId, initialNotes = "", onSave }: ProspectNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    setLastSaved(new Date())
    setSaving(false)

    if (onSave) {
      onSave(notes)
    }
  }

  const handleAutoSave = () => {
    // Auto-save after 2 seconds of inactivity
    const timeoutId = setTimeout(() => {
      if (notes !== initialNotes) {
        handleSave()
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Prospect Notes & Additional Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prospect-notes">Notes</Label>
          <Textarea
            id="prospect-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              handleAutoSave()
            }}
            placeholder="Enter additional information about the prospect...

Examples:
• Family wealth background
• Investment preferences and risk tolerance  
• Real estate holdings (primary residence, vacation homes, investment properties)
• Business ownership stakes
• Trust and estate planning considerations
• Philanthropic interests
• Liquidity events (IPO, acquisition, inheritance)
• Spending patterns and lifestyle
• Financial goals and timeline
• Relationship history with other advisors"
            rows={12}
            className="resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {lastSaved && (
              <>
                <Calendar className="h-4 w-4" />
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving || notes === initialNotes}>
            {saving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Notes
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Suggested Information to Capture:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• Real estate portfolio value</div>
            <div>• Investment account balances</div>
            <div>• Business valuations</div>
            <div>• Trust fund details</div>
            <div>• Insurance policies</div>
            <div>• Debt obligations</div>
            <div>• Spending patterns</div>
            <div>• Financial goals</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
