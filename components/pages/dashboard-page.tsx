"use client"

import { useState, useEffect, useRef, type DragEvent } from "react"
import GridLayout, { Layout } from "react-grid-layout"
import { RecordsGraphics } from "@/components/records/records-graphics"
import { TopPatternsCard } from "@/components/dashboard/top-patterns-card"
import { RecordsTable } from "@/components/records/records-table"
import { RecordsFilters } from "@/components/records/records-filters"
import { RecordsFilterPanel } from "@/components/records/records-filter-panel"
import { MexicoCityChart } from "@/components/dashboard/charts/mexico-city-chart"
import { Activity, Edit3, Eye, Plus, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ComponentsSidebar } from "@/components/dashboard/components-sidebar"
import type { Pattern } from "@/lib/types"

const INITIAL_GRID_ITEMS = new Set([
  "mexico-city-chart",
  "records-timeseries-overview",
  "records-pie-priority",
  "records-bar-service",
  "records-area-category",
  "records-line-trends",
  "records-pie-source",
  "records-bar-category",
  "top-patterns",
])

export function DashboardPage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [draggingComponentType, setDraggingComponentType] = useState<string | null>(null)
  const [editingComponent, setEditingComponent] = useState<{ id: string; type: string } | null>(null)
  const [recordsFilters, setRecordsFilters] = useState<Record<string, string[]>>({})
  const [isRecordsActionMenuCollapsed, setIsRecordsActionMenuCollapsed] = useState(false)
  const [graphicType, setGraphicType] = useState<'timeseries' | 'topN' | 'barChart' | 'pieChart' | 'areaChart' | 'treemap' | 'lineChart'>('timeseries')
  const [groupBy, setGroupBy] = useState<string>('service')
  const [componentConfigs, setComponentConfigs] = useState<Record<string, { graphicType: string; groupBy: string; filters: Record<string, string[]> }>>({
    'records-timeseries-overview': { graphicType: 'timeseries', groupBy: 'service', filters: {} },
    'records-pie-priority': { graphicType: 'pieChart', groupBy: 'priority', filters: {} },
    'records-bar-service': { graphicType: 'barChart', groupBy: 'service', filters: {} },
    'records-area-category': { graphicType: 'areaChart', groupBy: 'category', filters: {} },
    'records-line-trends': { graphicType: 'lineChart', groupBy: 'priority', filters: {} },
    'records-pie-source': { graphicType: 'pieChart', groupBy: 'source', filters: {} },
    'records-bar-category': { graphicType: 'barChart', groupBy: 'category', filters: {} },
    'top-patterns': { graphicType: 'patterns', groupBy: 'frequency', filters: {} },
    'records-bar-chart-1': { graphicType: 'barChart', groupBy: 'category', filters: {} },
    'records-treemap-1': { graphicType: 'treemap', groupBy: 'service,category', filters: {} }
  })
  const [facets, setFacets] = useState<any[]>([
    {
      field: 'service',
      label: 'Service',
      options: [
        { value: 'train', count: 45 },
        { value: 'metro', count: 32 },
        { value: 'bus', count: 28 }
      ]
    },
    {
      field: 'priority',
      label: 'Priority',
      options: [
        { value: 'P1', count: 12 },
        { value: 'P2', count: 23 },
        { value: 'P3', count: 31 },
        { value: 'P4', count: 28 },
        { value: 'P5', count: 11 }
      ]
    },
    {
      field: 'category',
      label: 'Category',
      options: [
        { value: 'accessibility', count: 18 },
        { value: 'delays-cancellations', count: 25 },
        { value: 'lost-items-security', count: 22 },
        { value: 'information-communication', count: 30 }
      ]
    }
  ])
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

  // Fetch facets and load component config when editing a records component
  useEffect(() => {
    if (editingComponent?.type?.startsWith('records-')) {
      fetchFacets()
      // Load existing configuration if available
      const config = componentConfigs[editingComponent.id]
      if (config) {
        setGraphicType(config.graphicType as any)
        setGroupBy(config.groupBy)
        setRecordsFilters(config.filters)
      } else {
        // Reset to defaults
        setGraphicType(editingComponent.type === 'records-bar-chart' ? 'barChart' : 'timeseries')
        setGroupBy('service')
        setRecordsFilters({})
      }
    }
  }, [editingComponent, componentConfigs])

  const fetchFacets = async () => {
    try {
      const response = await fetch('/api/records/facets')
      const result = await response.json()
      if (result.success) {
        setFacets(result.facets)
      }
    } catch (error) {
      console.error('Error fetching facets:', error)
      // Provide some default facets if API fails
      setFacets([
        {
          field: 'service',
          label: 'Service',
          options: [
            { value: 'train', count: 45 },
            { value: 'metro', count: 32 },
            { value: 'bus', count: 28 }
          ]
        },
        {
          field: 'priority',
          label: 'Priority',
          options: [
            { value: 'P1', count: 12 },
            { value: 'P2', count: 23 },
            { value: 'P3', count: 31 },
            { value: 'P4', count: 28 },
            { value: 'P5', count: 11 }
          ]
        },
        {
          field: 'category',
          label: 'Category',
          options: [
            { value: 'accessibility', count: 18 },
            { value: 'delays-cancellations', count: 25 },
            { value: 'lost-items-security', count: 22 },
            { value: 'information-communication', count: 30 }
          ]
        }
      ])
    }
  }

  const externalPatterns: Pattern[] = [
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

  const getComponentGridDefaults = (componentType: string) => {
    if (componentType === "metric") {
      return { w: 2, h: 2, minW: 2, minH: 2 }
    }
    if (componentType === "patterns") {
      return { w: 6, h: 3, minW: 6, minH: 3 }
    }
    if (componentType === "records-timeseries") {
      return { w: 8, h: 4, minW: 6, minH: 3 }
    }
    if (componentType === "records-bar-chart") {
      return { w: 6, h: 4, minW: 4, minH: 3 }
    }
    if (componentType === "records-pie-chart") {
      return { w: 6, h: 4, minW: 4, minH: 3 }
    }
    if (componentType === "records-treemap") {
      return { w: 8, h: 4, minW: 6, minH: 3 }
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
    // Mexico City Chart - Featured at top
    { i: "mexico-city-chart", x: 0, y: 0, w: 5, h: 5, minW: 5, minH: 2 },

    // Top row - patterns and priority chart
    { i: "top-patterns", x: 5, y: 0, w: 7, h: 5, minW: 4, minH: 4 },

    // Records Analytics - Comprehensive Dashboard (bigger sizes)
    { i: "records-timeseries-overview", x: 0, y: 5, w: 12, h: 5, minW: 8, minH: 4 },
    { i: "records-pie-priority", x: 0, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "records-bar-service", x: 6, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "records-area-category", x: 0, y: 15, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "records-line-trends", x: 6, y: 15, w: 6, h: 5, minW: 4, minH: 4 },

    // Additional analytics (bigger sizes)
    { i: "records-pie-source", x: 0, y: 20, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "records-bar-category", x: 6, y: 20, w: 6, h: 5, minW: 4, minH: 4 },
  ])

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(
      newLayout.filter((item) => item.i !== "__dropping-elem__" && item.i !== "__dropping-elem__custom__")
    )
  }

  const getComponentTypeFromKey = (key: string) => {
    if (key.startsWith("mexico-city-chart")) return "mexico-city-chart"
    if (key.startsWith("top-patterns")) return "top-patterns"
    if (key.startsWith("records-timeseries")) return "records-timeseries"
    if (key.startsWith("records-bar-chart")) return "records-bar-chart"
    if (key.startsWith("records-pie-chart")) return "records-pie-chart"
    if (key.startsWith("records-treemap")) return "records-treemap"
    return key
  }

  const renderGridItem = (key: string) => {
    const containerStyle = "h-full w-full overflow-hidden flex items-stretch"
    const metricContainerStyle = "h-full w-full flex flex-col"
    const componentType = getComponentTypeFromKey(key)

    if (componentType === "mexico-city-chart") {
      return (
        <div className={containerStyle} style={{ minHeight: '200px' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <MexicoCityChart variant="default" />
          </div>
        </div>
      )
    }

    if (componentType === "top-patterns") {
      const config = componentConfigs[key] || { graphicType: 'patterns', groupBy: 'frequency', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      
      return (
        <div className="h-full w-full p-4" style={{ minHeight: '300px' }}>
          <TopPatternsCard
            key={configKey}
            title="Top Patterns"
            filters={config.filters}
          />
        </div>
      )
    }

    if (componentType === "records-timeseries") {
      const config = componentConfigs[key] || { graphicType: 'timeseries', groupBy: 'service', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-bar-chart") {
      const config = componentConfigs[key] || { graphicType: 'barChart', groupBy: 'service', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-pie-chart") {
      const config = componentConfigs[key] || { graphicType: 'pieChart', groupBy: 'service', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-treemap") {
      const config = componentConfigs[key] || { graphicType: 'treemap', groupBy: 'service', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    // New specific records analytics components
    if (componentType === "records-timeseries-overview") {
      const config = componentConfigs[key] || { graphicType: 'timeseries', groupBy: 'service', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-pie-priority") {
      const config = componentConfigs[key] || { graphicType: 'pieChart', groupBy: 'priority', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-bar-service") {
      const config = componentConfigs[key] || { graphicType: 'barChart', groupBy: 'service', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-area-category") {
      const config = componentConfigs[key] || { graphicType: 'areaChart', groupBy: 'category', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-line-trends") {
      const config = componentConfigs[key] || { graphicType: 'lineChart', groupBy: 'priority', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-pie-source") {
      const config = componentConfigs[key] || { graphicType: 'pieChart', groupBy: 'source', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
        </div>
      )
    }

    if (componentType === "records-bar-category") {
      const config = componentConfigs[key] || { graphicType: 'barChart', groupBy: 'category', filters: {} }
      const configKey = `${key}-${config.graphicType}-${config.groupBy}-${JSON.stringify(config.filters)}`
      return (
        <div className="h-full w-full overflow-hidden" style={{ minHeight: '200px' }}>
          <RecordsGraphics 
            key={configKey}
            graphicType={config.graphicType as any} 
            groupBy={config.groupBy} 
            filters={config.filters}
            showControls={false}
          />
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

  const removeComponent = (componentId: string) => {
    setLayout((prev) => prev.filter((item) => item.i !== componentId))
  }

  const handleEditComponent = (componentId: string) => {
    const componentType = getComponentTypeFromKey(componentId)
    setEditingComponent({ id: componentId, type: componentType })
  }

  const handleComponentDragStart = (componentType: string) => {
    setDraggingComponentType(componentType)
  }

  const handleComponentDragEnd = () => {
    setDraggingComponentType(null)
  }

  const handleDrop = (_layout: Layout[], layoutItem: Layout, event: Event) => {
    const dragEvent = event as unknown as DragEvent
    const componentType = dragEvent.dataTransfer?.getData(DATA_TRANSFER_TYPE) || draggingComponentType
    if (!componentType) return
    const defaults = getComponentGridDefaults(componentType)
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

    // Since the drag image is centered on the cursor, use layoutItem position directly
    const targetX = clamp(layoutItem.x, 0, GRID_COLS - defaults.w)
    const targetY = Math.max(layoutItem.y, 0)

    addComponent(componentType, { x: targetX, y: targetY })
    setDraggingComponentType(null)
  }

  const handleDropDragOver = (event: any) => {
    event.preventDefault()
    const componentType = event.dataTransfer?.getData(DATA_TRANSFER_TYPE) || draggingComponentType || ""
    if (!draggingComponentType && componentType) {
      setDraggingComponentType(componentType)
    }
    const defaults = getComponentGridDefaults(componentType)

    // Calculate grid position from cursor, accounting for centered drag image
    if (containerRef.current && event.clientX && event.clientY) {
      const rect = containerRef.current.getBoundingClientRect()
      const colWidth = (containerWidth - GRID_MARGIN[0] * (GRID_COLS - 1) - GRID_CONTAINER_PADDING[0] * 2) / GRID_COLS
      const relativeX = event.clientX - rect.left - GRID_CONTAINER_PADDING[0]
      const relativeY = event.clientY - rect.top - GRID_CONTAINER_PADDING[1]

      // Calculate which grid cell the cursor is over
      const col = Math.floor(relativeX / (colWidth + GRID_MARGIN[0]))
      const row = Math.floor(relativeY / (GRID_ROW_HEIGHT + GRID_MARGIN[1]))

      // Center the component under cursor by offsetting by half its size
      const x = Math.max(0, Math.min(col - Math.floor(defaults.w / 2), GRID_COLS - defaults.w))
      const y = Math.max(0, row - Math.floor(defaults.h / 2))

      return { w: defaults.w, h: defaults.h, x, y }
    }

    return { w: defaults.w, h: defaults.h }
  }

  const dropPlaceholder = draggingComponentType
    ? { i: "__dropping-elem__custom__", ...getComponentGridDefaults(draggingComponentType) }
    : undefined

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-red-50/30 via-slate-50 to-rose-50/20 relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.04),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fef2f2_1px,transparent_1px),linear-gradient(to_bottom,#fef2f2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Header Section - Full Width */}
      <div className="relative z-20 bg-gradient-to-r from-white/90 via-red-50/90 to-white/90 backdrop-blur-xl border-b border-red-200/40 shadow-lg shadow-red-500/5">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-600 flex items-center gap-2 font-medium mb-0">
                  {isEditMode ? (
                    <>
                      <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        EDIT MODE
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">Drag to move, resize from edges</span>
                    </>
                  ) : (
                    <span className="bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                      Real-time mobility insights and analytics
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={() => {
                    setIsEditMode((prev) => {
                      const next = !prev
                      if (!next) setIsSidebarOpen(false)
                      return next
                    })
                  }}
                  variant={isEditMode ? "default" : "outline"}
                  size="default"
                  className={`flex items-center gap-2 transition-all duration-150 font-bold ${
                    isEditMode
                      ? "bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white shadow-xl shadow-red-500/50 border-0 hover:shadow-2xl hover:shadow-red-500/60 hover:scale-105"
                      : "border-2 border-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-red-50 hover:border-red-400 hover:shadow-lg"
                  }`}
                >
                  {isEditMode ? (
                    <>
                      <Eye className="w-4 h-4" />
                      View Mode
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Edit Layout
                    </>
                  )}
                </Button>
                {isEditMode && !isSidebarOpen && (
                  <Button
                    onClick={() => {
                      setIsEditMode(true)
                      setIsSidebarOpen(true)
                    }}
                    variant="default"
                    size="default"
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-600 text-white shadow-xl shadow-emerald-500/50 border-0 font-bold hover:shadow-2xl hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-150"
                  >
                    <Plus className="w-4 h-4" />
                    Add Component
                  </Button>
                )}
              </div>
            </div>
          </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex h-[calc(100vh-140px)] relative z-10">
        <div className="flex-1 overflow-auto px-8 py-8">
          <style jsx global>{`
            @keyframes gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-gradient {
              animation: gradient 3s ease infinite;
            }
          `}</style>

      <style jsx global>{`
        .react-grid-layout {
          position: relative;
          transition: height 200ms ease;
          padding-bottom: 40px;
        }
        .react-grid-item {
          transition: all 250ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          transition-property: transform !important;
          margin-bottom: 8px;
          box-sizing: border-box;
        }
        .react-grid-item.resizing {
          transition: none !important;
        }
        .react-grid-item.react-grid-placeholder {
          transition: all 150ms ease-out !important;
        }
        .react-grid-item > div {
          width: 100% !important;
          height: 100% !important;
          box-sizing: border-box;
          transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), filter 150ms ease !important;
        }
        .react-grid-item.react-dragging {
          z-index: 100;
        }
        .react-grid-item.react-dragging > div {
          transform: scale(1.05) rotate(2deg) !important;
          filter: drop-shadow(0 20px 40px rgba(239, 68, 68, 0.4)) !important;
          transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), filter 150ms ease !important;
        }
        .react-grid-item:not(.react-dragging):hover > div {
          transform: translateY(-4px) !important;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,0.15)) !important;
        }
        .edit-mode-item:hover {
          border-color: rgba(239, 68, 68, 0.8) !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1), 0 8px 24px rgba(239, 68, 68, 0.2) !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(254,242,242,0.9)) !important;
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
          border-right: 3px solid rgba(239, 68, 68, 0.5);
          border-bottom: 3px solid rgba(239, 68, 68, 0.5);
          transition: all 0.2s ease;
        }
        .react-grid-item:hover > .react-resizable-handle::after {
          border-right: 3px solid rgba(239, 68, 68, 1);
          border-bottom: 3px solid rgba(239, 68, 68, 1);
          width: 12px;
          height: 12px;
        }
        .react-resizable-hide > .react-resizable-handle {
          display: none;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgb(239, 68, 68);
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

      <div className="relative w-full min-h-[calc(100vh-180px)]" ref={containerRef}>
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
          {layout.map((item, index) => {
            // Assign a gradient color based on position for variety
            const gradientColors = [
              'from-blue-400/60 via-cyan-400/60 to-blue-400/60',
              'from-purple-400/60 via-pink-400/60 to-purple-400/60',
              'from-emerald-400/60 via-teal-400/60 to-emerald-400/60',
              'from-orange-400/60 via-amber-400/60 to-orange-400/60',
              'from-rose-400/60 via-pink-400/60 to-rose-400/60',
              'from-indigo-400/60 via-blue-400/60 to-indigo-400/60',
            ];
            const gradientColor = gradientColors[index % gradientColors.length];

            return (
            <div
              key={item.i}
              className={`group/item transition-all duration-100 ${isEditMode ? 'edit-mode-item' : ''}`}
              style={{
                border: 'none',
                borderRadius: '20px',
                transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: 'transparent',
                width: '100%',
                height: '100%',
                display: 'flex',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Main content with glass effect */}
              <div className="w-full h-full rounded-[20px] overflow-hidden backdrop-blur-sm bg-white/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] group-hover/item:shadow-[0_30px_60px_-15px_rgba(239,68,68,0.4)] transition-all duration-200 relative" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(249,250,251,0.95))'
              }}>
                {/* Edit mode action buttons */}
                {isEditMode && (
                  <div className="absolute top-2 right-2 z-[60] flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEditComponent(item.i)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-lg bg-white/95 hover:bg-red-500 hover:text-white border border-slate-200 shadow-lg backdrop-blur-sm transition-all duration-150 hover:scale-110"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeComponent(item.i)
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 rounded-lg bg-white/95 hover:bg-red-600 hover:text-white border border-slate-200 shadow-lg backdrop-blur-sm transition-all duration-150 hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="w-full h-full rounded-[20px] overflow-hidden">
                  {renderGridItem(item.i)}
                </div>
              </div>
            </div>
          )})}
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

      {/* Edit Component Modal */}
      {editingComponent && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 ${
          editingComponent?.type?.startsWith('records-') || editingComponent?.type === 'top-patterns'
            ? 'max-w-5xl max-h-[85vh]' 
            : 'max-w-2xl max-h-[80vh]'
        }`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Edit Component - {editingComponent.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h2>
              <Button
                onClick={() => setEditingComponent(null)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-white/20 text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className={`overflow-y-auto ${
              editingComponent?.type?.startsWith('records-') || editingComponent?.type === 'top-patterns'
                ? 'max-h-[calc(85vh-140px)]' 
                : 'max-h-[calc(80vh-140px)]'
            }`}>
              {editingComponent?.type?.startsWith('records-') || editingComponent?.type === 'top-patterns' ? (
                <div className="h-full overflow-hidden bg-gradient-to-br from-red-50/30 via-slate-50 to-rose-50/20 relative flex flex-col">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.04),transparent_50%)] pointer-events-none"></div>
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#fef2f2_1px,transparent_1px),linear-gradient(to_bottom,#fef2f2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

                  <style jsx global>{`
                    @keyframes gradient {
                      0%, 100% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                    }
                    .animate-gradient {
                      animation: gradient 3s ease infinite;
                    }
                  `}</style>



                  <div className="px-4 pt-4 pb-3 relative z-20">
                    <RecordsFilters
                      onFiltersChange={setRecordsFilters}
                      onToggleActionMenu={() => setIsRecordsActionMenuCollapsed(!isRecordsActionMenuCollapsed)}
                      isActionMenuCollapsed={isRecordsActionMenuCollapsed}
                      visualizationMode="graphic"
                      onVisualizationModeChange={() => {}}
                      graphicType={graphicType}
                      onGraphicTypeChange={setGraphicType}
                      groupBy={groupBy}
                      onGroupByChange={setGroupBy}
                      dateRange="Last 2 years"
                    />
                  </div>

                  <div className="flex-1 flex overflow-hidden relative z-10 min-h-0 px-4 pb-4">
                    <RecordsFilterPanel
                      onFiltersChange={setRecordsFilters}
                      isCollapsed={isRecordsActionMenuCollapsed}
                      facets={facets}
                      loading={false}
                      selectedFilters={recordsFilters}
                    />
                    <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Chart Preview</h3>
                        <p className="text-sm text-slate-600 mb-4">Preview of how your chart will look with current filters and settings</p>
                        <div className="h-80 w-full border border-slate-200 rounded-lg overflow-hidden">
                          <RecordsGraphics
                            filters={recordsFilters}
                            graphicType={graphicType}
                            groupBy={groupBy}
                            dateRange="Last 2 years"
                            showControls={false}
                          />
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Chart Configuration</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Type:</span>
                            <span className="ml-2 text-slate-800 capitalize">{graphicType}</span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Group by:</span>
                            <span className="ml-2 text-slate-800 capitalize">{groupBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-slate-700 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-600" />
                        <span className="font-semibold">Component ID:</span> {editingComponent.id}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">Component Settings</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-600 text-center py-8">
                          Component configuration options will be available here based on the component type.
                          <br />
                          <span className="text-xs text-slate-500 mt-2 block">
                            This feature allows you to customize data sources, display settings, and other component-specific options.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <Button
                onClick={() => setEditingComponent(null)}
                variant="outline"
                className="border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingComponent && (editingComponent.type.startsWith('records-') || editingComponent.type === 'top-patterns')) {
                    const newConfig = {
                      graphicType: editingComponent.type === 'top-patterns' ? 'patterns' : graphicType,
                      groupBy,
                      filters: { ...recordsFilters }
                    }
                    setComponentConfigs(prev => {
                      const updated = {
                        ...prev,
                        [editingComponent.id]: newConfig
                      }
                      console.log('Updating config for', editingComponent.id, newConfig)
                      return updated
                    })
                  }
                  setEditingComponent(null)
                }}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
