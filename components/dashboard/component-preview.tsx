"use client"

import { Activity, AlertCircle, AlertTriangle, Plus } from "lucide-react"

interface ComponentPreviewProps {
  componentId: string
}

export function ComponentPreview({ componentId }: ComponentPreviewProps) {
  return (
    <div className="w-full h-full rounded-lg border border-border/80 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-md overflow-hidden">
      <div className="h-full w-full p-2 flex flex-col gap-2 justify-between">
        {componentId === 'metric' && (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-slate-100 rounded-lg p-2 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wide text-blue-600 font-semibold">Metric</span>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 leading-tight">1,234</div>
              <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">+12.5%</div>
            </div>
          </div>
        )}

        {componentId === 'line-chart' && (
          <div className="w-full h-full bg-gradient-to-br from-rose-50 to-white rounded-lg p-2 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-rose-500 font-semibold">Line Chart</div>
            <svg className="w-full h-16" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="preview-line" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,75 L 30,55 L 60,65 L 90,35 L 120,48 L 150,22 L 180,32 L 200,28 L 200,100 L 0,100 Z"
                fill="url(#preview-line)"
              />
              <polyline
                points="0,75 30,55 60,65 90,35 120,48 150,22 180,32 200,28"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.5"
              />
              {[0, 30, 60, 90, 120, 150, 180, 200].map((x, i) => {
                const y = [75, 55, 65, 35, 48, 22, 32, 28][i]
                return <circle key={i} cx={x} cy={y} r="4" fill="#ec4899" opacity="0.9" />
              })}
            </svg>
          </div>
        )}

        {componentId === 'bar-chart' && (
          <div className="w-full h-full bg-gradient-to-br from-cyan-100 via-white to-slate-50 rounded-lg p-2 shadow-sm border border-cyan-100">
            <div className="text-[11px] uppercase tracking-wide text-cyan-700 font-semibold">Bar Chart</div>
            <svg className="w-full h-16" viewBox="0 0 200 100">
              {[40, 70, 55, 80, 60].map((height, i) => {
                const width = 22
                const gap = 14
                const x = 12 + i * (width + gap)
                return <rect key={i} x={x} y={100 - height} width={width} height={height} fill="#06b6d4" rx="4" />
              })}
            </svg>
          </div>
        )}

        {componentId === 'pie-chart' && (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-white rounded-lg p-2 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-amber-600 font-semibold">Pie Chart</div>
            <div className="w-full flex items-center justify-center">
              <svg className="w-18 h-18" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="#fde68a" />
                <path d="M 50 50 L 50 10 A 40 40 0 0 1 85 65 Z" fill="#f97316" />
                <path d="M 50 50 L 85 65 A 40 40 0 0 1 35 85 Z" fill="#ef4444" />
              </svg>
            </div>
          </div>
        )}

        {componentId === 'area-chart' && (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-white rounded-lg p-2 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-indigo-600 font-semibold">Area Chart</div>
            <svg className="w-full h-16" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="preview-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,70 L 40,50 L 80,60 L 120,40 L 160,46 L 200,32 L 200,100 L 0,100 Z"
                fill="url(#preview-area)"
              />
              <polyline
                points="0,70 40,50 80,60 120,40 160,46 200,32"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        )}

        {componentId === 'radar-chart' && (
          <div className="w-full h-full bg-gradient-to-br from-fuchsia-50 to-white rounded-lg p-2 shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-fuchsia-600 font-semibold">Radar Chart</div>
            <div className="w-full flex items-center justify-center">
              <svg className="w-18 h-18" viewBox="0 0 100 100">
                <polygon points="50,12 82,30 88,60 50,82 18,60 14,30" fill="#d946ef33" stroke="#d946ef" strokeWidth="2" />
                <polygon points="50,20 70,35 75,55 50,72 28,55 24,35" fill="none" stroke="#d946ef99" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        )}

        {componentId === 'alerts' && (
          <div className="w-full h-full bg-gradient-to-br from-red-50 to-white rounded-lg p-2 shadow-sm space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-red-600 font-semibold">Alerts</div>
            <div className="flex items-center gap-2 bg-white/80 border border-red-100 p-2 rounded">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-slate-800">High error rate</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 border border-amber-100 p-2 rounded">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-slate-800">Data spike</span>
            </div>
          </div>
        )}

        {componentId === 'patterns' && (
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-white rounded-lg p-2 shadow-sm space-y-2 text-xs">
            <div className="text-[11px] uppercase tracking-wide text-slate-600 font-semibold">Patterns</div>
            <div className="flex justify-between bg-white border border-slate-100 p-2 rounded">
              <span className="font-semibold text-slate-800">#mobility</span>
              <span className="text-blue-600 font-semibold">342</span>
            </div>
            <div className="flex justify-between bg-white border border-slate-100 p-2 rounded">
              <span className="font-semibold text-slate-800">EV charging</span>
              <span className="text-blue-600 font-semibold">287</span>
            </div>
            <div className="flex justify-between bg-white border border-slate-100 p-2 rounded">
              <span className="font-semibold text-slate-800">Smart cities</span>
              <span className="text-blue-600 font-semibold">156</span>
            </div>
          </div>
        )}

        {!['metric','line-chart','bar-chart','pie-chart','area-chart','radar-chart','alerts','patterns'].includes(componentId) && (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-muted-foreground">
            <Plus className="w-4 h-4 mb-1" />
            <span>Preview unavailable</span>
          </div>
        )}
      </div>
    </div>
  )
}
