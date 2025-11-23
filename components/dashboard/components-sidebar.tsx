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
  { id: 'top-patterns', name: 'Top Patterns', icon: Activity, description: 'Top patterns analysis', hoverColor: 'from-slate-500/5 via-slate-400/10 to-slate-500/5', borderColor: 'hover:border-slate-400/80', iconColor: 'text-slate-600', titleColor: 'group-hover:text-slate-600' },
  { id: 'records-timeseries', name: 'Records Timeseries', icon: TrendingUp, description: 'Records over time', hoverColor: 'from-emerald-500/5 via-emerald-400/10 to-emerald-500/5', borderColor: 'hover:border-emerald-400/80', iconColor: 'text-emerald-600', titleColor: 'group-hover:text-emerald-600' },
  { id: 'records-bar-chart', name: 'Records Bar Chart', icon: Activity, description: 'Records distribution', hoverColor: 'from-violet-500/5 via-violet-400/10 to-violet-500/5', borderColor: 'hover:border-violet-400/80', iconColor: 'text-violet-600', titleColor: 'group-hover:text-violet-600' },
  { id: 'records-pie-chart', name: 'Records Pie Chart', icon: Activity, description: 'Records breakdown', hoverColor: 'from-orange-500/5 via-orange-400/10 to-orange-500/5', borderColor: 'hover:border-orange-400/80', iconColor: 'text-orange-600', titleColor: 'group-hover:text-orange-600' },
  { id: 'records-treemap', name: 'Records Treemap', icon: Activity, description: 'Records hierarchy', hoverColor: 'from-teal-500/5 via-teal-400/10 to-teal-500/5', borderColor: 'hover:border-teal-400/80', iconColor: 'text-teal-600', titleColor: 'group-hover:text-teal-600' },
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

    // Create an invisible drag image
    const dragImage = document.createElement("div")
    dragImage.style.position = "absolute"
    dragImage.style.top = "-9999px"
    dragImage.style.left = "-9999px"
    dragImage.style.width = "1px"
    dragImage.style.height = "1px"
    dragImage.style.opacity = "0"
    document.body.appendChild(dragImage)

    // Set invisible drag image
    event.dataTransfer.setDragImage(dragImage, 0, 0)

    // Clean up after the drag starts
    requestAnimationFrame(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    })

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
