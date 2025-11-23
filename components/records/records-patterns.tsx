"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertCircle, Clock, Activity, Sparkles, Loader2, Zap } from "lucide-react"

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

  const generatePatterns = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      console.log('🔍 Generating patterns with filters:', filters, 'dateRange:', dateRange)

      const response = await fetch('/api/patterns/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: filters || {},
          dateRange: dateRange || 'Last 7 days'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate patterns')
      }

      const data = await response.json()
      console.log('✅ Generated patterns:', data.patterns)

      setPatterns(data.patterns || [])
      setHasGenerated(true)
    } catch (err) {
      console.error('❌ Error generating patterns:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-generate patterns when component mounts or filters change
  useEffect(() => {
    if (!hasGenerated) {
      generatePatterns()
    }
  }, []) // Only on mount

  // Regenerate when filters or date range change (after initial generation)
  useEffect(() => {
    if (hasGenerated) {
      generatePatterns()
    }
  }, [filters, dateRange])

  if (!hasGenerated && isGenerating) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-rose-500/20 to-red-500/20 blur-3xl animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-red-500 animate-spin relative mx-auto" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent">
              Generating Patterns
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Analyzing incidents with AI clustering algorithms
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
    </div>
  )
}
