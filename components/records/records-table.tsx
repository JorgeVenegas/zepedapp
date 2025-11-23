"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Loader2 } from "lucide-react"
import { Incident } from "@/lib/types"

interface RecordsTableProps {
  filters?: Record<string, string[]>
  totalCount?: number
  onToggleActionMenu?: () => void
  isActionMenuCollapsed?: boolean
  dateRange?: string
  onTotalCountChange?: (count: number) => void
}

export function RecordsTable({ filters, totalCount, onToggleActionMenu, isActionMenuCollapsed, dateRange, onTotalCountChange }: RecordsTableProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const observerTarget = useRef<HTMLDivElement>(null)
  const pageSize = 50

  // Reset when filters change
  useEffect(() => {
    setIncidents([])
    setPage(1)
    setHasMore(true)
  }, [filters, dateRange])

  const fetchIncidents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      // Add date range filter
      if (dateRange) {
        params.append('dateRange', dateRange)
      }

      // Add multiple values for each filter field
      if (filters) {
        Object.entries(filters).forEach(([key, values]) => {
          if (values.length > 0) {
            params.append(key, values.join(','))
          }
        })
      }

      const response = await fetch(`/api/records?${params}`)
      const result = await response.json()

      if (result.success) {
        const newIncidents = result.data
        
        if (page === 1) {
          setIncidents(newIncidents)
        } else {
          setIncidents(prev => [...prev, ...newIncidents])
        }
        
        // Update total count from filtered results
        if (onTotalCountChange && result.pagination.total !== undefined) {
          onTotalCountChange(result.pagination.total)
        }
        
        // Check if there are more pages
        setHasMore(page < result.pagination.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    } finally {
      setLoading(false)
    }
  }, [filters, page, dateRange, onTotalCountChange])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    if (priority === 2) return "bg-green-500/10 text-green-600 dark:text-green-400"
    if (priority === 3) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    if (priority === 4) return "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    return "bg-red-500/10 text-red-600 dark:text-red-400"
  }

  if (loading && incidents.length === 0) {
    return (
      <Card className="bg-card border-border p-8 text-center h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-muted-foreground">Loading incidents...</p>
        </div>
      </Card>
    )
  }

  if (incidents.length === 0 && !loading) {
    return (
      <Card className="bg-card border-border p-8 text-center h-full flex items-center justify-center">
        <p className="text-muted-foreground">No incidents found</p>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with action menu toggle and total count */}
      {onToggleActionMenu && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onToggleActionMenu}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
          >
            {isActionMenuCollapsed ? "Show" : "Hide"} filters
          </button>
          {totalCount !== undefined && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
            </div>
          )}
        </div>
      )}
      
      <Card className="bg-white border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Service</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Source</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Subservice</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Summary</th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer">
                <td className="px-4 py-0 text-xs text-slate-500 whitespace-nowrap font-mono">{formatDate(incident.time)}</td>
                <td className="px-4 py-0 text-xs text-slate-900 font-medium">{incident.service}</td>
                <td className="px-4 py-0 text-xs text-slate-600">{incident.source}</td>
                <td className="px-4 py-0 text-xs text-slate-600">{incident.subservice}</td>
                <td className="px-4 py-0 text-xs text-slate-600">{incident.category}</td>
                <td className="px-4 py-0 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPriorityColor(incident.priority)}`}>
                    P{incident.priority}
                  </span>
                </td>
                <td className="px-4 py-0 text-xs text-slate-600 max-w-md truncate">{incident.summary}</td>
                <td className="px-4 py-0 text-right">
                  <Link href={`/records/${incident.id}`}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-100 rounded-full transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Intersection observer target */}
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading more...</span>
            </div>
          )}
          {!hasMore && incidents.length > 0 && (
            <p className="text-xs text-muted-foreground">No more incidents to load</p>
          )}
        </div>
      </div>
    </Card>
    </div>
  )
}
