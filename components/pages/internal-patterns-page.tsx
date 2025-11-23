"use client"

import { PatternsTable } from "@/components/dashboard/patterns-table"
import { useState } from "react"

export function InternalPatternsPage() {
  const internalPatterns = [
    {
      id: "i1",
      title: "user feedback",
      description: "Pattern related to user feedback submissions",
      filters: {},
      priority: 3,
      frequency: 412,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
    {
      id: "i2",
      title: "performance issue",
      description: "Pattern related to performance concerns",
      filters: {},
      priority: 4,
      frequency: 298,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
    {
      id: "i3",
      title: "feature request",
      description: "Pattern related to feature requests",
      filters: {},
      priority: 2,
      frequency: 245,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
    {
      id: "i4",
      title: "data accuracy",
      description: "Pattern related to data accuracy issues",
      filters: {},
      priority: 3,
      frequency: 189,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
    {
      id: "i5",
      title: "integration delay",
      description: "Pattern related to integration delays",
      filters: {},
      priority: 3,
      frequency: 156,
      timeRangeStart: "2025-01-15",
      timeRangeEnd: "2025-11-22",
      incidentIds: [],
      created_at: "2025-01-15",
      updated_at: "2025-11-22",
    },
  ]

  const [sortBy, setSortBy] = useState<"frequency" | "date">("frequency")

  const sorted = [...internalPatterns].sort((a, b) =>
    sortBy === "frequency" ? b.frequency - a.frequency : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Internal Patterns</h1>
        <p className="text-gray-600">Patterns extracted from your internal data sources</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSortBy("frequency")}
          className={`px-4 py-2 rounded-md font-medium transition ${
            sortBy === "frequency" ? "bg-red-600 text-white" : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
          }`}
        >
          Sort by Frequency
        </button>
        <button
          onClick={() => setSortBy("date")}
          className={`px-4 py-2 rounded-md font-medium transition ${
            sortBy === "date" ? "bg-red-600 text-white" : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
          }`}
        >
          Sort by Date
        </button>
      </div>

      <PatternsTable title="All Internal Patterns" patterns={sorted} type="internal" />
    </div>
  )
}
