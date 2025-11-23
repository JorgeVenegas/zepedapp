"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Loader2, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import type { Incident } from "@/lib/types"

interface RecordsTimeseriesChartProps {
  variant?: "default" | "sample"
  filters?: Record<string, string[]>
  groupBy?: string
  dateRange?: string
  className?: string
}

export function RecordsTimeseriesChart({ 
  variant = "default", 
  filters, 
  groupBy = "severity", 
  dateRange,
  className 
}: RecordsTimeseriesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})

  const sampleData = [
    { time: "2025-01-01", High: 12, Medium: 35, Low: 22 },
    { time: "2025-02-01", High: 18, Medium: 42, Low: 28 },
    { time: "2025-03-01", High: 15, Medium: 38, Low: 25 },
    { time: "2025-04-01", High: 22, Medium: 48, Low: 32 },
    { time: "2025-05-01", High: 19, Medium: 45, Low: 29 },
    { time: "2025-06-01", High: 25, Medium: 52, Low: 35 },
  ]

  const sampleConfig: ChartConfig = {
    High: {
      label: "High",
      color: "#ef4444"
    },
    Medium: {
      label: "Medium", 
      color: "#f59e0b"
    },
    Low: {
      label: "Low",
      color: "#10b981"
    }
  }

  useEffect(() => {
    if (variant === "sample") {
      setData(sampleData)
      setChartConfig(sampleConfig)
      setLoading(false)
    } else {
      fetchData()
    }
  }, [variant, filters, groupBy, dateRange])

  const generateCategoryColors = (categories: string[]) => {
    const config: ChartConfig = {}
    const modernColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
      '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7'
    ]
    
    categories.forEach((cat, idx) => {
      config[cat] = {
        label: cat,
        color: modernColors[idx % modernColors.length]
      }
    })
    
    return config
  }

  const processDataForTimeseries = (incidents: Incident[], groupBy: string) => {
    const timeGroups = new Map<string, Map<string, number>>()
    
    incidents.forEach(incident => {
      const date = new Date(incident.created_at || '').toISOString().split('T')[0]
      const groupValue = incident[groupBy as keyof Incident]?.toString() || 'Unknown'
      
      if (!timeGroups.has(date)) {
        timeGroups.set(date, new Map())
      }
      
      const dateGroup = timeGroups.get(date)!
      dateGroup.set(groupValue, (dateGroup.get(groupValue) || 0) + 1)
    })

    // Convert to array and sort by date
    const result = Array.from(timeGroups.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, groups]) => {
        const entry: any = { time: date }
        groups.forEach((count, group) => {
          entry[group] = count
        })
        return entry
      })

    return result
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        pageSize: "10000"
      })

      if (dateRange) {
        params.append('dateRange', dateRange)
      }

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
        const processedData = processDataForTimeseries(incidents, groupBy)
        setData(processedData)
        
        // Generate colors for categories
        const allCategories = new Set<string>()
        processedData.forEach((point: any) => {
          Object.keys(point).forEach(key => {
            if (key !== 'time') {
              allCategories.add(key)
            }
          })
        })
        
        const config = generateCategoryColors(Array.from(allCategories))
        setChartConfig(config)
      }
    } catch (error) {
      console.error("Error fetching timeseries data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={`flex flex-col h-full ${className}`}>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Records Timeseries
          </CardTitle>
          <CardDescription className="text-xs mt-1">Incidents over time by {groupBy}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading chart data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className={`flex flex-col h-full ${className}`}>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Records Timeseries
          </CardTitle>
          <CardDescription className="text-xs mt-1">Incidents over time by {groupBy}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  // Get all unique categories for consistent area ordering
  const allCategories = Array.from(new Set(
    data.flatMap(point => Object.keys(point).filter(key => key !== 'time'))
  )).sort()

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          Records Timeseries
        </CardTitle>
        <CardDescription className="text-xs mt-1">Incidents over time by {groupBy}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <div className="h-full w-full px-4 pb-4">
          <ChartContainer config={chartConfig} className="h-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <AreaChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 20 }}>
                <defs>
                  {allCategories.map((category) => (
                    <linearGradient key={category} id={`fill${category}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={chartConfig[category]?.color}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartConfig[category]?.color}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => {
                    const date = new Date(value as string)
                    return date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {allCategories.map((category) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stackId="1"
                    stroke={chartConfig[category]?.color}
                    fill={`url(#fill${category})`}
                    strokeWidth={1.5}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}