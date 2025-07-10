"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface ManualEntryProps {
  onRecordAdded: (record: any) => void
}

export default function ManualEntry({ onRecordAdded }: ManualEntryProps) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    start_year: "",
    end_year: "",
    annual_income: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const record = {
      company: formData.company,
      position: formData.position,
      start_year: Number.parseInt(formData.start_year),
      end_year: formData.end_year ? Number.parseInt(formData.end_year) : null,
      annual_income: Number.parseInt(formData.annual_income),
    }

    onRecordAdded(record)

    // Reset form
    setFormData({
      company: "",
      position: "",
      start_year: "",
      end_year: "",
      annual_income: "",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Employment Record</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="e.g., Goldman Sachs"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                placeholder="e.g., Vice President"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_year">Start Year</Label>
              <Input
                id="start_year"
                type="number"
                value={formData.start_year}
                onChange={(e) => handleChange("start_year", e.target.value)}
                placeholder="2020"
                min="1950"
                max={new Date().getFullYear()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_year">End Year (Optional)</Label>
              <Input
                id="end_year"
                type="number"
                value={formData.end_year}
                onChange={(e) => handleChange("end_year", e.target.value)}
                placeholder="2023 or leave blank if current"
                min="1950"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual_income">Annual Income ($)</Label>
              <Input
                id="annual_income"
                type="number"
                value={formData.annual_income}
                onChange={(e) => handleChange("annual_income", e.target.value)}
                placeholder="150000"
                min="0"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Employment Record
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
