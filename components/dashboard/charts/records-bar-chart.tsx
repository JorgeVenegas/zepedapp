"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Loader2, BarChart3 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import type { Incident } from "@/lib/types"

interface RecordsBarChartProps {
  variant?: "default" | "sample"
  filters?: Record<string, string[]>
  groupBy?: string
  dateRange?: string
  className?: string
  limit?: number
}

export function RecordsBarChart({ 
  variant = "default", 
  filters, 
  groupBy = "severity", 
  dateRange,
  className,
  limit = 10 
}: RecordsBarChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})

  const sampleData = [
    { name: "High", value: 45, fill: "#ef4444" },
    { name: "Medium", value: 89, fill: "#f59e0b" },
    { name: "Low", value: 67, fill: "#10b981" },
    { name: "Critical", value: 23, fill: "#dc2626" },
    { name: "Info", value: 156, fill: "#3b82f6" },
  ]

  const sampleConfig: ChartConfig = {
    value: {
      label: "Count",
      color: "#3b82f6"
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
  }, [variant, filters, groupBy, dateRange, limit])

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
    
    config.value = {
      label: "Count",
      color: "#3b82f6"
    }
    
    return config
  }

  const processDataForTopN = (incidents: Incident[], groupBy: string, limit: number) => {
    const counts = new Map<string, number>()
    
    incidents.forEach(incident => {
      const groupValue = incident[groupBy as keyof Incident]?.toString() || 'Unknown'
      counts.set(groupValue, (counts.get(groupValue) || 0) + 1)
    })

    // Convert to array, sort by count, and take top N
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value, fill: generateCategoryColors([name])[name]?.color }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
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
        const processedData = processDataForTopN(incidents, groupBy, limit)
        setData(processedData)
        
        const config = generateCategoryColors(processedData.map(d => d.name))
        setChartConfig(config)
      }
    } catch (error) {
      console.error("Error fetching bar chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={`flex flex-col h-full ${className}`}>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="w-4 h-4" />
            Records Distribution
          </CardTitle>
          <CardDescription className="text-xs mt-1">Top {limit} {groupBy} values</CardDescription>
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
            <BarChart3 className="w-4 h-4" />
            Records Distribution
          </CardTitle>
          <CardDescription className="text-xs mt-1">Top {limit} {groupBy} values</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`flex flex-col ${className || 'h-full'}`}>
      <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="w-4 h-4" />
          Records Distribution
        </CardTitle>
        <CardDescription className="text-xs mt-1">Top {limit} {groupBy} values</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <div className="h-full w-full px-4 pb-4" style={{ minHeight: '200px' }}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: data.length > 5 ? 50 : 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={data.length > 5 ? -45 : 0}
                  textAnchor={data.length > 5 ? 'end' : 'middle'}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  radius={[2, 2, 0, 0]} 
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}