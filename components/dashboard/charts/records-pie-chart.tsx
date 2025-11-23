"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Loader2, PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import type { Incident } from "@/lib/types"

interface RecordsPieChartProps {
  variant?: "default" | "sample"
  filters?: Record<string, string[]>
  groupBy?: string
  dateRange?: string
  className?: string
  limit?: number
}

export function RecordsPieChart({ 
  variant = "default", 
  filters, 
  groupBy = "severity", 
  dateRange,
  className,
  limit = 8 
}: RecordsPieChartProps) {
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
    High: { label: "High", color: "#ef4444" },
    Medium: { label: "Medium", color: "#f59e0b" },
    Low: { label: "Low", color: "#10b981" },
    Critical: { label: "Critical", color: "#dc2626" },
    Info: { label: "Info", color: "#3b82f6" },
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
    
    return config
  }

  const processDataForPie = (incidents: Incident[], groupBy: string, limit: number) => {
    const counts = new Map<string, number>()
    
    incidents.forEach(incident => {
      const groupValue = incident[groupBy as keyof Incident]?.toString() || 'Unknown'
      counts.set(groupValue, (counts.get(groupValue) || 0) + 1)
    })

    // Convert to array, sort by count, and take top N
    const sortedData = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    const colors = generateCategoryColors(sortedData.map(([name]) => name))
    
    return sortedData.map(([name, value]) => ({ 
      name, 
      value, 
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
        const processedData = processDataForPie(incidents, groupBy, limit)
        setData(processedData)
        
        const config = generateCategoryColors(processedData.map(d => d.name))
        setChartConfig(config)
      }
    } catch (error) {
      console.error("Error fetching pie chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload
      const value = data.value || 0
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name || 'Unknown'}</p>
          <p className="text-sm text-muted-foreground">
            Count: {value}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card className={`flex flex-col ${className || 'h-full'}`}>
        <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <PieChartIcon className="w-4 h-4" />
            Records Breakdown
          </CardTitle>
          <CardDescription className="text-xs mt-1">Distribution by {groupBy}</CardDescription>
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
            <PieChartIcon className="w-4 h-4" />
            Records Breakdown
          </CardTitle>
          <CardDescription className="text-xs mt-1">Distribution by {groupBy}</CardDescription>
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
          <PieChartIcon className="w-4 h-4" />
          Records Breakdown
        </CardTitle>
        <CardDescription className="text-xs mt-1">Distribution by {groupBy}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <div className="h-full w-full px-4 pb-4" style={{ minHeight: '200px' }}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={data.length <= 4 ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
                  outerRadius="80%"
                  innerRadius="0%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  iconSize={8}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}