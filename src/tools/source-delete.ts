import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateArray, mapGcpError, McpError, ErrorCodes } from '../errors/index.js'

export interface SourceDeleteInput {
  source_names: string[]
}

export interface DeleteResult {
  name: string
  success: boolean
  error?: string
}

export interface SourceDeleteOutput {
  results: DeleteResult[]
  all_succeeded: boolean
}

export const sourceDeleteToolDefinition = {
  name: 'source_delete',
  description: 'Delete one or more sources from a notebook.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      source_names: {
        type: 'array',
        items: { type: 'string' },
        description: 'Full resource names of sources to delete',
        minItems: 1,
      },
    },
    required: ['source_names'],
  },
}

export async function handleSourceDelete(
  client: DiscoveryEngineClient,
  input: SourceDeleteInput
): Promise<SourceDeleteOutput> {
  validateArray(input.source_names, 'source_names', 1)

  const results: DeleteResult[] = []
  let allSucceeded = true

  const rawClient = client.getRawClient()

  for (const name of input.source_names) {
    try {
      await rawClient.deleteSource({ name })
      results.push({
        name,
        success: true,
      })
    } catch (error) {
      allSucceeded = false
      const mcpError = mapGcpError(error)
      results.push({
        name,
        success: false,
        error: mcpError.message,
      })
    }
  }

  if (results.every((r) => !r.success)) {
    throw new McpError(
      ErrorCodes.INTERNAL_ERROR,
      'All source deletions failed',
      { results }
    )
  }

  return {
    results,
    all_succeeded: allSucceeded,
  }
}
