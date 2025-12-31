import type { DiscoveryEngineClient } from '../clients/discovery-engine.js'
import { validateRequired, mapGcpError } from '../errors/index.js'
import type { Citation } from '../types/index.js'

export interface NotebookQueryInput {
  notebook_name: string
  query: string
  conversation_id?: string
  include_citations?: boolean
}

export interface NotebookQueryOutput {
  answer: string
  citations: Citation[]
  conversation_id: string
}

export const notebookQueryToolDefinition = {
  name: 'notebook_query',
  description: 'Query a notebook with natural language and receive cited answers grounded in the sources.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      notebook_name: {
        type: 'string',
        description: 'Full resource name of the notebook to query',
      },
      query: {
        type: 'string',
        description: 'Natural language question to ask',
      },
      conversation_id: {
        type: 'string',
        description: 'Conversation ID to continue a multi-turn dialogue',
      },
      include_citations: {
        type: 'boolean',
        description: 'Whether to include source citations (default: true)',
        default: true,
      },
    },
    required: ['notebook_name', 'query'],
  },
}

export async function handleNotebookQuery(
  client: DiscoveryEngineClient,
  input: NotebookQueryInput
): Promise<NotebookQueryOutput> {
  validateRequired(input.notebook_name, 'notebook_name')
  validateRequired(input.query, 'query')

  const includeCitations = input.include_citations !== false

  try {
    const rawClient = client.getRawClient()

    // Build conversation resource name
    const conversationName = input.conversation_id
      ? `${input.notebook_name}/conversations/${input.conversation_id}`
      : undefined

    const [response] = await rawClient.converseConversation({
      name: conversationName ?? `${input.notebook_name}/conversations/-`,
      query: {
        text: input.query,
      },
    })

    // Extract answer text
    const answer = response.reply?.reply ?? ''

    // Extract citations if requested
    const citations: Citation[] = []
    if (includeCitations && response.reply?.citations) {
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

    // Extract conversation ID from response
    const convId = extractConversationId(response.conversation?.name)

    return {
      answer,
      citations,
      conversation_id: convId,
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

function extractConversationId(name: string | undefined | null): string {
  if (!name) return ''
  const parts = name.split('/conversations/')
  return parts[1] ?? ''
}
