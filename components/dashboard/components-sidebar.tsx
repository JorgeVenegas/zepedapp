"use client"

import { TrendingUp, AlertTriangle, Activity, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComponentPreview } from "./component-preview"

interface ComponentsSidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  onAddComponent: (componentType: string) => void
}

const availableComponents = [
  { id: 'metric', name: 'Metric Card', icon: Activity, description: 'Display key metrics' },
  { id: 'line-chart', name: 'Line Chart', icon: TrendingUp, description: 'Time series data' },
  { id: 'bar-chart', name: 'Bar Chart', icon: Activity, description: 'Compare values' },
  { id: 'pie-chart', name: 'Pie Chart', icon: Activity, description: 'Show proportions' },
  { id: 'area-chart', name: 'Area Chart', icon: TrendingUp, description: 'Stacked trends' },
  { id: 'radar-chart', name: 'Radar Chart', icon: Activity, description: 'Multi-variable data' },
  { id: 'alerts', name: 'Alerts Panel', icon: AlertTriangle, description: 'Recent alerts' },
  { id: 'patterns', name: 'Patterns Table', icon: Activity, description: 'Pattern analysis' },
]

export function ComponentsSidebar({ isOpen, onToggle, onAddComponent }: ComponentsSidebarProps) {
  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'w-80' : 'w-0'
        } bg-muted border-l border-border overflow-hidden`}
      >
        {isOpen && (
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Components</h2>
              <Button
                onClick={() => onToggle(false)}
                variant="ghost"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto space-y-4">
              {availableComponents.map((component) => (
                <div
                  key={component.id}
                  className="bg-card border-2 border-border rounded-lg hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                  onClick={() => onAddComponent(component.id)}
                >
                  {/* Preview Section */}
                  <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center relative overflow-hidden">
                    <ComponentPreview componentId={component.id} />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-3 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {component.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {component.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button for Collapsed Sidebar */}
      {!isOpen && (
        <Button
          onClick={() => onToggle(true)}
          variant="default"
          size="sm"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}
    </>
  )
}
