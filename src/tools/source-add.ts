import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, validateArray, mapGcpError, McpError, ErrorCodes } from '../errors/index.js'
import type { SourceInput } from '../types/index.js'

export interface SourceAddInput {
  notebook_name: string
  sources: SourceInput[]
}

export interface SourceAddOutput {
  operation_id: string
  source_count: number
}

export const sourceAddToolDefinition = {
  name: 'source_add',
  description: 'Add one or more sources to a notebook. Supports Google Drive, websites, YouTube, text, and file uploads.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      notebook_name: {
        type: 'string',
        description: 'Full resource name of the target notebook',
      },
      sources: {
        type: 'array',
        description: 'Array of sources to add',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['google_drive', 'website', 'youtube', 'text', 'file'],
              description: 'Type of source',
            },
            uri: {
              type: 'string',
              description: 'Google Drive URI (for google_drive type)',
            },
            url: {
              type: 'string',
              description: 'Website URL (for website type)',
            },
            video_url: {
              type: 'string',
              description: 'YouTube video URL (for youtube type)',
            },
            content: {
              type: 'string',
              description: 'Raw text content (for text type)',
            },
            title: {
              type: 'string',
              description: 'Optional title for text sources',
            },
            base64_content: {
              type: 'string',
              description: 'Base64-encoded file content (for file type)',
            },
            mime_type: {
              type: 'string',
              description: 'MIME type of uploaded file (for file type)',
            },
            filename: {
              type: 'string',
              description: 'Filename for uploaded file (for file type)',
            },
          },
          required: ['type'],
        },
        minItems: 1,
      },
    },
    required: ['notebook_name', 'sources'],
  },
}

function validateSourceInput(source: SourceInput, index: number): void {
  switch (source.type) {
    case 'google_drive':
      if (!source.uri) {
        throw new McpError(
          ErrorCodes.VALIDATION_ERROR,
          `Source ${index}: uri is required for google_drive type`
        )
      }
      break
    case 'website':
      if (!source.url) {
        throw new McpError(
          ErrorCodes.VALIDATION_ERROR,
          `Source ${index}: url is required for website type`
        )
      }
      break
    case 'youtube':
      if (!source.videoUrl) {
        throw new McpError(
          ErrorCodes.VALIDATION_ERROR,
          `Source ${index}: video_url is required for youtube type`
        )
      }
      break
    case 'text':
      if (!source.content) {
        throw new McpError(
          ErrorCodes.VALIDATION_ERROR,
          `Source ${index}: content is required for text type`
        )
      }
      break
    case 'file':
      if (!source.base64Content || !source.mimeType || !source.filename) {
        throw new McpError(
          ErrorCodes.VALIDATION_ERROR,
          `Source ${index}: base64_content, mime_type, and filename are required for file type`
        )
      }
      break
  }
}

export async function handleSourceAdd(
  client: DiscoveryEngineClient,
  input: SourceAddInput
): Promise<SourceAddOutput> {
  validateRequired(input.notebook_name, 'notebook_name')
  validateArray(input.sources, 'sources', 1)

  // Validate each source
  input.sources.forEach((source, index) => validateSourceInput(source, index))

  try {
    const rawClient = client.getRawClient()

    // Build source creation requests
    const requests = input.sources.map((source) => {
      const sourceData: Record<string, unknown> = {}

      switch (source.type) {
        case 'google_drive':
          sourceData.googleDriveContent = { uri: source.uri }
          break
        case 'website':
          sourceData.webContent = { uri: source.url }
          break
        case 'youtube':
          sourceData.youtubeContent = { uri: source.videoUrl }
          break
        case 'text':
          sourceData.inlineContent = {
            content: source.content,
            mimeType: 'text/plain',
          }
          if (source.title) {
            sourceData.displayName = source.title
          }
          break
        case 'file':
          sourceData.inlineContent = {
            content: Buffer.from(source.base64Content ?? '', 'base64'),
            mimeType: source.mimeType,
          }
          sourceData.displayName = source.filename
          break
      }

      return {
        parent: input.notebook_name,
        source: sourceData,
      }
    })

    // Use batch create for multiple sources
    const [operation] = await rawClient.batchCreateSources({
      parent: input.notebook_name,
      requests,
    })

    return {
      operation_id: operation.name ?? '',
      source_count: input.sources.length,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}
