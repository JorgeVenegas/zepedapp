"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Pattern } from "@/lib/types"

interface PatternsTableProps {
  title: string
  patterns: Pattern[]
  type: "external" | "internal"
}

export function PatternsTable({ title, patterns, type }: PatternsTableProps) {
  return (
    <Card className="bg-white border-red-200">
      <CardHeader className="border-b border-red-100">
        <CardTitle className="text-red-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-red-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Pattern</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Count</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {patterns.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No patterns found
                  </td>
                </tr>
              ) : (
                patterns.map((pattern) => (
                  <tr key={pattern.id} className="border-b border-red-50 hover:bg-red-50 transition">
                    <td className="py-3 px-4 text-gray-800 font-medium">{pattern.text}</td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                        {pattern.count}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600 text-xs">
                      {new Date(pattern.lastSeen).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
