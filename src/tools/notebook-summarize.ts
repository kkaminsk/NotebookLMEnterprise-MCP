import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, validateEnum, mapGcpError } from '../errors/index.js'
import type { Citation } from '../types/index.js'

export interface NotebookSummarizeInput {
  notebook_name: string
  focus?: string
  format?: 'bullet_points' | 'paragraph' | 'faq'
}

export interface NotebookSummarizeOutput {
  summary: string
  format: string
  citations: Citation[]
}

const VALID_FORMATS = ['bullet_points', 'paragraph', 'faq'] as const

export const notebookSummarizeToolDefinition = {
  name: 'notebook_summarize',
  description: 'Generate a structured summary of all sources in a notebook.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      notebook_name: {
        type: 'string',
        description: 'Full resource name of the notebook to summarize',
      },
      focus: {
        type: 'string',
        description: 'Optional focus area for the summary (e.g., "financial risks")',
      },
      format: {
        type: 'string',
        enum: ['bullet_points', 'paragraph', 'faq'],
        description: 'Output format: bullet_points, paragraph, or faq',
        default: 'bullet_points',
      },
    },
    required: ['notebook_name'],
  },
}

export async function handleNotebookSummarize(
  client: DiscoveryEngineClient,
  input: NotebookSummarizeInput
): Promise<NotebookSummarizeOutput> {
  validateRequired(input.notebook_name, 'notebook_name')

  const format = input.format ?? 'bullet_points'
  if (input.format) {
    validateEnum(input.format, 'format', VALID_FORMATS)
  }

  try {
    const rawClient = client.getRawClient()

    // Build the summary prompt based on format
    let queryText = 'Provide a comprehensive summary of all the sources in this notebook.'

    if (input.focus) {
      queryText = `Provide a summary focused on: ${input.focus}`
    }

    switch (format) {
      case 'bullet_points':
        queryText += ' Format the response as bullet points.'
        break
      case 'paragraph':
        queryText += ' Format the response as flowing paragraphs.'
        break
      case 'faq':
        queryText += ' Format the response as frequently asked questions with answers.'
        break
    }

    const [response] = await rawClient.converseConversation({
      name: `${input.notebook_name}/conversations/-`,
      query: {
        text: queryText,
      },
    })

    const summary = response.reply?.reply ?? ''

    // Extract citations
    const citations: Citation[] = []
    if (response.reply?.citations) {
      for (const citation of response.reply.citations) {
        for (const source of citation.sources ?? []) {
          const ref = source.reference as Record<string, unknown> | undefined
          citations.push({
            textSpan: {
              start: citation.startIndex ?? 0,
              end: citation.endIndex ?? 0,
            },
            sourceId: (ref?.['docId'] as string) ?? '',
            sourceTitle: (ref?.['title'] as string) ?? '',
            pageOrTimestamp: extractPageOrTimestamp(ref),
          })
        }
      }
    }

    return {
      summary,
      format,
      citations,
    }
  } catch (error) {
    throw mapGcpError(error)
  }
}

function extractPageOrTimestamp(ref: Record<string, unknown> | undefined): string | undefined {
  if (!ref) return undefined

  const chunkInfo = ref['chunkInfo'] as Record<string, unknown> | undefined
  if (chunkInfo?.['pageIdentifier']) {
    return `Page ${chunkInfo['pageIdentifier']}`
  }
  if (chunkInfo?.['timestamp']) {
    return `${chunkInfo['timestamp']}`
  }
  return undefined
}
