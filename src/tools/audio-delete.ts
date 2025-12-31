import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, mapGcpError } from '../errors/index.js'

export interface AudioDeleteInput {
  notebook_name: string
}

export interface AudioDeleteOutput {
  success: boolean
  notebook_name: string
}

export const audioDeleteToolDefinition = {
  name: 'audio_delete',
  description: 'Delete the audio overview from a notebook. Required before creating a new audio overview.',
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

export async function handleAudioDelete(
  client: DiscoveryEngineClient,
  input: AudioDeleteInput
): Promise<AudioDeleteOutput> {
  validateRequired(input.notebook_name, 'notebook_name')

  try {
    const rawClient = client.getRawClient()

    await rawClient.deleteAudioOverview({
      name: `${input.notebook_name}/audioOverviews/default`,
    })

    return {
      success: true,
      notebook_name: input.notebook_name,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}
