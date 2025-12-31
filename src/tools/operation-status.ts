import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateOperationName } from '../errors/index.js'
import type { Operation, OperationName } from '../types/index.js'

export interface OperationStatusInput {
  operation_id: string
}

export interface OperationStatusOutput {
  name: string
  status: Operation['status']
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

export const operationStatusToolDefinition = {
  name: 'operation_status',
  description:
    'Check the status of a long-running operation. Use this to poll for completion of async operations like source ingestion or audio generation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      operation_id: {
        type: 'string',
        description:
          'The operation resource name in format: projects/{project}/locations/{location}/operations/{operation}',
      },
    },
    required: ['operation_id'],
  },
}

export async function handleOperationStatus(
  client: DiscoveryEngineClient,
  input: OperationStatusInput
): Promise<OperationStatusOutput> {
  validateOperationName(input.operation_id)

  const operation = await client.getOperation(input.operation_id as OperationName)

  return {
    name: operation.name,
    status: operation.status,
    done: operation.done,
    error: operation.error,
    result: operation.result,
    metadata: operation.metadata,
  }
}
