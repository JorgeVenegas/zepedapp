"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"

export function AlertsPanel() {
  const alerts = [
    { id: 1, type: "error", message: "High error rate detected", time: "5 min ago" },
    { id: 2, type: "warning", message: "Unusual data spike", time: "12 min ago" },
    { id: 3, type: "success", message: "Data sync completed", time: "30 min ago" },
  ]

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            {alert.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {alert.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
            {alert.type === "success" && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium">{alert.message}</p>
              <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
