"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onRecordsExtracted: (record: any) => void
  onNameExtracted?: (name: string) => void
}

export default function FileUpload({ onRecordsExtracted, onNameExtracted }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [extractedText, setExtractedText] = useState<string>("")

  const parseDocumentContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const content = e.target?.result

          // Check if it's a PDF file
          if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
            try {
              // Use PDF.js to extract text from PDF
              const pdfText = await extractTextFromPDF(content as ArrayBuffer)
              if (pdfText.length > 50) {
                console.log("Extracted PDF text preview:", pdfText.substring(0, 300) + "...")
                resolve(pdfText)
                return
              }
            } catch (pdfError) {
              console.error("PDF parsing failed:", pdfError)
              reject(new Error(`Failed to parse PDF: ${pdfError.message}`))
              return
            }
          } else {
            // For text files, read as text
            console.log("Reading text file content, length:", (content as string).length)
            resolve(content as string)
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))

      // Read PDF files as ArrayBuffer, text files as text
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        reader.readAsArrayBuffer(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  // PDF text extraction using PDF.js library
  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // Dynamically import PDF.js (ES-module build)
    const pdfjsLib = await import("pdfjs-dist")

    /**
     * The preview runtime blocks web-worker downloads.
     * We therefore disable the worker and let PDF.js run on the main thread.
     */
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      disableWorker: true, // <-- run without worker to avoid CORS / CDN issues
    }).promise

    console.log(`PDF loaded with ${pdf.numPages} pages (worker disabled)`)

    let fullText = ""

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()

      if (pageText) fullText += pageText + "\n"
    }

    console.log(`Extracted ${fullText.length} characters from PDF`)
    return fullText.trim()
  }

  const extractPersonName = (content: string): string => {
    const lines = content
      .split(/[\n\r]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    console.log("Looking for name in first 10 lines:", lines.slice(0, 10))

    // Common name patterns
    const namePatterns = [
      // Full name at start of line
      /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)$/,
      // Name followed by title/role
      /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*[-|,]/,
      // Name in contact section
      /(?:Name|Contact):\s*([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    ]

    // Check first 15 lines for name patterns
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i]

      // Skip common header words
      if (
        line.toLowerCase().includes("resume") ||
        line.toLowerCase().includes("curriculum") ||
        line.toLowerCase().includes("contact") ||
        line.toLowerCase().includes("email") ||
        line.toLowerCase().includes("phone") ||
        line.toLowerCase().includes("address")
      ) {
        continue
      }

      for (const pattern of namePatterns) {
        const match = line.match(pattern)
        if (match) {
          const name = match[1].trim()
          console.log("Found name:", name)
          return name
        }
      }

      // Simple check for likely names (2-3 words, proper case)
      if (
        /^[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?$/.test(line) &&
        !line.includes("University") &&
        !line.includes("Institute") &&
        !line.includes("Company") &&
        !line.includes("Corporation")
      ) {
        console.log("Found likely name:", line)
        return line.trim()
      }
    }

    return ""
  }

  const extractCompanies = (content: string): string[] => {
    const companies = []
    const lines = content.toLowerCase()

    // Common company patterns
    const companyPatterns = [
      { pattern: /google|alphabet/g, name: "Google" },
      { pattern: /microsoft/g, name: "Microsoft" },
      { pattern: /apple/g, name: "Apple" },
      { pattern: /amazon/g, name: "Amazon" },
      { pattern: /meta|facebook/g, name: "Meta" },
      { pattern: /goldman\s*sachs/g, name: "Goldman Sachs" },
      { pattern: /morgan\s*stanley/g, name: "Morgan Stanley" },
      { pattern: /jp\s*morgan|jpmorgan/g, name: "JPMorgan Chase" },
      { pattern: /bank\s*of\s*america/g, name: "Bank of America" },
      { pattern: /citigroup|citibank/g, name: "Citigroup" },
      { pattern: /mckinsey/g, name: "McKinsey & Company" },
      { pattern: /boston\s*consulting/g, name: "Boston Consulting Group" },
      { pattern: /bain/g, name: "Bain & Company" },
      { pattern: /deloitte/g, name: "Deloitte" },
      { pattern: /pwc|pricewaterhousecoopers/g, name: "PwC" },
      { pattern: /ernst\s*young|ey/g, name: "Ernst & Young" },
      { pattern: /kpmg/g, name: "KPMG" },
      { pattern: /mit|massachusetts\s*institute/g, name: "Massachusetts Institute of Technology" },
      { pattern: /harvard/g, name: "Harvard University" },
      { pattern: /stanford/g, name: "Stanford University" },
      { pattern: /yale/g, name: "Yale University" },
      { pattern: /princeton/g, name: "Princeton University" },
      { pattern: /columbia/g, name: "Columbia University" },
      { pattern: /university\s*of\s*california/g, name: "University of California" },
      { pattern: /johns\s*hopkins/g, name: "Johns Hopkins University" },
      { pattern: /dow\s*chemical|dow\s*inc/g, name: "Dow" },
      { pattern: /deep\s*principle/g, name: "Deep Principle" },
    ]

    companyPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(lines)) {
        companies.push(name)
      }
    })

    return [...new Set(companies)] // Remove duplicates
  }

  const extractPositions = (content: string): Array<{ title: string; salaryRange: [number, number] }> => {
    const positions = []
    const lines = content.toLowerCase()

    const positionPatterns = [
      { pattern: /ceo|chief\s*executive/g, title: "Chief Executive Officer", salaryRange: [200000, 500000] },
      { pattern: /cto|chief\s*technology/g, title: "Chief Technology Officer", salaryRange: [180000, 400000] },
      { pattern: /founder/g, title: "Founder", salaryRange: [150000, 300000] },
      { pattern: /managing\s*director/g, title: "Managing Director", salaryRange: [400000, 1200000] },
      { pattern: /vice\s*president|vp/g, title: "Vice President", salaryRange: [180000, 400000] },
      { pattern: /director/g, title: "Director", salaryRange: [120000, 250000] },
      { pattern: /senior\s*manager/g, title: "Senior Manager", salaryRange: [100000, 180000] },
      { pattern: /manager/g, title: "Manager", salaryRange: [80000, 140000] },
      { pattern: /senior\s*software\s*engineer/g, title: "Senior Software Engineer", salaryRange: [130000, 220000] },
      { pattern: /software\s*engineer/g, title: "Software Engineer", salaryRange: [90000, 160000] },
      { pattern: /data\s*scientist/g, title: "Data Scientist", salaryRange: [100000, 180000] },
      { pattern: /research\s*scientist/g, title: "Research Scientist", salaryRange: [90000, 150000] },
      { pattern: /research\s*assistant/g, title: "Research Assistant", salaryRange: [40000, 65000] },
      { pattern: /teaching\s*assistant/g, title: "Teaching Assistant", salaryRange: [25000, 40000] },
      { pattern: /postdoc|post\s*doctoral/g, title: "Postdoctoral Researcher", salaryRange: [45000, 65000] },
      { pattern: /professor/g, title: "Professor", salaryRange: [70000, 150000] },
      { pattern: /consultant/g, title: "Consultant", salaryRange: [80000, 150000] },
      { pattern: /analyst/g, title: "Analyst", salaryRange: [70000, 120000] },
      { pattern: /associate/g, title: "Associate", salaryRange: [90000, 160000] },
      { pattern: /intern/g, title: "Intern", salaryRange: [50000, 80000] },
    ]

    positionPatterns.forEach(({ pattern, title, salaryRange }) => {
      if (pattern.test(lines)) {
        positions.push({ title, salaryRange })
      }
    })

    return positions
  }

  const extractYears = (content: string): Array<{ start: number; end: number | null }> => {
    const yearRanges = []

    // Pattern for year ranges: "2020-2024", "2020 - Present", "Jan 2020 - Dec 2023"
    const yearPatterns = [
      /(\d{4})\s*[-–—]\s*(\d{4})/g,
      /(\d{4})\s*[-–—]\s*(?:present|current|now)/gi,
      /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})\s*[-–—]\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})/gi,
      /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})\s*[-–—]\s*(?:present|current|now)/gi,
    ]

    yearPatterns.forEach((pattern) => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const startYear = Number.parseInt(match[1])
        const endYear = match[2] && !isNaN(Number.parseInt(match[2])) ? Number.parseInt(match[2]) : null

        if (startYear >= 1990 && startYear <= new Date().getFullYear()) {
          yearRanges.push({ start: startYear, end: endYear })
        }
      }
    })

    // If no ranges found, look for individual years
    if (yearRanges.length === 0) {
      const singleYearPattern = /\b(20\d{2})\b/g
      const years = []
      let match
      while ((match = singleYearPattern.exec(content)) !== null) {
        const year = Number.parseInt(match[1])
        if (year >= 2000 && year <= new Date().getFullYear()) {
          years.push(year)
        }
      }

      // Create ranges from consecutive years
      years.sort((a, b) => a - b)
      for (let i = 0; i < years.length; i++) {
        if (i === 0 || years[i] - years[i - 1] > 1) {
          yearRanges.push({ start: years[i], end: years[i] === new Date().getFullYear() ? null : years[i] })
        }
      }
    }

    return yearRanges
  }

  const localFallback = (content: string, fileName: string) => extractEmploymentDataLocal(content, fileName)

  const extractEmploymentDataLocal = async (content: string, fileName: string) => {
    const name = extractPersonName(content)
    const companies = extractCompanies(content)
    const positions = extractPositions(content)
    const years = extractYears(content)

    const records = []

    // Create records based on extracted data
    years.forEach((year) => {
      companies.forEach((company) => {
        positions.forEach((position) => {
          records.push({
            company: company,
            position: position.title,
            start_year: year.start,
            end_year: year.end,
            annual_income: position.salaryRange ? (position.salaryRange[0] + position.salaryRange[1]) / 2 : null,
            source: fileName,
            extracted: false,
            needsReview: true,
            location: null,
            confidence: 0.5,
            reasoning: "Extracted using local heuristics",
          })
        })
      })
    })

    return {
      records: records,
      errors: [],
      analysis: {
        name: name,
        currentRole: null,
        location: null,
        jurisdiction: null,
        summary: null,
        totalExperience: null,
        confidenceScore: 0.5,
      },
    }
  }

  const extractEmploymentData = async (content: string, fileName: string, file: File) => {
    console.log(
      "Analyzing document with Gemini 2.0 Flash:",
      fileName,
      file.type === "application/pdf" ? "(PDF)" : "(Text)",
    )
    setExtractedText(content)

    try {
      const res = await fetch("/api/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, fileName }),
      })

      const data = await res.json()
      console.log("API response:", { status: res.status, data })

      // Only fall back on actual quota exceeded responses
      if (res.status === 429 && data.quotaExceeded) {
        console.warn("Using local fallback parser (Gemini 2.0 Flash quota exceeded).")
        const fallback = await localFallback(content, fileName)
        if (!Array.isArray(fallback.errors)) fallback.errors = []
        fallback.errors.unshift("AI quota exceeded – used local parser.")
        return fallback
      }

      if (!res.ok) {
        // For other errors, show the actual error instead of falling back
        console.error("Gemini 2.0 Flash API error:", data)
        return {
          records: [],
          errors: [`Gemini 2.0 Flash analysis failed: ${data.details || data.error || "Unknown error"}`],
          analysis: null,
        }
      }

      const analysis = data
      console.log("Gemini 2.0 Flash analysis result:", analysis)

      // Extract person name
      if (analysis.name && onNameExtracted) {
        onNameExtracted(analysis.name)
      }

      // Convert employment records to the expected format
      const records =
        analysis.employmentRecords?.map((record) => ({
          company: record.company,
          position: record.position,
          start_year: record.startYear,
          end_year: record.endYear,
          annual_income: record.annualIncome,
          source: fileName,
          extracted: true,
          needsReview: record.confidence < 0.8,
          location: record.location,
          confidence: record.confidence,
          reasoning: record.reasoning,
        })) || []

      const errors = []

      if (analysis.confidenceScore < 0.7) {
        errors.push(
          `AI confidence is ${Math.round(analysis.confidenceScore * 100)}%. Please review extracted data carefully.`,
        )
      }

      if (records.length === 0) {
        errors.push(`No employment records found in ${fileName}. Document may need manual review.`)
      }

      return {
        records,
        errors,
        analysis: {
          name: analysis.name,
          currentRole: analysis.currentRole,
          location: analysis.location,
          jurisdiction: analysis.jurisdiction,
          summary: analysis.summary,
          totalExperience: analysis.totalExperience,
          confidenceScore: analysis.confidenceScore,
        },
      }
    } catch (error) {
      console.error("Gemini 2.0 Flash analysis error:", error)
      return {
        records: [],
        errors: [`Network error during analysis: ${error.message}. Please try again.`],
        analysis: null,
      }
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      setParseErrors([])
      const allErrors = []

      for (const file of acceptedFiles) {
        try {
          console.info(`Processing file with Gemini 2.0 Flash: ${file.name}`)

          // Parse document content
          const content = await parseDocumentContent(file)
          console.log("Extracted content preview:", content.substring(0, 300) + "...")

          // Analyze with Gemini 2.0 Flash AI
          const { records, errors, analysis } = await extractEmploymentData(content, file.name, file)

          if (errors.length > 0) {
            allErrors.push(...errors)
          }

          console.log("AI extracted records:", records)

          // Store full analysis for debugging
          if (analysis) {
            console.log("Full AI analysis:", analysis)
          }

          // Add records one by one
          for (const record of records) {
            console.log("Adding AI-analyzed record:", record)
            onRecordsExtracted(record)
            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          setUploadedFiles((prev) => [
            ...prev,
            `${file.name} (PDF.js + Gemini 2.0 Flash Analysis: ${analysis?.confidenceScore ? Math.round(analysis.confidenceScore * 100) + "%" : "Unknown"})`,
          ])
        } catch (error) {
          console.error("Upload error:", error)
          allErrors.push(`Failed to process ${file.name}: ${error.message}`)
        }
      }

      if (allErrors.length > 0) {
        setParseErrors(allErrors)
      }

      setUploading(false)
    },
    [onRecordsExtracted, onNameExtracted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  })

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-lg font-medium">Analyzing document with Gemini 2.0 Flash...</p>
              <p className="text-sm text-gray-500">Using PDF.js to extract text, then AI analysis</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <p className="text-lg font-medium">{isDragActive ? "Drop files here" : "Upload Resume or CV"}</p>
                <p className="text-sm text-gray-500">PDF, DOC, DOCX, TXT files supported</p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF.js + Gemini 2.0 Flash AI will extract companies, positions, years, and estimate salaries
                </p>
              </div>
              <Button variant="outline">Choose Files</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {parseErrors.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Document parsing notes:</p>
              {parseErrors.map((error, index) => (
                <p key={index} className="text-sm">
                  {error}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Processed Files:</h4>
          {uploadedFiles.map((fileName, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-green-600">
              <FileText className="h-4 w-4" />
              <span>{fileName} - Employment data extracted</span>
            </div>
          ))}
        </div>
      )}

      {extractedText && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            View extracted text (for debugging)
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono max-h-40 overflow-y-auto">
            {extractedText.substring(0, 1000)}...
          </div>
        </details>
      )}
    </div>
  )
}
