import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateArray, mapGcpError, McpError, ErrorCodes } from '../errors/index.js'

export interface NotebookDeleteInput {
  notebook_names: string[]
}

export interface DeleteResult {
  name: string
  success: boolean
  error?: string
}

export interface NotebookDeleteOutput {
  results: DeleteResult[]
  all_succeeded: boolean
}

export const notebookDeleteToolDefinition = {
  name: 'notebook_delete',
  description: 'Delete one or more notebooks. Returns status for each deletion.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      notebook_names: {
        type: 'array',
        items: { type: 'string' },
        description: 'Full resource names of notebooks to delete',
        minItems: 1,
      },
    },
    required: ['notebook_names'],
  },
}

export async function handleNotebookDelete(
  client: DiscoveryEngineClient,
  input: NotebookDeleteInput
): Promise<NotebookDeleteOutput> {
  validateArray(input.notebook_names, 'notebook_names', 1)

  const results: DeleteResult[] = []
  let allSucceeded = true

  const rawClient = client.getRawClient()

  // Process deletions - could be parallelized but sequential is safer
  for (const name of input.notebook_names) {
    try {
      await rawClient.deleteNotebook({ name })
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

  // If all failed, throw an error
  if (results.every((r) => !r.success)) {
    throw new McpError(
      ErrorCodes.INTERNAL_ERROR,
      'All notebook deletions failed',
      { results }
    )
  }

  return {
    results,
    all_succeeded: allSucceeded,
  }
}
