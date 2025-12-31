import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { mapGcpError, McpError, ErrorCodes } from '../errors/index.js'

export interface ResourceTemplate {
  uriTemplate: string
  name: string
  description: string
  mimeType: string
}

export const resourceTemplates: ResourceTemplate[] = [
  {
    uriTemplate: 'notebooklm://notebooks/{notebook_id}',
    name: 'NotebookLM Notebook',
    description: 'A NotebookLM notebook with sources and conversation history',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'notebooklm://notebooks/{notebook_id}/sources',
    name: 'Notebook Sources',
    description: 'List of sources in a NotebookLM notebook',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'notebooklm://notebooks/{notebook_id}/audio',
    name: 'Notebook Audio Overview',
    description: 'Audio overview status and content for a notebook',
    mimeType: 'application/json',
  },
]

export interface ParsedUri {
  type: 'notebook' | 'sources' | 'audio'
  notebookId: string
}

export function parseResourceUri(uri: string): ParsedUri {
  const notebookMatch = uri.match(/^notebooklm:\/\/notebooks\/([^/]+)$/)
  if (notebookMatch?.[1]) {
    return { type: 'notebook', notebookId: notebookMatch[1] }
  }

  const sourcesMatch = uri.match(/^notebooklm:\/\/notebooks\/([^/]+)\/sources$/)
  if (sourcesMatch?.[1]) {
    return { type: 'sources', notebookId: sourcesMatch[1] }
  }

  const audioMatch = uri.match(/^notebooklm:\/\/notebooks\/([^/]+)\/audio$/)
  if (audioMatch?.[1]) {
    return { type: 'audio', notebookId: audioMatch[1] }
  }

  throw new McpError(
    ErrorCodes.VALIDATION_ERROR,
    `Invalid resource URI: ${uri}`
  )
}

export async function handleResourceRead(
  client: DiscoveryEngineClient,
  uri: string
): Promise<{ content: string; mimeType: string }> {
  const parsed = parseResourceUri(uri)
  const notebookName = client.getNotebookPath(parsed.notebookId)

  try {
    const rawClient = client.getRawClient()

    switch (parsed.type) {
      case 'notebook': {
        const [notebook] = await rawClient.getNotebook({ name: notebookName })
        const [sourcesResponse] = await rawClient.listSources({ parent: notebookName })

        return {
          content: JSON.stringify(
            {
              name: notebook.name,
              display_name: notebook.displayName,
              create_time: notebook.createTime,
              source_count: (sourcesResponse.sources ?? []).length,
            },
            null,
            2
          ),
          mimeType: 'application/json',
        }
      }

      case 'sources': {
        const [response] = await rawClient.listSources({ parent: notebookName })
        const sources = (response.sources ?? []).map((s) => ({
          name: s.name,
          display_name: s.displayName,
          state: s.state,
        }))

        return {
          content: JSON.stringify({ sources }, null, 2),
          mimeType: 'application/json',
        }
      }

      case 'audio': {
        try {
          const [audio] = await rawClient.getAudioOverview({
            name: `${notebookName}/audioOverviews/default`,
          })
          const audioObj = audio as unknown as Record<string, unknown>

          return {
            content: JSON.stringify(
              {
                status: audioObj['state'],
                audio_uri: audioObj['audioUri'],
                duration_seconds: audioObj['durationSeconds'],
              },
              null,
              2
            ),
            mimeType: 'application/json',
          }
        } catch {
          throw new McpError(ErrorCodes.NOT_FOUND, 'No audio overview exists for this notebook')
        }
      }
    }
  } catch (error) {
    if (error instanceof McpError) throw error
    throw mapGcpError(error)
  }
}
