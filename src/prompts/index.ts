export interface PromptArgument {
  name: string
  description: string
  required: boolean
}

export interface PromptTemplate {
  name: string
  description: string
  arguments: PromptArgument[]
}

export const promptTemplates: PromptTemplate[] = [
  {
    name: 'research_assistant',
    description: 'Conduct research using NotebookLM sources',
    arguments: [
      {
        name: 'topic',
        description: 'Research topic or question',
        required: true,
      },
      {
        name: 'notebook_name',
        description: 'Full resource name of the notebook to query',
        required: true,
      },
    ],
  },
  {
    name: 'document_briefing',
    description: 'Generate an executive briefing from notebook sources',
    arguments: [
      {
        name: 'notebook_name',
        description: 'Full resource name of the notebook',
        required: true,
      },
      {
        name: 'audience',
        description: 'Target audience: executive, technical, or general',
        required: false,
      },
    ],
  },
  {
    name: 'podcast_script',
    description: 'Generate audio overview with custom focus',
    arguments: [
      {
        name: 'notebook_name',
        description: 'Full resource name of the notebook',
        required: true,
      },
      {
        name: 'focus',
        description: 'Specific angle or theme for the podcast',
        required: false,
      },
    ],
  },
]

export interface PromptInput {
  [key: string]: string | undefined
}

export function generatePrompt(templateName: string, args: PromptInput): string {
  switch (templateName) {
    case 'research_assistant':
      return generateResearchAssistantPrompt(args)
    case 'document_briefing':
      return generateDocumentBriefingPrompt(args)
    case 'podcast_script':
      return generatePodcastScriptPrompt(args)
    default:
      throw new Error(`Unknown prompt template: ${templateName}`)
  }
}

function generateResearchAssistantPrompt(args: PromptInput): string {
  const topic = args['topic'] ?? 'the main topics'
  const notebookName = args['notebook_name'] ?? ''

  return `You are a research assistant with access to a NotebookLM notebook.

Notebook: ${notebookName}
Research Topic: ${topic}

Instructions:
1. Use the notebook_query tool to search for information about "${topic}"
2. Analyze the cited sources carefully
3. Synthesize findings into a clear, well-organized response
4. Always cite your sources using the provided citation metadata
5. If information is incomplete, use notebook_summarize to get broader context

Begin your research by querying the notebook about the topic.`
}

function generateDocumentBriefingPrompt(args: PromptInput): string {
  const notebookName = args['notebook_name'] ?? ''
  const audience = args['audience'] ?? 'general'

  let audienceGuidance = ''
  switch (audience) {
    case 'executive':
      audienceGuidance =
        'Focus on strategic implications, key decisions, and bottom-line impact. Keep it concise and action-oriented.'
      break
    case 'technical':
      audienceGuidance =
        'Include technical details, implementation considerations, and architectural decisions.'
      break
    default:
      audienceGuidance =
        'Provide a balanced overview suitable for a broad audience with varying technical backgrounds.'
  }

  return `You are preparing a briefing document from NotebookLM sources.

Notebook: ${notebookName}
Target Audience: ${audience}

${audienceGuidance}

Instructions:
1. Use notebook_summarize to generate an overview of all sources
2. Identify the most critical points for your audience
3. Structure the briefing with:
   - Executive Summary (2-3 sentences)
   - Key Findings (bullet points)
   - Recommendations (if applicable)
   - Sources Referenced
4. Use notebook_query for any follow-up details needed

Begin by summarizing the notebook contents.`
}

function generatePodcastScriptPrompt(args: PromptInput): string {
  const notebookName = args['notebook_name'] ?? ''
  const focus = args['focus']

  const focusGuidance = focus
    ? `Focus the discussion on: ${focus}`
    : 'Cover the main themes and interesting insights from the sources.'

  return `You are preparing to generate an AI podcast from NotebookLM sources.

Notebook: ${notebookName}
${focusGuidance}

Instructions:
1. First, use notebook_summarize to understand the source content
2. Identify the most engaging topics for an audio discussion
3. Use audio_create to generate the podcast with the focus: "${focus ?? 'main themes and insights'}"
4. Monitor the generation with operation_status
5. Once complete, use audio_get to retrieve the audio URL

Begin by summarizing the notebook to understand the content.`
}
