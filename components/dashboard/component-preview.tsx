"use client"

import { Activity, AlertCircle, AlertTriangle, Plus } from "lucide-react"

interface ComponentPreviewProps {
  componentId: string
}

export function ComponentPreview({ componentId }: ComponentPreviewProps) {
  return (
    <>
      {componentId === 'metric' && (
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Metric</span>
            <Activity className="w-6 h-6 text-blue-500 opacity-50" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">1,234</div>
            <div className="text-xs text-green-500 mt-1">+12.5%</div>
          </div>
        </div>
      )}
      {componentId === 'line-chart' && (
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <polyline
            points="0,80 30,60 60,70 90,40 120,50 150,20 180,30 200,25"
            fill="none"
            stroke="#ec4899"
            strokeWidth="2"
          />
          {[0, 30, 60, 90, 120, 150, 180, 200].map((x, i) => {
            const y = [80, 60, 70, 40, 50, 20, 30, 25][i]
            return <circle key={i} cx={x} cy={y} r="3" fill="#ec4899" />
          })}
        </svg>
      )}
      {componentId === 'bar-chart' && (
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <rect x="10" y="40" width="30" height="60" fill="#06b6d4" rx="2" />
          <rect x="50" y="30" width="30" height="70" fill="#06b6d4" rx="2" />
          <rect x="90" y="50" width="30" height="50" fill="#06b6d4" rx="2" />
          <rect x="130" y="20" width="30" height="80" fill="#06b6d4" rx="2" />
          <rect x="170" y="45" width="30" height="55" fill="#06b6d4" rx="2" />
        </svg>
      )}
      {componentId === 'pie-chart' && (
        <svg className="w-24 h-24" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#ef4444" />
          <path d="M 50 50 L 50 10 A 40 40 0 0 1 85 65 Z" fill="#f97316" />
          <path d="M 50 50 L 85 65 A 40 40 0 0 1 35 85 Z" fill="#84cc16" />
        </svg>
      )}
      {componentId === 'area-chart' && (
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="preview-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0,80 L 40,60 L 80,70 L 120,50 L 160,55 L 200,40 L 200,100 L 0,100 Z"
            fill="url(#preview-gradient)"
          />
          <polyline
            points="0,80 40,60 80,70 120,50 160,55 200,40"
            fill="none"
            stroke="#ec4899"
            strokeWidth="2"
          />
        </svg>
      )}
      {componentId === 'radar-chart' && (
        <svg className="w-24 h-24" viewBox="0 0 100 100">
          <polygon points="50,10 80,30 85,60 50,80 15,60 20,30" fill="#ec4899" opacity="0.3" stroke="#ec4899" strokeWidth="2" />
          <polygon points="50,20 70,35 75,55 50,70 25,55 30,35" fill="none" stroke="#ddd" strokeWidth="1" />
          <line x1="50" y1="50" x2="50" y2="10" stroke="#ddd" strokeWidth="1" />
          <line x1="50" y1="50" x2="80" y2="30" stroke="#ddd" strokeWidth="1" />
          <line x1="50" y1="50" x2="85" y2="60" stroke="#ddd" strokeWidth="1" />
          <line x1="50" y1="50" x2="50" y2="80" stroke="#ddd" strokeWidth="1" />
          <line x1="50" y1="50" x2="15" y2="60" stroke="#ddd" strokeWidth="1" />
          <line x1="50" y1="50" x2="20" y2="30" stroke="#ddd" strokeWidth="1" />
        </svg>
      )}
      {componentId === 'alerts' && (
        <div className="w-full h-full flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/60 p-2 rounded">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-foreground">High error rate</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 p-2 rounded">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-foreground">Data spike</span>
          </div>
        </div>
      )}
      {componentId === 'patterns' && (
        <div className="w-full h-full flex flex-col gap-1 text-xs">
          <div className="flex justify-between bg-white/60 p-2 rounded">
            <span className="font-medium">#mobility</span>
            <span className="text-blue-600">342</span>
          </div>
          <div className="flex justify-between bg-white/60 p-2 rounded">
            <span className="font-medium">EV charging</span>
            <span className="text-blue-600">287</span>
          </div>
          <div className="flex justify-between bg-white/60 p-2 rounded">
            <span className="font-medium">smart cities</span>
            <span className="text-blue-600">156</span>
          </div>
        </div>
      )}
    </>
  )
}
