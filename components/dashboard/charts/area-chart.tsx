"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

type AreaChartVariant = "default" | "sample"

const defaultData = [
  { date: "Mon", pattern1: 40, pattern2: 24, pattern3: 24 },
  { date: "Tue", pattern1: 30, pattern2: 13, pattern3: 22 },
  { date: "Wed", pattern1: 20, pattern2: 98, pattern3: 29 },
  { date: "Thu", pattern1: 27, pattern2: 39, pattern3: 20 },
  { date: "Fri", pattern1: 18, pattern2: 48, pattern3: 21 },
  { date: "Sat", pattern1: 23, pattern2: 38, pattern3: 25 },
  { date: "Sun", pattern1: 34, pattern2: 43, pattern3: 21 },
]

const sampleData = [
  { label: "Data 1", seriesA: 30, seriesB: 20, seriesC: 15 },
  { label: "Data 2", seriesA: 40, seriesB: 25, seriesC: 18 },
  { label: "Data 3", seriesA: 28, seriesB: 30, seriesC: 22 },
]

interface AreaChartComponentProps {
  variant?: AreaChartVariant
}

export function AreaChartComponent({ variant = "default" }: AreaChartComponentProps) {
  const data = variant === "sample" ? sampleData : defaultData
  const xKey = variant === "sample" ? "label" : "date"
  const title = variant === "sample" ? "Sample Area Chart" : "Pattern Trends (Weekly)"

  return (
    <Card className="p-6 bg-card border-border w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">{title}</h3>
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPattern1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPattern2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPattern3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey={xKey} stroke="rgba(0,0,0,0.5)" />
            <YAxis stroke="rgba(0,0,0,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey={variant === "sample" ? "seriesA" : "pattern1"}
              stackId="1"
              stroke="#ec4899"
              fillOpacity={1}
              fill="url(#colorPattern1)"
            />
            <Area
              type="monotone"
              dataKey={variant === "sample" ? "seriesB" : "pattern2"}
              stackId="1"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorPattern2)"
            />
            <Area
              type="monotone"
              dataKey={variant === "sample" ? "seriesC" : "pattern3"}
              stackId="1"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorPattern3)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
