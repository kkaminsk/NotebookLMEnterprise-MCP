import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, mapGcpError } from '../errors/index.js'
import type { SourceType, SourceStatus } from '../types/index.js'

export interface SourceListInput {
  notebook_name: string
}

export interface SourceMetadata {
  name: string
  type: SourceType
  status: SourceStatus
  title?: string
  word_count?: number
}

export interface SourceListOutput {
  sources: SourceMetadata[]
}

export const sourceListToolDefinition = {
  name: 'source_list',
  description: 'List all sources in a notebook with their metadata and processing status.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      notebook_name: {
        type: 'string',
        description: 'Full resource name of the notebook',
      },
    },
    required: ['notebook_name'],
  },
}

function mapSourceType(source: Record<string, unknown>): SourceType {
  if (source['googleDriveContent']) return 'google_drive'
  if (source['webContent']) return 'website'
  if (source['youtubeContent']) return 'youtube'
  if (source['inlineContent']) {
    const inline = source['inlineContent'] as Record<string, unknown>
    if (inline['mimeType'] === 'text/plain') return 'text'
    return 'file'
  }
  return 'text'
}

function mapSourceStatus(state: string | undefined): SourceStatus {
  switch (state) {
    case 'ACTIVE':
    case 'READY':
      return 'READY'
    case 'INITIALIZING':
    case 'PROCESSING':
      return 'PROCESSING'
    default:
      return 'FAILED'
  }
}

export async function handleSourceList(
  client: DiscoveryEngineClient,
  input: SourceListInput
): Promise<SourceListOutput> {
  validateRequired(input.notebook_name, 'notebook_name')

  try {
    const rawClient = client.getRawClient()

    const [response] = await rawClient.listSources({
      parent: input.notebook_name,
    })

    const sources: SourceMetadata[] = (response.sources ?? []).map((source) => {
      const sourceObj = source as unknown as Record<string, unknown>
      return {
        name: (source.name ?? '') as string,
        type: mapSourceType(sourceObj),
        status: mapSourceStatus(source.state as string | undefined),
        title: source.displayName as string | undefined,
        word_count: sourceObj['wordCount'] as number | undefined,
      }
    })

    return { sources }
  } catch (error) {
    throw mapGcpError(error)
  }
}
