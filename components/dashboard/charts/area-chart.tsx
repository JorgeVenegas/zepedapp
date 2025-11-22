"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

const data = [
  { date: "Mon", pattern1: 40, pattern2: 24, pattern3: 24 },
  { date: "Tue", pattern1: 30, pattern2: 13, pattern3: 22 },
  { date: "Wed", pattern1: 20, pattern2: 98, pattern3: 29 },
  { date: "Thu", pattern1: 27, pattern2: 39, pattern3: 20 },
  { date: "Fri", pattern1: 18, pattern2: 48, pattern3: 21 },
  { date: "Sat", pattern1: 23, pattern2: 38, pattern3: 25 },
  { date: "Sun", pattern1: 34, pattern2: 43, pattern3: 21 },
]

export function AreaChartComponent() {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Pattern Trends (Weekly)</h3>
      <div className="w-full h-64">
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
            <XAxis dataKey="date" stroke="rgba(0,0,0,0.5)" />
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
              dataKey="pattern1"
              stackId="1"
              stroke="#ec4899"
              fillOpacity={1}
              fill="url(#colorPattern1)"
            />
            <Area
              type="monotone"
              dataKey="pattern2"
              stackId="1"
              stroke="#06b6d4"
              fillOpacity={1}
              fill="url(#colorPattern2)"
            />
            <Area
              type="monotone"
              dataKey="pattern3"
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
