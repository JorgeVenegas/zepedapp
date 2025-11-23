"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, AlertCircle, Clock, Activity } from "lucide-react"

interface RecordsPatternsProps {
  filters?: Record<string, string[]>
  dateRange?: string
}

// Mock pattern data based on train/metro mobility issues
const generateMockPatterns = () => {
  return [
    {
      id: 1,
      title: "Recurring Train Delays Due to Technical Issues",
      description: "Technical problems causing train delays during peak morning hours (8-10 AM), affecting punctuality and passenger connections",
      frequency: 412,
      trend: "increasing",
      affectedServices: ["Tren", "Metro"],
      priority: 2,
      lastSeen: "15 minutes ago",
      avgResponseTime: "32 min delay"
    },
    {
      id: 2,
      title: "Accessibility Issues for Wheelchair Users",
      description: "Reserved wheelchair zones occupied, ramps unavailable, and lack of staff assistance causing significant mobility barriers",
      frequency: 289,
      trend: "stable",
      affectedServices: ["Metro", "Tren"],
      priority: 2,
      lastSeen: "1 hour ago",
      avgResponseTime: "18 min delay"
    },
    {
      id: 3,
      title: "Staff Behavior and Customer Service Complaints",
      description: "Recurring reports of unfriendly treatment by control personnel and lack of clear information during incidents",
      frequency: 234,
      trend: "increasing",
      affectedServices: ["Metro", "Tren"],
      priority: 3,
      lastSeen: "45 minutes ago",
      avgResponseTime: "N/A"
    },
    {
      id: 4,
      title: "Facility Cleanliness and Maintenance Problems",
      description: "Dirty or broken bathrooms, malfunctioning escalators, insufficient lighting, and lack of heating/AC across multiple stations",
      frequency: 198,
      trend: "stable",
      affectedServices: ["Metro", "Tren"],
      priority: 3,
      lastSeen: "2 hours ago",
      avgResponseTime: "N/A"
    },
    {
      id: 5,
      title: "Ticketing and Fare Confusion",
      description: "Online ticket purchase problems, confusion about discount cards, zone tariffs, and refund processes causing passenger frustration",
      frequency: 167,
      trend: "decreasing",
      affectedServices: ["Metro", "Tren"],
      priority: 3,
      lastSeen: "30 minutes ago",
      avgResponseTime: "N/A"
    },
    {
      id: 6,
      title: "Lost Items and Security Concerns",
      description: "High volume of lost personal belongings (wallets, phones, strollers) and unclear lost & found service information",
      frequency: 145,
      trend: "stable",
      affectedServices: ["Metro", "Tren"],
      priority: 4,
      lastSeen: "3 hours ago",
      avgResponseTime: "N/A"
    },
    {
      id: 7,
      title: "Poor Information and Communication During Delays",
      description: "Contradictory information, non-functional information panels, and lack of timely announcements during cancellations and delays",
      frequency: 312,
      trend: "increasing",
      affectedServices: ["Metro", "Tren"],
      priority: 2,
      lastSeen: "20 minutes ago",
      avgResponseTime: "N/A"
    }
  ]
}

const getTrendIcon = (trend: string) => {
  if (trend === "increasing") return <TrendingUp className="w-4 h-4 text-red-500" />
  if (trend === "decreasing") return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
  return <Activity className="w-4 h-4 text-blue-500" />
}

const getPriorityColor = (priority: number) => {
  if (priority === 1) return "bg-red-100 text-red-700 border-red-300"
  if (priority === 2) return "bg-orange-100 text-orange-700 border-orange-300"
  return "bg-yellow-100 text-yellow-700 border-yellow-300"
}

export function RecordsPatterns({ filters, dateRange }: RecordsPatternsProps) {
  const patterns = generateMockPatterns()

  return (
    <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Detected Patterns</h3>
            <p className="text-xs text-slate-500">AI-identified recurring issues and anomalies</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total patterns:</span>
            <span className="text-lg font-bold text-slate-700">{patterns.length}</span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {patterns.map((pattern) => (
          <div key={pattern.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                {getTrendIcon(pattern.trend)}
                <span className="text-xs font-mono text-slate-500">{pattern.frequency}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">{pattern.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{pattern.description}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(pattern.priority)}`}>
                    P{pattern.priority}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pattern.affectedServices.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Last seen: {pattern.lastSeen}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Avg response: {pattern.avgResponseTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="capitalize text-slate-600 font-medium">
                      Trend: {pattern.trend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          Patterns are automatically detected using AI analysis of incident data
        </p>
      </div>
    </Card>
  )
}
