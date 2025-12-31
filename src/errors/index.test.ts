import { describe, it, expect } from 'vitest'
import {
  McpError,
  ErrorCodes,
  mapGcpError,
  validateRequired,
  validateArray,
  validateEnum,
  validateOperationName,
} from './index.js'

describe('McpError', () => {
  it('should create error with code and message', () => {
    const error = new McpError(ErrorCodes.NOT_FOUND, 'Resource not found')

    expect(error.code).toBe('not_found')
    expect(error.message).toBe('Resource not found')
    expect(error.name).toBe('McpError')
  })

  it('should include details when provided', () => {
    const error = new McpError(ErrorCodes.VALIDATION_ERROR, 'Invalid input', {
      field: 'name',
    })

    expect(error.details).toEqual({ field: 'name' })
  })

  it('should convert to tool error format', () => {
    const error = new McpError(ErrorCodes.NOT_FOUND, 'Not found', { id: '123' })
    const toolError = error.toToolError()

    expect(toolError).toEqual({
      code: 'not_found',
      message: 'Not found',
      details: { id: '123' },
    })
  })
})

describe('mapGcpError', () => {
  it('should map INVALID_ARGUMENT (code 3) to validation_error', () => {
    const gcpError = Object.assign(new Error('Bad request'), { code: 3 })
    const result = mapGcpError(gcpError)

    expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR)
  })

  it('should map NOT_FOUND (code 5) to not_found', () => {
    const gcpError = Object.assign(new Error('Not found'), { code: 5 })
    const result = mapGcpError(gcpError)

    expect(result.code).toBe(ErrorCodes.NOT_FOUND)
  })

  it('should map PERMISSION_DENIED (code 7) to permission_denied', () => {
    const gcpError = Object.assign(new Error('Permission denied'), { code: 7 })
    const result = mapGcpError(gcpError)

    expect(result.code).toBe(ErrorCodes.PERMISSION_DENIED)
    expect(result.message).toContain('discoveryengine.* permissions')
  })

  it('should map RESOURCE_EXHAUSTED (code 8) to resource_exhausted', () => {
    const gcpError = Object.assign(new Error('Quota exceeded'), { code: 8 })
    const result = mapGcpError(gcpError)

    expect(result.code).toBe(ErrorCodes.RESOURCE_EXHAUSTED)
    expect(result.message).toContain('quota limits')
  })

  it('should map UNAUTHENTICATED (code 16) to unauthenticated', () => {
    const gcpError = Object.assign(new Error('Invalid credentials'), { code: 16 })
    const result = mapGcpError(gcpError)

    expect(result.code).toBe(ErrorCodes.UNAUTHENTICATED)
    expect(result.message).toContain('gcloud auth application-default login')
  })

  it('should map HTTP 429 to rate_limit_exceeded', () => {
    const httpError = Object.assign(new Error('Too many requests'), { status: 429 })
    const result = mapGcpError(httpError)

    expect(result.code).toBe(ErrorCodes.RATE_LIMIT_EXCEEDED)
  })

  it('should map unknown codes to internal_error', () => {
    const gcpError = Object.assign(new Error('Unknown'), { code: 999 })
    const result = mapGcpError(gcpError)

    expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR)
  })

  it('should handle non-Error values', () => {
    const result = mapGcpError('string error')

    expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR)
    expect(result.message).toBe('An unknown error occurred')
  })
})

describe('validateRequired', () => {
  it('should pass for non-empty values', () => {
    expect(() => validateRequired('value', 'field')).not.toThrow()
    expect(() => validateRequired(123, 'field')).not.toThrow()
    expect(() => validateRequired({}, 'field')).not.toThrow()
  })

  it('should throw for undefined', () => {
    expect(() => validateRequired(undefined, 'field')).toThrow(McpError)
    expect(() => validateRequired(undefined, 'field')).toThrow('field is required')
  })

  it('should throw for null', () => {
    expect(() => validateRequired(null, 'field')).toThrow(McpError)
  })

  it('should throw for empty string', () => {
    expect(() => validateRequired('', 'field')).toThrow(McpError)
  })
})

describe('validateArray', () => {
  it('should pass for valid arrays', () => {
    expect(() => validateArray(['item'], 'field')).not.toThrow()
    expect(() => validateArray([1, 2, 3], 'field')).not.toThrow()
  })

  it('should throw for non-arrays', () => {
    expect(() => validateArray('not-array', 'field')).toThrow('must be an array')
    expect(() => validateArray({}, 'field')).toThrow('must be an array')
  })

  it('should throw for empty arrays when minLength is 1', () => {
    expect(() => validateArray([], 'field')).toThrow('must have at least 1 item')
  })

  it('should respect custom minLength', () => {
    expect(() => validateArray(['a'], 'field', 2)).toThrow('must have at least 2 item')
    expect(() => validateArray(['a', 'b'], 'field', 2)).not.toThrow()
  })
})

describe('validateEnum', () => {
  const validValues = ['a', 'b', 'c'] as const

  it('should pass for valid enum values', () => {
    expect(() => validateEnum('a', 'field', validValues)).not.toThrow()
    expect(() => validateEnum('b', 'field', validValues)).not.toThrow()
  })

  it('should throw for invalid values', () => {
    expect(() => validateEnum('d', 'field', validValues)).toThrow('must be one of: a, b, c')
  })

  it('should throw for non-strings', () => {
    expect(() => validateEnum(123, 'field', validValues)).toThrow(McpError)
  })
})

describe('validateOperationName', () => {
  it('should pass for valid operation names', () => {
    expect(() =>
      validateOperationName('projects/my-project/locations/us/operations/op-123')
    ).not.toThrow()
  })

  it('should throw for invalid format', () => {
    expect(() => validateOperationName('invalid-format')).toThrow(
      'operation_id must be in format'
    )
  })

  it('should throw for non-strings', () => {
    expect(() => validateOperationName(123)).toThrow('operation_id must be a string')
  })

  it('should throw for partial paths', () => {
    expect(() => validateOperationName('projects/my-project')).toThrow(McpError)
    expect(() => validateOperationName('projects/my-project/locations/us')).toThrow(McpError)
  })
})
