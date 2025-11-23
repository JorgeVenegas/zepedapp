"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

type BarChartVariant = "default" | "sample"

const defaultData = [
  { source: "Twitter", records: 1240 },
  { source: "Facebook", records: 890 },
  { source: "Instagram", records: 720 },
  { source: "Internal", records: 1100 },
  { source: "Other", records: 440 },
]

const sampleData = [
  { label: "Data 1", value: 120 },
  { label: "Data 2", value: 180 },
  { label: "Data 3", value: 140 },
]

interface BarChartComponentProps {
  variant?: BarChartVariant
}

export function BarChartComponent({ variant = "default" }: BarChartComponentProps) {
  const data = variant === "sample" ? sampleData : defaultData
  const xKey = variant === "sample" ? "label" : "source"
  const yKey = variant === "sample" ? "value" : "records"
  const title = variant === "sample" ? "Sample Bar Chart" : "Records by Source"

  return (
    <Card className="p-6 bg-card border-border w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">{title}</h3>
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            <Bar dataKey={yKey} fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
