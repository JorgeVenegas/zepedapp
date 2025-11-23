"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertCircle, Clock, Activity, Sparkles, Loader2 } from "lucide-react"

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

const getPriorityColor = (priority: number) => {
  if (priority === 1) return "bg-red-100 text-red-700 border-red-300"
  if (priority === 2) return "bg-orange-100 text-orange-700 border-orange-300"
  return "bg-yellow-100 text-yellow-700 border-yellow-300"
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
      <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm">
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-700">Generating Patterns...</h3>
            <p className="text-sm text-slate-500">
              Analyzing incidents with AI clustering algorithms
            </p>
            <p className="text-xs text-slate-400">
              This may take a moment for large datasets
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm">
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-700">Error Generating Patterns</h3>
            <p className="text-sm text-slate-500">{error}</p>
            <Button onClick={generatePatterns} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (patterns.length === 0 && hasGenerated) {
    return (
      <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm">
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <Sparkles className="w-12 h-12 text-slate-300" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-slate-700">No Patterns Found</h3>
            <p className="text-sm text-slate-500">
              Try adjusting your filters or date range to see detected patterns
            </p>
            <Button onClick={generatePatterns} className="mt-4" variant="outline">
              Regenerate Patterns
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Detected Patterns</h3>
            <p className="text-xs text-slate-500">AI-identified recurring issues and anomalies</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={generatePatterns} 
              disabled={isGenerating}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Regenerate
                </>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Total patterns:</span>
              <span className="text-lg font-bold text-slate-700">{patterns.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {patterns.map((pattern, idx) => (
          <div key={pattern.id || `pattern-${idx}`} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-mono text-slate-500">{pattern.frequency}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">{pattern.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{pattern.description}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(pattern.priority)}`}>
                    P{pattern.priority}
                  </div>
                </div>

                {pattern.incident_ids && pattern.incident_ids.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <AlertCircle className="w-3 h-3" />
                    <span>{pattern.incident_ids.length} related incidents</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          Patterns are automatically detected using AI clustering and translation for Spanish text
        </p>
      </div>
    </Card>
  )
}
