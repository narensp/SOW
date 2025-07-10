"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Check, X, Building, Calendar, DollarSign, Calculator, TrendingDown, Globe, Brain } from "lucide-react"
import type { EmploymentRecord } from "./dashboard"

interface IncomeTimelineProps {
  records: EmploymentRecord[]
  onUpdateRecord: (id: string, updates: Partial<EmploymentRecord>) => void
  loading: boolean
  jurisdiction?: string
}

interface YearlyFinancials {
  year: number
  grossIncome: number
  incomeTax: number
  socialContributions: number
  deductions: number
  netIncome: number
  companies: string[]
  currency: string
}

export default function IncomeTimeline({ records, onUpdateRecord, loading, jurisdiction = "US" }: IncomeTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<EmploymentRecord>>({})
  const [editingYear, setEditingYear] = useState<number | null>(null)
  const [yearlyEdits, setYearlyEdits] = useState<{ [year: number]: Partial<YearlyFinancials> }>({})

  const getCurrencyInfo = (jurisdiction: string) => {
    const currencies = {
      US: { symbol: "$", code: "USD" },
      UK: { symbol: "£", code: "GBP" },
      CA: { symbol: "C$", code: "CAD" },
      AU: { symbol: "A$", code: "AUD" },
      DE: { symbol: "€", code: "EUR" },
      FR: { symbol: "€", code: "EUR" },
      CH: { symbol: "CHF", code: "CHF" },
      SG: { symbol: "S$", code: "SGD" },
      HK: { symbol: "HK$", code: "HKD" },
      JP: { symbol: "¥", code: "JPY" },
    }
    return currencies[jurisdiction] || currencies.US
  }

  const calculateTaxes = (income: number, year: number, jurisdiction: string) => {
    const currency = getCurrencyInfo(jurisdiction)

    switch (jurisdiction) {
      case "UK":
        return calculateUKTaxes(income, year)
      case "CA":
        return calculateCanadianTaxes(income, year)
      case "AU":
        return calculateAustralianTaxes(income, year)
      case "DE":
        return calculateGermanTaxes(income, year)
      case "FR":
        return calculateFrenchTaxes(income, year)
      case "CH":
        return calculateSwissTaxes(income, year)
      case "SG":
        return calculateSingaporeTaxes(income, year)
      case "HK":
        return calculateHongKongTaxes(income, year)
      case "JP":
        return calculateJapaneseTaxes(income, year)
      default:
        return calculateUSTaxes(income, year)
    }
  }

  const calculateUKTaxes = (income: number, year: number) => {
    // UK tax bands for 2023/24
    let incomeTax = 0
    if (income > 125140)
      incomeTax = income * 0.45 // Additional rate
    else if (income > 50270)
      incomeTax = income * 0.4 // Higher rate
    else if (income > 12570) incomeTax = income * 0.2 // Basic rate

    // National Insurance (Employee)
    const niThreshold = 12570
    const niUpperLimit = 50270
    let nationalInsurance = 0
    if (income > niUpperLimit) {
      nationalInsurance = (niUpperLimit - niThreshold) * 0.12 + (income - niUpperLimit) * 0.02
    } else if (income > niThreshold) {
      nationalInsurance = (income - niThreshold) * 0.12
    }

    const personalAllowance = Math.max(0, 12570 - Math.max(0, (income - 100000) * 0.5))

    return {
      incomeTax: Math.round(incomeTax),
      socialContributions: Math.round(nationalInsurance),
      deductions: Math.round(personalAllowance),
    }
  }

  const calculateCanadianTaxes = (income: number, year: number) => {
    // Federal + Ontario tax rates (simplified)
    let federalTax = 0
    if (income > 221708) federalTax = income * 0.33
    else if (income > 165430) federalTax = income * 0.29
    else if (income > 106717) federalTax = income * 0.26
    else if (income > 53359) federalTax = income * 0.205
    else federalTax = income * 0.15

    // Ontario provincial tax
    let provincialTax = 0
    if (income > 220000) provincialTax = income * 0.1316
    else if (income > 150000) provincialTax = income * 0.1216
    else if (income > 98463) provincialTax = income * 0.1116
    else if (income > 49231) provincialTax = income * 0.0915
    else provincialTax = income * 0.0505

    // CPP and EI
    const cpp = Math.min(income, 66600) * 0.0595
    const ei = Math.min(income, 63300) * 0.0163

    return {
      incomeTax: Math.round(federalTax + provincialTax),
      socialContributions: Math.round(cpp + ei),
      deductions: Math.round(income * 0.1), // Basic personal amount
    }
  }

  const calculateAustralianTaxes = (income: number, year: number) => {
    // Australian tax brackets 2023-24
    let incomeTax = 0
    if (income > 180000) incomeTax = 51667 + (income - 180000) * 0.45
    else if (income > 120000) incomeTax = 29467 + (income - 120000) * 0.37
    else if (income > 45000) incomeTax = 5092 + (income - 45000) * 0.325
    else if (income > 18200) incomeTax = (income - 18200) * 0.19

    // Medicare Levy
    const medicareLevy = income > 23365 ? income * 0.02 : 0

    return {
      incomeTax: Math.round(incomeTax),
      socialContributions: Math.round(medicareLevy),
      deductions: Math.round(income * 0.08), // Standard deductions
    }
  }

  const calculateGermanTaxes = (income: number, year: number) => {
    // German tax (simplified progressive rate)
    let incomeTax = 0
    if (income > 277826) incomeTax = income * 0.45
    else if (income > 62810) incomeTax = income * 0.42
    else if (income > 10908) incomeTax = income * 0.25 // Simplified

    // Social contributions (employee share)
    const socialContributions = income * 0.2 // Pension, health, unemployment, care

    return {
      incomeTax: Math.round(incomeTax),
      socialContributions: Math.round(socialContributions),
      deductions: Math.round(income * 0.12), // Standard deductions
    }
  }

  const calculateFrenchTaxes = (income: number, year: number) => {
    // French tax brackets (simplified)
    let incomeTax = 0
    if (income > 177106) incomeTax = income * 0.45
    else if (income > 78570) incomeTax = income * 0.41
    else if (income > 27478) incomeTax = income * 0.3
    else if (income > 10777) incomeTax = income * 0.11

    // Social contributions
    const socialContributions = income * 0.23 // Employee contributions

    return {
      incomeTax: Math.round(incomeTax),
      socialContributions: Math.round(socialContributions),
      deductions: Math.round(income * 0.1), // Standard allowances
    }
  }

  const calculateSwissTaxes = (income: number, year: number) => {
    // Swiss federal tax (simplified)
    let federalTax = 0
    if (income > 755200) federalTax = income * 0.115
    else if (income > 134600) federalTax = income * 0.08
    else if (income > 31600) federalTax = income * 0.05

    // Social contributions (AHV/IV/EO + ALV)
    const socialContributions = Math.min(income, 148200) * 0.0635

    return {
      incomeTax: Math.round(federalTax),
      socialContributions: Math.round(socialContributions),
      deductions: Math.round(income * 0.08), // Standard deductions
    }
  }

  const calculateSingaporeTaxes = (income: number, year: number) => {
    // Singapore tax brackets
    let incomeTax = 0
    if (income > 1000000) incomeTax = 176950 + (income - 1000000) * 0.24
    else if (income > 320000) incomeTax = 47200 + (income - 320000) * 0.22
    else if (income > 200000) incomeTax = 21200 + (income - 200000) * 0.18
    else if (income > 120000) incomeTax = 7200 + (income - 120000) * 0.15
    else if (income > 80000) incomeTax = 3200 + (income - 80000) * 0.11
    else if (income > 40000) incomeTax = 550 + (income - 40000) * 0.07
    else if (income > 20000) incomeTax = (income - 20000) * 0.0375

    // CPF contributions (employee share)
    const cpf = Math.min(income, 102000) * 0.2

    return {
      incomeTax: Math.round(incomeTax),
      socialContributions: Math.round(cpf),
      deductions: Math.round(income * 0.05), // Personal reliefs
    }
  }

  const calculateHongKongTaxes = (income: number, year: number) => {
    // Hong Kong salaries tax (progressive rates)
    let incomeTax = 0
    if (income > 200000) incomeTax = 30000 + (income - 200000) * 0.17
    else if (income > 150000) incomeTax = 22500 + (income - 150000) * 0.12
    else if (income > 100000) incomeTax = 15000 + (income - 100000) * 0.07
    else if (income > 50000) incomeTax = 7500 + (income - 50000) * 0.06
    else incomeTax = income * 0.02

    // MPF contributions
    const mpf = Math.min(Math.max(income - 7100, 0), 1500000) * 0.05

    return {
      incomeTax: Math.round(Math.min(incomeTax, income * 0.17)), // Standard rate cap
      socialContributions: Math.round(mpf),
      deductions: Math.round(132000), // Basic allowance
    }
  }

  const calculateJapaneseTaxes = (income: number, year: number) => {
    // Japanese income tax (national)
    let nationalTax = 0
    if (income > 40000000) nationalTax = income * 0.45
    else if (income > 18000000) nationalTax = income * 0.4
    else if (income > 9000000) nationalTax = income * 0.33
    else if (income > 6950000) nationalTax = income * 0.23
    else if (income > 3300000) nationalTax = income * 0.2
    else if (income > 1950000) nationalTax = income * 0.1
    else nationalTax = income * 0.05

    // Resident tax (local) - approximately 10%
    const residentTax = income * 0.1

    // Social insurance (employee share)
    const socialInsurance = income * 0.15

    return {
      incomeTax: Math.round(nationalTax + residentTax),
      socialContributions: Math.round(socialInsurance),
      deductions: Math.round(480000), // Basic deduction
    }
  }

  const calculateUSTaxes = (income: number, year: number) => {
    // US Federal tax brackets (simplified for 2023)
    let federalTax = 0
    if (income > 578125) federalTax = income * 0.37
    else if (income > 231250) federalTax = income * 0.35
    else if (income > 182050) federalTax = income * 0.32
    else if (income > 95450) federalTax = income * 0.24
    else if (income > 44725) federalTax = income * 0.22
    else if (income > 11000) federalTax = income * 0.12
    else federalTax = income * 0.1

    // State tax (assuming NY at ~8%)
    const stateTax = income * 0.08

    // Social Security (6.2% up to cap) + Medicare (1.45% + 0.9% additional)
    const ssCap = 160200
    const socialSecurity = Math.min(income, ssCap) * 0.062
    const medicare = income * 0.0145 + (income > 200000 ? (income - 200000) * 0.009 : 0)

    return {
      incomeTax: Math.round(federalTax + stateTax),
      socialContributions: Math.round(socialSecurity + medicare),
      deductions: Math.round(Math.max(13850, income * 0.15)), // Standard or itemized
    }
  }

  const generateYearlyData = (): YearlyFinancials[] => {
    const yearlyIncome: { [year: number]: { income: number; companies: string[] } } = {}

    records.forEach((record) => {
      const endYear = record.end_year || new Date().getFullYear()
      for (let year = record.start_year; year <= endYear; year++) {
        if (!yearlyIncome[year]) {
          yearlyIncome[year] = { income: 0, companies: [] }
        }
        yearlyIncome[year].income += record.annual_income
        if (!yearlyIncome[year].companies.includes(record.company)) {
          yearlyIncome[year].companies.push(record.company)
        }
      }
    })

    const currency = getCurrencyInfo(jurisdiction)

    return Object.entries(yearlyIncome)
      .map(([year, data]) => {
        const yearNum = Number.parseInt(year)
        const grossIncome = yearlyEdits[yearNum]?.grossIncome ?? data.income
        const taxes = calculateTaxes(grossIncome, yearNum, jurisdiction)
        const totalTaxes = taxes.incomeTax + taxes.socialContributions
        const netIncome = grossIncome - totalTaxes + taxes.deductions

        return {
          year: yearNum,
          grossIncome,
          ...taxes,
          netIncome: Math.round(netIncome),
          companies: data.companies,
          currency: currency.code,
        }
      })
      .sort((a, b) => a.year - b.year)
  }

  const startEdit = (record: EmploymentRecord) => {
    setEditingId(record.id)
    setEditValues({
      company: record.company,
      position: record.position,
      start_year: record.start_year,
      end_year: record.end_year,
      annual_income: record.annual_income,
    })
  }

  const saveEdit = () => {
    if (editingId && editValues) {
      onUpdateRecord(editingId, editValues)
      setEditingId(null)
      setEditValues({})
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const startYearEdit = (year: number, data: YearlyFinancials) => {
    setEditingYear(year)
    setYearlyEdits((prev) => ({
      ...prev,
      [year]: {
        grossIncome: data.grossIncome,
        incomeTax: data.incomeTax,
        socialContributions: data.socialContributions,
        deductions: data.deductions,
      },
    }))
  }

  const saveYearEdit = () => {
    setEditingYear(null)
  }

  const cancelYearEdit = () => {
    if (editingYear) {
      setYearlyEdits((prev) => {
        const newEdits = { ...prev }
        delete newEdits[editingYear]
        return newEdits
      })
    }
    setEditingYear(null)
  }

  const yearlyData = generateYearlyData()
  const currency = getCurrencyInfo(jurisdiction)
  const totalNetWealth = yearlyData.reduce((sum, year) => sum + year.netIncome * 0.15, 0) // 15% savings rate

  const getTaxLabels = (jurisdiction: string) => {
    switch (jurisdiction) {
      case "UK":
        return { incomeTax: "Income Tax", socialContributions: "National Insurance" }
      case "CA":
        return { incomeTax: "Income Tax", socialContributions: "CPP/EI" }
      case "AU":
        return { incomeTax: "Income Tax", socialContributions: "Medicare Levy" }
      case "DE":
        return { incomeTax: "Income Tax", socialContributions: "Social Insurance" }
      case "FR":
        return { incomeTax: "Income Tax", socialContributions: "Social Contributions" }
      case "CH":
        return { incomeTax: "Federal Tax", socialContributions: "AHV/ALV" }
      case "SG":
        return { incomeTax: "Income Tax", socialContributions: "CPF" }
      case "HK":
        return { incomeTax: "Salaries Tax", socialContributions: "MPF" }
      case "JP":
        return { incomeTax: "Income Tax", socialContributions: "Social Insurance" }
      default:
        return { incomeTax: "Income Tax", socialContributions: "Social Security/Medicare" }
    }
  }

  const taxLabels = getTaxLabels(jurisdiction)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Employment Records</span>
              {jurisdiction && (
                <Badge variant="outline" className="ml-2">
                  <Globe className="h-3 w-3 mr-1" />
                  {jurisdiction}
                </Badge>
              )}
            </CardTitle>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>AI Enhanced</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No employment records yet</p>
              <p className="text-sm">Upload documents, add LinkedIn profile, or enter records manually</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  {editingId === record.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={editValues.company || ""}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, company: e.target.value }))}
                          placeholder="Company"
                        />
                        <Input
                          value={editValues.position || ""}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, position: e.target.value }))}
                          placeholder="Position"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          type="number"
                          value={editValues.start_year || ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, start_year: Number.parseInt(e.target.value) }))
                          }
                          placeholder="Start Year"
                        />
                        <Input
                          type="number"
                          value={editValues.end_year || ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              end_year: e.target.value ? Number.parseInt(e.target.value) : null,
                            }))
                          }
                          placeholder="End Year"
                        />
                        <Input
                          type="number"
                          value={editValues.annual_income || ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, annual_income: Number.parseInt(e.target.value) }))
                          }
                          placeholder={`Annual Income (${currency.code})`}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveEdit}>
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{record.company}</h3>
                          <Badge variant="secondary">{record.position}</Badge>
                          {record.confidence && (
                            <Badge variant={record.confidence > 0.8 ? "default" : "secondary"} className="text-xs">
                              AI: {Math.round(record.confidence * 100)}%
                            </Badge>
                          )}
                          {record.source && (
                            <Badge variant="outline" className="text-xs">
                              {record.source}
                            </Badge>
                          )}
                        </div>
                        {record.reasoning && (
                          <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                            <strong>AI Reasoning:</strong> {record.reasoning}
                          </div>
                        )}
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {record.start_year} - {record.end_year || "Present"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              {currency.symbol}
                              {record.annual_income.toLocaleString()}/year
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(record)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {yearlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Annual Financial Breakdown ({jurisdiction})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {yearlyData.map((data) => (
                <div key={data.year} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{data.year}</h3>
                      <Badge variant="outline">{data.companies.join(", ")}</Badge>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => startYearEdit(data.year, data)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {editingYear === data.year ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Gross Income</label>
                          <Input
                            type="number"
                            value={yearlyEdits[data.year]?.grossIncome || data.grossIncome}
                            onChange={(e) =>
                              setYearlyEdits((prev) => ({
                                ...prev,
                                [data.year]: {
                                  ...prev[data.year],
                                  grossIncome: Number.parseInt(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">{taxLabels.incomeTax}</label>
                          <Input
                            type="number"
                            value={yearlyEdits[data.year]?.incomeTax || data.incomeTax}
                            onChange={(e) =>
                              setYearlyEdits((prev) => ({
                                ...prev,
                                [data.year]: {
                                  ...prev[data.year],
                                  incomeTax: Number.parseInt(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">{taxLabels.socialContributions}</label>
                          <Input
                            type="number"
                            value={yearlyEdits[data.year]?.socialContributions || data.socialContributions}
                            onChange={(e) =>
                              setYearlyEdits((prev) => ({
                                ...prev,
                                [data.year]: {
                                  ...prev[data.year],
                                  socialContributions: Number.parseInt(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Deductions</label>
                          <Input
                            type="number"
                            value={yearlyEdits[data.year]?.deductions || data.deductions}
                            onChange={(e) =>
                              setYearlyEdits((prev) => ({
                                ...prev,
                                [data.year]: {
                                  ...prev[data.year],
                                  deductions: Number.parseInt(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={saveYearEdit}>
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelYearEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-600">Gross Income</p>
                        <p className="font-semibold text-green-600">
                          {currency.symbol}
                          {data.grossIncome.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">{taxLabels.incomeTax}</p>
                        <p className="font-semibold text-red-600">
                          -{currency.symbol}
                          {data.incomeTax.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">{taxLabels.socialContributions}</p>
                        <p className="font-semibold text-red-600">
                          -{currency.symbol}
                          {data.socialContributions.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">Deductions</p>
                        <p className="font-semibold text-blue-600">
                          +{currency.symbol}
                          {data.deductions.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">Net Income</p>
                        <p className="font-bold text-green-700">
                          {currency.symbol}
                          {data.netIncome.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Estimated Wealth Accumulation</h4>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                Based on 15% savings rate from net income across all years ({currency.code})
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {currency.symbol}
                {totalNetWealth.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
