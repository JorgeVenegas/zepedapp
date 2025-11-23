"use client"

import { useState } from "react"
import { RecordsTable } from "@/components/records/records-table"
import { RecordsFilters } from "@/components/records/records-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, Save, FileText, CheckCircle2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface Pattern {
  id?: string
  tempId?: string
  title: string
  description: string
  priority: number
  frequency: number
  filters: any
  time_range?: {
    start: string
    end: string
  }
  incident_ids?: string[]
  isTemporary?: boolean
}

export function RecordsPage() {
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [isCreatingPatterns, setIsCreatingPatterns] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [createdPatterns, setCreatedPatterns] = useState<Pattern[]>([])
  const [savingPatternIds, setSavingPatternIds] = useState<Set<string>>(new Set())
  const [creatingSolutionIds, setCreatingSolutionIds] = useState<Set<string>>(new Set())

  const handleExplorePatterns = async () => {
    setIsCreatingPatterns(true)
    try {
      // First, fetch all incident IDs based on current filters
      const params = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, values]) => {
          if (values.length > 0) {
            params.append(key, values.join(','))
          }
        })
      }
      
      // Set a large page size to get all matching incidents
      params.append('pageSize', '10000')
      params.append('page', '1')
      
      const recordsResponse = await fetch(`/api/records?${params}`)
      const recordsResult = await recordsResponse.json()
      
      if (!recordsResult.success || !recordsResult.data?.length) {
        alert('No records found with the current filters')
        return
      }
      
      // Extract incident IDs
      const incidentIds = recordsResult.data.map((incident: any) => incident.id)
      
      // Call the clustering API without saving
      const clusterResponse = await fetch('/api/patterns/cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident_ids: incidentIds,
          preview: true, // Flag to indicate we want preview only
        }),
      })
      
      const clusterResult = await clusterResponse.json()
      
      if (clusterResult.success && clusterResult.patterns) {
        // Mark patterns as temporary (not yet saved) and sort by frequency descending
        const tempPatterns = clusterResult.patterns
          .map((p: any, idx: number) => ({
            ...p,
            tempId: `temp-${idx}`,
            isTemporary: true,
          }))
          .sort((a: Pattern, b: Pattern) => b.frequency - a.frequency)
        setCreatedPatterns(tempPatterns)
        setIsDrawerOpen(true)
      } else {
        alert(`Failed to create patterns: ${clusterResult.error}`)
      }
    } catch (error) {
      console.error('Error creating patterns:', error)
      alert('An error occurred while creating patterns')
    } finally {
      setIsCreatingPatterns(false)
    }
  }

  const handleSavePattern = async (pattern: Pattern, silent = false) => {
    const patternId = pattern.id || pattern.tempId
    if (!patternId) return null
    
    // If already saved, return the existing ID
    if (pattern.id && !pattern.isTemporary) {
      return pattern.id
    }
    
    setSavingPatternIds(prev => new Set(prev).add(patternId))
    
    try {
      const payload = {
        title: pattern.title,
        description: pattern.description,
        filters: pattern.filters,
        priority: pattern.priority,
        frequency: pattern.frequency,
        time_range_start: pattern.time_range?.start,
        time_range_end: pattern.time_range?.end,
        incident_ids: pattern.incident_ids,
      }
      
      console.log('Attempting to save pattern:', {
        patternId,
        payload,
      })
      
      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      console.log('Save pattern response status:', response.status)
      
      const result = await response.json()
      
      console.log('Save pattern result:', result)
      
      if (result.success) {
        // Update the pattern to mark it as saved
        setCreatedPatterns(prev =>
          prev.map(p =>
            (p.id || p.tempId) === patternId
              ? { ...p, id: result.pattern.id, isTemporary: false }
              : p
          )
        )
        if (!silent) {
          alert('Pattern saved successfully!')
        }
        return result.pattern.id
      } else {
        console.error('Failed to save pattern:', {
          error: result.error,
          details: result.details,
          payload,
        })
        if (!silent) {
          alert(`Failed to save pattern: ${result.error}${result.details ? '\nDetails: ' + result.details : ''}`)
        }
        return null
      }
    } catch (error) {
      console.error('Error saving pattern (caught exception):', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        pattern: {
          title: pattern.title,
          priority: pattern.priority,
          frequency: pattern.frequency,
        },
      })
      if (!silent) {
        alert('An error occurred while saving the pattern: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
      return null
    } finally {
      setSavingPatternIds(prev => {
        const next = new Set(prev)
        next.delete(patternId)
        return next
      })
    }
  }

  const handleCreateSolution = async (pattern: Pattern) => {
    const patternId = pattern.id || pattern.tempId
    if (!patternId) return
    
    setCreatingSolutionIds(prev => new Set(prev).add(patternId))
    
    try {
      // First, ensure the pattern is saved
      const savedPatternId = await handleSavePattern(pattern, true)
      
      if (!savedPatternId) {
        alert('Failed to save pattern before creating solution')
        return
      }
      
      // TODO: Implement solution creation API call
      // const response = await fetch('/api/solutions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ pattern_id: savedPatternId })
      // })
      
      console.log('Create solution for pattern:', savedPatternId)
      alert('Solution creation feature coming soon!')
      
    } catch (error) {
      console.error('Error creating solution:', error)
      alert('An error occurred while creating the solution')
    } finally {
      setCreatingSolutionIds(prev => {
        const next = new Set(prev)
        next.delete(patternId)
        return next
      })
    }
  }

  return (
    <>
      <div className="p-6 space-y-4 h-full flex flex-col bg-gradient-to-br from-slate-50/50 via-white to-slate-100/30 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <RecordsFilters onFiltersChange={setFilters} />
          <Button 
            onClick={handleExplorePatterns}
            disabled={isCreatingPatterns}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            {isCreatingPatterns ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Patterns...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Explore Patterns
              </>
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <RecordsTable filters={filters} />
        </div>
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[1000px] sm:max-w-[1000px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Discovered Patterns</SheetTitle>
            <SheetDescription className="text-base">
              {createdPatterns.length} {createdPatterns.length === 1 ? 'pattern' : 'patterns'} identified, sorted by frequency
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {createdPatterns.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No patterns created yet
              </div>
            ) : (
              <div className="space-y-4">
                {createdPatterns.map((pattern, index) => {
                  const patternId = pattern.id || pattern.tempId
                  const isSaving = savingPatternIds.has(patternId || '')
                  const isCreatingSolution = creatingSolutionIds.has(patternId || '')
                  const isSaved = !pattern.isTemporary

                  return (
                    <div
                      key={patternId}
                      className="border-2 rounded-xl p-5 space-y-4 bg-gradient-to-br from-white to-slate-50 shadow-md hover:shadow-xl transition-all duration-200 hover:border-purple-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-xl text-slate-800">{pattern.title}</h3>
                              {isSaved && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Saved
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {pattern.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-slate-100">
                        <div className="text-center">
                          <div className="text-xs font-medium text-slate-500 mb-1">Priority</div>
                          <Badge 
                            variant={pattern.priority > 7 ? "destructive" : "default"}
                            className="text-base font-bold px-3 py-1"
                          >
                            {pattern.priority}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-slate-500 mb-1">Frequency</div>
                          <div className="text-lg font-bold text-blue-600">{pattern.frequency}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-slate-500 mb-1">Incidents</div>
                          <div className="text-lg font-bold text-slate-700">{pattern.incident_ids?.length || 0}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-slate-500 mb-1">Time Range</div>
                          <div className="text-xs font-semibold text-slate-600">
                            {pattern.time_range ? (
                              <>
                                {new Date(pattern.time_range.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' - '}
                                {new Date(pattern.time_range.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </>
                            ) : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleSavePattern(pattern, false)}
                          disabled={isSaving || isSaved || isCreatingSolution}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-slate-300 hover:bg-slate-50"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : isSaved ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Pattern
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleCreateSolution(pattern)}
                          disabled={isCreatingSolution}
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg border-0"
                        >
                          {isCreatingSolution ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2 h-4 w-4" />
                              Create Solution
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
