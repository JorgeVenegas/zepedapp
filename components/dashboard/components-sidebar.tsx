"use client"

import type React from "react"
import { TrendingUp, AlertTriangle, Activity, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComponentPreview } from "./component-preview"

interface ComponentsSidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  onAddComponent: (componentType: string) => void
  onComponentDragStart?: (componentType: string) => void
  onComponentDragEnd?: () => void
  getDragPreviewSize?: (componentType: string) => { width: number; height: number } | null
}

const availableComponents = [
  { id: 'metric', name: 'Metric Card', icon: Activity, description: 'Display key metrics', hoverColor: 'from-blue-500/5 via-blue-400/10 to-blue-500/5', borderColor: 'hover:border-blue-400/80', iconColor: 'text-blue-600', titleColor: 'group-hover:text-blue-600' },
  { id: 'line-chart', name: 'Line Chart', icon: TrendingUp, description: 'Time series data', hoverColor: 'from-pink-500/5 via-pink-400/10 to-rose-500/5', borderColor: 'hover:border-pink-400/80', iconColor: 'text-pink-600', titleColor: 'group-hover:text-pink-600' },
  { id: 'bar-chart', name: 'Bar Chart', icon: Activity, description: 'Compare values', hoverColor: 'from-cyan-500/5 via-cyan-400/10 to-cyan-500/5', borderColor: 'hover:border-cyan-400/80', iconColor: 'text-cyan-600', titleColor: 'group-hover:text-cyan-600' },
  { id: 'pie-chart', name: 'Pie Chart', icon: Activity, description: 'Show proportions', hoverColor: 'from-amber-500/5 via-amber-400/10 to-orange-500/5', borderColor: 'hover:border-amber-400/80', iconColor: 'text-amber-600', titleColor: 'group-hover:text-amber-600' },
  { id: 'area-chart', name: 'Area Chart', icon: TrendingUp, description: 'Stacked trends', hoverColor: 'from-indigo-500/5 via-indigo-400/10 to-indigo-500/5', borderColor: 'hover:border-indigo-400/80', iconColor: 'text-indigo-600', titleColor: 'group-hover:text-indigo-600' },
  { id: 'radar-chart', name: 'Radar Chart', icon: Activity, description: 'Multi-variable data', hoverColor: 'from-fuchsia-500/5 via-fuchsia-400/10 to-fuchsia-500/5', borderColor: 'hover:border-fuchsia-400/80', iconColor: 'text-fuchsia-600', titleColor: 'group-hover:text-fuchsia-600' },
  { id: 'alerts', name: 'Alerts Panel', icon: AlertTriangle, description: 'Recent alerts', hoverColor: 'from-red-500/5 via-red-400/10 to-red-500/5', borderColor: 'hover:border-red-400/80', iconColor: 'text-red-600', titleColor: 'group-hover:text-red-600' },
  { id: 'patterns', name: 'Patterns Table', icon: Activity, description: 'Pattern analysis', hoverColor: 'from-slate-500/5 via-slate-400/10 to-slate-500/5', borderColor: 'hover:border-slate-400/80', iconColor: 'text-slate-600', titleColor: 'group-hover:text-slate-600' },
]

const DATA_TRANSFER_TYPE = "application/zepedapp-component"

export function ComponentsSidebar({
  isOpen,
  onToggle,
  onAddComponent,
  onComponentDragStart,
  onComponentDragEnd,
  getDragPreviewSize,
}: ComponentsSidebarProps) {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, componentId: string) => {
    event.dataTransfer.setData(DATA_TRANSFER_TYPE, componentId)
    event.dataTransfer.setData("text/plain", componentId)
    event.dataTransfer.effectAllowed = "copy"

    // Get the actual grid size for this component type
    const gridSize = getDragPreviewSize?.(componentId)

    if (gridSize) {
      // Create a drag preview that matches the grid item size
      const dragImage = document.createElement("div")
      dragImage.style.position = "absolute"
      dragImage.style.top = "-9999px"
      dragImage.style.left = "-9999px"
      dragImage.style.width = `${gridSize.width}px`
      dragImage.style.height = `${gridSize.height}px`
      dragImage.style.background = "rgba(59, 130, 246, 0.2)"
      dragImage.style.border = "2px dashed rgba(59, 130, 246, 0.5)"
      dragImage.style.borderRadius = "8px"
      dragImage.style.pointerEvents = "none"
      document.body.appendChild(dragImage)

      // Center the drag image on the cursor
      event.dataTransfer.setDragImage(dragImage, gridSize.width / 2, gridSize.height / 2)

      // Clean up after the drag starts
      requestAnimationFrame(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage)
        }
      })
    } else {
      // Fallback: use the sidebar card as drag preview
      const target = event.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      event.dataTransfer.setDragImage(target, rect.width / 2, rect.height / 2)
    }

    onComponentDragStart?.(componentId)
  }

  const handleDragEnd = () => {
    onComponentDragEnd?.()
  }

  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'w-[380px]' : 'w-0'
        } bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100/80 border-l border-slate-300/50 shadow-2xl overflow-hidden relative z-50`}
      >
        {isOpen && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 pt-5 px-5 border-b border-slate-300/40">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Add Components</h2>
                <p className="text-xs text-slate-500 mt-0.5">Drag or click to add</p>
              </div>
              <Button
                onClick={() => onToggle(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full hover:bg-white/60 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Button>
            </div>

            {/* Component Grid */}
            <div className="flex-1 overflow-y-auto overflow-x-visible space-y-5 px-5 py-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200/50">
              {availableComponents.map((component) => (
                <div
                  key={component.id}
                  className={`bg-white border border-slate-200/70 rounded-xl ${component.borderColor} hover:shadow-2xl transition-all duration-200 cursor-pointer group overflow-hidden hover:scale-[1.03] active:scale-[0.98]`}
                  onClick={() => onAddComponent(component.id)}
                  draggable
                  onDragStart={(event) => handleDragStart(event, component.id)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Preview Section */}
                  <div className="h-28 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 p-3 flex items-center justify-center relative overflow-hidden">
                    <ComponentPreview componentId={component.id} />
                    {/* Hover overlay with animated gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${component.hoverColor} opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center`}>
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Plus className={`w-5 h-5 ${component.iconColor}`} />
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-3 border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/20">
                    <h3 className={`text-sm font-bold text-slate-800 mb-0.5 ${component.titleColor} transition-colors`}>
                      {component.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {component.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
