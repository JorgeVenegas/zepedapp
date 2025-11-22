"use client"

import { MetricCard } from "@/components/dashboard/metric-card"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { PatternsTable } from "@/components/dashboard/patterns-table"
import { LineChartComponent } from "@/components/dashboard/charts/line-chart"
import { BarChartComponent } from "@/components/dashboard/charts/bar-chart"
import { PieChartComponent } from "@/components/dashboard/charts/pie-chart"
import { AreaChartComponent } from "@/components/dashboard/charts/area-chart"
import { RadarChartComponent } from "@/components/dashboard/charts/radar-chart"
import { TrendingUp, AlertTriangle, Activity, Zap } from "lucide-react"

export function DashboardPage() {
  const externalPatterns = [
    {
      id: "1",
      text: "#mobility",
      count: 342,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "external" as const,
    },
    {
      id: "2",
      text: "autonomous vehicles",
      count: 287,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "external" as const,
    },
    {
      id: "3",
      text: "EV charging",
      count: 156,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "external" as const,
    },
    {
      id: "4",
      text: "smart cities",
      count: 128,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "external" as const,
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Real-time mobility insights and alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Active Records" value="2,847" icon={Activity} trend="+12.5%" trendPositive />
        <MetricCard title="Processing Rate" value="94.2%" icon={TrendingUp} trend="+2.1%" trendPositive />
        <MetricCard title="Alerts Today" value="23" icon={AlertTriangle} trend="+5" trendPositive={false} />
        <MetricCard title="API Calls" value="45.2K" icon={Zap} trend="+8.3%" trendPositive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChartComponent />
        </div>
        <AlertsPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent />
        <PieChartComponent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartComponent />
        <RadarChartComponent />
      </div>

      <div>
        <PatternsTable title="Top External Patterns (Twitter)" patterns={externalPatterns} type="external" />
      </div>
    </div>
  )
}
