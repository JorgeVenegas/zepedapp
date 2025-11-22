"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export function RecordsTable() {
  const records = [
    { id: "REC-001", source: "Twitter", status: "Processed", date: "2025-11-22 10:30", score: 0.92 },
    { id: "REC-002", source: "Facebook", status: "Processing", date: "2025-11-22 10:25", score: 0.87 },
    { id: "REC-003", source: "Instagram", status: "Processed", date: "2025-11-22 10:20", score: 0.95 },
    { id: "REC-004", source: "Twitter", status: "Failed", date: "2025-11-22 10:15", score: 0.45 },
    { id: "REC-005", source: "Facebook", status: "Processed", date: "2025-11-22 10:10", score: 0.88 },
  ]

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Source</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-border hover:bg-muted transition-colors">
                <td className="px-6 py-4 text-sm text-foreground font-mono">{record.id}</td>
                <td className="px-6 py-4 text-sm text-foreground">{record.source}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === "Processed"
                        ? "bg-green-500/20 text-green-700"
                        : record.status === "Processing"
                          ? "bg-blue-500/20 text-blue-700"
                          : "bg-red-500/20 text-red-700"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{record.date}</td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{(record.score * 100).toFixed(0)}%</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/records/${record.id}`}>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/50">
        <p className="text-sm text-muted-foreground">Showing 1-5 of 847 records</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}
