// Resource name patterns
export type NotebookName = `projects/${string}/locations/${string}/notebooks/${string}`
export type SourceName = `${NotebookName}/sources/${string}`
export type AudioOverviewName = `${NotebookName}/audioOverviews/${string}`
export type OperationName = `projects/${string}/locations/${string}/operations/${string}`

// Operation status
export type OperationStatus = 'RUNNING' | 'DONE' | 'FAILED'

export interface Operation {
  name: OperationName
  status: OperationStatus
  done: boolean
  error?: {
    code: number
    message: string
  }
  result?: unknown
  metadata?: {
    createTime?: string
    endTime?: string
    progressPercent?: number
  }
}

// Notebook types
export interface Notebook {
  name: NotebookName
  displayName: string
  createTime: string
  updateTime?: string
}

// Source types
export type SourceType = 'google_drive' | 'website' | 'youtube' | 'text' | 'file'

export type SourceStatus = 'PROCESSING' | 'READY' | 'FAILED'

export interface Source {
  name: SourceName
  type: SourceType
  status: SourceStatus
  title?: string
  wordCount?: number
}

export interface SourceInput {
  type: SourceType
  uri?: string
  url?: string
  videoUrl?: string
  content?: string
  title?: string
  base64Content?: string
  mimeType?: string
  filename?: string
}

// Audio overview types
export type AudioStatus = 'GENERATING' | 'READY' | 'FAILED'

export interface AudioOverview {
  name: AudioOverviewName
  status: AudioStatus
  audioUri?: string
  durationSeconds?: number
  generatedAt?: string
  error?: string
}

// Citation types
export interface Citation {
  textSpan: {
    start: number
    end: number
  }
  sourceId: string
  sourceTitle: string
  pageOrTimestamp?: string
}

// Query response types
export interface QueryResponse {
  answer: string
  citations: Citation[]
  conversationId: string
}

// Tool input/output types
export interface ToolError {
  code: string
  message: string
  details?: Record<string, unknown>
}
