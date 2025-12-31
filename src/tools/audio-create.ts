import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, mapGcpError } from '../errors/index.js'

export interface AudioCreateInput {
  notebook_name: string
  focus?: string
  language?: string
}

export interface AudioCreateOutput {
  operation_id: string
  notebook_name: string
}

export const audioCreateToolDefinition = {
  name: 'audio_create',
  description: 'Generate an AI podcast-style audio overview of notebook sources. Only one audio overview can exist per notebook.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      notebook_name: {
        type: 'string',
        description: 'Full resource name of the notebook',
      },
      focus: {
        type: 'string',
        description: 'Focus directive for the podcast (e.g., "Analyze the regulatory risks")',
      },
      language: {
        type: 'string',
        description: 'Language code (e.g., "en-US", "en-GB")',
        default: 'en-US',
      },
    },
    required: ['notebook_name'],
  },
}

export async function handleAudioCreate(
  client: DiscoveryEngineClient,
  input: AudioCreateInput
): Promise<AudioCreateOutput> {
  validateRequired(input.notebook_name, 'notebook_name')

  try {
    const rawClient = client.getRawClient()

    const [operation] = await rawClient.createAudioOverview({
      parent: input.notebook_name,
      audioOverview: {
        generationOptions: {
          episodeFocus: input.focus,
          languageCode: input.language ?? 'en-US',
        },
      },
    })

    return {
      operation_id: operation.name ?? '',
      notebook_name: input.notebook_name,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}
