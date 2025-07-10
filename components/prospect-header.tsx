"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Briefcase, Calendar } from "lucide-react"

interface ProspectHeaderProps {
  name?: string
  currentRole?: string
  location?: string
  jurisdiction?: string
  totalRecords?: number
  careerSpan?: string
}

export default function ProspectHeader({
  name,
  currentRole,
  location,
  jurisdiction,
  totalRecords = 0,
  careerSpan,
}: ProspectHeaderProps) {
  if (!name) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-gray-500">
            <User className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-semibold">Prospect Profile</h2>
              <p className="text-sm">Upload a resume or LinkedIn profile to get started</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{name}</h2>
              {jurisdiction && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{jurisdiction}</span>
                </Badge>
              )}
            </div>

            {currentRole && (
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{currentRole}</span>
              </div>
            )}

            {location && (
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{location}</span>
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {totalRecords > 0 && (
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-3 w-3" />
                  <span>
                    {totalRecords} employment record{totalRecords !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {careerSpan && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{careerSpan}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
