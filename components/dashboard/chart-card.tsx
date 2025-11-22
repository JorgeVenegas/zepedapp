"use client"

import { Card } from "@/components/ui/card"

interface ChartCardProps {
  title: string
}

export function ChartCard({ title }: ChartCardProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Chart placeholder - Ready for chart component</p>
      </div>
    </Card>
  )
}
