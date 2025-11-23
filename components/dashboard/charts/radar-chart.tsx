"use client"

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

const data = [
  { category: "Accuracy", value: 85 },
  { category: "Speed", value: 72 },
  { category: "Completeness", value: 90 },
  { category: "Relevance", value: 78 },
  { category: "Freshness", value: 88 },
]

export function RadarChartComponent() {
  return (
    <Card className="p-6 bg-card border-border w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">Data Quality Metrics</h3>
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis dataKey="category" stroke="rgba(0,0,0,0.5)" />
            <PolarRadiusAxis stroke="rgba(0,0,0,0.5)" />
            <Radar name="Performance" dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
