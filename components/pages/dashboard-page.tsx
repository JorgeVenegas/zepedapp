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
      title: "#mobility",
      description: "Pattern related to mobility discussions",
      filters: {},
      priority: 3,
      frequency: 342,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
    {
      id: "2",
      title: "autonomous vehicles",
      description: "Pattern related to autonomous vehicle topics",
      filters: {},
      priority: 3,
      frequency: 287,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
    {
      id: "3",
      title: "EV charging",
      description: "Pattern related to electric vehicle charging",
      filters: {},
      priority: 2,
      frequency: 156,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
    {
      id: "4",
      title: "smart cities",
      description: "Pattern related to smart city initiatives",
      filters: {},
      priority: 2,
      frequency: 128,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
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
