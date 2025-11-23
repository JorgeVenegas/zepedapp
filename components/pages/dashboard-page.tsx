"use client"

import { useState, useEffect, useRef } from "react"
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
import type { DisplayPattern } from "@/lib/types"

export function DashboardPage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

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
    setLayout(newLayout)
  }

  const renderGridItem = (key: string) => {
    const containerStyle = "h-full w-full overflow-hidden flex items-stretch"
    const metricContainerStyle = "h-full w-full flex flex-col"

    switch (key) {
      case "metric-1":
        return (
          <div className={metricContainerStyle}>
            <div className="flex-1 w-full">
              <MetricCard title="Active Records" value="2,847" icon={Activity} trend="+12.5%" trendPositive />
            </div>
          </div>
        )
      case "metric-2":
        return (
          <div className={metricContainerStyle}>
            <div className="flex-1 w-full">
              <MetricCard title="Processing Rate" value="94.2%" icon={TrendingUp} trend="+2.1%" trendPositive />
            </div>
          </div>
        )
      case "metric-3":
        return (
          <div className={metricContainerStyle}>
            <div className="flex-1 w-full">
              <MetricCard title="Alerts Today" value="23" icon={AlertTriangle} trend="+5" trendPositive={false} />
            </div>
          </div>
        )
      case "metric-4":
        return (
          <div className={metricContainerStyle}>
            <div className="flex-1 w-full">
              <MetricCard title="API Calls" value="45.2K" icon={Zap} trend="+8.3%" trendPositive />
            </div>
          </div>
        )
      case "line-chart":
        return (
          <div className={containerStyle} style={{ minHeight: '200px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <LineChartComponent />
            </div>
          </div>
        )
      case "alerts":
        return (
          <div className={containerStyle} style={{ minHeight: '200px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <AlertsPanel />
            </div>
          </div>
        )
      case "bar-chart":
        return (
          <div className={containerStyle} style={{ minHeight: '200px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <BarChartComponent />
            </div>
          </div>
        )
      case "pie-chart":
        return (
          <div className={containerStyle} style={{ minHeight: '200px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <PieChartComponent />
            </div>
          </div>
        )
      case "area-chart":
        return (
          <div className={containerStyle} style={{ minHeight: '200px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <AreaChartComponent />
            </div>
          </div>
        )
      case "radar-chart":
        return (
          <div className={containerStyle} style={{ minHeight: '200px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <RadarChartComponent />
            </div>
          </div>
        )
      case "patterns":
        return (
          <div className={containerStyle} style={{ minHeight: '200px' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <PatternsTable title="Top External Patterns (Twitter)" patterns={externalPatterns} type="external" />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-8">
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
          width={containerWidth}
          onLayoutChange={onLayoutChange}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          compactType={isEditMode ? null : "vertical"}
          preventCollision={true}
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
  )
}
