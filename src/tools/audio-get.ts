import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, mapGcpError } from '../errors/index.js'
import type { AudioStatus } from '../types/index.js'

export interface AudioGetInput {
  notebook_name: string
}

export interface AudioGetOutput {
  status: AudioStatus
  audio_uri?: string
  duration_seconds?: number
  generated_at?: string
  error?: string
}

export const audioGetToolDefinition = {
  name: 'audio_get',
  description: 'Get the current audio overview status and content for a notebook.',
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

export async function handleAudioGet(
  client: DiscoveryEngineClient,
  input: AudioGetInput
): Promise<AudioGetOutput> {
  validateRequired(input.notebook_name, 'notebook_name')

  try {
    const rawClient = client.getRawClient()

    const [audioOverview] = await rawClient.getAudioOverview({
      name: `${input.notebook_name}/audioOverviews/default`,
    })

    const overview = audioOverview as unknown as Record<string, unknown>
    const state = (overview['state'] as string) ?? 'UNKNOWN'

    let status: AudioStatus
    switch (state) {
      case 'GENERATING':
      case 'PROCESSING':
        status = 'GENERATING'
        break
      case 'READY':
      case 'ACTIVE':
        status = 'READY'
        break
      default:
        status = 'FAILED'
    }

    return {
      status,
      audio_uri: status === 'READY' ? (overview['audioUri'] as string) : undefined,
      duration_seconds: overview['durationSeconds'] as number | undefined,
      generated_at: overview['createTime'] as string | undefined,
      error: status === 'FAILED' ? (overview['error'] as string) : undefined,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}
