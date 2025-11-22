"use client"

import { PatternsTable } from "@/components/dashboard/patterns-table"
import { useState } from "react"

export function InternalPatternsPage() {
  const internalPatterns = [
    {
      id: "i1",
      text: "user feedback",
      count: 412,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "internal" as const,
    },
    {
      id: "i2",
      text: "performance issue",
      count: 298,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "internal" as const,
    },
    {
      id: "i3",
      text: "feature request",
      count: 245,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "internal" as const,
    },
    {
      id: "i4",
      text: "data accuracy",
      count: 189,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "internal" as const,
    },
    {
      id: "i5",
      text: "integration delay",
      count: 156,
      recordIds: [],
      firstSeen: "2025-01-15",
      lastSeen: "2025-11-22",
      type: "internal" as const,
    },
  ]

  const [sortBy, setSortBy] = useState<"count" | "date">("count")

  const sorted = [...internalPatterns].sort((a, b) =>
    sortBy === "count" ? b.count - a.count : new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime(),
  )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Internal Patterns</h1>
        <p className="text-gray-600">Patterns extracted from your internal data sources</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSortBy("count")}
          className={`px-4 py-2 rounded-md font-medium transition ${
            sortBy === "count" ? "bg-red-600 text-white" : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
          }`}
        >
          Sort by Count
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
