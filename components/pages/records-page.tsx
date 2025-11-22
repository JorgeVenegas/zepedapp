"use client"

import { RecordsTable } from "@/components/records/records-table"
import { RecordsFilters } from "@/components/records/records-filters"

export function RecordsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Records</h1>
        <p className="text-muted-foreground mt-1">View and filter all pulled data records</p>
      </div>

      <RecordsFilters />
      <RecordsTable />
    </div>
  )
}
