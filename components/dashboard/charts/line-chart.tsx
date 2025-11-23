"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

const data = [
  { time: "00:00", value: 240 },
  { time: "04:00", value: 320 },
  { time: "08:00", value: 280 },
  { time: "12:00", value: 420 },
  { time: "16:00", value: 380 },
  { time: "20:00", value: 510 },
  { time: "24:00", value: 480 },
]

export function LineChartComponent() {
  return (
    <Card className="p-6 bg-card border-border w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">Processing Volume (24h)</h3>
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="time" stroke="rgba(0,0,0,0.5)" />
            <YAxis stroke="rgba(0,0,0,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
