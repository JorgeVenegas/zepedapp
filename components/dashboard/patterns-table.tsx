"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import type { Pattern } from "@/lib/types"
import { Save, Lightbulb, Calendar, Filter, AlertCircle } from "lucide-react"

interface PatternsTableProps {
  title: string
  patterns: Pattern[]
  type: "external" | "internal"
}

export function PatternsTable({ title, patterns, type }: PatternsTableProps) {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingSolution, setIsCreatingSolution] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleRowClick = (pattern: Pattern) => {
    console.log('Row clicked:', pattern.id, pattern.title);
    console.log('Pattern data:', pattern);
    setSelectedPattern(pattern)
    setIsDrawerOpen(true)
    setStatusMessage(null)
  }

  const handleSavePattern = async () => {
    if (!selectedPattern) return
    
    setIsSaving(true)
    setStatusMessage(null)
    try {
      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedPattern.title,
          description: selectedPattern.description,
          filters: selectedPattern.filters,
          priority: selectedPattern.priority,
          frequency: selectedPattern.frequency,
          time_range_start: selectedPattern.timeRangeStart,
          time_range_end: selectedPattern.timeRangeEnd,
          incident_ids: selectedPattern.incidentIds
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setStatusMessage({ type: 'success', text: 'Pattern saved successfully!' })
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Failed to save pattern' })
      }
    } catch (error) {
      console.error('Failed to save pattern:', error)
      setStatusMessage({ type: 'error', text: 'Failed to save pattern. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateSolution = async () => {
    if (!selectedPattern) return
    
    setIsCreatingSolution(true)
    setStatusMessage(null)
    try {
      const response = await fetch('/api/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern_id: selectedPattern.id,
          name: `Solution for ${selectedPattern.title}`,
          description: selectedPattern.description
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setStatusMessage({ type: 'success', text: 'Solution created successfully!' })
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Failed to create solution' })
      }
    } catch (error) {
      console.error('Failed to create solution:', error)
      setStatusMessage({ type: 'error', text: 'Failed to create solution. Please try again.' })
    } finally {
      setIsCreatingSolution(false)
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-600 bg-red-50"
    if (priority >= 3) return "text-orange-600 bg-orange-50"
    if (priority >= 2) return "text-yellow-600 bg-yellow-50"
    return "text-blue-600 bg-blue-50"
  }

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return "Critical"
    if (priority >= 3) return "High"
    if (priority >= 2) return "Medium"
    return "Low"
  }

  return (
    <>
      <Card className="bg-white border-red-200">
        <CardHeader className="border-b border-red-100">
          <CardTitle className="text-red-700">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Pattern</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Count</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {patterns.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No patterns found
                    </td>
                  </tr>
                ) : (
                  patterns.map((pattern) => (
                    <tr 
                      key={pattern.id} 
                      className="border-b border-red-50 hover:bg-red-50 transition cursor-pointer"
                      onClick={() => handleRowClick(pattern)}
                    >
                      <td className="py-3 px-4 text-gray-800 font-medium">{pattern.title}</td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                          {pattern.frequency}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600 text-xs">
                        {new Date(pattern.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedPattern ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-gray-900">
                  {selectedPattern.title}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {selectedPattern.description}
                </SheetDescription>
              </SheetHeader>

              {statusMessage && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  statusMessage.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {statusMessage.text}
                </div>
              )}

              <div className="mt-6 space-y-6">
                {/* Priority Badge */}
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Priority:</span>
                  <Badge className={`${getPriorityColor(selectedPattern.priority)} border-none`}>
                    {getPriorityLabel(selectedPattern.priority)} (P{selectedPattern.priority})
                  </Badge>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm text-gray-600">Frequency</div>
                    <div className="text-2xl font-bold text-red-700">{selectedPattern.frequency}</div>
                    <div className="text-xs text-gray-500">incidents</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-600">Affected Records</div>
                    <div className="text-2xl font-bold text-blue-700">{selectedPattern.incidentIds.length}</div>
                    <div className="text-xs text-gray-500">records</div>
                  </div>
                </div>

                {/* Time Range */}
                {(selectedPattern.timeRangeStart || selectedPattern.timeRangeEnd) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Time Range:</span>
                    </div>
                    <div className="pl-7 text-sm text-gray-600">
                      <div>First seen: {selectedPattern.timeRangeStart ? new Date(selectedPattern.timeRangeStart).toLocaleDateString() : 'N/A'}</div>
                      <div>Last seen: {selectedPattern.timeRangeEnd ? new Date(selectedPattern.timeRangeEnd).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                {Object.keys(selectedPattern.filters).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Applied Filters:</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      {Object.entries(selectedPattern.filters).map(([key, value]) => (
                        <div key={key} className="text-sm text-gray-600">
                          <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Incident IDs Preview */}
                {selectedPattern.incidentIds.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Related Incident IDs:</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                      <div className="text-xs text-gray-600 space-y-1">
                        {selectedPattern.incidentIds.slice(0, 10).map((id) => (
                          <div key={id} className="font-mono">{id}</div>
                        ))}
                        {selectedPattern.incidentIds.length > 10 && (
                          <div className="text-gray-500 italic">
                            ... and {selectedPattern.incidentIds.length - 10} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t space-y-1 text-xs text-gray-500">
                  <div>Created: {new Date(selectedPattern.created_at).toLocaleString()}</div>
                  <div>Updated: {new Date(selectedPattern.updated_at).toLocaleString()}</div>
                  <div>Pattern ID: {selectedPattern.id}</div>
                </div>
              </div>

              <SheetFooter className="mt-8 gap-2 sm:gap-0">
                <Button
                  onClick={handleSavePattern}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Pattern'}
                </Button>
                <Button
                  onClick={handleCreateSolution}
                  disabled={isCreatingSolution}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {isCreatingSolution ? 'Creating...' : 'Create Solution'}
                </Button>
              </SheetFooter>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading pattern details...</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
