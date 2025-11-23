"use client"

import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Table2, PieChart } from "lucide-react"

interface RecordsGraphicsProps {
  filters?: Record<string, string[]>
  graphicType: 'timeseries' | 'topN' | 'barChart' | 'pieChart'
  groupBy: string
  dateRange?: string
}

// Mock data generator based on train/metro mobility issues
const generateMockData = (groupBy: string, type: string) => {
  const categories = {
    service: ['Metro', 'Tren'],
    source: ['Mail', 'App', 'Web', 'Social Media', 'Phone'],
    category: [
      'Delays-Cancellations',
      'Staff-Passenger Behavior',
      'Accessibility',
      'Facilities-Cleanliness',
      'Tickets-Fares',
      'Lost Items-Security',
      'Information-Communication'
    ],
    priority: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'],
    subservice: [
      'Conductor',
      'Taquilla',
      'Información',
      'Accesibilidad',
      'Limpieza',
      'Aire Acondicionado',
      'Wifi',
      'App'
    ]
  }

  const items = categories[groupBy as keyof typeof categories] || categories.service

  if (type === 'timeseries') {
    // Generate 24 hours of data
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      ...items.reduce((acc, item, idx) => ({
        ...acc,
        [item]: Math.floor(Math.random() * 50) + (idx * 10)
      }), {})
    }))
  }

  if (type === 'topN' || type === 'barChart') {
    return items.map((item, idx) => ({
      name: item,
      count: Math.floor(Math.random() * 200) + 50,
      percentage: (Math.random() * 40 + 10).toFixed(1)
    })).sort((a, b) => b.count - a.count)
  }

  if (type === 'pieChart') {
    const data = items.map((item) => ({
      name: item,
      value: Math.floor(Math.random() * 200) + 50
    }))
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return data.map(item => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(1)
    }))
  }

  return []
}

export function RecordsGraphics({ filters, graphicType, groupBy, dateRange }: RecordsGraphicsProps) {
  const data = generateMockData(groupBy, graphicType)

  if (graphicType === 'timeseries') {
    return (
      <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Incidents Over Time</h3>
          <p className="text-xs text-slate-500">Grouped by {groupBy}</p>
        </div>
        <div className="h-[400px] flex items-end gap-1">
          {(data as any[]).map((point, idx) => {
            const values = Object.entries(point).filter(([key]) => key !== 'time')
            const stackHeight = values.reduce((sum, [, val]) => sum + (val as number), 0)
            const maxHeight = Math.max(...(data as any[]).map(p => 
              Object.entries(p).filter(([k]) => k !== 'time').reduce((s, [, v]) => s + (v as number), 0)
            ))
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse" style={{ height: '360px' }}>
                  {values.map(([name, value], vIdx) => (
                    <div
                      key={name}
                      className="w-full transition-all hover:opacity-80"
                      style={{
                        height: `${((value as number) / maxHeight) * 100}%`,
                        backgroundColor: `hsl(${vIdx * 72}, 70%, 60%)`
                      }}
                      title={`${name}: ${value}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">{point.time}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.keys((data[0] as any) || {}).filter(k => k !== 'time').map((key, idx) => (
            <div key={key} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: `hsl(${idx * 72}, 70%, 60%)` }}
              />
              <span className="text-xs text-slate-600">{key}</span>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (graphicType === 'topN') {
    return (
      <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Top {data.length} by {groupBy}</h3>
          <p className="text-xs text-slate-500">Incident count distribution</p>
        </div>
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">{groupBy}</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">Count</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">%</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {(data as any[]).map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-slate-600">{item.count}</td>
                  <td className="px-4 py-3 text-xs text-right text-slate-500">{item.percentage}%</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  if (graphicType === 'barChart') {
    const maxCount = Math.max(...(data as any[]).map((d: any) => d.count))
    
    return (
      <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700">Incidents by {groupBy}</h3>
          <p className="text-xs text-slate-500">Distribution across categories</p>
        </div>
        <div className="space-y-4">
          {(data as any[]).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-32 text-sm text-slate-700 font-medium truncate" title={item.name}>
                {item.name}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-8 rounded-full flex items-center justify-end px-3 transition-all hover:opacity-90"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: `hsl(${idx * 45}, 70%, 55%)`
                    }}
                  >
                    <span className="text-xs font-semibold text-white">{item.count}</span>
                  </div>
                </div>
                <div className="w-12 text-xs text-slate-500 text-right">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (graphicType === 'pieChart') {
    const total = (data as any[]).reduce((sum: number, item: any) => sum + item.value, 0)
    let currentAngle = 0

    return (
      <Card className="bg-white border border-slate-200 h-full overflow-auto shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700">Distribution by {groupBy}</h3>
          <p className="text-xs text-slate-500">Proportional breakdown</p>
        </div>
        <div className="flex items-center justify-center gap-8">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {(data as any[]).map((item, idx) => {
                const percentage = (item.value / total) * 100
                const angle = (percentage / 100) * 360
                const startAngle = currentAngle
                currentAngle += angle

                // Calculate arc path
                const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180)
                const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180)
                const x2 = 50 + 45 * Math.cos(((startAngle + angle) * Math.PI) / 180)
                const y2 = 50 + 45 * Math.sin(((startAngle + angle) * Math.PI) / 180)
                const largeArc = angle > 180 ? 1 : 0

                return (
                  <path
                    key={idx}
                    d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={`hsl(${idx * 72}, 70%, 60%)`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <title>{`${item.name}: ${item.percentage}%`}</title>
                  </path>
                )
              })}
              {/* Center white circle for donut effect */}
              <circle cx="50" cy="50" r="25" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700">{total}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {(data as any[]).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: `hsl(${idx * 72}, 70%, 60%)` }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.value} ({item.percentage}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return null
}
