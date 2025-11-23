"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, ChevronDown, Calendar as CalendarIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"

interface FilterValue {
  field: string
  value: string
  label: string
}

interface RecordsFiltersProps {
  onFiltersChange?: (filters: Record<string, string[]>) => void
  onToggleActionMenu?: () => void
  isActionMenuCollapsed?: boolean
  availableOptions?: {
    services: string[]
    sources: string[]
    categories: string[]
    subservices: string[]
  }
  visualizationMode?: 'records' | 'patterns' | 'graphic'
  onVisualizationModeChange?: (mode: 'records' | 'patterns' | 'graphic') => void
  graphicType?: 'timeseries' | 'topN' | 'barChart' | 'pieChart'
  onGraphicTypeChange?: (type: 'timeseries' | 'topN' | 'barChart' | 'pieChart') => void
  groupBy?: string
  onGroupByChange?: (groupBy: string) => void
  dateRange?: string
  onDateRangeChange?: (range: string) => void
  externalFilters?: Record<string, string[]>
}

export function RecordsFilters({ 
  onFiltersChange, 
  onToggleActionMenu, 
  isActionMenuCollapsed, 
  availableOptions: propOptions,
  visualizationMode = 'records',
  onVisualizationModeChange,
  graphicType = 'timeseries',
  onGraphicTypeChange,
  groupBy = 'service',
  onGroupByChange,
  dateRange: externalDateRange,
  onDateRangeChange,
  externalFilters
}: RecordsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<{ field: string; values: string[] }[]>([])
  const [dateRange, setDateRange] = useState(externalDateRange || "Last 7 days")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState("00:00")
  const [endTime, setEndTime] = useState("23:59")
  const availableOptions = propOptions || {
    services: [] as string[],
    sources: [] as string[],
    categories: [] as string[],
    subservices: [] as string[],
  }
  const inputRef = useRef<HTMLInputElement>(null)
  const isUpdatingFromExternal = useRef(false)

  // Sync with external filters from filter panel
  useEffect(() => {
    if (externalFilters) {
      const newFilters: FilterValue[] = []
      Object.entries(externalFilters).forEach(([field, values]) => {
        // Check if this is a negated filter (exclusion)
        const isNegated = field.startsWith('-')
        const actualField = isNegated ? field.substring(1) : field
        
        values.forEach(value => {
          const label = actualField === "priority" ? `P${value}` : value
          const displayLabel = isNegated ? `-${actualField}:${label}` : `${actualField}:${label}`
          newFilters.push({ 
            field: actualField, 
            value: isNegated ? `-${value}` : value, 
            label: displayLabel 
          })
        })
      })
      
      // Only update if different from current activeFilters
      const currentFiltersStr = JSON.stringify(activeFilters.sort((a, b) => a.label.localeCompare(b.label)))
      const newFiltersStr = JSON.stringify(newFilters.sort((a, b) => a.label.localeCompare(b.label)))
      
      if (currentFiltersStr !== newFiltersStr) {
        isUpdatingFromExternal.current = true
        setActiveFilters(newFilters)
      }
    }
  }, [externalFilters])

  // Sync date range from external source
  useEffect(() => {
    if (externalDateRange) {
      setDateRange(externalDateRange)
    }
  }, [externalDateRange])

  useEffect(() => {
    // Don't notify parent if we're updating from external filters
    if (isUpdatingFromExternal.current) {
      isUpdatingFromExternal.current = false
      return
    }
    
    // Convert activeFilters to the format expected by parent
    const filterMap: Record<string, string[]> = {}
    activeFilters.forEach((filter) => {
      if (!filterMap[filter.field]) {
        filterMap[filter.field] = []
      }
      filterMap[filter.field].push(filter.value)
    })
    onFiltersChange?.(filterMap)
  }, [activeFilters, onFiltersChange])

  useEffect(() => {
    if (searchQuery.length > 0) {
      generateSuggestions(searchQuery)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [searchQuery])

  const generateSuggestions = (query: string) => {
    const lowerQuery = query.toLowerCase()
    const newSuggestions: { field: string; values: string[] }[] = []

    // Check if query starts with a field name
    const fieldMatch = query.match(/^(service|source|category|subservice|priority):(.*)/)
    
    if (fieldMatch) {
      const [, field, value] = fieldMatch
      const lowerValue = value.toLowerCase()
      
      if (field === "priority") {
        const priorities = ["1", "2", "3", "4", "5"].filter(p => p.includes(lowerValue))
        if (priorities.length > 0) {
          newSuggestions.push({ field: "priority", values: priorities })
        }
      } else {
        const optionKey = `${field}s` as keyof typeof availableOptions
        const values = availableOptions[optionKey]?.filter(v => 
          v.toLowerCase().includes(lowerValue)
        ) || []
        if (values.length > 0) {
          newSuggestions.push({ field, values })
        }
      }
    } else {
      // Show all matching values across all fields
      Object.entries(availableOptions).forEach(([key, values]) => {
        const field = key.slice(0, -1) // Remove 's' from end
        const matching = values.filter(v => v.toLowerCase().includes(lowerQuery))
        if (matching.length > 0) {
          newSuggestions.push({ field, values: matching.slice(0, 5) })
        }
      })
      
      // Also check priorities
      const priorities = ["1", "2", "3", "4", "5"].filter(p => p.includes(lowerQuery))
      if (priorities.length > 0) {
        newSuggestions.push({ field: "priority", values: priorities })
      }
    }

    setSuggestions(newSuggestions)
  }

  const addFilter = (field: string, value: string) => {
    const label = field === "priority" ? `P${value}` : value
    const filterValue: FilterValue = { field, value, label: `${field}:${label}` }
    
    // Check if this exact filter already exists
    const exists = activeFilters.some(f => f.field === field && f.value === value)
    if (!exists) {
      setActiveFilters([...activeFilters, filterValue])
    }
    
    setSearchQuery("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && searchQuery === "" && activeFilters.length > 0) {
      // Remove last filter when backspace is pressed on empty input
      removeFilter(activeFilters.length - 1)
    }
  }

  const getFieldLabel = (field: string) => {
    return field.charAt(0).toUpperCase() + field.slice(1)
  }

  const formatDateRangeDisplay = (range: string) => {
    try {
      const customRange = JSON.parse(range)
      if (customRange.start && customRange.end) {
        const start = new Date(customRange.start)
        const end = new Date(customRange.end)
        return `${start.toLocaleDateString()} ${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${end.toLocaleDateString()} ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      }
    } catch {
      // Not JSON, return as-is (preset range)
      return range
    }
    return range
  }

  return (
    <>
    <Card className="p-4 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/60 border-slate-200/60 shadow-xl shadow-slate-200/20 backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {/* Search Input with Active Filters and Date Range */}
        <div className="flex gap-3">
          {/* Date Range Selector */}
          <DropdownMenu open={showDatePicker} onOpenChange={setShowDatePicker}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-[52px] px-5 border-2 border-slate-200 rounded-full bg-gradient-to-br from-white via-slate-50 to-white hover:border-blue-300 hover:shadow-xl hover:scale-[1.02] shadow-lg shadow-slate-200/30 transition-all duration-300 backdrop-blur-sm whitespace-nowrap"
              >
                <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{formatDateRangeDisplay(dateRange)}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-white border-2 border-slate-200 rounded-xl shadow-xl">
              <div className="p-2">
                <button
                  onClick={() => { 
                    setDateRange("Last 15 minutes"); 
                    setShowDatePicker(false);
                    onDateRangeChange?.("Last 15 minutes");
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Last 15 minutes
                </button>
                <button
                  onClick={() => { 
                    setDateRange("Last hour"); 
                    setShowDatePicker(false);
                    onDateRangeChange?.("Last hour");
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Last hour
                </button>
                <button
                  onClick={() => { 
                    setDateRange("Last 4 hours"); 
                    setShowDatePicker(false);
                    onDateRangeChange?.("Last 4 hours");
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Last 4 hours
                </button>
                <button
                  onClick={() => { 
                    setDateRange("Last 24 hours"); 
                    setShowDatePicker(false);
                    onDateRangeChange?.("Last 24 hours");
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Last 24 hours
                </button>
                <button
                  onClick={() => { 
                    setDateRange("Last 7 days"); 
                    setShowDatePicker(false);
                    onDateRangeChange?.("Last 7 days");
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => { 
                    setDateRange("Last 30 days"); 
                    setShowDatePicker(false);
                    onDateRangeChange?.("Last 30 days");
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Last 30 days
                </button>
                <button
                  onClick={() => { 
                    setDateRange("Last 90 days"); 
                    setShowDatePicker(false);
                    onDateRangeChange?.("Last 90 days");
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Last 90 days
                </button>
                <div className="border-t border-slate-200 my-2"></div>
                <button
                  onClick={() => { 
                    setShowDatePicker(false);
                    setShowCustomPicker(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md transition-all duration-200 font-medium"
                >
                  Custom range...
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative flex-1">
          <div className="flex items-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-3xl bg-gradient-to-r from-white to-slate-50 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 shadow-lg shadow-slate-200/20 transition-all duration-300 backdrop-blur-sm">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {activeFilters.map((filter, index) => {
                const isNegated = filter.value.startsWith('-')
                const displayValue = isNegated ? filter.value.substring(1) : filter.value
                const priorityDisplay = filter.field === "priority" ? `P${displayValue}` : displayValue
                
                return (
                  <div
                    key={index}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shadow-sm ${
                      isNegated 
                        ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200'
                        : 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-200'
                    }`}
                  >
                    <span className="font-semibold">{isNegated ? '-' : ''}{getFieldLabel(filter.field)}:</span>
                    <span>{priorityDisplay}</span>
                    <X
                      className={`w-3 h-3 cursor-pointer transition-colors duration-200 ${
                        isNegated ? 'hover:text-red-900' : 'hover:text-violet-900'
                      }`}
                      onClick={() => removeFilter(index)}
                    />
                  </div>
                )
              })}
              
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                placeholder={activeFilters.length === 0 ? "Filter by service:value, source:value, category:value, priority:1-5..." : ""}
                className="flex-1 min-w-[200px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 px-3 text-xs flex-shrink-0 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 hover:text-red-700 border border-red-200 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-gradient-to-br from-white via-slate-50/95 to-slate-100/80 border-2 border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-300/30 max-h-[400px] overflow-y-auto backdrop-blur-md">
              {suggestions.map((suggestion) => (
                <div key={suggestion.field} className="p-2">
                  <div className="text-xs font-semibold text-muted-foreground px-2 py-1">
                    {getFieldLabel(suggestion.field)}
                  </div>
                  {suggestion.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => addFilter(suggestion.field, value)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 rounded-sm transition-all duration-200 flex items-center justify-between group"
                    >
                      <span>{suggestion.field === "priority" ? `Priority ${value}` : value}</span>
                      <span className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Click to add
                      </span>
                    </button>
                  ))}
                </div>
              ))}
              
              <div className="p-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-100/80 to-slate-200/60 backdrop-blur-sm rounded-b-3xl">
                <div className="text-xs text-muted-foreground px-2">
                  <p className="font-medium mb-1">Tips:</p>
                  <p>• Type <code className="px-1 py-0.5 bg-background rounded">service:</code> to filter by service</p>
                  <p>• Type <code className="px-1 py-0.5 bg-background rounded">priority:1</code> for priority filters</p>
                  <p>• Use backspace to remove the last filter</p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Visualization Mode Selector */}
        {onVisualizationModeChange && (
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">View:</span>
              <button
                onClick={() => onVisualizationModeChange('records')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                  visualizationMode === 'records'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 hover:from-slate-200 hover:to-slate-300 hover:shadow-md hover:scale-105'
                }`}
              >
                Records
              </button>
              <button
                onClick={() => onVisualizationModeChange('patterns')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                  visualizationMode === 'patterns'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 hover:from-slate-200 hover:to-slate-300 hover:shadow-md hover:scale-105'
                }`}
              >
                Patterns
              </button>
              <button
                onClick={() => onVisualizationModeChange('graphic')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                  visualizationMode === 'graphic'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 hover:from-slate-200 hover:to-slate-300 hover:shadow-md hover:scale-105'
                }`}
              >
                Graphic
              </button>
            </div>

            {/* Graphic Type Submenu */}
            {visualizationMode === 'graphic' && onGraphicTypeChange && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-xs text-slate-500 font-medium">Chart:</span>
                  <button
                    onClick={() => onGraphicTypeChange('timeseries')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                      graphicType === 'timeseries'
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-br from-white to-slate-50 text-slate-600 hover:from-slate-50 hover:to-slate-100 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md hover:scale-105'
                    }`}
                  >
                    Timeseries
                  </button>
                  <button
                    onClick={() => onGraphicTypeChange('topN')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                      graphicType === 'topN'
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-br from-white to-slate-50 text-slate-600 hover:from-slate-50 hover:to-slate-100 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md hover:scale-105'
                    }`}
                  >
                    Top N
                  </button>
                  <button
                    onClick={() => onGraphicTypeChange('barChart')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                      graphicType === 'barChart'
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-br from-white to-slate-50 text-slate-600 hover:from-slate-50 hover:to-slate-100 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md hover:scale-105'
                    }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => onGraphicTypeChange('pieChart')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                      graphicType === 'pieChart'
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-br from-white to-slate-50 text-slate-600 hover:from-slate-50 hover:to-slate-100 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md hover:scale-105'
                    }`}
                  >
                    Pie Chart
                  </button>
                </div>

                {onGroupByChange && (
                  <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Group by:</span>
                    <select
                      value={groupBy}
                      onChange={(e) => onGroupByChange(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-600 hover:from-slate-50 hover:to-slate-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm transition-all duration-300"
                    >
                      <option value="service">Service</option>
                      <option value="source">Source</option>
                      <option value="category">Category</option>
                      <option value="priority">Priority</option>
                      <option value="subservice">Subservice</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>

    {/* Custom Date Range Modal */}
    {showCustomPicker && (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => {
            setCustomStartDate(undefined)
            setCustomEndDate(undefined)
            setStartTime("00:00")
            setEndTime("23:59")
            setShowCustomPicker(false)
          }}
        />
        
        {/* Modal */}
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
          <div 
            className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-4xl pointer-events-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Select Custom Date Range</h2>
              <p className="text-sm text-slate-600 mt-1">Choose start and end dates for your filter</p>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Start Date & Time */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Start Date</label>
                    <div className="border-2 border-slate-200 rounded-2xl p-4 bg-gradient-to-br from-white to-slate-50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 shadow-md">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        disabled={(date) => date > new Date()}
                        className="w-full"
                        classNames={{
                          today: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900 font-semibold rounded-full shadow-sm",
                          selected: "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-full shadow-lg",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-11 text-base border-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">End Date</label>
                    <div className="border-2 border-slate-200 rounded-2xl p-4 bg-gradient-to-br from-white to-slate-50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 shadow-md">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        disabled={(date) => date > new Date() || (customStartDate ? date < customStartDate : false)}
                        className="w-full"
                        classNames={{
                          today: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900 font-semibold rounded-full shadow-sm",
                          selected: "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-full shadow-lg",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full h-11 text-base border-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Selected Range Preview */}
              {customStartDate && customEndDate && (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl shadow-lg">
                  <p className="text-sm text-slate-900">
                    <span className="font-bold">Selected Range:</span>{' '}
                    <span className="font-medium">
                      {customStartDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {startTime}
                      <span className="mx-2 text-slate-500">→</span>
                      {customEndDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {endTime}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-t border-slate-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCustomStartDate(undefined)
                  setCustomEndDate(undefined)
                  setStartTime("00:00")
                  setEndTime("23:59")
                  setShowCustomPicker(false)
                }}
                className="px-8 h-12 text-base font-semibold rounded-full border-2 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    const startDateTime = new Date(customStartDate)
                    const [startHour, startMin] = startTime.split(':')
                    startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0)
                    
                    const endDateTime = new Date(customEndDate)
                    const [endHour, endMin] = endTime.split(':')
                    endDateTime.setHours(parseInt(endHour), parseInt(endMin), 59, 999)
                    
                    const customRangeJSON = JSON.stringify({ 
                      start: startDateTime.toISOString(), 
                      end: endDateTime.toISOString() 
                    })
                    setDateRange(customRangeJSON)
                    onDateRangeChange?.(customRangeJSON)
                    setShowCustomPicker(false)
                  }
                }}
                disabled={!customStartDate || !customEndDate}
                className="px-8 h-12 text-base font-bold bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
              >
                Apply Date Range
              </Button>
            </div>
          </div>
        </div>
      </>
    )}
  </>
  )
}
