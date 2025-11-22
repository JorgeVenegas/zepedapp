"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend: string
  trendPositive: boolean
}

export function MetricCard({ title, value, icon: Icon, trend, trendPositive }: MetricCardProps) {
  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className={`text-xs mt-2 ${trendPositive ? "text-green-500" : "text-red-500"}`}>
            {trend} from last period
          </p>
        </div>
        <Icon className="w-8 h-8 text-primary opacity-50" />
      </div>
    </Card>
  )
}
