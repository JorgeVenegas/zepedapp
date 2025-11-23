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
    <Card className="p-6 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/50 border-slate-200/60 hover:border-blue-300/60 transition-all duration-300 hover:shadow-2xl hover:scale-105">
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
