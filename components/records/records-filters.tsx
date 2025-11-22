"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"

export function RecordsFilters() {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Source: All", "Status: Active", "Date: Last 7 days"].map((filter) => (
            <div
              key={filter}
              className="px-3 py-1 rounded-full bg-muted text-sm text-foreground flex items-center gap-2"
            >
              {filter}
              <X className="w-3 h-3 cursor-pointer hover:text-primary" />
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="ml-auto bg-transparent">
          Add Filter
        </Button>
      </div>
    </Card>
  )
}
