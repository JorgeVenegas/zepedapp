// Incident types
export interface Incident {
  id: string
  time: string
  service: string
  source: string
  subservice: string
  priority: number
  category: string
  sentiment_analysis: string | null
  summary: string
  original: string
  keywords: string[]
  created_at: string
  updated_at: string
}

// Pattern types
export interface Pattern {
  id: string
  title: string
  description: string
  filters: Record<string, any>
  priority: number
  frequency: number
  timeRangeEnd: string | null
  timeRangeStart: string | null
  incidentIds: string[]
  created_at: string
  updated_at: string
}

// Solution types
export interface Solution {
  id: string
  name: string
  description: string
  cost_min: number
  cost_max: number
  feasibility: number
  implementation_start_date: string
  implementation_end_date: string
  created_at: string
  updated_at: string
}

// Legacy DataRecord type (for backward compatibility)
export interface DataRecord {
  id: string
  source: "twitter" | "facebook" | "instagram" | "internal"
  type: "external" | "internal"
  status: "processed" | "processing" | "failed"
  date: string
  score: number
  content?: string
  patterns?: string[]
  metadata?: Record<string, any>
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// Settings types
export interface ProjectSettings {
  id: string
  name: string
  sources: DataSource[]
  createdAt: string
  updatedAt: string
}

export interface DataSource {
  id: string
  name: string
  type: "twitter" | "facebook" | "instagram"
  enabled: boolean
  config: Record<string, any>
}

// Alert types
export interface Alert {
  id: string
  type: "error" | "warning" | "success" | "info"
  message: string
  timestamp: string
  recordId?: string
}
