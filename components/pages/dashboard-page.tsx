"use client"

import { useState, useEffect, useRef, type DragEvent } from "react"
import GridLayout, { Layout } from "react-grid-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { PatternsTable } from "@/components/dashboard/patterns-table"
import { LineChartComponent } from "@/components/dashboard/charts/line-chart"
import { BarChartComponent } from "@/components/dashboard/charts/bar-chart"
import { PieChartComponent } from "@/components/dashboard/charts/pie-chart"
import { AreaChartComponent } from "@/components/dashboard/charts/area-chart"
import { RadarChartComponent } from "@/components/dashboard/charts/radar-chart"
import { TrendingUp, AlertTriangle, Activity, Zap, Edit3, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComponentsSidebar } from "@/components/dashboard/components-sidebar"
import type { DisplayPattern } from "@/lib/types"

const INITIAL_GRID_ITEMS = new Set([
  "metric-1",
  "metric-2",
  "metric-3",
  "metric-4",
  "line-chart",
  "alerts",
  "bar-chart",
  "pie-chart",
  "area-chart",
  "radar-chart",
  "patterns",
])

export function DashboardPage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [draggingComponentType, setDraggingComponentType] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const DATA_TRANSFER_TYPE = "application/zepedapp-component"
  const GRID_COLS = 12
  const GRID_MARGIN: [number, number] = [20, 24]
  const GRID_ROW_HEIGHT = 70
  const GRID_CONTAINER_PADDING: [number, number] = [0, 0]

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const externalPatterns: DisplayPattern[] = [
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

  const getComponentGridDefaults = (componentType: string) => {
    if (componentType === "metric") {
      return { w: 2, h: 2, minW: 2, minH: 2 }
    }
    if (componentType === "patterns") {
      return { w: 6, h: 3, minW: 6, minH: 3 }
    }
    if (componentType) {
      return { w: 4, h: 3, minW: 4, minH: 3 }
    }
    return { w: 4, h: 3, minW: 2, minH: 2 }
  }

  const getDragPreviewSize = (componentType: string) => {
    const defaults = getComponentGridDefaults(componentType)
    if (!containerRef.current) return null
    const colWidth =
      (containerWidth - GRID_MARGIN[0] * (GRID_COLS - 1) - GRID_CONTAINER_PADDING[0] * 2) / GRID_COLS
    const width = defaults.w * colWidth + (defaults.w - 1) * GRID_MARGIN[0]
    const height = defaults.h * GRID_ROW_HEIGHT + (defaults.h - 1) * GRID_MARGIN[1]
    return { width, height }
  }

  const [layout, setLayout] = useState<Layout[]>([
    // Metrics row
    { i: "metric-1", x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "metric-2", x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "metric-3", x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
    { i: "metric-4", x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },

    // Charts
    { i: "line-chart", x: 0, y: 2, w: 8, h: 4, minW: 4, minH: 3 },
    { i: "alerts", x: 8, y: 2, w: 4, h: 4, minW: 3, minH: 3 },
    { i: "bar-chart", x: 0, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "pie-chart", x: 6, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "area-chart", x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "radar-chart", x: 6, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "patterns", x: 0, y: 14, w: 12, h: 4, minW: 6, minH: 3 },
  ])

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(
      newLayout.filter((item) => item.i !== "__dropping-elem__" && item.i !== "__dropping-elem__custom__")
    )
  }

  const getComponentTypeFromKey = (key: string) => {
    if (key.startsWith("metric")) return "metric"
    if (key.startsWith("line-chart")) return "line-chart"
    if (key.startsWith("bar-chart")) return "bar-chart"
    if (key.startsWith("pie-chart")) return "pie-chart"
    if (key.startsWith("area-chart")) return "area-chart"
    if (key.startsWith("radar-chart")) return "radar-chart"
    if (key.startsWith("alerts")) return "alerts"
    if (key.startsWith("patterns")) return "patterns"
    return key
  }

  const renderGridItem = (key: string) => {
    const containerStyle = "h-full w-full overflow-hidden flex items-stretch"
    const metricContainerStyle = "h-full w-full flex flex-col"
    const componentType = getComponentTypeFromKey(key)

    if (componentType === "metric") {
      const metricContentMap: Record<string, { title: string; value: string; icon: any; trend?: string; trendPositive?: boolean }> = {
        "metric-1": { title: "Active Records", value: "2,847", icon: Activity, trend: "+12.5%", trendPositive: true },
        "metric-2": { title: "Processing Rate", value: "94.2%", icon: TrendingUp, trend: "+2.1%", trendPositive: true },
        "metric-3": { title: "Alerts Today", value: "23", icon: AlertTriangle, trend: "+5", trendPositive: false },
        "metric-4": { title: "API Calls", value: "45.2K", icon: Zap, trend: "+8.3%", trendPositive: true },
      }
      const metricConfig = metricContentMap[key] ?? { title: "Metric 1", value: "1,234", icon: Activity, trend: "+0%", trendPositive: true }
      return (
        <div className={metricContainerStyle}>
          <div className="flex-1 w-full">
            <MetricCard
              title={metricConfig.title}
              value={metricConfig.value}
              icon={metricConfig.icon}
              trend={metricConfig.trend}
              trendPositive={metricConfig.trendPositive}
            />
          </div>
        </div>
      )
    }

    if (componentType === "line-chart") {
      const useSample = !INITIAL_GRID_ITEMS.has(key)
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <LineChartComponent variant={useSample ? "sample" : "default"} />
          </div>
        </div>
      )
    }

    if (componentType === "alerts") {
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <AlertsPanel />
          </div>
        </div>
      )
    }

    if (componentType === "bar-chart") {
      const useSample = !INITIAL_GRID_ITEMS.has(key)
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <BarChartComponent variant={useSample ? "sample" : "default"} />
          </div>
        </div>
      )
    }

    if (componentType === "pie-chart") {
      const useSample = !INITIAL_GRID_ITEMS.has(key)
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <PieChartComponent variant={useSample ? "sample" : "default"} />
          </div>
        </div>
      )
    }

    if (componentType === "area-chart") {
      const useSample = !INITIAL_GRID_ITEMS.has(key)
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <AreaChartComponent variant={useSample ? "sample" : "default"} />
          </div>
        </div>
      )
    }

    if (componentType === "radar-chart") {
      const useSample = !INITIAL_GRID_ITEMS.has(key)
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <RadarChartComponent variant={useSample ? "sample" : "default"} />
          </div>
        </div>
      )
    }

    if (componentType === "patterns") {
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <PatternsTable title="Top External Patterns (Twitter)" patterns={externalPatterns} type="external" />
          </div>
        </div>
      )
    }

    return null
  }

  const addComponent = (componentType: string, position?: { x: number; y: number }) => {
    const newId = `${componentType}-${Date.now()}`
    const defaults = getComponentGridDefaults(componentType)
    const newLayout: Layout = {
      i: newId,
      x: position?.x ?? 0,
      y: position?.y ?? Infinity, // Add to bottom when no drop position
      ...defaults,
    }
    setLayout((prev) => [...prev, newLayout])
  }

  const handleComponentDragStart = (componentType: string) => {
    setDraggingComponentType(componentType)
  }

  const handleComponentDragEnd = () => {
    setDraggingComponentType(null)
  }

  const handleDrop = (_layout: Layout[], layoutItem: Layout, event: DragEvent) => {
    const componentType = event.dataTransfer?.getData(DATA_TRANSFER_TYPE) || draggingComponentType
    if (!componentType) return
    const defaults = getComponentGridDefaults(componentType)
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

    // Derive drop col/row from cursor and center the item under the cursor
    let targetX = layoutItem.x
    let targetY = layoutItem.y

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const colWidth =
        (containerWidth - GRID_MARGIN[0] * (GRID_COLS - 1) - GRID_CONTAINER_PADDING[0] * 2) / GRID_COLS
      const relativeX = event.clientX - rect.left - GRID_CONTAINER_PADDING[0]
      const relativeY = event.clientY - rect.top - GRID_CONTAINER_PADDING[1]
      const col = Math.floor(relativeX / (colWidth + GRID_MARGIN[0]))
      const row = Math.floor(relativeY / (GRID_ROW_HEIGHT + GRID_MARGIN[1]))
      targetX = clamp(col - Math.floor(defaults.w / 2), 0, GRID_COLS - defaults.w)
      targetY = Math.max(row - Math.floor(defaults.h / 2), 0)
    } else {
      targetX = clamp(layoutItem.x - Math.floor(defaults.w / 2), 0, GRID_COLS - defaults.w)
      targetY = Math.max(layoutItem.y - Math.floor(defaults.h / 2), 0)
    }

    addComponent(componentType, { x: targetX, y: targetY })
    setDraggingComponentType(null)
  }

  const handleDropDragOver = (event: DragEvent) => {
    event.preventDefault()
    const componentType = event.dataTransfer?.getData(DATA_TRANSFER_TYPE) || draggingComponentType || ""
    if (!draggingComponentType && componentType) {
      setDraggingComponentType(componentType)
    }
    const defaults = getComponentGridDefaults(componentType)
    return { w: defaults.w, h: defaults.h }
  }

  const dropPlaceholder = draggingComponentType
    ? { i: "__dropping-elem__custom__", ...getComponentGridDefaults(draggingComponentType) }
    : undefined

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Drag components to move, resize from edges and corners"
                : "Real-time mobility insights and alerts"
              }
            </p>
          </div>
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            size="default"
            className={`flex items-center gap-2 transition-all ${
              isEditMode
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                : "hover:bg-gray-100"
            }`}
          >
            {isEditMode ? (
              <>
                <Eye className="w-4 h-4" />
                View Only
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Edit Layout
              </>
            )}
          </Button>
        </div>

      {isEditMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
          <p className="text-sm text-blue-900 font-medium">
            Edit Mode Active - Drag to move • Grab edges to resize • Changes save automatically
          </p>
        </div>
      )}

      <style jsx global>{`
        .react-grid-layout {
          position: relative;
          transition: height 200ms ease;
          padding-bottom: 40px;
        }
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top, width, height;
          margin-bottom: 8px;
          box-sizing: border-box;
        }
        .react-grid-item > div {
          width: 100% !important;
          height: 100% !important;
          box-sizing: border-box;
        }
        .react-grid-item.react-dragging {
          z-index: 100;
          transition: none;
        }
        .edit-mode-item:hover {
          border-color: rgba(59, 130, 246, 0.6) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .react-grid-item img {
          pointer-events: none;
          user-select: none;
        }
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 24px;
          height: 24px;
          z-index: 50;
        }
        .react-grid-item > .react-resizable-handle::after {
          content: "";
          position: absolute;
          right: 4px;
          bottom: 4px;
          width: 10px;
          height: 10px;
          border-right: 3px solid rgba(59, 130, 246, 0.5);
          border-bottom: 3px solid rgba(59, 130, 246, 0.5);
          transition: all 0.2s ease;
        }
        .react-grid-item:hover > .react-resizable-handle::after {
          border-right: 3px solid rgba(59, 130, 246, 1);
          border-bottom: 3px solid rgba(59, 130, 246, 1);
          width: 12px;
          height: 12px;
        }
        .react-resizable-hide > .react-resizable-handle {
          display: none;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgb(59, 130, 246);
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -o-user-select: none;
          user-select: none;
          border-radius: 8px;
        }
        .react-grid-item.static {
          background: transparent;
        }
        .react-grid-item.resizing {
          opacity: 0.9;
          z-index: 100;
        }
        .react-grid-item .react-resizable-handle {
          cursor: se-resize;
        }
        .react-grid-item > .react-resizable-handle-sw {
          bottom: 0;
          left: 0;
          cursor: sw-resize;
          transform: rotate(90deg);
        }
        .react-grid-item > .react-resizable-handle-se {
          bottom: 0;
          right: 0;
          cursor: se-resize;
        }
        .react-grid-item > .react-resizable-handle-nw {
          top: 0;
          left: 0;
          cursor: nw-resize;
          transform: rotate(180deg);
        }
        .react-grid-item > .react-resizable-handle-ne {
          top: 0;
          right: 0;
          cursor: ne-resize;
          transform: rotate(270deg);
        }
        .react-grid-item > .react-resizable-handle-w,
        .react-grid-item > .react-resizable-handle-e {
          top: 50%;
          margin-top: -10px;
          cursor: ew-resize;
        }
        .react-grid-item > .react-resizable-handle-w {
          left: 0;
          transform: rotate(135deg);
        }
        .react-grid-item > .react-resizable-handle-e {
          right: 0;
          transform: rotate(315deg);
        }
        .react-grid-item > .react-resizable-handle-n,
        .react-grid-item > .react-resizable-handle-s {
          left: 50%;
          margin-left: -10px;
          cursor: ns-resize;
        }
        .react-grid-item > .react-resizable-handle-n {
          top: 0;
          transform: rotate(225deg);
        }
        .react-grid-item > .react-resizable-handle-s {
          bottom: 0;
          transform: rotate(45deg);
        }
      `}</style>

      <div className="relative w-full" ref={containerRef}>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={70}
          containerPadding={GRID_CONTAINER_PADDING}
          width={containerWidth}
          onLayoutChange={onLayoutChange}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          isDroppable={isEditMode}
          onDrop={handleDrop}
          onDropDragOver={handleDropDragOver}
          droppingItem={dropPlaceholder}
          compactType="vertical"
          preventCollision={false}
          margin={[20, 24]}
          resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's']}
          autoSize={true}
        >
          {layout.map((item) => (
            <div
              key={item.i}
              className={`${isEditMode ? 'edit-mode-item' : ''}`}
              style={{
                border: isEditMode ? '2px dashed rgba(59, 130, 246, 0.3)' : 'none',
                borderRadius: '8px',
                transition: 'border 0.2s ease',
                backgroundColor: isEditMode ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              {renderGridItem(item.i)}
            </div>
          ))}
        </GridLayout>
      </div>
      </div>

      {isEditMode && (
        <ComponentsSidebar
          isOpen={isSidebarOpen}
          onToggle={setIsSidebarOpen}
          onAddComponent={(componentType) => addComponent(componentType)}
          onComponentDragStart={handleComponentDragStart}
          onComponentDragEnd={handleComponentDragEnd}
          getDragPreviewSize={getDragPreviewSize}
        />
      )}
    </div>
  )
}
