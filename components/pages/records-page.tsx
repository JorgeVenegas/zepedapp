"use client"

import { useState } from "react"
import { RecordsTable } from "@/components/records/records-table"
import { RecordsFilters } from "@/components/records/records-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, Save, FileText, CheckCircle2, ArrowRight, Clock, DollarSign, Target, Calendar, Info, ChevronDown, ChevronUp } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { generateSolutionsAPI } from '@/lib/api/solutionsAPI'
import type { Solution } from '@/lib/types/solution'

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
  const [patternSolutions, setPatternSolutions] = useState<Record<string, Solution[]>>({})
  
  // Solutions drawer state
  const [isSolutionsDrawerOpen, setIsSolutionsDrawerOpen] = useState(false)
  const [selectedPatternForSolutions, setSelectedPatternForSolutions] = useState<Pattern | null>(null)
  const [currentSolutions, setCurrentSolutions] = useState<Solution[]>([])
  const [expandedJustifications, setExpandedJustifications] = useState<Set<string>>(new Set())

  // Helper function to safely calculate days between dates
  const calculateDays = (start: Date | string, end: Date | string): number => {
    try {
      const startDate = typeof start === 'string' ? new Date(start) : start
      const endDate = typeof end === 'string' ? new Date(end) : end
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    } catch (error) {
      console.error('Error calculating days:', error)
      return 0
    }
  }

  // Helper function to safely format dates
  const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString('en-US', options)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'N/A'
    }
  }

  // Helper function to toggle justification expansion
  const toggleJustification = (solutionIndex: number, type: string) => {
    const key = `solution-${solutionIndex}-${type}`;
    setExpandedJustifications(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Helper function to get feasibility label
  const getFeasibilityLabel = (feasibility: number): string => {
    if (feasibility >= 8) return 'Highly Feasible';
    if (feasibility >= 6) return 'Moderately Feasible';
    return 'Challenging Implementation';
  };

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
      
      console.log('🚀 Generating AI solutions for pattern:', pattern.title)
      
      // Convert pattern to the format expected by the API
      const patternForAPI = {
        id: savedPatternId,
        title: pattern.title,
        description: pattern.description,
        priority: pattern.priority,
        frequency: pattern.frequency,
        time_range: pattern.time_range || {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        },
        filters: pattern.filters
      }
      
      // Generate solutions using Groq AI
      const solutions = await generateSolutionsAPI(patternForAPI, {
        maxSolutions: 5,
        feasibilityThreshold: 3,
        prioritizeBy: 'feasibility'
      })
      
      console.log('✅ Generated solutions:', solutions)
      
      // Store solutions for this pattern
      setPatternSolutions(prev => ({
        ...prev,
        [patternId]: solutions
      }))
      
      // Open solutions drawer with the generated solutions
      setSelectedPatternForSolutions(pattern)
      setCurrentSolutions(solutions)
      setExpandedJustifications(new Set()) // Clear previous expanded states
      setIsSolutionsDrawerOpen(true)
      
    } catch (error) {
      console.error('❌ Error creating solution:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to generate solutions: ${errorMessage}\n\nPlease check your internet connection and try again.`)
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

                      {/* Solution Status Indicator */}
                      {patternSolutions[patternId || ''] && patternSolutions[patternId || ''].length > 0 && (
                        <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {patternSolutions[patternId || ''].length} solution{patternSolutions[patternId || ''].length !== 1 ? 's' : ''} generated
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPatternForSolutions(pattern)
                                setCurrentSolutions(patternSolutions[patternId || ''])
                                setExpandedJustifications(new Set()) // Clear previous expanded states
                                setIsSolutionsDrawerOpen(true)
                              }}
                              className="text-green-700 border-green-300 hover:bg-green-100"
                            >
                              View Solutions
                              <ArrowRight className="ml-1 w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Solutions Drawer */}
      <Sheet open={isSolutionsDrawerOpen} onOpenChange={setIsSolutionsDrawerOpen}>
        <SheetContent className="w-[1200px] sm:max-w-[1200px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-green-600" />
              AI-Generated Solutions
            </SheetTitle>
            <SheetDescription className="text-base">
              {selectedPatternForSolutions && (
                <>
                  Solutions for: <span className="font-semibold text-slate-700">"{selectedPatternForSolutions.title}"</span>
                  <br />
                  {currentSolutions.length} solution{currentSolutions.length !== 1 ? 's' : ''} generated with cost estimates and implementation timelines
                </>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {currentSolutions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">No solutions available</p>
                <p className="text-sm">Generate solutions for a pattern to see them here</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {currentSolutions.map((solution, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                  >
                    {/* Solution Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-slate-800">{solution.name}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Solution Description */}
                    <div className="mb-6">
                      <p className="text-slate-600 leading-relaxed text-base">
                        {solution.description}
                      </p>
                    </div>

                    {/* Solution Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Cost Card */}
                      <div 
                        className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm space-y-2 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                        onClick={() => toggleJustification(index, 'cost')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-800">Investment Required</h4>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            {expandedJustifications.has(`solution-${index}-cost`) ? (
                              <>
                                <span>Hide Details</span>
                                <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>Show Details</span>
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                          ${solution.cost.min.toLocaleString()}K - ${solution.cost.max.toLocaleString()}K
                        </div>
                        <div className="text-sm text-blue-600">
                          Budget Range Estimate
                        </div>
                        
                        {/* Expandable Cost Justification */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedJustifications.has(`solution-${index}-cost`) 
                            ? 'max-h-96 opacity-100 mt-3' 
                            : 'max-h-0 opacity-0 mt-0'
                        }`}>
                          <div className="p-3 bg-blue-50/70 rounded-md border border-blue-200 transform transition-transform duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Info className="h-4 w-4 text-blue-700" />
                              <h5 className="font-semibold text-blue-800">Investment Breakdown</h5>
                            </div>
                            <p className="text-sm text-blue-700 leading-relaxed">
                              {solution.cost.justification || 'Detailed cost justification not available for this solution.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Card */}
                      <div 
                        className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm space-y-2 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all duration-200"
                        onClick={() => toggleJustification(index, 'time')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-800">Implementation Time</h4>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                            {expandedJustifications.has(`solution-${index}-time`) ? (
                              <>
                                <span>Hide Details</span>
                                <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>Show Details</span>
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                          {calculateDays(solution.implementationTime.start, solution.implementationTime.end)} days
                        </div>
                        <div className="text-sm text-purple-600">
                          Estimated Duration
                        </div>
                        
                        {/* Expandable Timeline Justification */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedJustifications.has(`solution-${index}-time`) 
                            ? 'max-h-96 opacity-100 mt-3' 
                            : 'max-h-0 opacity-0 mt-0'
                        }`}>
                          <div className="p-3 bg-purple-50/70 rounded-md border border-purple-200 transform transition-transform duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-purple-700" />
                              <h5 className="font-semibold text-purple-800">Timeline Breakdown</h5>
                            </div>
                            <p className="text-sm text-purple-700 leading-relaxed">
                              {solution.implementationTime.justification || 'Detailed timeline justification not available for this solution.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Feasibility Card */}
                      <div 
                        className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm space-y-2 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200"
                        onClick={() => toggleJustification(index, 'feasibility')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-green-800">Feasibility Score</h4>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            {expandedJustifications.has(`solution-${index}-feasibility`) ? (
                              <>
                                <span>Hide Details</span>
                                <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                <span>Show Details</span>
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {solution.feasibility}/10
                        </div>
                        <div className="text-sm text-green-600">
                          {getFeasibilityLabel(solution.feasibility)}
                        </div>
                        
                        {/* Expandable Feasibility Justification */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedJustifications.has(`solution-${index}-feasibility`) 
                            ? 'max-h-96 opacity-100 mt-3' 
                            : 'max-h-0 opacity-0 mt-0'
                        }`}>
                          <div className="p-3 bg-green-50/70 rounded-md border border-green-200 transform transition-transform duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-green-700" />
                              <h5 className="font-semibold text-green-800">Feasibility Analysis</h5>
                            </div>
                            <p className="text-sm text-green-700 leading-relaxed">
                              {solution.feasibilityJustification || 'Detailed feasibility analysis not available for this solution.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-300 hover:bg-slate-50"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Solution
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
