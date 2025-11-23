"use client"

import { PatternsTable } from "@/components/dashboard/patterns-table"
import { useState } from "react"
import { mockPatterns } from "@/lib/mockPatterns"

export function InternalPatternsPage() {
  const internalPatterns = mockPatterns // Using mock data for testing

  const [sortBy, setSortBy] = useState<"frequency" | "date">("frequency")

  const sorted = [...internalPatterns].sort((a, b) =>
    sortBy === "frequency" ? b.frequency - a.frequency : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-red-50/30 via-slate-50 to-rose-50/20 relative">
      {/* Background pattern */}
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

      {/* Header */}
      <div className="relative z-20 bg-gradient-to-r from-white/90 via-red-50/90 to-white/90 backdrop-blur-xl border-b border-red-200/40 shadow-lg shadow-red-500/5">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-black bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Internal Patterns
            </h1>
            <p className="text-sm text-slate-600 flex items-center gap-2 font-medium mb-0">
              <span className="bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                Patterns extracted from your internal data sources
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 space-y-6">

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
    </div>
  )
}
