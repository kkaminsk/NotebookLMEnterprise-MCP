import type { ToolError } from '../types/index.js'

// Error codes for MCP responses
export const ErrorCodes = {
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  PERMISSION_DENIED: 'permission_denied',
  UNAUTHENTICATED: 'unauthenticated',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  RESOURCE_EXHAUSTED: 'resource_exhausted',
  INTERNAL_ERROR: 'internal_error',
  INVALID_OPERATION: 'invalid_operation',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export class McpError extends Error {
  public readonly code: ErrorCode
  public readonly details?: Record<string, unknown>

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'McpError'
    this.code = code
    this.details = details
  }

  toToolError(): ToolError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    }
  }
}

// Google Cloud error interface (simplified)
interface GcpError {
  code?: number
  message?: string
  details?: unknown[]
}

// Map Google Cloud gRPC status codes to MCP errors
const GCP_STATUS_CODE_MAP: Record<number, ErrorCode> = {
  3: ErrorCodes.VALIDATION_ERROR, // INVALID_ARGUMENT
  5: ErrorCodes.NOT_FOUND, // NOT_FOUND
  7: ErrorCodes.PERMISSION_DENIED, // PERMISSION_DENIED
  8: ErrorCodes.RESOURCE_EXHAUSTED, // RESOURCE_EXHAUSTED
  16: ErrorCodes.UNAUTHENTICATED, // UNAUTHENTICATED
}

export function mapGcpError(error: unknown): McpError {
  // Check if it's a Google Cloud error with a code
  if (error instanceof Error) {
    const gcpError = error as Error & GcpError

    if (typeof gcpError.code === 'number') {
      const mcpCode = GCP_STATUS_CODE_MAP[gcpError.code] ?? ErrorCodes.INTERNAL_ERROR
      const message = getEnhancedMessage(mcpCode, gcpError.message ?? error.message)
      return new McpError(mcpCode, message)
    }

    // Check for HTTP-style errors
    const httpError = error as Error & { status?: number; statusCode?: number }
    const httpStatus = httpError.status ?? httpError.statusCode

    if (typeof httpStatus === 'number') {
      const mcpCode = mapHttpStatus(httpStatus)
      const message = getEnhancedMessage(mcpCode, error.message)
      return new McpError(mcpCode, message)
    }

    return new McpError(ErrorCodes.INTERNAL_ERROR, error.message)
  }

  return new McpError(ErrorCodes.INTERNAL_ERROR, 'An unknown error occurred')
}

function mapHttpStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCodes.VALIDATION_ERROR
    case 401:
      return ErrorCodes.UNAUTHENTICATED
    case 403:
      return ErrorCodes.PERMISSION_DENIED
    case 404:
      return ErrorCodes.NOT_FOUND
    case 429:
      return ErrorCodes.RATE_LIMIT_EXCEEDED
    default:
      return ErrorCodes.INTERNAL_ERROR
  }
}

function getEnhancedMessage(code: ErrorCode, originalMessage: string): string {
  switch (code) {
    case ErrorCodes.UNAUTHENTICATED:
      return `${originalMessage}. Run 'gcloud auth application-default login' to authenticate.`
    case ErrorCodes.PERMISSION_DENIED:
      return `${originalMessage}. Ensure the service account has discoveryengine.* permissions.`
    case ErrorCodes.RATE_LIMIT_EXCEEDED:
      return `${originalMessage}. Consider implementing exponential backoff and retry.`
    case ErrorCodes.RESOURCE_EXHAUSTED:
      return `${originalMessage}. You may have exceeded your quota limits.`
    default:
      return originalMessage
  }
}

// Validation helpers
export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new McpError(
      ErrorCodes.VALIDATION_ERROR,
      `${fieldName} is required`,
      { field: fieldName }
    )
  }
}

export function validateArray(value: unknown, fieldName: string, minLength = 1): void {
  if (!Array.isArray(value)) {
    throw new McpError(
      ErrorCodes.VALIDATION_ERROR,
      `${fieldName} must be an array`,
      { field: fieldName }
    )
  }
  if (value.length < minLength) {
    throw new McpError(
      ErrorCodes.VALIDATION_ERROR,
      `${fieldName} must have at least ${minLength} item(s)`,
      { field: fieldName, minLength }
    )
  }
}

export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  validValues: readonly T[]
): asserts value is T {
  if (typeof value !== 'string' || !validValues.includes(value as T)) {
    throw new McpError(
      ErrorCodes.VALIDATION_ERROR,
      `${fieldName} must be one of: ${validValues.join(', ')}`,
      { field: fieldName, validValues }
    )
  }
}

export function validateOperationName(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new McpError(
      ErrorCodes.VALIDATION_ERROR,
      'operation_id must be a string',
      { field: 'operation_id' }
    )
  }

  const operationPattern = /^projects\/[^/]+\/locations\/[^/]+\/operations\/[^/]+$/
  if (!operationPattern.test(value)) {
    throw new McpError(
      ErrorCodes.VALIDATION_ERROR,
      'operation_id must be in format: projects/{project}/locations/{location}/operations/{operation}',
      { field: 'operation_id', pattern: 'projects/{project}/locations/{location}/operations/{operation}' }
    )
  }
}
