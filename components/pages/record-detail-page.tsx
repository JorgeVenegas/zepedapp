"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface RecordDetailPageProps {
  recordId: string
}

export function RecordDetailPage({ recordId }: RecordDetailPageProps) {
  // Mock data - will be replaced with API call to Supabase
  const record = {
    id: recordId,
    source: "Twitter",
    status: "Processed",
    date: "2025-11-22 10:30",
    score: 0.92,
    content:
      "Just launched our new mobility analytics platform! Excited to see real-time insights into transportation patterns. #AI #Analytics #Mobility",
    author: "@mobility_tech",
    engagement: {
      likes: 1247,
      retweets: 342,
      replies: 89,
    },
    sentiment: "Positive",
    keywords: ["mobility", "analytics", "AI", "transportation"],
    processingTime: "2.3s",
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/records">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back to Records
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Record Details</h1>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post content - primary section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post card */}
          <Card className="bg-card border-border p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{record.author}</h2>
                <p className="text-sm text-muted-foreground">{record.date}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  record.status === "Processed"
                    ? "bg-green-500/20 text-green-700"
                    : record.status === "Processing"
                      ? "bg-blue-500/20 text-blue-700"
                      : "bg-red-500/20 text-red-700"
                }`}
              >
                {record.status}
              </span>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">{record.content}</p>
            </div>

            {/* Engagement metrics */}
            <div className="flex gap-6 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Likes</p>
                <p className="text-lg font-semibold text-foreground">{record.engagement.likes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Retweets</p>
                <p className="text-lg font-semibold text-foreground">{record.engagement.retweets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Replies</p>
                <p className="text-lg font-semibold text-foreground">{record.engagement.replies.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Keywords section */}
          <Card className="bg-card border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Extracted Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {record.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-4">
          <Card className="bg-card border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Record Metadata</h3>

            <div className="space-y-4 divide-y divide-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Record ID</p>
                <p className="text-sm font-mono text-foreground mt-1">{record.id}</p>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Source</p>
                <p className="text-sm text-foreground mt-1">{record.source}</p>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sentiment</p>
                <p className="text-sm text-foreground mt-1">{record.sentiment}</p>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Confidence Score</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-lg font-bold text-primary">{(record.score * 100).toFixed(0)}%</p>
                  <div className="flex-1 bg-border rounded-full h-2">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${record.score * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Processing Time</p>
                <p className="text-sm text-foreground mt-1">{record.processingTime}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
