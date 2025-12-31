#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { loadConfig, ConfigError } from './config.js'
import { getClient, closeClient } from './clients/discovery-engine.js'
import { McpError, mapGcpError } from './errors/index.js'

// Tool imports
import {
  operationStatusToolDefinition,
  handleOperationStatus,
  type OperationStatusInput,
} from './tools/operation-status.js'
import {
  notebookCreateToolDefinition,
  handleNotebookCreate,
  type NotebookCreateInput,
} from './tools/notebook-create.js'
import {
  notebookListToolDefinition,
  handleNotebookList,
  type NotebookListInput,
} from './tools/notebook-list.js'
import {
  notebookDeleteToolDefinition,
  handleNotebookDelete,
  type NotebookDeleteInput,
} from './tools/notebook-delete.js'
import {
  notebookShareToolDefinition,
  handleNotebookShare,
  type NotebookShareInput,
} from './tools/notebook-share.js'
import {
  sourceAddToolDefinition,
  handleSourceAdd,
  type SourceAddInput,
} from './tools/source-add.js'
import {
  sourceListToolDefinition,
  handleSourceList,
  type SourceListInput,
} from './tools/source-list.js'
import {
  sourceDeleteToolDefinition,
  handleSourceDelete,
  type SourceDeleteInput,
} from './tools/source-delete.js'
import {
  notebookQueryToolDefinition,
  handleNotebookQuery,
  type NotebookQueryInput,
} from './tools/notebook-query.js'
import {
  notebookSummarizeToolDefinition,
  handleNotebookSummarize,
  type NotebookSummarizeInput,
} from './tools/notebook-summarize.js'
import {
  audioCreateToolDefinition,
  handleAudioCreate,
  type AudioCreateInput,
} from './tools/audio-create.js'
import {
  audioGetToolDefinition,
  handleAudioGet,
  type AudioGetInput,
} from './tools/audio-get.js'
import {
  audioDeleteToolDefinition,
  handleAudioDelete,
  type AudioDeleteInput,
} from './tools/audio-delete.js'

// Resource and prompt imports
import { resourceTemplates, handleResourceRead } from './resources/index.js'
import { promptTemplates, generatePrompt } from './prompts/index.js'

const SERVER_NAME = 'notebooklm-mcp-server'
const SERVER_VERSION = '0.1.0'

async function main(): Promise<void> {
  // Load configuration
  let config
  try {
    config = loadConfig()
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(`Configuration error: ${error.message}`)
      process.exit(1)
    }
    throw error
  }

  // Initialize client
  const client = getClient(config)

  // Create MCP server with full capabilities
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  )

  // All tool definitions
  const allTools = [
    operationStatusToolDefinition,
    notebookCreateToolDefinition,
    notebookListToolDefinition,
    notebookDeleteToolDefinition,
    notebookShareToolDefinition,
    sourceAddToolDefinition,
    sourceListToolDefinition,
    sourceDeleteToolDefinition,
    notebookQueryToolDefinition,
    notebookSummarizeToolDefinition,
    audioCreateToolDefinition,
    audioGetToolDefinition,
    audioDeleteToolDefinition,
  ]

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: allTools }
  })

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
      let result: unknown

      switch (name) {
        case 'operation_status':
          result = await handleOperationStatus(client, args as unknown as OperationStatusInput)
          break
        case 'notebook_create':
          result = await handleNotebookCreate(client, args as unknown as NotebookCreateInput)
          break
        case 'notebook_list':
          result = await handleNotebookList(client, args as unknown as NotebookListInput)
          break
        case 'notebook_delete':
          result = await handleNotebookDelete(client, args as unknown as NotebookDeleteInput)
          break
        case 'notebook_share':
          result = await handleNotebookShare(client, args as unknown as NotebookShareInput)
          break
        case 'source_add':
          result = await handleSourceAdd(client, args as unknown as SourceAddInput)
          break
        case 'source_list':
          result = await handleSourceList(client, args as unknown as SourceListInput)
          break
        case 'source_delete':
          result = await handleSourceDelete(client, args as unknown as SourceDeleteInput)
          break
        case 'notebook_query':
          result = await handleNotebookQuery(client, args as unknown as NotebookQueryInput)
          break
        case 'notebook_summarize':
          result = await handleNotebookSummarize(client, args as unknown as NotebookSummarizeInput)
          break
        case 'audio_create':
          result = await handleAudioCreate(client, args as unknown as AudioCreateInput)
          break
        case 'audio_get':
          result = await handleAudioGet(client, args as unknown as AudioGetInput)
          break
        case 'audio_delete':
          result = await handleAudioDelete(client, args as unknown as AudioDeleteInput)
          break
        default:
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: { code: 'unknown_tool', message: `Unknown tool: ${name}` } }) }],
            isError: true,
          }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      }
    } catch (error) {
      const mcpError = error instanceof McpError ? error : mapGcpError(error)
      return {
        content: [{ type: 'text', text: JSON.stringify(mcpError.toToolError(), null, 2) }],
        isError: true,
      }
    }
  })

  // Register resource template list handler
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
      resourceTemplates: resourceTemplates.map((t) => ({
        uriTemplate: t.uriTemplate,
        name: t.name,
        description: t.description,
        mimeType: t.mimeType,
      })),
    }
  })

  // Register resource read handler
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params

    try {
      const { content, mimeType } = await handleResourceRead(client, uri)
      return {
        contents: [{ uri, text: content, mimeType }],
      }
    } catch (error) {
      const mcpError = error instanceof McpError ? error : mapGcpError(error)
      throw mcpError
    }
  })

  // Register prompt list handler
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: promptTemplates.map((p) => ({
        name: p.name,
        description: p.description,
        arguments: p.arguments.map((a) => ({
          name: a.name,
          description: a.description,
          required: a.required,
        })),
      })),
    }
  })

  // Register prompt get handler
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    const template = promptTemplates.find((p) => p.name === name)
    if (!template) {
      throw new McpError('not_found' as const, `Unknown prompt: ${name}`)
    }

    const promptText = generatePrompt(name, args ?? {})

    return {
      description: template.description,
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: promptText },
        },
      ],
    }
  })

  // Setup transport
  const transport = new StdioServerTransport()

  // Handle shutdown
  process.on('SIGINT', async () => {
    await closeClient()
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await closeClient()
    await server.close()
    process.exit(0)
  })

  // Start server
  await server.connect(transport)
}

main().catch((error: unknown) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
