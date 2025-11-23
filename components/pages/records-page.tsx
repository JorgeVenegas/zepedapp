"use client"

import { useState } from "react"
import { RecordsTable } from "@/components/records/records-table"
import { RecordsFilters } from "@/components/records/records-filters"

export function RecordsPage() {
  const [filters, setFilters] = useState<Record<string, string[]>>({})

  return (
    <div className="p-6 space-y-4 h-full flex flex-col bg-gradient-to-br from-slate-50/50 via-white to-slate-100/30 backdrop-blur-sm">
      <RecordsFilters onFiltersChange={setFilters} />
      <div className="flex-1 overflow-hidden">
        <RecordsTable filters={filters} />
      </div>
    </div>
  )
}
