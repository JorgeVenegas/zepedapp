"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react"

interface FilterOption {
  value: string
  count: number
}

interface FacetGroup {
  field: string
  label: string
  options: FilterOption[]
}

interface RecordsFilterPanelProps {
  onFiltersChange?: (filters: Record<string, string[]>) => void
  isCollapsed?: boolean
  facets: FacetGroup[]
  loading?: boolean
  selectedFilters?: Record<string, string[]>
}

export function RecordsFilterPanel({ onFiltersChange, isCollapsed = false, facets, loading = false, selectedFilters: externalFilters }: RecordsFilterPanelProps) {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set(["service", "source", "category", "priority"]))
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [initialized, setInitialized] = useState(false)
  const isUpdatingFromExternal = useRef(false)
  const lastExternalFiltersRef = useRef<string>("")

  // Initialize all filters with all values when facets first load
  useEffect(() => {
    if (!initialized && facets.length > 0) {
      const initialFilters: Record<string, string[]> = {}
      facets.forEach(facet => {
        initialFilters[facet.field] = facet.options.map(o => 
          facet.field === "priority" ? o.value.replace("P", "") : o.value
        )
      })
      setSelectedFilters(initialFilters)
      setInitialized(true)
    }
  }, [facets, initialized])

  // Sync with external filters when provided (convert from optimized format)
  useEffect(() => {
    if (externalFilters && Object.keys(externalFilters).length > 0 && facets.length > 0) {
      // Check if external filters actually changed
      const externalFiltersStr = JSON.stringify(externalFilters)
      if (lastExternalFiltersRef.current === externalFiltersStr) {
        return // No change, skip update
      }
      lastExternalFiltersRef.current = externalFiltersStr
      
      // Convert optimized filters back to full selection state
      const reconstructedFilters: Record<string, string[]> = {}
      
      facets.forEach(facet => {
        const allOptions = facet.options.map(o => 
          facet.field === "priority" ? o.value.replace("P", "") : o.value
        )
        
        // Check for both regular and negated versions
        const regularKey = facet.field
        const negatedKey = `-${facet.field}`
        
        if (externalFilters[negatedKey]) {
          // Negated: all except these values
          const excludedValues = externalFilters[negatedKey]
          reconstructedFilters[facet.field] = allOptions.filter(v => !excludedValues.includes(v))
        } else if (externalFilters[regularKey]) {
          // Regular: only these values
          reconstructedFilters[facet.field] = externalFilters[regularKey]
        } else {
          // Not in filters: assume all selected
          reconstructedFilters[facet.field] = allOptions
        }
      })
      
      isUpdatingFromExternal.current = true
      setSelectedFilters(reconstructedFilters)
    }
  }, [externalFilters, facets])

  useEffect(() => {
    // Don't notify parent if we're updating from external filters
    if (isUpdatingFromExternal.current) {
      isUpdatingFromExternal.current = false
      return
    }
    
    if (initialized) {
      // Calculate optimized filters for search bar display
      const optimizedFilters: Record<string, string[]> = {}
      
      facets.forEach(facet => {
        const allOptions = facet.options.map(o => 
          facet.field === "priority" ? o.value.replace("P", "") : o.value
        )
        const selectedValues = selectedFilters[facet.field] || []
        
        const totalCount = allOptions.length
        const selectedCount = selectedValues.length
        const unselectedCount = totalCount - selectedCount
        
        // Only add to filters if not all selected
        if (selectedCount > 0 && selectedCount < totalCount) {
          // Use inclusion if fewer items selected, exclusion if fewer items unselected
          if (selectedCount <= unselectedCount) {
            // Include: show selected items
            optimizedFilters[facet.field] = selectedValues
          } else {
            // Exclude: show unselected items with negation
            const unselectedValues = allOptions.filter(v => !selectedValues.includes(v))
            optimizedFilters[`-${facet.field}`] = unselectedValues
          }
        }
        // If all selected or none selected, don't add to filters (implicit all)
      })
      
      onFiltersChange?.(optimizedFilters)
    }
  }, [selectedFilters, onFiltersChange, initialized, facets])

  const toggleFacet = (field: string) => {
    const newExpanded = new Set(expandedFacets)
    if (newExpanded.has(field)) {
      newExpanded.delete(field)
    } else {
      newExpanded.add(field)
    }
    setExpandedFacets(newExpanded)
  }

  const toggleFilter = (field: string, value: string) => {
    const currentValues = selectedFilters[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    if (newValues.length === 0) {
      const { [field]: _, ...rest } = selectedFilters
      setSelectedFilters(rest)
    } else {
      setSelectedFilters({ ...selectedFilters, [field]: newValues })
    }
  }

  const selectAll = (field: string, values: string[]) => {
    setSelectedFilters({ ...selectedFilters, [field]: values })
  }

  const selectOnly = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: [value] })
  }

  const isFilterSelected = (field: string, value: string) => {
    return selectedFilters[field]?.includes(value) || false
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
  }

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((sum, values) => sum + values.length, 0)
  }

  if (loading) {
    return (
      <div className={`transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-64 pr-6'}`}>
        {!isCollapsed && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 h-full">
            <p className="text-xs text-slate-400">Loading filters...</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full transition-all duration-300 relative ${isCollapsed ? 'w-0' : 'w-64 pr-6'}`}>
      {!isCollapsed && (
        <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {facets.map((facet) => (
              <div key={facet.field} className="border-b border-slate-100 last:border-b-0">
                <button
                  onClick={() => toggleFacet(facet.field)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {facet.label}
                  </span>
                  {expandedFacets.has(facet.field) ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {expandedFacets.has(facet.field) && (
                  <div className="px-4 pb-3 space-y-2">
                    {/* Select All option */}
                    <label className="flex items-center gap-2 cursor-pointer group hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors">
                      <Checkbox
                        checked={facet.options.every(o => {
                          const val = facet.field === "priority" ? o.value.replace("P", "") : o.value
                          return isFilterSelected(facet.field, val)
                        })}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const allValues = facet.options.map(o => 
                              facet.field === "priority" ? o.value.replace("P", "") : o.value
                            )
                            selectAll(facet.field, allValues)
                          } else {
                            // Unselect all by removing the field from filters
                            const { [facet.field]: _, ...rest } = selectedFilters
                            setSelectedFilters(rest)
                          }
                        }}
                        className="border-slate-300"
                      />
                      <span className="text-xs text-red-600 font-semibold flex-1 group-hover:text-red-700">
                        Select all
                      </span>
                    </label>
                    
                    {facet.options.map((option) => {
                      const actualValue = facet.field === "priority" ? option.value.replace("P", "") : option.value
                      return (
                        <div
                          key={option.value}
                          className="flex items-center gap-2 group hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition-colors"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <Checkbox
                              checked={isFilterSelected(facet.field, actualValue)}
                              onCheckedChange={() => toggleFilter(facet.field, actualValue)}
                              className="border-slate-300"
                            />
                            <span className="text-xs text-slate-600 flex-1 group-hover:text-slate-900">
                              {option.value}
                            </span>
                          </label>
                          <button
                            onClick={() => selectOnly(facet.field, actualValue)}
                            className="text-[10px] text-red-600 hover:text-red-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity px-1"
                          >
                            only
                          </button>
                          <span className="text-xs text-slate-400 font-mono">
                            {option.count}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {getActiveFilterCount() > 0 && (
            <div className="p-4 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{getActiveFilterCount()}</span> filter{getActiveFilterCount() !== 1 ? "s" : ""} active
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
