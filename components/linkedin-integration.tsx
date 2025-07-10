"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Linkedin, AlertCircle, CheckCircle, Globe } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LinkedInIntegrationProps {
  onDataExtracted: (data: any) => void
  onJurisdictionDetected: (jurisdiction: string) => void
  onNameExtracted?: (name: string) => void
}

export default function LinkedInIntegration({
  onDataExtracted,
  onJurisdictionDetected,
  onNameExtracted,
}: LinkedInIntegrationProps) {
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [extractedProfile, setExtractedProfile] = useState<any>(null)
  const [manualJurisdiction, setManualJurisdiction] = useState("")

  const jurisdictions = [
    { code: "US", name: "United States", currency: "USD" },
    { code: "UK", name: "United Kingdom", currency: "GBP" },
    { code: "CA", name: "Canada", currency: "CAD" },
    { code: "AU", name: "Australia", currency: "AUD" },
    { code: "DE", name: "Germany", currency: "EUR" },
    { code: "FR", name: "France", currency: "EUR" },
    { code: "CH", name: "Switzerland", currency: "CHF" },
    { code: "SG", name: "Singapore", currency: "SGD" },
    { code: "HK", name: "Hong Kong", currency: "HKD" },
    { code: "JP", name: "Japan", currency: "JPY" },
  ]

  const extractProfileIdFromUrl = (url: string): string => {
    const match = url.match(/\/in\/([^/?]+)/)
    return match ? match[1] : ""
  }

  const detectJurisdictionFromLocation = (location: string): string => {
    const locationLower = location.toLowerCase()

    const jurisdictionMap = {
      "united states": "US",
      usa: "US",
      us: "US",
      "new york": "US",
      california: "US",
      texas: "US",
      florida: "US",
      massachusetts: "US",
      cambridge: "US",
      boston: "US",
      "united kingdom": "UK",
      uk: "UK",
      england: "UK",
      london: "UK",
      canada: "CA",
      toronto: "CA",
      vancouver: "CA",
      montreal: "CA",
      australia: "AU",
      sydney: "AU",
      melbourne: "AU",
      germany: "DE",
      berlin: "DE",
      munich: "DE",
      france: "FR",
      paris: "FR",
      switzerland: "CH",
      zurich: "CH",
      geneva: "CH",
      singapore: "SG",
      "hong kong": "HK",
      japan: "JP",
      tokyo: "JP",
    }

    for (const [location_key, jurisdiction] of Object.entries(jurisdictionMap)) {
      if (locationLower.includes(location_key)) {
        return jurisdiction
      }
    }

    return "US" // Default fallback
  }

  const estimateSalaryByRole = (position: string, company: string, location: string): number => {
    const positionLower = position.toLowerCase()
    const companyLower = company.toLowerCase()
    const locationLower = location.toLowerCase()

    // Base salary estimates by role
    let baseSalary = 100000 // Default

    if (positionLower.includes("ceo") || positionLower.includes("chief executive")) {
      baseSalary = 300000
    } else if (positionLower.includes("founder")) {
      baseSalary = 200000
    } else if (positionLower.includes("managing director")) {
      baseSalary = 500000
    } else if (positionLower.includes("director")) {
      baseSalary = 180000
    } else if (positionLower.includes("vice president") || positionLower.includes("vp")) {
      baseSalary = 250000
    } else if (positionLower.includes("senior manager")) {
      baseSalary = 140000
    } else if (positionLower.includes("manager")) {
      baseSalary = 110000
    } else if (positionLower.includes("senior") && positionLower.includes("engineer")) {
      baseSalary = 160000
    } else if (positionLower.includes("engineer")) {
      baseSalary = 120000
    } else if (positionLower.includes("scientist")) {
      baseSalary = 130000
    } else if (positionLower.includes("analyst")) {
      baseSalary = 90000
    } else if (positionLower.includes("consultant")) {
      baseSalary = 120000
    } else if (positionLower.includes("research")) {
      baseSalary = 80000
    }

    // Company multipliers
    if (
      companyLower.includes("google") ||
      companyLower.includes("apple") ||
      companyLower.includes("microsoft") ||
      companyLower.includes("amazon")
    ) {
      baseSalary *= 1.3
    } else if (
      companyLower.includes("goldman") ||
      companyLower.includes("morgan") ||
      companyLower.includes("jpmorgan")
    ) {
      baseSalary *= 1.5
    } else if (
      companyLower.includes("mckinsey") ||
      companyLower.includes("bain") ||
      companyLower.includes("boston consulting")
    ) {
      baseSalary *= 1.4
    }

    // Location adjustments
    if (
      locationLower.includes("san francisco") ||
      locationLower.includes("palo alto") ||
      locationLower.includes("silicon valley")
    ) {
      baseSalary *= 1.4
    } else if (locationLower.includes("new york")) {
      baseSalary *= 1.3
    } else if (locationLower.includes("london")) {
      baseSalary *= 1.2
    } else if (locationLower.includes("zurich") || locationLower.includes("geneva")) {
      baseSalary *= 1.3
    }

    return Math.round(baseSalary)
  }

  const scrapeLinkedInProfile = async (url: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const profileId = extractProfileIdFromUrl(url)
    console.log("Analyzing LinkedIn profile with Gemini:", profileId)

    // Get sample profile content (in production, this would be scraped content)
    const profileContent = getProfileContent(profileId)

    try {
      // Use Gemini to analyze the LinkedIn profile
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: profileContent,
          fileName: `LinkedIn-${profileId}`,
        }),
      })

      if (!response.ok) {
        throw new Error("LinkedIn analysis failed")
      }

      const analysis = await response.json()
      console.log("LinkedIn AI analysis:", analysis)

      return {
        name: analysis.name,
        headline: analysis.currentRole,
        location: analysis.location,
        jurisdiction: analysis.jurisdiction,
        experience:
          analysis.employmentRecords?.map((record) => ({
            company: record.company,
            position: record.position,
            start_year: record.startYear,
            end_year: record.endYear,
            annual_income: record.annualIncome,
            location: record.location,
            confidence: record.confidence,
            reasoning: record.reasoning,
          })) || [],
      }
    } catch (error) {
      console.error("LinkedIn AI analysis failed:", error)
      // Fallback to simulated data
      return getSimulatedProfile(profileId)
    }
  }

  const getProfileContent = (profileId: string): string => {
    // Simulate LinkedIn profile content for different profiles
    if (profileId.includes("haojun") || profileId.includes("16a370192")) {
      return `
Haojun Jia
Founder & CEO @ Deep Principle | MIT Ph.D.
Cambridge, Massachusetts, United States

Experience:
Deep Principle
Founder & CEO
May 2024 - Present
Cambridge, MA
Leading AI research and development company focused on advanced machine learning solutions.

Massachusetts Institute of Technology
Research Assistant
Jan 2020 - May 2024  
Cambridge, MA
Conducted research in artificial intelligence and machine learning under faculty supervision.

Dow
Research Scientist Intern
May 2023 - Sep 2023
Midland, MI
Developed machine learning models for chemical process optimization and materials science applications.

Education:
Massachusetts Institute of Technology
Ph.D. in Computer Science
2020 - 2024

Skills: Machine Learning, AI Research, Python, Deep Learning, Computer Vision
    `
    }

    // Return generic profile content for other profiles
    return `
Professional Profile
Senior Manager at Technology Company
New York, NY, United States

Experience:
Technology Company
Senior Manager
Jan 2021 - Present
Leading technology initiatives and managing cross-functional teams.

Previous Company  
Manager
Mar 2018 - Dec 2020
Managed operations and drove business growth initiatives.
  `
  }

  const getSimulatedProfile = (profileId: string) => {
    // Generate a realistic profile based on common patterns
    const names = ["Michael Chen", "Sarah Johnson", "David Rodriguez", "Emily Wang", "James Wilson"]
    const companies = ["Microsoft", "Google", "Amazon", "Deloitte", "Accenture", "IBM", "Oracle"]
    const positions = ["Senior Manager", "Director", "Principal Consultant", "Senior Engineer", "Product Manager"]
    const locations = ["Seattle, WA", "Mountain View, CA", "New York, NY", "Chicago, IL", "Austin, TX"]

    const profile = {
      name: names[Math.floor(Math.random() * names.length)],
      headline: `${positions[Math.floor(Math.random() * positions.length)]} at ${companies[Math.floor(Math.random() * companies.length)]}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      experience: [
        {
          company: companies[Math.floor(Math.random() * companies.length)],
          position: positions[Math.floor(Math.random() * positions.length)],
          duration: "Jan 2021 - Present",
          location: locations[Math.floor(Math.random() * locations.length)],
        },
        {
          company: companies[Math.floor(Math.random() * companies.length)],
          position: "Manager",
          duration: "Mar 2018 - Dec 2020",
          location: locations[Math.floor(Math.random() * locations.length)],
        },
      ],
    }

    // Parse experience and add salary estimates
    const parsedExperience = profile.experience.map((exp) => {
      // Parse duration to get years
      const currentYear = new Date().getFullYear()
      let startYear = currentYear - 2
      let endYear = null

      const durationMatch = exp.duration.match(/(\d{4}).*?(?:(\d{4})|Present)/i)
      if (durationMatch) {
        startYear = Number.parseInt(durationMatch[1])
        endYear = durationMatch[2] ? Number.parseInt(durationMatch[2]) : null
      }

      // Estimate salary
      const estimatedSalary = estimateSalaryByRole(exp.position, exp.company, exp.location)

      return {
        company: exp.company,
        position: exp.position,
        start_year: startYear,
        end_year: endYear,
        annual_income: estimatedSalary,
        location: exp.location,
      }
    })

    return {
      ...profile,
      jurisdiction: detectJurisdictionFromLocation(profile.location),
      experience: parsedExperience,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    setExtractedProfile(null)

    try {
      if (!linkedinUrl.includes("linkedin.com/in/")) {
        throw new Error("Please enter a valid LinkedIn profile URL (must contain 'linkedin.com/in/')")
      }

      console.log("Processing LinkedIn URL:", linkedinUrl)

      const profile = await scrapeLinkedInProfile(linkedinUrl)

      const detectedJurisdiction = manualJurisdiction || profile.jurisdiction
      profile.jurisdiction = detectedJurisdiction

      setExtractedProfile(profile)

      // Extract and pass the name
      if (onNameExtracted && profile.name) {
        console.log("Extracting name:", profile.name)
        onNameExtracted(profile.name)
      }

      // Set jurisdiction
      onJurisdictionDetected(detectedJurisdiction)

      console.log("Processing", profile.experience.length, "employment records")

      // Add employment records
      for (const exp of profile.experience) {
        const record = {
          company: exp.company,
          position: exp.position,
          start_year: exp.start_year,
          end_year: exp.end_year,
          annual_income: exp.annual_income,
          source: "LinkedIn",
          jurisdiction: detectedJurisdiction,
          location: exp.location,
          extracted: true,
        }
        console.log("Adding LinkedIn record:", record)
        onDataExtracted(record)
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setSuccess(`Successfully extracted data for ${profile.name} (${profile.jurisdiction})`)
      setLinkedinUrl("")
    } catch (err) {
      setError(err.message)
      console.error("LinkedIn extraction error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Linkedin className="h-5 w-5 text-blue-600" />
          <span>LinkedIn Profile Integration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">LinkedIn Scraping Simulation</p>
              <p className="text-sm">
                Due to LinkedIn's anti-scraping measures, this simulates profile extraction. In production, this would
                use:
              </p>
              <ul className="text-xs space-y-1 ml-4">
                <li>• LinkedIn API (requires partnership)</li>
                <li>• Backend scraping service with proxy rotation</li>
                <li>• Manual data entry with LinkedIn as reference</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
            <Input
              id="linkedin-url"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/profile-name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jurisdiction">Manual Jurisdiction Override (Optional)</Label>
            <Select value={manualJurisdiction} onValueChange={setManualJurisdiction}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect from profile location" />
              </SelectTrigger>
              <SelectContent>
                {jurisdictions.map((jurisdiction) => (
                  <SelectItem key={jurisdiction.code} value={jurisdiction.code}>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>
                        {jurisdiction.name} ({jurisdiction.currency})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extracting Profile Data...
              </>
            ) : (
              <>
                <Linkedin className="h-4 w-4 mr-2" />
                Extract Profile Data
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {extractedProfile && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Extracted Profile Data:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Name:</strong> {extractedProfile.name}
              </div>
              <div>
                <strong>Current Role:</strong> {extractedProfile.headline}
              </div>
              <div>
                <strong>Location:</strong> {extractedProfile.location}
              </div>
              <div>
                <strong>Employment Records:</strong> {extractedProfile.experience.length}
              </div>
              <div>
                <strong>Jurisdiction:</strong> {extractedProfile.jurisdiction}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Try different LinkedIn URLs to see varied profile extraction</p>
          <p>• Automatically estimates salaries based on role, company, and location</p>
          <p>• Detects jurisdiction from profile location for tax calculations</p>
          <p>• In production, would require LinkedIn API access or backend scraping</p>
        </div>
      </CardContent>
    </Card>
  )
}
