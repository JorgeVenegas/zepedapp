"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TrendingUp, AlertCircle, Clock, Activity, Sparkles, Loader2, Zap, Save, Plus } from "lucide-react"
import { mockPatterns } from "@/lib/mockPatterns"

interface RecordsPatternsProps {
  filters?: Record<string, string[]>
  dateRange?: string
}

interface Pattern {
  id?: string
  title: string
  description: string
  priority: number
  frequency: number
  filters: any
  incident_ids?: string[]
  incidentIds?: string[]
}

const getPriorityConfig = (priority: number) => {
  if (priority === 1) return {
    bg: "bg-gradient-to-br from-red-50 to-rose-50",
    border: "border-red-200/60",
    badge: "bg-red-100 text-red-700 border-red-300",
    icon: "text-red-500",
    glow: "group-hover:shadow-red-500/20"
  }
  if (priority === 2) return {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    border: "border-orange-200/60",
    badge: "bg-orange-100 text-orange-700 border-orange-300",
    icon: "text-orange-500",
    glow: "group-hover:shadow-orange-500/20"
  }
  return {
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
    border: "border-yellow-200/60",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: "text-yellow-600",
    glow: "group-hover:shadow-yellow-500/20"
  }
}

export function RecordsPatterns({ filters, dateRange }: RecordsPatternsProps) {
  const [patterns, setPatterns] = useState<Pattern[]>(mockPatterns)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(true) // Already "generated" with mock data
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingSolution, setIsCreatingSolution] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [solutionMessage, setSolutionMessage] = useState<string | null>(null)

  const handlePatternClick = (pattern: Pattern) => {
    setSelectedPattern(pattern)
    setIsDrawerOpen(true)
    setSaveMessage(null)
    setSolutionMessage(null)
  }

  const handleSavePattern = async () => {
    if (!selectedPattern) return
    
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPattern)
      })
      
      if (response.ok) {
        setSaveMessage('Pattern saved successfully!')
      } else {
        setSaveMessage('Failed to save pattern')
      }
    } catch (error) {
      console.error('Error saving pattern:', error)
      setSaveMessage('Error saving pattern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateSolution = async () => {
    if (!selectedPattern) return
    
    setIsCreatingSolution(true)
    setSolutionMessage(null)
    
    try {
      const response = await fetch('/api/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: selectedPattern,
          title: `Solution for: ${selectedPattern.title}`,
          description: selectedPattern.description
        })
      })
      
      if (response.ok) {
        setSolutionMessage('Solution created successfully!')
      } else {
        setSolutionMessage('Failed to create solution')
      }
    } catch (error) {
      console.error('Error creating solution:', error)
      setSolutionMessage('Error creating solution')
    } finally {
      setIsCreatingSolution(false)
    }
  }

  const generatePatterns = async () => {
    // Using mock data instead of API call
    console.log('📊 Loading mock patterns...')
    setPatterns(mockPatterns)
    setHasGenerated(true)
  }

  // No auto-generation needed since we're using mock data
  // Just show the patterns immediately

  // Removed loading state since we're using mock data

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-rose-500/20 to-red-500/20 blur-3xl"></div>
            <div className="relative bg-white rounded-full p-6 shadow-2xl inline-block">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-800">Error Generating Patterns</h3>
            <p className="text-sm text-slate-600">{error}</p>
            <Button
              onClick={generatePatterns}
              className="mt-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (patterns.length === 0 && hasGenerated) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 via-gray-200/50 to-slate-200/50 blur-3xl"></div>
            <div className="relative bg-white rounded-full p-6 shadow-2xl inline-block">
              <Sparkles className="w-12 h-12 text-slate-400" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-800">No Patterns Found</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Try adjusting your filters or date range to see detected patterns
            </p>
            <Button
              onClick={generatePatterns}
              variant="outline"
              className="mt-4 border-2 border-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-red-50 hover:border-red-400"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate Patterns
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-white via-slate-50/50 to-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              Detected Patterns
            </h3>
            <p className="text-xs text-slate-500">AI-identified recurring issues and anomalies</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={generatePatterns}
              disabled={isGenerating}
              size="sm"
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 bg-gradient-to-br from-red-50 to-rose-50 px-4 py-2 rounded-lg border border-red-200/60">
              <span className="text-xs font-medium text-slate-600">Total patterns:</span>
              <Badge className="bg-red-600 text-white hover:bg-red-700 font-bold text-sm px-2 py-1">
                {patterns.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {patterns.map((pattern, idx) => {
            const config = getPriorityConfig(pattern.priority)

            return (
              <div
                key={pattern.id || `pattern-${idx}`}
                onClick={() => handlePatternClick(pattern)}
                className={`group relative rounded-2xl ${config.bg} border ${config.border} p-5 hover:shadow-2xl ${config.glow} transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
              >
                {/* Priority Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 text-xs font-bold rounded-full border ${config.badge} shadow-sm`}>
                    P{pattern.priority}
                  </div>
                </div>

                {/* Frequency Indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className={`absolute inset-0 ${config.icon.replace('text-', 'bg-')}/20 blur-xl rounded-full`}></div>
                    <div className="relative bg-white rounded-full p-3 shadow-lg">
                      <Activity className={`w-5 h-5 ${config.icon}`} />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-800">
                      {pattern.frequency}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">occurrences</div>
                  </div>
                </div>

                {/* Pattern Info */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-800 leading-tight line-clamp-2">
                    {pattern.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {pattern.description}
                  </p>

                  {/* Related Incidents */}
                  {pattern.incident_ids && pattern.incident_ids.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                      <AlertCircle className={`w-4 h-4 ${config.icon}`} />
                      <span className="text-xs font-semibold text-slate-700">
                        {pattern.incident_ids.length} related incident{pattern.incident_ids.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200/60 bg-gradient-to-r from-white via-slate-50/50 to-white">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-red-500" />
          <p className="text-xs text-slate-500 font-medium">
            Patterns are automatically detected using AI clustering and translation for Spanish text
          </p>
        </div>
      </div>

      {/* Pattern Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedPattern && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">{selectedPattern.title}</SheetTitle>
                <SheetDescription className="text-base">
                  Pattern details and related incidents
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Priority Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600">Priority:</span>
                  <Badge 
                    className={
                      selectedPattern.priority === 1 
                        ? "bg-red-100 text-red-700 border-red-300" 
                        : selectedPattern.priority === 2 
                        ? "bg-orange-100 text-orange-700 border-orange-300" 
                        : "bg-yellow-100 text-yellow-700 border-yellow-300"
                    }
                  >
                    P{selectedPattern.priority}
                  </Badge>
                  <span className="text-sm font-medium text-slate-600 ml-4">Frequency:</span>
                  <Badge className="bg-slate-100 text-slate-700">
                    {selectedPattern.frequency} occurrences
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedPattern.description}
                  </p>
                </div>

                {/* Filters */}
                {selectedPattern.filters && Object.keys(selectedPattern.filters).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Applied Filters</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedPattern.filters).map(([key, values]) => (
                        <div key={key} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="text-xs font-semibold text-slate-700 mb-2 capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(values) ? (
                              values.map((value, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-white text-slate-700 border border-slate-300">
                                  {value}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="bg-white text-slate-700 border border-slate-300">
                                {String(values)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Incidents Table */}
                {(selectedPattern.incident_ids || selectedPattern.incidentIds) && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Related Incidents ({(selectedPattern.incident_ids || selectedPattern.incidentIds || []).length})
                    </h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">#</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700">Incident ID</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(selectedPattern.incident_ids || selectedPattern.incidentIds || []).map((id, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-2 text-xs text-slate-500">{idx + 1}</td>
                                <td className="px-4 py-2 text-xs font-mono text-slate-700">{id}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={handleCreateSolution}
                    disabled={isCreatingSolution}
                    className="flex-[2] bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    {isCreatingSolution ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Solution
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleSavePattern} 
                    disabled={isSaving}
                    variant="outline"
                    className="flex-1 border-slate-300 hover:bg-slate-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>

                {/* Status Messages */}
                {saveMessage && (
                  <div className={`text-sm p-3 rounded-lg ${
                    saveMessage.includes('success') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {saveMessage}
                  </div>
                )}
                {solutionMessage && (
                  <div className={`text-sm p-3 rounded-lg ${
                    solutionMessage.includes('success') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {solutionMessage}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
