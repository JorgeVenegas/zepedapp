"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FilterValue {
  field: string
  value: string
  label: string
}

interface RecordsFiltersProps {
  onFiltersChange?: (filters: Record<string, string[]>) => void
}

export function RecordsFilters({ onFiltersChange }: RecordsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<{ field: string; values: string[] }[]>([])
  const [availableOptions, setAvailableOptions] = useState({
    services: [] as string[],
    sources: [] as string[],
    categories: [] as string[],
    subservices: [] as string[],
  })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  useEffect(() => {
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

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/records?pageSize=1000")
      const result = await response.json()

      if (result.success) {
        const incidents = result.data
        const services = [...new Set(incidents.map((i: any) => i.service).filter(Boolean))].sort() as string[]
        const sources = [...new Set(incidents.map((i: any) => i.source).filter(Boolean))].sort() as string[]
        const categories = [...new Set(incidents.map((i: any) => i.category).filter(Boolean))].sort() as string[]
        const subservices = [...new Set(incidents.map((i: any) => i.subservice).filter(Boolean))].sort() as string[]

        setAvailableOptions({ services, sources, categories, subservices })
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    }
  }

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

  return (
    <Card className="p-4 bg-gradient-to-br from-white via-slate-50/90 to-slate-100/60 border-slate-200/60 shadow-xl shadow-slate-200/20 backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {/* Search Input with Active Filters */}
        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-3xl bg-gradient-to-r from-white to-slate-50 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400 shadow-lg shadow-slate-200/20 transition-all duration-300 backdrop-blur-sm">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {activeFilters.map((filter, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200 shadow-sm"
                >
                  <span className="font-semibold">{getFieldLabel(filter.field)}:</span>
                  <span>{filter.field === "priority" ? `P${filter.value}` : filter.value}</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-violet-900 transition-colors duration-200"
                    onClick={() => removeFilter(index)}
                  />
                </div>
              ))}
              
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

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Quick filters:</span>
          {["service", "source", "category", "priority"].map((field) => (
            <DropdownMenu key={field}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-200 text-slate-700 hover:text-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl rounded-full px-4">
                  {getFieldLabel(field)}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-3 max-h-[300px] overflow-y-auto bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-300/25 backdrop-blur-md">
                {field === "priority" ? (
                  [1, 2, 3, 4, 5].map((p) => (
                    <button
                      key={p}
                      onClick={() => addFilter("priority", p.toString())}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-sm transition-all duration-200"
                    >
                      Priority {p}
                    </button>
                  ))
                ) : (
                  availableOptions[`${field}s` as keyof typeof availableOptions]?.map((value) => (
                    <button
                      key={value}
                      onClick={() => addFilter(field, value)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-sm transition-all duration-200"
                    >
                      {value}
                    </button>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>
    </Card>
  )
}
