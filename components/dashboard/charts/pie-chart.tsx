"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card } from "@/components/ui/card"

const data = [
  { name: "High", value: 35 },
  { name: "Medium", value: 45 },
  { name: "Low", value: 20 },
]

const COLORS = ["#ef4444", "#f97316", "#84cc16"]

export function PieChartComponent() {
  return (
    <Card className="p-6 bg-card border-border w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex-shrink-0">Alert Distribution</h3>
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius="70%"
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
