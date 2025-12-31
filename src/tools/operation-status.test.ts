import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleOperationStatus, operationStatusToolDefinition } from './operation-status.js'
import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { McpError, ErrorCodes } from '../errors/index.js'

describe('operationStatusToolDefinition', () => {
  it('should have correct name', () => {
    expect(operationStatusToolDefinition.name).toBe('operation_status')
  })

  it('should have required operation_id parameter', () => {
    expect(operationStatusToolDefinition.inputSchema.required).toContain('operation_id')
  })
})

describe('handleOperationStatus', () => {
  let mockClient: { getOperation: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockClient = {
      getOperation: vi.fn(),
    }
  })

  it('should return operation status for running operation', async () => {
    mockClient.getOperation.mockResolvedValue({
      name: 'projects/test/locations/us/operations/op-123',
      status: 'RUNNING',
      done: false,
      metadata: {
        progressPercent: 50,
      },
    })

    const result = await handleOperationStatus(
      mockClient as unknown as DiscoveryEngineClient,
      { operation_id: 'projects/test/locations/us/operations/op-123' }
    )

    expect(result.status).toBe('RUNNING')
    expect(result.done).toBe(false)
    expect(result.metadata?.progressPercent).toBe(50)
  })

  it('should return operation status for completed operation', async () => {
    mockClient.getOperation.mockResolvedValue({
      name: 'projects/test/locations/us/operations/op-123',
      status: 'DONE',
      done: true,
      result: { success: true },
    })

    const result = await handleOperationStatus(
      mockClient as unknown as DiscoveryEngineClient,
      { operation_id: 'projects/test/locations/us/operations/op-123' }
    )

    expect(result.status).toBe('DONE')
    expect(result.done).toBe(true)
    expect(result.result).toEqual({ success: true })
  })

  it('should return operation status for failed operation', async () => {
    mockClient.getOperation.mockResolvedValue({
      name: 'projects/test/locations/us/operations/op-123',
      status: 'FAILED',
      done: true,
      error: {
        code: 3,
        message: 'Invalid input',
      },
    })

    const result = await handleOperationStatus(
      mockClient as unknown as DiscoveryEngineClient,
      { operation_id: 'projects/test/locations/us/operations/op-123' }
    )

    expect(result.status).toBe('FAILED')
    expect(result.done).toBe(true)
    expect(result.error).toEqual({
      code: 3,
      message: 'Invalid input',
    })
  })

  it('should throw validation error for invalid operation ID format', async () => {
    await expect(
      handleOperationStatus(mockClient as unknown as DiscoveryEngineClient, {
        operation_id: 'invalid-format',
      })
    ).rejects.toThrow(McpError)

    await expect(
      handleOperationStatus(mockClient as unknown as DiscoveryEngineClient, {
        operation_id: 'invalid-format',
      })
    ).rejects.toMatchObject({
      code: ErrorCodes.VALIDATION_ERROR,
    })
  })

  it('should throw validation error for non-string operation ID', async () => {
    await expect(
      handleOperationStatus(mockClient as unknown as DiscoveryEngineClient, {
        operation_id: 123 as unknown as string,
      })
    ).rejects.toThrow('operation_id must be a string')
  })

  it('should propagate client errors', async () => {
    const clientError = new McpError(ErrorCodes.NOT_FOUND, 'Operation not found')
    mockClient.getOperation.mockRejectedValue(clientError)

    await expect(
      handleOperationStatus(mockClient as unknown as DiscoveryEngineClient, {
        operation_id: 'projects/test/locations/us/operations/op-123',
      })
    ).rejects.toThrow(clientError)
  })
})
