"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart3, Users, Clock, Filter, ArrowUpDown, Loader2 } from "lucide-react"
import type { Pattern } from "@/lib/types"

interface TopPatternsCardProps {
  filters?: Record<string, string[]>
  title?: string
}

export function TopPatternsCard({ 
  filters = {}, 
  title = "Top Patterns" 
}: TopPatternsCardProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'frequency' | 'priority' | 'created_at'>('frequency')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch patterns from API
  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/patterns')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.patterns) {
            setPatterns(result.patterns)
          }
        }
      } catch (error) {
        console.error('Error fetching patterns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatterns()
  }, [])

  // Filter and sort patterns
  const filteredAndSortedPatterns = (patterns || [])
    .filter(pattern => {
      // Apply filters if any
      return Object.keys(filters).length === 0 || 
             Object.entries(filters).every(([filterKey, filterValues]) => {
               if (filterValues.length === 0) return true
               // Add your filtering logic here based on your data structure
               return true
             })
    })
    .sort((a, b) => {
      let compareValue = 0
      switch (sortBy) {
        case 'frequency':
          compareValue = a.frequency - b.frequency
          break
        case 'priority':
          compareValue = a.priority - b.priority
          break
        case 'created_at':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortOrder === 'desc' ? -compareValue : compareValue
    })
    .slice(0, 6) // Show top 6 patterns (2x3 grid)

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-2xl shadow-red-500/40"
    if (priority >= 3) return "bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white shadow-2xl shadow-orange-500/40"
    if (priority >= 2) return "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-white shadow-2xl shadow-amber-500/40"
    return "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-2xl shadow-emerald-500/40"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return "N/A"
    }
  }

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-white via-slate-50/50 to-red-50/30 border-slate-200/60 shadow-2xl shadow-slate-200/20 backdrop-blur-sm">
      <CardHeader className="pb-6 px-6 pt-6 border-b border-slate-200/40 bg-gradient-to-r from-red-50/50 to-rose-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-sm"></div>
            <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
            <Badge variant="outline" className="text-xs font-medium text-red-600 border-red-300/60 bg-red-50/50 px-3 py-1">
              Top {filteredAndSortedPatterns.length}
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button
              variant={sortBy === 'frequency' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSort('frequency')}
              className={`flex items-center gap-2 h-9 text-xs px-4 font-medium transition-all duration-200 ${
                sortBy === 'frequency' 
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30' 
                  : 'hover:bg-red-50 text-slate-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Frequency
            </Button>
            <Button
              variant={sortBy === 'priority' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSort('priority')}
              className={`flex items-center gap-2 h-9 text-xs px-4 font-medium transition-all duration-200 ${
                sortBy === 'priority' 
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30' 
                  : 'hover:bg-red-50 text-slate-600'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Priority
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-rose-200 flex items-center justify-center shadow-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                </div>
                <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-500/10 animate-ping"></div>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-slate-700 mb-1">Loading patterns...</p>
                <p className="text-sm text-slate-500">Analyzing data trends</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 overflow-y-auto h-full py-2" style={{ maxHeight: 'calc(100% - 12px)' }}>
            {filteredAndSortedPatterns.map((pattern, index) => (
            <Card key={pattern.id} className="group relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 border-slate-200/60 hover:border-red-300/60 hover:shadow-2xl hover:shadow-slate-200/20 transition-all duration-300 rounded-3xl backdrop-blur-sm">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.04),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#fef2f2_1px,transparent_1px),linear-gradient(to_bottom,#fef2f2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative p-4">
                {/* Header with ranking and priority */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-slate-300/60 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <span className="text-sm font-bold text-slate-700">{index + 1}</span>
                    </div>
                    <Badge className={`text-xs px-3 py-1 font-bold shadow-lg border-0 ${getPriorityColor(pattern.priority)}`}>
                      P{pattern.priority}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent">
                      {pattern.frequency}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">occurrences</div>
                  </div>
                </div>
                
                {/* Pattern title */}
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-4 min-h-[2.5rem] group-hover:text-red-900 transition-colors duration-300">
                  {pattern.title}
                </h4>
                
                {/* Footer stats with enhanced styling */}
                <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-600">{pattern.incidentIds?.length || 0}</span>
                      <span className="text-slate-400">incidents</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-500">{formatDate(pattern.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced hover effect */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-red-400/0 group-hover:ring-red-400/20 transition-all duration-300"></div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-b-3xl"></div>
            </Card>
          ))}
          
            {filteredAndSortedPatterns.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-xl border border-slate-300/60">
                  <BarChart3 className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-4">No patterns found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">No patterns are currently available or all have been filtered out. Try adjusting your criteria to discover insights.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}