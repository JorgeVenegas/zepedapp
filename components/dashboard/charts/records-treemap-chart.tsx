"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Loader2, Grid3X3 } from "lucide-react"
import { Treemap, ResponsiveContainer } from 'recharts'
import type { Incident } from "@/lib/types"

interface RecordsTreemapChartProps {
  variant?: "default" | "sample"
  filters?: Record<string, string[]>
  groupBy?: string
  dateRange?: string
  className?: string
  limit?: number
}

export function RecordsTreemapChart({ 
  variant = "default", 
  filters, 
  groupBy = "severity,priority", 
  dateRange,
  className,
  limit = 20 
}: RecordsTreemapChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})

  const sampleData = [
    { name: "High - P1", size: 45, fill: "#ef4444" },
    { name: "Medium - P2", size: 89, fill: "#f59e0b" },
    { name: "Low - P3", size: 67, fill: "#10b981" },
    { name: "Critical - P0", size: 23, fill: "#dc2626" },
    { name: "Info - P3", size: 156, fill: "#3b82f6" },
    { name: "High - P2", size: 34, fill: "#f87171" },
    { name: "Medium - P1", size: 56, fill: "#fbbf24" },
    { name: "Low - P2", size: 78, fill: "#34d399" },
  ]

  const sampleConfig: ChartConfig = {
    size: {
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
      '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7',
      '#f97316', '#84cc16', '#06b6d4', '#a855f7', '#eab308', '#f43f5e'
    ]
    
    categories.forEach((cat, idx) => {
      config[cat] = {
        label: cat,
        color: modernColors[idx % modernColors.length]
      }
    })
    
    config.size = {
      label: "Count",
      color: "#3b82f6"
    }
    
    return config
  }

  const processDataForTreemap = (incidents: Incident[], groupBy: string, limit: number) => {
    const groupByFields = groupBy.split(',').map(field => field.trim())
    const counts = new Map<string, number>()
    
    incidents.forEach(incident => {
      const groupValues = groupByFields.map(field => 
        incident[field as keyof Incident]?.toString() || 'Unknown'
      )
      const groupKey = groupValues.join(' - ')
      counts.set(groupKey, (counts.get(groupKey) || 0) + 1)
    })

    // Convert to array, sort by count, and take top N
    const sortedData = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    const colors = generateCategoryColors(sortedData.map(([name]) => name))
    
    return sortedData.map(([name, size]) => ({ 
      name, 
      size, 
      fill: colors[name]?.color 
    }))
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
        const processedData = processDataForTreemap(incidents, groupBy, limit)
        setData(processedData)
        
        const config = generateCategoryColors(processedData.map(d => d.name))
        setChartConfig(config)
      }
    } catch (error) {
      console.error("Error fetching treemap data:", error)
    } finally {
      setLoading(false)
    }
  }

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name, ...rest } = props
    
    // Safety checks
    if (!x && x !== 0) return null
    if (!y && y !== 0) return null
    if (!width || !height) return null
    
    const displayName = name || (payload && payload.name) || 'Unknown'
    const displaySize = (payload && payload.size) || 0
    const fillColor = (payload && payload.fill) || '#3b82f6'
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: fillColor,
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        {width > 35 && height > 20 && displayName && (
          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={Math.min(Math.max(width / 8, 7), 12)} fontWeight="500">
            <tspan x={x + width / 2} dy={-6}>{displayName}</tspan>
            <tspan x={x + width / 2} dy={14} fontSize={Math.min(Math.max(width / 10, 6), 10)}>({displaySize})</tspan>
          </text>
        )}
      </g>
    )
  }

  if (loading) {
    return (
      <Card className={`flex flex-col ${className || 'h-full'}`}>
        <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Grid3X3 className="w-4 h-4" />
            Records Hierarchy
          </CardTitle>
          <CardDescription className="text-xs mt-1">Hierarchical view by {groupBy.replace(',', ' and ')}</CardDescription>
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
      <Card className={`flex flex-col ${className || 'h-full'}`}>
        <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Grid3X3 className="w-4 h-4" />
            Records Hierarchy
          </CardTitle>
          <CardDescription className="text-xs mt-1">Hierarchical view by {groupBy.replace(',', ' and ')}</CardDescription>
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
          <Grid3X3 className="w-4 h-4" />
          Records Hierarchy
        </CardTitle>
        <CardDescription className="text-xs mt-1">Hierarchical view by {groupBy.replace(',', ' and ')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <div className="h-full w-full px-4 pb-4" style={{ minHeight: '200px' }}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={data}
                dataKey="size"
                aspectRatio={undefined}
                stroke="#fff"
                fill="#8884d8"
                content={<CustomizedContent />}
                isAnimationActive={false}
              />
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}