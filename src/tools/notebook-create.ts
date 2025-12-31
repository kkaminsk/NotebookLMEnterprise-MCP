import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, mapGcpError } from '../errors/index.js'
import type { Notebook } from '../types/index.js'

export interface NotebookCreateInput {
  display_name: string
  location?: string
  notebook_id?: string
}

export interface NotebookCreateOutput {
  name: string
  display_name: string
  create_time: string
}

export const notebookCreateToolDefinition = {
  name: 'notebook_create',
  description: 'Create a new NotebookLM notebook for organizing and querying sources.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      display_name: {
        type: 'string',
        description: 'Human-readable name for the notebook',
      },
      location: {
        type: 'string',
        description: 'GCP location (us, eu, or global). Defaults to server configuration.',
        enum: ['us', 'eu', 'global'],
      },
      notebook_id: {
        type: 'string',
        description: 'Custom notebook ID. Auto-generated if not provided.',
      },
    },
    required: ['display_name'],
  },
}

export async function handleNotebookCreate(
  client: DiscoveryEngineClient,
  input: NotebookCreateInput
): Promise<NotebookCreateOutput> {
  validateRequired(input.display_name, 'display_name')

  try {
    const rawClient = client.getRawClient()
    const parent = client.getParent()

    const [notebook] = await rawClient.createNotebook({
      parent,
      notebook: {
        displayName: input.display_name,
      },
      notebookId: input.notebook_id,
    })

    const result = notebook as unknown as Notebook

    return {
      name: result.name,
      display_name: result.displayName,
      create_time: result.createTime,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}
