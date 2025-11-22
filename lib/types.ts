export interface Record {
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

// Pattern types
export interface Pattern {
  id: string
  text: string
  count: number
  recordIds: string[]
  firstSeen: string
  lastSeen: string
  type: "external" | "internal"
}
