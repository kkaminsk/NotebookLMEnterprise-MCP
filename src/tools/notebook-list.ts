import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { mapGcpError } from '../errors/index.js'

export interface NotebookListInput {
  location?: string
  page_size?: number
  page_token?: string
  recently_viewed?: boolean
}

export interface NotebookSummary {
  name: string
  display_name: string
  create_time: string
}

export interface NotebookListOutput {
  notebooks: NotebookSummary[]
  next_page_token?: string
}

export const notebookListToolDefinition = {
  name: 'notebook_list',
  description: 'List notebooks accessible to the authenticated user.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      location: {
        type: 'string',
        description: 'Filter by location (us, eu, or global)',
        enum: ['us', 'eu', 'global'],
      },
      page_size: {
        type: 'number',
        description: 'Maximum number of notebooks to return (max 100)',
        minimum: 1,
        maximum: 100,
      },
      page_token: {
        type: 'string',
        description: 'Token for pagination',
      },
      recently_viewed: {
        type: 'boolean',
        description: 'If true, return only recently viewed notebooks',
      },
    },
    required: [],
  },
}

export async function handleNotebookList(
  client: DiscoveryEngineClient,
  input: NotebookListInput
): Promise<NotebookListOutput> {
  try {
    const rawClient = client.getRawClient()
    const parent = client.getParent()

    if (input.recently_viewed) {
      // Use listRecentlyViewedNotebooks for recently viewed
      const [response] = await rawClient.listRecentlyViewedNotebooks({
        parent,
        pageSize: input.page_size ?? 50,
        pageToken: input.page_token,
      })

      const notebooks = (response.notebooks ?? []).map((nb) => ({
        name: nb.name ?? '',
        display_name: nb.displayName ?? '',
        create_time: nb.createTime?.seconds?.toString() ?? '',
      }))

      return {
        notebooks,
        next_page_token: response.nextPageToken ?? undefined,
      }
    }

    // Standard list
    const [response] = await rawClient.listNotebooks({
      parent,
      pageSize: input.page_size ?? 50,
      pageToken: input.page_token,
    })

    const notebooks = (response.notebooks ?? []).map((nb) => ({
      name: nb.name ?? '',
      display_name: nb.displayName ?? '',
      create_time: nb.createTime?.seconds?.toString() ?? '',
    }))

    return {
      notebooks,
      next_page_token: response.nextPageToken ?? undefined,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}
