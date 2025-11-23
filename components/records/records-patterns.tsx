"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TrendingUp, AlertCircle, Clock, Activity, Sparkles, Loader2, Zap, Save, Plus, BookmarkPlus, FileText, Check } from "lucide-react"

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
  timeRangeStart?: string
  timeRangeEnd?: string
  time_range?: {
    start: string
    end: string
  }
}

interface Incident {
  id: string
  time: string
  service: string
  source: string
  subservice: string
  priority: number
  category: string
  sentiment_analysis: number
  summary: string
  original?: string
  keywords: string[]
  created_at: string
  updated_at: string
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
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingSolution, setIsCreatingSolution] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [solutionMessage, setSolutionMessage] = useState<string | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loadingIncidents, setLoadingIncidents] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [aiThought, setAiThought] = useState("")
  const [showAiAnalysis, setShowAiAnalysis] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const animationRef = useRef<{ cancelled: boolean; words: string[] }>({ cancelled: false, words: [] })
  const [isPatternSaved, setIsPatternSaved] = useState(false)
  const [checkingSaved, setCheckingSaved] = useState(false)
  const [lastGeneratedFilters, setLastGeneratedFilters] = useState<Record<string, string[]> | undefined>(undefined)
  const [lastGeneratedDateRange, setLastGeneratedDateRange] = useState<string | undefined>(undefined)
  const [solutions, setSolutions] = useState<any[]>([])
  const [loadingSolutions, setLoadingSolutions] = useState(false)
  const [typingStates, setTypingStates] = useState<{[key: number]: {words: string[], currentIndex: number}}>({})
  const [typingComplete, setTypingComplete] = useState<{[key: number]: boolean}>({})
  const [solutionIds, setSolutionIds] = useState<{[key: number]: string | null}>({})
  const [savingSolution, setSavingSolution] = useState<{[key: number]: boolean}>({})
  const [selectedSolutionDetail, setSelectedSolutionDetail] = useState<any | null>(null)

  // Check if current filters differ from last generated filters
  const filtersHaveChanged = () => {
    if (!lastGeneratedFilters && !lastGeneratedDateRange) return true
    
    // Compare filters
    const currentFiltersStr = JSON.stringify(filters || {})
    const lastFiltersStr = JSON.stringify(lastGeneratedFilters || {})
    if (currentFiltersStr !== lastFiltersStr) return true
    
    // Compare date range
    if (dateRange !== lastGeneratedDateRange) return true
    
    return false
  }

  // Fetch patterns on mount and when hasGenerated changes
  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch('/api/patterns')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.patterns) {
            // Sort by frequency descending
            const sortedPatterns = [...result.patterns].sort((a, b) => b.frequency - a.frequency)
            setPatterns(sortedPatterns)
            if (result.patterns.length > 0) {
              setHasGenerated(true)
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch patterns:', err)
      }
    }
    fetchPatterns()
  }, [hasGenerated])

  const simulateAiThinking = async (pattern: Pattern) => {
    animationRef.current.cancelled = false
    setShowAiAnalysis(true)
    setIsAiThinking(true)
    setCurrentWordIndex(0)
    
    // Loading phase with cancellation check - 3 seconds total
    for (let i = 0; i < 30; i++) {
      if (animationRef.current.cancelled) return
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    if (animationRef.current.cancelled) return
    
    setIsAiThinking(false)
    
    // Final conclusion - word by word animation
    const conclusion = `After analyzing ${pattern.incident_ids?.length || 0} related incidents, the pattern "${pattern.title}" shows strong correlation with backend service disruptions and infrastructure dependencies. High confidence match identified with known internal errors in the system telemetry. Recommended action: Review correlated internal errors and consider infrastructure audit for affected services.`
    
    const words = conclusion.split(' ')
    animationRef.current.words = words
    setAiThought("")
    
    for (let i = 0; i < words.length; i++) {
      if (animationRef.current.cancelled) break
      
      await new Promise(resolve => setTimeout(resolve, 80))
      
      if (animationRef.current.cancelled) break
      
      setCurrentWordIndex(i + 1)
      setAiThought(words.slice(0, i + 1).join(' '))
    }
  }

  const handlePatternClick = async (pattern: Pattern) => {
    setSelectedPattern(pattern)
    setIsDrawerOpen(true)
    setSaveMessage(null)
    setSolutionMessage(null)
    setIncidents([])
    setShowAiAnalysis(false)
    setAiThought("")
    setCurrentWordIndex(0)
    setSolutions([])
    animationRef.current = { cancelled: false, words: [] }
    
    // Check if pattern is already saved in database
    if (pattern.id) {
      setIsPatternSaved(true)
    } else {
      setIsPatternSaved(false)
    }
    
    // Start AI thinking simulation
    setIsAiThinking(true)
    simulateAiThinking(pattern)
    
    // Fetch incident details
    const incidentIds = pattern.incident_ids || pattern.incidentIds || []
    if (incidentIds.length > 0) {
      setLoadingIncidents(true)
      try {
        // Fetch each incident individually
        const incidentPromises = incidentIds.map(async (id) => {
          const response = await fetch(`/api/records/${id}`)
          if (response.ok) {
            const result = await response.json()
            console.log('Fetched incident result:', result)
            // API returns { success: true, data: {...incident} }
            return result.success ? result.data : null
          }
          return null
        })
        
        const fetchedIncidents = await Promise.all(incidentPromises)
        const validIncidents = fetchedIncidents.filter(incident => incident !== null)
        console.log('All valid incidents:', validIncidents)
        setIncidents(validIncidents)
      } catch (error) {
        console.error('Error fetching incidents:', error)
        setIncidents([])
      } finally {
        setLoadingIncidents(false)
      }
    } else {
      setLoadingIncidents(false)
    }
  }

  const handleSavePattern = async () => {
    if (!selectedPattern) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedPattern.title,
          description: selectedPattern.description,
          filters: selectedPattern.filters,
          priority: selectedPattern.priority,
          frequency: selectedPattern.frequency,
          time_range_start: selectedPattern.timeRangeStart || selectedPattern.time_range?.start,
          time_range_end: selectedPattern.timeRangeEnd || selectedPattern.time_range?.end,
          incident_ids: selectedPattern.incident_ids || selectedPattern.incidentIds,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSaveMessage('Pattern saved successfully')
        // Update the pattern with the new ID
        if (result.pattern?.id) {
          setSelectedPattern({ ...selectedPattern, id: result.pattern.id })
          setIsPatternSaved(true)
          
          // Update in patterns list
          setPatterns(patterns.map(p => 
            p.title === selectedPattern.title ? { ...p, id: result.pattern.id } : p
          ))
        }
      } else {
        setSaveMessage('Failed to save pattern')
      }
      
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error('Error saving pattern:', err)
      setSaveMessage('Error saving pattern')
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleDeletePattern = async () => {
    if (!selectedPattern?.id) return
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/patterns/${selectedPattern.id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSaveMessage('Pattern deleted successfully')
        setIsPatternSaved(false)
        
        // Remove ID from pattern
        setSelectedPattern({ ...selectedPattern, id: undefined })
        
        // Update in patterns list
        setPatterns(patterns.map(p => 
          p.id === selectedPattern.id ? { ...p, id: undefined } : p
        ))
        
        // Close drawer after short delay
        setTimeout(() => {
          setIsDrawerOpen(false)
        }, 1500)
      } else {
        setSaveMessage('Failed to delete pattern')
      }
      
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error('Error deleting pattern:', err)
      setSaveMessage('Error deleting pattern')
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSolution = async (solution: any, index: number) => {
    try {
      setSavingSolution(prev => ({ ...prev, [index]: true }))
      
      // If already saved, delete it
      if (solutionIds[index]) {
        const response = await fetch(`/api/solutions/${solutionIds[index]}`, {
          method: 'DELETE',
        })
        
        const data = await response.json()
        
        if (data.success) {
          setSolutionIds(prev => ({ ...prev, [index]: null }))
          setSaveMessage('Solution removed successfully')
        } else {
          setSaveMessage('Failed to remove solution')
        }
      } else {
        // Save new solution
        const response = await fetch('/api/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: solution.name,
            description: solution.description,
            cost_min: solution.cost_min,
            cost_max: solution.cost_max,
            feasibility: solution.feasibility,
            implementation_start_date: solution.implementation_start_date,
            implementation_end_date: solution.implementation_end_date,
          }),
        })
        
        const data = await response.json()
        
        if (data.success && data.data?.id) {
          setSolutionIds(prev => ({ ...prev, [index]: data.data.id }))
          setSaveMessage('Solution saved successfully')
        } else {
          setSaveMessage('Failed to save solution')
        }
      }
      
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving/removing solution:', error)
      setSaveMessage('Error occurred')
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setSavingSolution(prev => ({ ...prev, [index]: false }))
    }
  }

  const handleCreateSolution = async () => {
    if (!selectedPattern || !selectedPattern.id) return
    
    setIsCreatingSolution(true)
    setLoadingSolutions(true)
    setSolutionMessage(null)
    // Immediately show empty solutions array to trigger drawer expansion
    setSolutions([{}, {}, {}])
    setTypingStates({})
    setTypingComplete({})
    setSolutionIds({})
    
    try {
      const response = await fetch(`/api/patterns/${selectedPattern.id}/solutions`, {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSolutionMessage(`✅ Successfully generated ${result.count} solutions!`)
        const generatedSolutions = result.solutions || []
        setSolutions(generatedSolutions)
        
        // Initialize typing animation for each solution
        const initialTypingStates: {[key: number]: {words: string[], currentIndex: number}} = {}
        const initialTypingComplete: {[key: number]: boolean} = {}
        generatedSolutions.forEach((solution: any, idx: number) => {
          const words = solution.description.split(' ')
          initialTypingStates[idx] = { words, currentIndex: 0 }
          initialTypingComplete[idx] = false
        })
        setTypingStates(initialTypingStates)
        setTypingComplete(initialTypingComplete)
        
        // Animate words appearing - smoother like AI Analysis
        let wordIndex = 0
        const totalWords = Math.max(...generatedSolutions.map((s: any) => s.description.split(' ').length))
        const interval = setInterval(() => {
          wordIndex++
          setTypingStates(prev => {
            const newStates = { ...prev }
            Object.keys(newStates).forEach(key => {
              const idx = parseInt(key)
              if (newStates[idx].currentIndex < newStates[idx].words.length) {
                newStates[idx] = { ...newStates[idx], currentIndex: newStates[idx].currentIndex + 1 }
              } else if (newStates[idx].currentIndex === newStates[idx].words.length) {
                // Mark typing as complete for this solution
                setTypingComplete(prevComplete => ({ ...prevComplete, [idx]: true }))
              }
            })
            return newStates
          })
          
          if (wordIndex >= totalWords) {
            clearInterval(interval)
            // Mark all as complete
            const allComplete: {[key: number]: boolean} = {}
            generatedSolutions.forEach((_: any, idx: number) => {
              allComplete[idx] = true
            })
            setTypingComplete(allComplete)
          }
        }, 80)
        
        setTimeout(() => setSolutionMessage(null), 3000)
      } else {
        setSolutionMessage(`❌ ${result.error || 'Failed to generate solutions'}`)
        setSolutions([])
        setTimeout(() => setSolutionMessage(null), 5000)
      }
    } catch (err) {
      console.error('Error creating solution:', err)
      setSolutionMessage('❌ An error occurred while generating solutions')
      setSolutions([])
      setTimeout(() => setSolutionMessage(null), 5000)
    } finally {
      setIsCreatingSolution(false)
      setLoadingSolutions(false)
    }
  }

  const generatePatterns = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      console.log('🔄 Generating patterns from clustering API...')
      console.log('📊 Current filters:', filters)
      console.log('📅 Date range:', dateRange)
      
      // Call clustering API in preview mode (don't save to DB yet)
      const response = await fetch('/api/patterns/cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          dateRange,
          options: {
            similarityThreshold: 0.55,
            timeWindowHours: 168,
            minClusterSize: 2,
            useEmbeddings: true,
            embeddingModel: 'Xenova/all-MiniLM-L6-v2',
            skipTranslation: true, // Skip translation since incidents are already in English
          },
          preview: true, // Preview mode - don't save to database
        }),
      })
      
      const result = await response.json()
      
      if (result.success && result.patterns) {
        console.log(`✅ Generated ${result.patterns.length} patterns (preview mode)`)
        // Sort by frequency descending
        const sortedPatterns = [...result.patterns].sort((a, b) => b.frequency - a.frequency)
        setPatterns(sortedPatterns)
        setHasGenerated(true)
        
        // Track the filters used for this generation
        setLastGeneratedFilters(filters ? { ...filters } : undefined)
        setLastGeneratedDateRange(dateRange)
      } else {
        setError(result.error || 'Failed to generate patterns')
      }
    } catch (err) {
      console.error('Error generating patterns:', err)
      setError('An error occurred while generating patterns')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveAllPatterns = async () => {
    if (patterns.length === 0) return
    
    setIsSaving(true)
    try {
      console.log('💾 Saving patterns to database...')
      
      // Save each pattern to the database
      const savePromises = patterns.map(async (pattern) => {
        const response = await fetch('/api/patterns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: pattern.title,
            description: pattern.description,
            filters: pattern.filters,
            priority: pattern.priority,
            frequency: pattern.frequency,
            time_range_start: pattern.timeRangeStart || pattern.time_range?.start,
            time_range_end: pattern.timeRangeEnd || pattern.time_range?.end,
            incident_ids: pattern.incident_ids || pattern.incidentIds,
          }),
        })
        return response.json()
      })
      
      const results = await Promise.all(savePromises)
      const successCount = results.filter(r => r.success).length
      
      if (successCount > 0) {
        setSaveMessage(`Successfully saved ${successCount} pattern${successCount > 1 ? 's' : ''}`)
        console.log(`✅ Saved ${successCount} patterns to database`)
        
        // Refresh patterns from database
        const fetchResponse = await fetch('/api/patterns')
        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json()
          if (fetchResult.success && fetchResult.patterns) {
            const sortedPatterns = [...fetchResult.patterns].sort((a, b) => b.frequency - a.frequency)
            setPatterns(sortedPatterns)
          }
        }
      } else {
        setSaveMessage('Failed to save patterns')
      }
      
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err) {
      console.error('Error saving patterns:', err)
      setSaveMessage('Error saving patterns')
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
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
              No patterns detected with the current filters. Patterns are automatically generated based on your filter selection. Try adjusting your filters or date range to see different patterns.
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
          <div className="flex items-center gap-3">
            {filtersHaveChanged() && (
              <Button
                onClick={generatePatterns}
                disabled={isGenerating}
                size="sm"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Patterns
                  </>
                )}
              </Button>
            )}
            {patterns.length > 0 && !filtersHaveChanged() && (
              <Button
                onClick={saveAllPatterns}
                disabled={isSaving}
                size="sm"
                variant="outline"
                className="border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All
                  </>
                )}
              </Button>
            )}
            {saveMessage && (
              <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                {saveMessage}
              </div>
            )}
            {patterns.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-br from-red-50 to-rose-50 px-4 py-2 rounded-lg border border-red-200/60">
                <span className="text-xs font-medium text-slate-600">Total patterns:</span>
                <Badge className="bg-red-600 text-white hover:bg-red-700 font-bold text-sm px-2 py-1">
                  {patterns.length}
                </Badge>
              </div>
            )}
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
      <Sheet open={isDrawerOpen} onOpenChange={(open) => {
        setIsDrawerOpen(open)
        if (!open) {
          animationRef.current.cancelled = true
          setSolutions([])
        }
      }}>
        <SheetContent className={`overflow-y-auto transition-all duration-500 ease-in-out ${solutions.length > 0 ? '!w-[90vw] !max-w-none' : '!w-full sm:!w-[640px]'}`}>
          {selectedPattern && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">{selectedPattern.title}</SheetTitle>
                <SheetDescription className="text-base">
                  Pattern details and related incidents
                </SheetDescription>
              </SheetHeader>

              <div className={`mt-6 ${solutions.length > 0 ? 'grid grid-cols-2 gap-6 h-[calc(100vh-12rem)]' : 'space-y-6'}`}>
                {/* Left Side - Pattern Details */}
                <div className={`space-y-6 ${solutions.length > 0 ? 'overflow-y-auto pr-4' : ''}`}>
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  {isPatternSaved ? (
                    <Button
                      onClick={handleDeletePattern}
                      disabled={isSaving}
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Unsave Pattern
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSavePattern}
                      disabled={isSaving}
                      variant="outline"
                      className="flex-1 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Pattern
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleCreateSolution}
                    disabled={isCreatingSolution}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isCreatingSolution ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Solution
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Thinking Process */}
                {showAiAnalysis && (
                  <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg p-4 border border-indigo-200/50 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {isAiThinking ? (
                          <div className="relative w-6 h-6">
                            {/* Gemini-style animated sparkle */}
                            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                              <div className="absolute top-0 left-1/2 w-1 h-1 bg-indigo-500 rounded-full transform -translate-x-1/2"></div>
                              <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-500 rounded-full transform -translate-x-1/2"></div>
                              <div className="absolute left-0 top-1/2 w-1 h-1 bg-pink-500 rounded-full transform -translate-y-1/2"></div>
                              <div className="absolute right-0 top-1/2 w-1 h-1 bg-blue-500 rounded-full transform -translate-y-1/2"></div>
                            </div>
                            <div className="absolute inset-0 animate-pulse">
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-20 blur-sm"></div>
                            </div>
                            <Sparkles className="w-6 h-6 text-indigo-600 relative z-10 animate-pulse" />
                          </div>
                        ) : (
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-indigo-900">
                            AI Analysis
                          </h4>
                          {isAiThinking && (
                            <Badge className="bg-indigo-100 text-indigo-700 text-xs animate-pulse">
                              Thinking...
                            </Badge>
                          )}
                        </div>
                        {isAiThinking ? (
                          <div className="space-y-3">
                            {/* Gemini-style loading bars */}
                            <div className="space-y-2">
                              <div className="h-2 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-shimmer" style={{ width: '100%', animation: 'shimmer 2s infinite' }}></div>
                              </div>
                              <div className="h-2 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 rounded-full overflow-hidden" style={{ width: '85%' }}>
                                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-shimmer" style={{ width: '100%', animation: 'shimmer 2s infinite', animationDelay: '0.3s' }}></div>
                              </div>
                              <div className="h-2 bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 rounded-full overflow-hidden" style={{ width: '70%' }}>
                                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-shimmer" style={{ width: '100%', animation: 'shimmer 2s infinite', animationDelay: '0.6s' }}></div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 italic">Analyzing patterns and correlations...</p>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-700 leading-relaxed">
                            {animationRef.current.words.slice(0, currentWordIndex).map((word, idx) => (
                              <span key={idx} className="animate-fadeIn" style={{ animationDelay: '0ms' }}>
                                {word}{' '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                    <div className="space-y-3">
                      {Object.entries(selectedPattern.filters).map(([key, values]) => {
                        // Skip rendering for certain keys or handle them specially
                        if (key === 'keywords') {
                          // Group all keywords into a single badge
                          const allKeywords = Array.isArray(values) ? values : [];
                          if (allKeywords.length === 0) return null;
                          
                          // Clean keywords by removing brackets and quotes
                          const cleanedKeywords = allKeywords.map((kw: any) => 
                            String(kw).replace(/[\[\]"']/g, '').trim()
                          ).filter(Boolean);
                          
                          // Limit to 5 keywords
                          const displayKeywords = cleanedKeywords.slice(0, 5);
                          const hasMore = cleanedKeywords.length > 5;
                          
                          return (
                            <div key={key} className="space-y-2">
                              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Keywords</div>
                              <div className="flex flex-wrap gap-2">
                                {displayKeywords.map((keyword, idx) => (
                                  <Badge 
                                    key={idx}
                                    className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                                {hasMore && (
                                  <Badge className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5">
                                    +{cleanedKeywords.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        }
                        
                        if (key === 'priority_range') {
                          // Format priority range object
                          const range = values as any;
                          if (typeof range === 'object' && range !== null) {
                            return (
                              <div key={key} className="space-y-2">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority Range</div>
                                <Badge className="bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 shadow-sm">
                                  P{range.min} - P{range.max}
                                </Badge>
                              </div>
                            );
                          }
                          return null;
                        }
                        
                        if (key === 'sentiments') {
                          // Group sentiments and format with labels
                          const sentimentValues = Array.isArray(values) ? values : [values];
                          const sentimentLabels = sentimentValues.map((val: any) => {
                            if (val === -1 || val === '-1') return 'Negative';
                            if (val === 0 || val === '0') return 'Neutral';
                            if (val === 1 || val === '1') return 'Positive';
                            return String(val);
                          });
                          
                          if (sentimentLabels.length === 0) return null;
                          
                          return (
                            <div key={key} className="space-y-2">
                              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sentiments</div>
                              <div className="flex flex-wrap gap-2">
                                {sentimentLabels.map((label, idx) => (
                                  <Badge 
                                    key={idx}
                                    className={
                                      label === 'Negative' 
                                        ? "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border border-red-200 px-3 py-1.5 shadow-sm"
                                        : label === 'Positive'
                                        ? "bg-gradient-to-br from-green-50 to-green-100 text-green-700 border border-green-200 px-3 py-1.5 shadow-sm"
                                        : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 shadow-sm"
                                    }
                                  >
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        if (key === 'time_range') {
                          // Format time range object
                          const range = values as any;
                          if (typeof range === 'object' && range !== null && range.start && range.end) {
                            const startDate = new Date(range.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const endDate = new Date(range.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                              <div key={key} className="space-y-2">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Time Range</div>
                                <Badge className="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 shadow-sm">
                                  {startDate} - {endDate}
                                </Badge>
                              </div>
                            );
                          }
                          return null;
                        }
                        
                        // Handle regular array values (services, categories, etc.)
                        if (Array.isArray(values)) {
                          if (values.length === 0) return null;
                          
                          // Limit to 5 items
                          const displayValues = values.slice(0, 5);
                          const hasMore = values.length > 5;
                          
                          return (
                            <div key={key} className="space-y-2">
                              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{key.replace(/_/g, ' ')}</div>
                              <div className="flex flex-wrap gap-2">
                                {displayValues.map((val, idx) => (
                                  <Badge 
                                    key={idx}
                                    className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow capitalize"
                                  >
                                    {String(val)}
                                  </Badge>
                                ))}
                                {hasMore && (
                                  <Badge className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5">
                                    +{values.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        }
                        
                        // Handle single values
                        return (
                          <div key={key} className="space-y-2">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{key.replace(/_/g, ' ')}</div>
                            <Badge className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 shadow-sm capitalize">
                              {String(values)}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Related Incidents Table */}
                {(selectedPattern.incident_ids || selectedPattern.incidentIds) && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Related Incidents ({(selectedPattern.incident_ids || selectedPattern.incidentIds || []).length})
                    </h3>
                    
                    {loadingIncidents ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        <span className="ml-2 text-sm text-slate-600">Loading incidents...</span>
                      </div>
                    ) : incidents.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Time</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Service</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Category</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Priority</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Summary</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {incidents.map((incident, idx) => (
                                <tr key={incident?.id || idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">
                                    {incident?.time ? new Date(incident.time).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    }) : 'N/A'}
                                  </td>
                                  <td className="px-3 py-3">
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {incident?.service || 'N/A'}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-3 text-xs text-slate-600 capitalize">
                                    {incident?.category ? incident.category.replace(/-/g, ' ') : 'N/A'}
                                  </td>
                                  <td className="px-3 py-3">
                                    {incident?.priority ? (
                                      <Badge 
                                        className={
                                          incident.priority <= 2
                                            ? "bg-red-100 text-red-700 text-xs"
                                            : incident.priority === 3
                                            ? "bg-orange-100 text-orange-700 text-xs"
                                            : "bg-yellow-100 text-yellow-700 text-xs"
                                        }
                                      >
                                        P{incident.priority}
                                      </Badge>
                                    ) : 'N/A'}
                                  </td>
                                  <td className="px-3 py-3 text-xs text-slate-700 max-w-md">
                                    <div className="line-clamp-2">
                                      {incident?.summary || 'No summary available'}
                                    </div>
                                    {incident?.keywords && incident.keywords.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {incident.keywords.slice(0, 3).map((keyword, i) => (
                                          <span key={i} className="inline-block px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded">
                                            {keyword}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-500">
                        No incident details available
                      </div>
                    )}
                  </div>
                )}

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

              {/* Right Side - Solutions */}
              {solutions.length > 0 && (
                <div className="space-y-6 border-l border-slate-200 pl-6 overflow-y-auto pr-4 pointer-events-auto">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Generated Solutions</h3>
                    <p className="text-sm text-slate-600">AI-powered solutions for this pattern</p>
                  </div>

                  {loadingSolutions ? (
                    <div className="space-y-4">
                      {[0, 1, 2].map((idx) => (
                        <div 
                          key={idx} 
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 animate-in fade-in"
                          style={{ animationDelay: `${idx * 200}ms`, animationFillMode: 'both' }}
                        >
                          {/* Title skeleton with shimmer */}
                          <div className="h-6 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 rounded-md mb-3 w-3/4 animate-pulse bg-[length:200%_100%] animate-shimmer" />
                          
                          {/* Description skeleton lines */}
                          <div className="space-y-2 mb-4">
                            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded w-full animate-pulse bg-[length:200%_100%] animate-shimmer" />
                            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded w-full animate-pulse bg-[length:200%_100%] animate-shimmer" />
                            <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded w-2/3 animate-pulse bg-[length:200%_100%] animate-shimmer" />
                          </div>
                          
                          {/* Metrics skeleton */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/60 rounded-lg p-3">
                              <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
                              <div className="h-4 bg-slate-300 rounded w-12" />
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                              <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
                              <div className="h-4 bg-slate-300 rounded w-24" />
                            </div>
                            <div className="bg-white/60 rounded-lg p-3">
                              <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
                              <div className="h-4 bg-slate-300 rounded w-28" />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* AI generation message */}
                      <div className="flex items-center justify-center gap-2 py-4">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-purple-600 font-medium">AI is analyzing pattern and generating solutions...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {solutions.map((solution, idx) => (
                        <div 
                          key={solution.id || idx} 
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto"
                          style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                        >
                          <h4 className="text-lg font-bold text-purple-900 mb-3">{solution.name}</h4>
                          
                          <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                            {typingStates[idx] ? (
                              typingStates[idx].words.slice(0, typingStates[idx].currentIndex).map((word, wordIdx) => (
                                <span 
                                  key={wordIdx} 
                                  className="animate-fadeIn"
                                  style={{ animationDelay: '0ms' }}
                                >
                                  {word + ' '}
                                </span>
                              ))
                            ) : solution.description}
                          </p>
                          
                          {/* Show metrics only after typing completes */}
                          {(typingComplete[idx] || !typingStates[idx]) && (
                          <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2" style={{ animationDuration: '500ms' }}>
                            <div className="bg-white/60 rounded-lg p-3 animate-float" style={{ animationDelay: '0ms' }}>
                              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Feasibility</div>
                              <div className="text-sm font-bold text-slate-900">
                                {solution.feasibility}/10
                              </div>
                            </div>
                            
                            <div className="bg-white/60 rounded-lg p-3 animate-float" style={{ animationDelay: '200ms' }}>
                              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Cost Range</div>
                              <div className="text-sm font-bold text-slate-900">
                                ${(solution.cost_min || 0).toLocaleString()} - ${(solution.cost_max || 0).toLocaleString()} MXN
                              </div>
                            </div>
                            
                            <div className="bg-white/60 rounded-lg p-3 animate-float" style={{ animationDelay: '400ms' }}>
                              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Timeline</div>
                              <div className="text-sm font-bold text-slate-900">
                                {new Date(solution.implementation_start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                {' → '}
                                {new Date(solution.implementation_end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          )}
                          
                          {/* Action buttons - show after typing completes */}
                          {(typingComplete[idx] || !typingStates[idx]) && (
                          <div className="flex gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto" style={{ animationDuration: '500ms', animationDelay: '200ms' }}>
                            {solutionIds[idx] ? (
                              <Button
                                onClick={() => handleSaveSolution(solution, idx)}
                                disabled={savingSolution[idx]}
                                variant="outline"
                                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                              >
                                {savingSolution[idx] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Unsave Solution
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleSaveSolution(solution, idx)}
                                disabled={savingSolution[idx]}
                                variant="outline"
                                className="flex-1 border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                              >
                                {savingSolution[idx] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="w-4 h-4 mr-2" />
                                    Save Solution
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('View Details clicked:', solution)
                                setSelectedSolutionDetail(solution)
                              }}
                              disabled={loadingSolutions || !solution.name || !solution.description}
                              variant="outline"
                              className="flex-1 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Solution Details Modal - Rendered via Portal to escape drawer z-index */}
      {selectedSolutionDetail && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-in fade-in"
          onClick={() => {
            console.log('Modal backdrop clicked')
            setSelectedSolutionDetail(null)
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 animate-in slide-in-from-bottom-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                  {selectedSolutionDetail.name}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <TrendingUp className={`w-5 h-5 ${
                    selectedSolutionDetail.feasibility >= 8 ? 'text-green-600' :
                    selectedSolutionDetail.feasibility >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                  <span className={`text-lg font-bold ${
                    selectedSolutionDetail.feasibility >= 8 ? 'text-green-700' :
                    selectedSolutionDetail.feasibility >= 5 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    Feasibility: {selectedSolutionDetail.feasibility}/10
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('× button clicked')
                  setSelectedSolutionDetail(null)
                }}
                className="text-slate-400 hover:text-slate-600 text-3xl font-bold leading-none transition-colors pointer-events-auto cursor-pointer z-10"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedSolutionDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">$</span>
                    </div>
                    <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide">
                      Budget Range
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-green-600 font-medium">Minimum</p>
                      <p className="text-2xl font-bold text-green-800">
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(selectedSolutionDetail.cost_min)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Maximum</p>
                      <p className="text-2xl font-bold text-green-800">
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(selectedSolutionDetail.cost_max)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                      Timeline
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">Start Date</p>
                      <p className="text-lg font-bold text-blue-800">
                        {new Date(selectedSolutionDetail.implementation_start_date).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">End Date</p>
                      <p className="text-lg font-bold text-blue-800">
                        {new Date(selectedSolutionDetail.implementation_end_date).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-200 flex gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Close button clicked')
                    setSelectedSolutionDetail(null)
                  }}
                  className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all duration-200 pointer-events-auto cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
