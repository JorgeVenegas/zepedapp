"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { RecordsTable } from "@/components/records/records-table"
import { RecordsFilters } from "@/components/records/records-filters"
import { RecordsFilterPanel } from "@/components/records/records-filter-panel"
import { RecordsGraphics } from "@/components/records/records-graphics"
import { RecordsPatterns } from "@/components/records/records-patterns"

interface FilterOption {
  value: string
  count: number
}

interface FacetGroup {
  field: string
  label: string
  options: FilterOption[]
}
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
  const [unifiedFilters, setUnifiedFilters] = useState<Record<string, string[]>>({})
  const [isActionMenuCollapsed, setIsActionMenuCollapsed] = useState(false)
  const [facets, setFacets] = useState<FacetGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [visualizationMode, setVisualizationMode] = useState<'records' | 'patterns' | 'graphic'>('records')
  const [graphicType, setGraphicType] = useState<'timeseries' | 'topN' | 'barChart' | 'pieChart'>('timeseries')
  const [groupBy, setGroupBy] = useState<string>('service')
  const [totalCount, setTotalCount] = useState<number>(0)
  const [dateRange, setDateRange] = useState<string>("Last 7 days")

  // Convert optimized filters (with negations) to actual filter values for API
  const actualFilters = useMemo(() => {
    const result: Record<string, string[]> = {}
    
    Object.entries(unifiedFilters).forEach(([key, values]) => {
      if (key.startsWith('-')) {
        // Negated filter: get all values except the excluded ones
        const field = key.substring(1)
        const facet = facets.find(f => f.field === field)
        if (facet) {
          const allValues = facet.options.map(o => 
            field === "priority" ? o.value.replace("P", "") : o.value
          )
          const excludedValues = values.map(v => v.startsWith('-') ? v.substring(1) : v)
          result[field] = allValues.filter(v => !excludedValues.includes(v))
        }
      } else {
        // Regular inclusion filter
        result[key] = values
      }
    })
    
    return result
  }, [unifiedFilters, facets])

  useEffect(() => {
    fetchFacets()
  }, [dateRange])

  const fetchFacets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pageSize: "10000"
      })

      // Add date range filter
      if (dateRange) {
        params.append('dateRange', dateRange)
      }

      // Don't apply other filters to facets - show all available options
      const response = await fetch(`/api/records?${params}`)
      const result = await response.json()

      if (result.success) {
        const incidents = result.data

        // Calculate facets with counts
        const serviceCounts: Record<string, number> = {}
        const sourceCounts: Record<string, number> = {}
        const categoryCounts: Record<string, number> = {}
        const subserviceCounts: Record<string, number> = {}
        const priorityCounts: Record<string, number> = {}

        incidents.forEach((incident: any) => {
          if (incident.service) serviceCounts[incident.service] = (serviceCounts[incident.service] || 0) + 1
          if (incident.source) sourceCounts[incident.source] = (sourceCounts[incident.source] || 0) + 1
          if (incident.category) categoryCounts[incident.category] = (categoryCounts[incident.category] || 0) + 1
          if (incident.subservice) subserviceCounts[incident.subservice] = (subserviceCounts[incident.subservice] || 0) + 1
          if (incident.priority) priorityCounts[`P${incident.priority}`] = (priorityCounts[`P${incident.priority}`] || 0) + 1
        })

        const createFacet = (field: string, label: string, counts: Record<string, number>): FacetGroup => ({
          field,
          label,
          options: Object.entries(counts)
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10) // Show top 10
        })

        setFacets([
          createFacet("service", "Service", serviceCounts),
          createFacet("source", "Source", sourceCounts),
          createFacet("category", "Category", categoryCounts),
          createFacet("subservice", "Subservice", subserviceCounts),
          createFacet("priority", "Priority", priorityCounts),
        ])
        
        setTotalCount(incidents.length)
      }
    } catch (error) {
      console.error("Failed to fetch facets:", error)
    } finally {
      setLoading(false)
    }
  }

  // Extract filter options from facets for the search bar (memoized to prevent re-renders)
  const availableOptions = useMemo(() => ({
    services: facets.find(f => f.field === "service")?.options.map(o => o.value) || [],
    sources: facets.find(f => f.field === "source")?.options.map(o => o.value) || [],
    categories: facets.find(f => f.field === "category")?.options.map(o => o.value) || [],
    subservices: facets.find(f => f.field === "subservice")?.options.map(o => o.value) || [],
  }), [facets])

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 pb-4">
        <RecordsFilters 
          onFiltersChange={setUnifiedFilters} 
          onToggleActionMenu={() => setIsActionMenuCollapsed(!isActionMenuCollapsed)}
          isActionMenuCollapsed={isActionMenuCollapsed}
          availableOptions={availableOptions}
          visualizationMode={visualizationMode}
          onVisualizationModeChange={setVisualizationMode}
          graphicType={graphicType}
          onGraphicTypeChange={setGraphicType}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          externalFilters={unifiedFilters}
        />
      </div>
      <div className="flex-1 flex overflow-hidden px-6 pb-6">
        <RecordsFilterPanel 
          onFiltersChange={setUnifiedFilters} 
          isCollapsed={isActionMenuCollapsed}
          facets={facets}
          loading={loading}
          selectedFilters={unifiedFilters}
        />
        <div className="flex-1 overflow-hidden">
          {visualizationMode === 'records' ? (
            <RecordsTable 
              filters={actualFilters} 
              totalCount={totalCount}
              onToggleActionMenu={() => setIsActionMenuCollapsed(!isActionMenuCollapsed)}
              isActionMenuCollapsed={isActionMenuCollapsed}
              dateRange={dateRange}
              onTotalCountChange={setTotalCount}
            />
          ) : visualizationMode === 'patterns' ? (
            <RecordsPatterns filters={actualFilters} dateRange={dateRange} />
          ) : (
            <RecordsGraphics filters={actualFilters} graphicType={graphicType} groupBy={groupBy} dateRange={dateRange} />
          )}
        </div>
      </div>
    </div>
  )
}
