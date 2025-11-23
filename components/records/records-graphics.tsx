"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { BarChart3, TrendingUp, Table2, PieChart, Loader2, Maximize2, Save, X } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, Pie, PieChart as RechartsPieChart, Cell, Treemap, ResponsiveContainer, Line, LineChart } from 'recharts'
import { NestedPieChart } from "@/components/dashboard/charts/nested-pie-chart"
import type { Incident } from "@/lib/types"

interface RecordsGraphicsProps {
  filters?: Record<string, string[]>
  graphicType: 'timeseries' | 'topN' | 'barChart' | 'pieChart' | 'areaChart' | 'treemap' | 'lineChart'
  groupBy: string
  dateRange?: string
  onToggleActionMenu?: () => void
  isActionMenuCollapsed?: boolean
  showControls?: boolean
}

interface TooltipData {
  content: string
  x: number
  y: number
  show: boolean
}

export function RecordsGraphics({ filters, graphicType, groupBy, dateRange, onToggleActionMenu, isActionMenuCollapsed, showControls = true }: RecordsGraphicsProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [graphicName, setGraphicName] = useState("")
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [tooltip, setTooltip] = useState<TooltipData>({ content: "", x: 0, y: 0, show: false })

  // Helper to format groupBy label
  const getGroupByLabel = (groupBy: string) => {
    if (groupBy.includes(',')) {
      return groupBy.split(',').map(field => 
        field.charAt(0).toUpperCase() + field.slice(1)
      ).join(' → ')
    }
    return groupBy.charAt(0).toUpperCase() + groupBy.slice(1)
  }

  // Helper to generate better colors for categories
  const generateCategoryColors = (categories: string[], isNested: boolean) => {
    const chartConfig: ChartConfig = {}
    
    // More distinct modern colors with better contrast
    const modernColors = [
      '#3b82f6', // Bright Blue
      '#ef4444', // Bright Red
      '#10b981', // Bright Green
      '#f59e0b', // Bright Amber
      '#8b5cf6', // Bright Purple
      '#ec4899', // Bright Pink
      '#14b8a6', // Bright Teal
      '#f97316', // Bright Orange
      '#6366f1', // Indigo
      '#84cc16', // Lime
      '#06b6d4', // Cyan
      '#a855f7', // Violet
      '#eab308', // Yellow
      '#f43f5e', // Rose
      '#22c55e', // Emerald
      '#0ea5e9', // Sky Blue
    ]
    
    if (!isNested) {
      // Simple single grouping - use distinct colors with high contrast
      categories.forEach((cat, idx) => {
        const color = modernColors[idx % modernColors.length]
        chartConfig[cat] = {
          label: cat,
          color: color
        }
      })
    } else {
      // Nested grouping - assign distinct base colors per primary group
      const primaryGroups = new Map<string, string[]>()
      
      // Group by primary category
      categories.forEach(cat => {
        if (!cat || typeof cat !== 'string') return // Safety check
        const primary = cat.split(' - ')[0]
        if (!primaryGroups.has(primary)) {
          primaryGroups.set(primary, [])
        }
        primaryGroups.get(primary)!.push(cat)
      })
      
      // Assign distinct base color per primary group
      const primaryArray = Array.from(primaryGroups.keys()).sort()
      primaryArray.forEach((primary, primaryIdx) => {
        const baseColor = modernColors[primaryIdx % modernColors.length]
        const subCategories = primaryGroups.get(primary)!
        
        // For subcategories, create clear variations using opacity and brightness
        subCategories.forEach((cat, subIdx) => {
          // Convert hex to RGB
          const r = parseInt(baseColor.slice(1, 3), 16)
          const g = parseInt(baseColor.slice(3, 5), 16)
          const b = parseInt(baseColor.slice(5, 7), 16)
          
          // Create distinct variations
          let finalColor: string
          if (subCategories.length === 1) {
            finalColor = baseColor
          } else {
            // Mix with white/black for variations
            const ratio = subIdx / Math.max(subCategories.length - 1, 1)
            if (ratio < 0.5) {
              // Lighten (mix with white)
              const mixRatio = ratio * 2
              const newR = Math.round(r + (255 - r) * mixRatio * 0.6)
              const newG = Math.round(g + (255 - g) * mixRatio * 0.6)
              const newB = Math.round(b + (255 - b) * mixRatio * 0.6)
              finalColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
            } else {
              // Darken (mix with black)
              const mixRatio = (ratio - 0.5) * 2
              const newR = Math.round(r * (1 - mixRatio * 0.5))
              const newG = Math.round(g * (1 - mixRatio * 0.5))
              const newB = Math.round(b * (1 - mixRatio * 0.5))
              finalColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
            }
          }
          
          chartConfig[cat] = {
            label: cat,
            color: finalColor
          }
        })
      })
    }
    
    return chartConfig
  }

  // Helper to get color for a category (handles CSS variable issues)
  const getCategoryColor = (chartConfig: ChartConfig, category: string, fallbackIdx: number = 0) => {
    return chartConfig[category]?.color || `hsl(${fallbackIdx * 50}, 70%, 55%)`
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchData()
  }, [filters, graphicType, groupBy, dateRange])

  // ESC key handler for fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pageSize: "10000"
      })

      // Add date range filter
      if (dateRange) {
        params.append('dateRange', dateRange)
      }

      // Add filters
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
        const incidents = result.data
        setTotalCount(incidents.length)
        const processedData = processDataForChart(incidents, graphicType, groupBy)
        setData(processedData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processDataForChart = (incidents: any[], type: string, groupField: string) => {
    // Check if we have nested grouping (e.g., "priority,service")
    const groupFields = groupField.includes(',') ? groupField.split(',') : [groupField]
    const isNestedGrouping = groupFields.length > 1
    
    if (type === 'timeseries' || type === 'areaChart' || type === 'lineChart') {
      // Determine time granularity based on data range
      const dates = incidents.map(i => new Date(i.time)).sort((a, b) => a.getTime() - b.getTime())
      if (dates.length === 0) return []
      
      const firstDate = dates[0]
      const lastDate = dates[dates.length - 1]
      const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Choose grouping strategy
      let timeKey: (date: Date) => string
      let sortKey: (timeStr: string) => string
      
      if (daysDiff <= 2) {
        // Group by hour for very short ranges
        timeKey = (date) => `${String(date.getHours()).padStart(2, '0')}:00`
        sortKey = (time) => time.padStart(5, '0')
      } else if (daysDiff <= 31) {
        // Group by day for ranges up to a month
        timeKey = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        sortKey = (time) => time
      } else if (daysDiff <= 365) {
        // Group by week for ranges up to a year
        timeKey = (date) => {
          const startOfWeek = new Date(date)
          startOfWeek.setDate(date.getDate() - date.getDay())
          return startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
        sortKey = (time) => time
      } else {
        // Group by month for longer ranges
        timeKey = (date) => date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        sortKey = (time) => time
      }
      
      const timeData: Record<string, Record<string, number>> = {}
      const allCategories = new Set<string>()
      
      incidents.forEach(incident => {
        const date = new Date(incident.time)
        const timeLabel = timeKey(date)
        
        // Build nested group label
        let groupValue: string
        if (isNestedGrouping) {
          const parts = groupFields.map(field => {
            const val = incident[field] || 'Unknown'
            return field === 'priority' ? `P${val}` : val
          })
          groupValue = parts.join(' - ')
        } else {
          groupValue = incident[groupFields[0]] || 'Unknown'
          if (groupFields[0] === 'priority') groupValue = `P${groupValue}`
        }
        
        allCategories.add(groupValue)
        
        if (!timeData[timeLabel]) {
          timeData[timeLabel] = {}
        }
        timeData[timeLabel][groupValue] = (timeData[timeLabel][groupValue] || 0) + 1
      })

      // Generate complete time range with gaps filled
      const allTimeLabels: string[] = []
      let currentDate = new Date(firstDate)
      
      while (currentDate <= lastDate) {
        const timeLabel = timeKey(currentDate)
        if (!allTimeLabels.includes(timeLabel)) {
          allTimeLabels.push(timeLabel)
        }
        
        // Increment based on granularity
        if (daysDiff <= 2) {
          currentDate.setHours(currentDate.getHours() + 1)
        } else if (daysDiff <= 31) {
          currentDate.setDate(currentDate.getDate() + 1)
        } else if (daysDiff <= 365) {
          currentDate.setDate(currentDate.getDate() + 7)
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1)
        }
      }

      // Fill gaps with zero values for continuous data
      const completeTimeData = allTimeLabels.map(timeLabel => {
        const dataPoint: Record<string, any> = { time: timeLabel }
        
        // Initialize all categories with zero
        allCategories.forEach(category => {
          dataPoint[category] = timeData[timeLabel]?.[category] || 0
        })
        
        return dataPoint
      })

      // Sort chronologically
      return completeTimeData.sort((a, b) => {
        if (daysDiff <= 2) {
          return a.time.localeCompare(b.time)
        } else {
          return new Date(a.time).getTime() - new Date(b.time).getTime()
        }
      })
    }

    if (type === 'topN' || type === 'barChart') {
      const counts: Record<string, number> = {}
      
      incidents.forEach(incident => {
        // Build nested group label
        let value: string
        if (isNestedGrouping) {
          const parts = groupFields.map(field => {
            const val = incident[field] || 'Unknown'
            return field === 'priority' ? `P${val}` : val
          })
          value = parts.join(' - ')
        } else {
          value = incident[groupFields[0]] || 'Unknown'
          if (groupFields[0] === 'priority') value = `P${value}`
        }
        counts[value] = (counts[value] || 0) + 1
      })

      const total = incidents.length
      return Object.entries(counts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: ((count / total) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count)
    }

    if (type === 'pieChart' || type === 'treemap') {
      const counts: Record<string, number> = {}
      
      incidents.forEach(incident => {
        // Build nested group label
        let value: string
        if (isNestedGrouping) {
          const parts = groupFields.map(field => {
            const val = incident[field] || 'Unknown'
            return field === 'priority' ? `P${val}` : val
          })
          value = parts.join(' - ')
        } else {
          value = incident[groupFields[0]] || 'Unknown'
          if (groupFields[0] === 'priority') value = `P${value}`
        }
        counts[value] = (counts[value] || 0) + 1
      })

      const total = incidents.length
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / total) * 100).toFixed(1)
      }))
    }

    return []
  }

  const handleSaveGraphic = async () => {
    if (!graphicName.trim()) {
      alert("Please enter a name for the graphic")
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/graphics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: graphicName,
          type: graphicType,
          groupBy,
          filters,
          dateRange,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Graphic saved successfully!")
        setShowSaveModal(false)
        setGraphicName("")
      } else {
        alert("Failed to save graphic: " + result.error)
      }
    } catch (error) {
      console.error("Error saving graphic:", error)
      alert("Failed to save graphic")
    } finally {
      setSaving(false)
    }
  }

  const renderGraphicControls = () => (
    showControls ? (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveModal(true)}
          className="rounded-full shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Graphic
        </Button>
      </div>
    ) : null
  )

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <Card className="bg-white border border-slate-200 flex-1 flex items-center justify-center shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Loading chart data...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <Card className="bg-white border border-slate-200 flex-1 flex items-center justify-center shadow-sm">
          <p className="text-sm text-slate-500">No data available</p>
        </Card>
      </div>
    )
  }

  if (graphicType === 'timeseries') {
    // Collect all unique categories for consistent color mapping
    const allCategories = new Set<string>()
    data.forEach((point: any) => {
      Object.keys(point).forEach(key => {
        if (key !== 'time') {
          allCategories.add(key)
        }
      })
    })
    const categoryArray = Array.from(allCategories).sort()
    const isNested = groupBy.includes(',')
    
    // Create chart config with improved colors
    const chartConfig = generateCategoryColors(categoryArray, isNested)

    const chartContent = (
      <Card className={`bg-white shadow-sm flex flex-col ${isFullscreen ? 'h-screen border-0 rounded-none overflow-auto' : 'h-full border border-slate-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-700">Incidents Over Time</CardTitle>
            <CardDescription className="text-xs text-slate-500">Grouped by {getGroupByLabel(groupBy)}</CardDescription>
          </div>
          {renderGraphicControls()}
        </CardHeader>
        <CardContent className="flex-1 pb-0 min-h-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 50, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              {categoryArray.map((category, idx) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="a"
                  fill={getCategoryColor(chartConfig, category, idx)}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )

    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isFullscreen && mounted && createPortal(
            <div className="fixed inset-0 z-[9997] bg-white overflow-auto">
              {chartContent}
            </div>,
            document.body
          )}
          {!isFullscreen && chartContent}
        </div>
        
        {/* Tooltip */}
        {tooltip.show && mounted && createPortal(
          <div
            className="fixed z-[10000] pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl mb-2 whitespace-pre-line">
              {tooltip.content}
            </div>
          </div>,
          document.body
        )}
        
        {/* Save Modal */}
        {showSaveModal && mounted && createPortal(
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setShowSaveModal(false)}
            />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Save Graphic</h2>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Graphic Name
                    </label>
                    <Input
                      type="text"
                      value={graphicName}
                      onChange={(e) => setGraphicName(e.target.value)}
                      placeholder="e.g., Metro Incidents by Hour"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                    <p className="text-slate-600"><span className="font-semibold">Type:</span> {graphicType}</p>
                    <p className="text-slate-600"><span className="font-semibold">Group by:</span> {groupBy}</p>
                    <p className="text-slate-600"><span className="font-semibold">Date range:</span> {dateRange}</p>
                    {filters && Object.keys(filters).length > 0 && (
                      <p className="text-slate-600"><span className="font-semibold">Filters:</span> {Object.keys(filters).length} active</p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end rounded-b-3xl">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveModal(false)}
                    disabled={saving}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGraphic}
                    disabled={saving || !graphicName.trim()}
                    className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    )
  }

  if (graphicType === 'topN') {
    const chartContent = (
      <Card className={`bg-white overflow-auto shadow-sm ${isFullscreen ? 'h-screen border-0 rounded-none' : 'border border-slate-200'}`}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Top {data.length} by {getGroupByLabel(groupBy)}</h3>
            <p className="text-xs text-slate-500">Incident count distribution</p>
          </div>
          {renderGraphicControls()}
        </div>
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">{groupBy}</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Count</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">%</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {(data as any[]).map((item, idx) => (
                <tr 
                  key={idx} 
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onMouseMove={(e) => {
                    setTooltip({
                      content: `Rank #${idx + 1}: ${item.name}\n${item.count} incidents\n${item.percentage}% of total`,
                      x: e.clientX,
                      y: e.clientY,
                      show: true
                    })
                  }}
                  onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                >
                  <td className="px-4 py-3 text-xs text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-slate-600">{item.count}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-500">{item.percentage}%</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )

    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isFullscreen && mounted && createPortal(
            <div className="fixed inset-0 z-[9997] bg-white overflow-auto">
              {chartContent}
            </div>,
            document.body
          )}
          {!isFullscreen && chartContent}
        </div>
        
        {/* Tooltip */}
        {tooltip.show && mounted && createPortal(
          <div
            className="fixed z-[10000] pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl mb-2 whitespace-pre-line">
              {tooltip.content}
            </div>
          </div>,
          document.body
        )}
      </div>
    )
  }

  if (graphicType === 'barChart') {
    const isNested = groupBy.includes(',')
    const categoryArray = (data as any[]).map(item => item.name)
    
    // Create chart config with improved colors
    const chartConfig = generateCategoryColors(categoryArray, isNested)
    
    const chartContent = (
      <Card className={`bg-white overflow-auto shadow-sm ${isFullscreen ? 'h-screen border-0 rounded-none' : 'h-full border border-slate-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-700">Incidents by {getGroupByLabel(groupBy)}</CardTitle>
            <CardDescription className="text-xs text-slate-500">Distribution across categories</CardDescription>
          </div>
          {renderGraphicControls()}
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis type="number" className="text-xs" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={90}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                radius={[0, 4, 4, 0]}
              >
                {(data as any[]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color || `hsl(${index * 45}, 70%, 55%)`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )

    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isFullscreen && mounted && createPortal(
            <div className="fixed inset-0 z-[9997] bg-white overflow-auto">
              {chartContent}
            </div>,
            document.body
          )}
          {!isFullscreen && chartContent}
        </div>
        
        {/* Tooltip */}
        {tooltip.show && mounted && createPortal(
          <div
            className="fixed z-[10000] pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl mb-2 whitespace-pre-line">
              {tooltip.content}
            </div>
          </div>,
          document.body
        )}
      </div>
    )
  }

  if (graphicType === 'lineChart') {
    // Collect all unique categories for consistent color mapping
    const allCategories = new Set<string>()
    data.forEach((point: any) => {
      Object.keys(point).forEach(key => {
        if (key !== 'time') {
          allCategories.add(key)
        }
      })
    })
    const categoryArray = Array.from(allCategories).sort()
    const isNested = groupBy.includes(',')
    
    // Create chart config with improved colors
    const chartConfig = generateCategoryColors(categoryArray, isNested)

    const chartContent = (
      <Card className={`bg-white shadow-sm flex flex-col ${isFullscreen ? 'h-screen border-0 rounded-none overflow-auto' : 'h-full border border-slate-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-700">Incidents Over Time</CardTitle>
            <CardDescription className="text-xs text-slate-500">Grouped by {groupBy}</CardDescription>
          </div>
          {renderGraphicControls()}
        </CardHeader>
        <CardContent className="flex-1 pb-0 min-h-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 50, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              {categoryArray.map((category, idx) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={getCategoryColor(chartConfig, category, idx)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )

    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isFullscreen && mounted && createPortal(
            <div className="fixed inset-0 z-[9997] bg-white overflow-auto p-6">
              {chartContent}
            </div>,
            document.body
          )}
          {!isFullscreen && chartContent}
        </div>
      </div>
    )
  }

  if (graphicType === 'treemap') {
    const total = (data as any[]).reduce((sum: number, item: any) => sum + (item.value || 0), 0)
    
    if (total === 0 || !data || data.length === 0) {
      return (
        <Card className="bg-white shadow-sm p-6 h-full border border-slate-200">
          <div className="flex items-center justify-center h-full text-slate-500">
            No data available for treemap
          </div>
        </Card>
      )
    }
    
    // Generate improved colors
    const isNested = groupBy.includes(',')
    const categoryArray = (data as any[]).map(item => item.name)
    const chartConfig = generateCategoryColors(categoryArray, isNested)
    
    // Format data for recharts treemap
    const treemapData = (data as any[]).map((item, idx) => ({
      name: item.name,
      size: item.value,
      value: item.value,
      percentage: item.percentage,
      fill: chartConfig[item.name]?.color || `hsl(${idx * 60}, 70%, 60%)`
    }))

    // Custom content renderer for treemap cells
    const CustomizedContent = (props: any) => {
      const { x, y, width, height, name, value, percentage } = props
      
      // Add safety checks for undefined values
      if (!name || !value || x === undefined || y === undefined || width === undefined || height === undefined) {
        return null
      }
      
      const displayName = String(name || '')
      const displayValue = String(value || '')
      const displayPercentage = String(percentage || '')
      
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: props.fill,
              stroke: '#fff',
              strokeWidth: 2,
            }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
          {width > 50 && height > 30 && (
            <>
              <text
                x={x + width / 2}
                y={y + height / 2 - 8}
                textAnchor="middle"
                fill="#fff"
                fontSize={width > 100 ? 14 : 10}
                fontWeight="bold"
              >
                {displayName.length > 20 ? displayName.substring(0, 17) + '...' : displayName}
              </text>
              <text
                x={x + width / 2}
                y={y + height / 2 + 8}
                textAnchor="middle"
                fill="#fff"
                fontSize={width > 100 ? 12 : 9}
              >
                {displayValue}
              </text>
              {width > 80 && height > 50 && (
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 24}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={9}
                  opacity={0.9}
                >
                  {displayPercentage}%
                </text>
              )}
            </>
          )}
        </g>
      )
    }

    const chartContent = (
      <Card className={`bg-white overflow-auto shadow-sm p-6 ${isFullscreen ? 'h-screen border-0 rounded-none' : 'h-full border border-slate-200'}`}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Treemap by {getGroupByLabel(groupBy)}</h3>
            <p className="text-xs text-slate-500">Size proportional to count</p>
          </div>
          {renderGraphicControls()}
        </div>
        <div className="w-full" style={{ height: isFullscreen ? 'calc(100vh - 140px)' : '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent />}
              isAnimationActive={false}
            >
              <ChartTooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                        <div className="font-semibold">{data.name}</div>
                        <div>{data.value} incident{data.value !== 1 ? 's' : ''}</div>
                        <div>{data.percentage}% of total</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </Card>
    )

    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isFullscreen && mounted && createPortal(
            <div className="fixed inset-0 z-[9997] bg-white overflow-auto p-6">
              {chartContent}
            </div>,
            document.body
          )}
          {!isFullscreen && chartContent}
        </div>
      </div>
    )
  }

  if (graphicType === 'pieChart') {
    const total = (data as any[]).reduce((sum: number, item: any) => sum + (item.value || 0), 0)
    const isNested = groupBy.includes(',')
    const categoryArray = (data as any[]).map(item => item?.name).filter(Boolean)
    
    // DEBUG: Log the incoming data
    console.log('🔍 PIE CHART DEBUG:')
    console.log('groupBy:', groupBy)
    console.log('isNested:', isNested)
    console.log('data:', data)
    console.log('total:', total)
    
    // Create chart config with improved colors
    const chartConfig = generateCategoryColors(categoryArray, isNested)

    // More distinct modern colors with better contrast
    const modernColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
      '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7',
      '#eab308', '#f43f5e', '#22c55e', '#0ea5e9'
    ]

    // Process data for nested donut chart
    let innerData: any[] = []
    let outerData: any[] = []
    let hasNestedData = false
    
    if (isNested && data.length > 0) {
      // Group data by primary category
      const primaryGroups = new Map<string, {total: number, items: any[]}>()
      
      data.forEach((item: any) => {
        if (!item || !item.name || typeof item.name !== 'string') return
        
        const parts = item.name.split(' - ')
        if (parts.length < 2) {
          // If no separator found, treat as single category
          console.log('⚠️ Skipping item without separator:', item.name)
          return
        }
        
        const primary = parts[0].trim()
        const secondary = parts[1].trim() || 'Other'
        
        if (!primaryGroups.has(primary)) {
          primaryGroups.set(primary, {total: 0, items: []})
        }
        
        const group = primaryGroups.get(primary)!
        group.total += (item.value || 0)
        group.items.push({
          name: secondary,
          fullName: item.name,
          value: item.value || 0,
          percentage: item.percentage || '0'
        })
      })
      
      if (primaryGroups.size > 0) {
        // Create inner ring data (primary categories)
        innerData = Array.from(primaryGroups.entries()).map(([name, group]) => ({
          name,
          value: group.total,
          percentage: ((group.total / Math.max(total, 1)) * 100).toFixed(1)
        }))
        
        // Outer ring is the full data
        outerData = data.filter((item: any) => {
          return item && item.name && typeof item.name === 'string' && item.name.includes(' - ')
        }).map((item: any) => ({
          ...item,
          fullName: item.name,
          primary: item.name.split(' - ')[0].trim()
        }))
        
        hasNestedData = innerData.length > 0 && outerData.length > 0
        
        // DEBUG: Log processed data
        console.log('📊 Processed nested data:')
        console.log('innerData:', innerData)
        console.log('outerData:', outerData)
        console.log('hasNestedData:', hasNestedData)
      }
    }

    const chartContent = (
      <Card className={`bg-white overflow-hidden shadow-sm flex flex-col ${isFullscreen ? 'h-screen border-0 rounded-none' : 'h-full border border-slate-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-700">Distribution by {getGroupByLabel(groupBy)}</CardTitle>
            <CardDescription className="text-xs text-slate-500">Proportional breakdown</CardDescription>
          </div>
          {renderGraphicControls()}
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          {hasNestedData ? (
            // Use Nivo for nested pie charts
            <NestedPieChart
              innerData={innerData.map((item, idx) => ({
                id: item.name,
                label: item.name,
                value: item.value,
                color: modernColors[idx % modernColors.length],
                percentage: item.percentage
              }))}
              outerData={outerData.map((item, idx) => {
                // Find the parent color to create correlation
                const parentName = item.primary || item.name.split(' - ')[0]
                const parentIndex = innerData.findIndex(inner => inner.name === parentName)
                const baseColor = parentIndex >= 0 ? modernColors[parentIndex % modernColors.length] : modernColors[idx % modernColors.length]
                
                // Create variation of parent color for visual correlation
                const colorVariations = [
                  baseColor,
                  baseColor + '80', // Add transparency
                  baseColor.replace('#', '#').slice(0, 7) + 'CC', // Different transparency
                  baseColor.replace('#', '#').slice(0, 7) + 'AA'
                ]
                
                return {
                  id: item.fullName,
                  label: item.name.split(' - ')[1] || item.name,
                  value: item.value,
                  color: getCategoryColor(chartConfig, item.name, idx) || colorVariations[idx % colorVariations.length],
                  parentId: item.primary,
                  percentage: item.percentage
                }
              })}
              height={400}
            />
          ) : (
            // Use Recharts for simple pie charts
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <ChartTooltip 
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                            <div className="font-semibold">{data.name}</div>
                            <div>{data.value} incident{data.value !== 1 ? 's' : ''}</div>
                            <div>{data.percentage}%</div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    paddingAngle={2}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    labelLine={false}
                  >
                    {(data as any[]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(chartConfig, entry.name, index)} />
                    ))}
                </Pie>
              </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {hasNestedData ? (
              /* Show both inner and outer categories */
              <>
                <div className="w-full text-center mb-2">
                  <span className="text-xs font-semibold text-slate-600">Inner Ring: Primary Categories</span>
                </div>
                {innerData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: modernColors[idx % modernColors.length] }}
                    />
                    <span className="text-xs text-slate-600">{item.name} ({item.percentage}%)</span>
                  </div>
                ))}
              </>
            ) : (
              /* Show single level categories */
              (data as any[]).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: getCategoryColor(chartConfig, item.name, idx) }}
                  />
                  <span className="text-xs text-slate-600">{item.name}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    )

    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isFullscreen && mounted && createPortal(
            <div className="fixed inset-0 z-[9997] bg-white overflow-auto">
              {chartContent}
            </div>,
            document.body
          )}
          {!isFullscreen && chartContent}
        </div>
        
        {/* Tooltip */}
        {tooltip.show && mounted && createPortal(
          <div
            className="fixed z-[10000] pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl mb-2 whitespace-pre-line">
              {tooltip.content}
            </div>
          </div>,
          document.body
        )}
      </div>
    )
  }

  if (graphicType === 'areaChart') {
    // Collect all unique categories for consistent color mapping
    const allCategories = new Set<string>()
    data.forEach((point: any) => {
      Object.keys(point).forEach(key => {
        if (key !== 'time') {
          allCategories.add(key)
        }
      })
    })
    const categoryArray = Array.from(allCategories).sort()
    const isNested = groupBy.includes(',')
    
    // Create chart config with improved colors
    const chartConfig = generateCategoryColors(categoryArray, isNested)

    const chartContent = (
      <Card className={`bg-white shadow-sm flex flex-col ${isFullscreen ? 'h-screen border-0 rounded-none overflow-auto' : 'h-full border border-slate-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-700">Incidents Over Time</CardTitle>
            <CardDescription className="text-xs text-slate-500">Grouped by {groupBy}</CardDescription>
          </div>
          {renderGraphicControls()}
        </CardHeader>
        <CardContent className="flex-1 pb-0 min-h-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 50, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              {categoryArray.map((category, idx) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="1"
                  stroke={getCategoryColor(chartConfig, category, idx)}
                  fill={getCategoryColor(chartConfig, category, idx)}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )

    return (
      <div className="h-full flex flex-col">
        {onToggleActionMenu && (
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onToggleActionMenu}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
            >
              {isActionMenuCollapsed ? "Show" : "Hide"} filters
            </button>
            {totalCount > 0 && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{totalCount.toLocaleString()}</span> total records
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isFullscreen && mounted && createPortal(
            <div className="fixed inset-0 z-[9997] bg-white overflow-auto">
              {chartContent}
            </div>,
            document.body
          )}
          {!isFullscreen && chartContent}
        </div>
        
        {/* Tooltip */}
        {tooltip.show && mounted && createPortal(
          <div
            className="fixed z-[10000] pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl mb-2 whitespace-pre-line">
              {tooltip.content}
            </div>
          </div>,
          document.body
        )}
        
        {/* Save Modal */}
        {showSaveModal && mounted && createPortal(
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setShowSaveModal(false)}
            />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Save Graphic</h2>
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Graphic Name
                    </label>
                    <Input
                      value={graphicName}
                      onChange={(e) => setGraphicName(e.target.value)}
                      placeholder="Enter a name for this graphic..."
                      className="w-full"
                    />
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Type:</span>
                      <span className="font-semibold text-slate-900 capitalize">{graphicType}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Group By:</span>
                      <span className="font-semibold text-slate-900">{groupBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Date Range:</span>
                      <span className="font-semibold text-slate-900">{dateRange || 'Last 2 years'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveModal(false)}
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGraphic}
                    disabled={!graphicName.trim() || saving}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Graphic
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    )
  }

  return null
}
