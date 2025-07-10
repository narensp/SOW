"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Plus, LogOut, TrendingUp, UserIcon, Linkedin, Globe } from "lucide-react"
import FileUpload from "@/components/file-upload"
import ManualEntry from "@/components/manual-entry"
import IncomeTimeline from "@/components/income-timeline"
import LinkedInIntegration from "@/components/linkedin-integration"
import ProspectNotes from "@/components/prospect-notes"
import ProspectHeader from "@/components/prospect-header"
import { useRouter } from "next/navigation"
import AIFinancialAnalyzer from "@/components/ai-financial-analyzer"
import GeminiQuotaChecker from "@/components/gemini-quota-checker"
import ApiKeyManager from "@/components/api-key-manager"

interface DashboardProps {
  user: User
}

export interface EmploymentRecord {
  id: string
  company: string
  position: string
  start_year: number
  end_year: number | null
  annual_income: number
  created_at: string
  user_id: string
  source?: string
  needsReview?: boolean
  jurisdiction?: string
  location?: string
  extracted?: boolean
}

export default function Dashboard({ user }: DashboardProps) {
  const [employmentRecords, setEmploymentRecords] = useState<EmploymentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [prospectNotes, setProspectNotes] = useState("")
  const [jurisdiction, setJurisdiction] = useState("US")
  const [prospectName, setProspectName] = useState("")
  const [prospectRole, setProspectRole] = useState("")
  const [prospectLocation, setProspectLocation] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const addEmploymentRecord = (record: Omit<EmploymentRecord, "id" | "created_at" | "user_id">) => {
    console.log("Dashboard: Adding employment record:", record)

    const newRecord: EmploymentRecord = {
      ...record,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: user.id,
    }

    setEmploymentRecords((prev) => {
      const updated = [...prev, newRecord].sort((a, b) => a.start_year - b.start_year)
      console.log("Dashboard: Updated employment records:", updated)
      return updated
    })

    // Update prospect role if this is the current position
    if (!record.end_year && !prospectRole) {
      setProspectRole(`${record.position} at ${record.company}`)
    }
  }

  const updateEmploymentRecord = (id: string, updates: Partial<EmploymentRecord>) => {
    setEmploymentRecords((prev) => prev.map((record) => (record.id === id ? { ...record, ...updates } : record)))
  }

  const handleJurisdictionDetected = (detectedJurisdiction: string) => {
    console.log("Dashboard: Setting jurisdiction to:", detectedJurisdiction)
    setJurisdiction(detectedJurisdiction)
  }

  const handleNameExtracted = (name: string) => {
    console.log("Dashboard: Setting prospect name to:", name)
    setProspectName(name)

    // Set location based on name
    if (name === "Haojun Jia") {
      setProspectLocation("Cambridge, Massachusetts, United States")
    }
  }

  const handleLinkedInDataExtracted = (data: any) => {
    console.log("Dashboard: LinkedIn data extracted:", data)
    addEmploymentRecord(data)

    // Update prospect info from LinkedIn data
    if (data.source === "LinkedIn" && data.location) {
      setProspectLocation(data.location)
    }
  }

  // Calculate totals based on actual employment records
  const totalEstimatedWealth = employmentRecords.reduce((total, record) => {
    const years = (record.end_year || new Date().getFullYear()) - record.start_year + 1
    return total + record.annual_income * years * 0.15
  }, 0)

  const averageIncome =
    employmentRecords.length > 0
      ? employmentRecords.reduce((sum, record) => sum + record.annual_income, 0) / employmentRecords.length
      : 0

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

  const getJurisdictionName = (code: string): string => {
    const names = {
      US: "United States",
      UK: "United Kingdom",
      CA: "Canada",
      AU: "Australia",
      DE: "Germany",
      FR: "France",
      CH: "Switzerland",
      SG: "Singapore",
      HK: "Hong Kong",
      JP: "Japan",
    }
    return names[code] || code
  }

  const getCareerSpan = (): string => {
    if (employmentRecords.length === 0) return ""
    const startYear = Math.min(...employmentRecords.map((r) => r.start_year))
    const endYear = Math.max(...employmentRecords.map((r) => r.end_year || new Date().getFullYear()))
    return `${startYear} - ${endYear}`
  }

  const currencySymbol = getCurrencySymbol(jurisdiction)

  console.log("Dashboard render - Employment records:", employmentRecords.length)
  console.log("Dashboard render - Prospect name:", prospectName)
  console.log("Dashboard render - Total wealth:", totalEstimatedWealth)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wealth Estimator</h1>
                <p className="text-sm text-gray-500">Private Banking Advisory Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>{getJurisdictionName(jurisdiction)}</span>
              </div>
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProspectHeader
          name={prospectName}
          currentRole={prospectRole}
          location={prospectLocation}
          jurisdiction={jurisdiction}
          totalRecords={employmentRecords.length}
          careerSpan={getCareerSpan()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Employment History Input</CardTitle>
                <CardDescription>
                  Upload Haojun Jia's resume, enter LinkedIn profile, or manually add employment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload" className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="flex items-center space-x-2">
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Manual</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-6">
                    <FileUpload onRecordsExtracted={addEmploymentRecord} onNameExtracted={handleNameExtracted} />
                  </TabsContent>
                  <TabsContent value="linkedin" className="mt-6">
                    <LinkedInIntegration
                      onDataExtracted={handleLinkedInDataExtracted}
                      onJurisdictionDetected={handleJurisdictionDetected}
                      onNameExtracted={handleNameExtracted}
                    />
                  </TabsContent>
                  <TabsContent value="manual" className="mt-6">
                    <ManualEntry onRecordAdded={addEmploymentRecord} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <IncomeTimeline
              records={employmentRecords}
              onUpdateRecord={updateEmploymentRecord}
              loading={loading}
              jurisdiction={jurisdiction}
            />

            <ProspectNotes initialNotes={prospectNotes} onSave={setProspectNotes} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Wealth Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Employment Records</p>
                    <p className="text-2xl font-bold">{employmentRecords.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Annual Income</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currencySymbol}
                      {Math.round(averageIncome).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Accumulated Wealth</p>
                    <p className="text-3xl font-bold text-green-600">
                      {currencySymbol}
                      {Math.round(totalEstimatedWealth).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Based on 15% savings rate assumption</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {employmentRecords.filter((r) => r.source === "LinkedIn").length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">LinkedIn Profile</span>
                      <span className="font-medium text-blue-600">
                        ✓ {employmentRecords.filter((r) => r.source === "LinkedIn").length} records
                      </span>
                    </div>
                  )}
                  {employmentRecords.filter((r) => r.source && r.source.includes(".pdf")).length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">PDF Resume</span>
                      <span className="font-medium text-green-600">
                        ✓ {employmentRecords.filter((r) => r.source && r.source.includes(".pdf")).length} records
                      </span>
                    </div>
                  )}
                  {employmentRecords.filter((r) => !r.source || r.source === "Manual").length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Manual Entry</span>
                      <span className="font-medium text-gray-600">
                        ✓ {employmentRecords.filter((r) => !r.source || r.source === "Manual").length} records
                      </span>
                    </div>
                  )}
                  {employmentRecords.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>No employment records yet</p>
                      <p className="text-xs">Upload resume or LinkedIn profile to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Upload Haojun Jia's resume PDF</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Try LinkedIn: haojun-jia-16a370192</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Review extracted employment data</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Generate comprehensive wealth report</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AIFinancialAnalyzer
              employmentRecords={employmentRecords}
              jurisdiction={jurisdiction}
              prospectName={prospectName}
              onAnalysisComplete={setAiAnalysis}
            />

            <ApiKeyManager />

            <GeminiQuotaChecker />
          </div>
        </div>
      </main>
    </div>
  )
}
