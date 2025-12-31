# NotebookLM Enterprise MCP Server

An MCP (Model Context Protocol) server that exposes Google Cloud NotebookLM Enterprise API capabilities to AI agents and LLM-powered applications.

## Features

- **Notebook Management**: Create, list, delete, and share notebooks
- **Source Ingestion**: Add documents from Google Drive, websites, YouTube, and raw text
- **Conversational Search**: Query notebooks with natural language, get cited answers
- **Audio Overview**: Generate AI podcast-style discussions of source materials
- **MCP Resources**: Browse notebooks, sources, and audio via URI templates
- **Prompt Templates**: Pre-built prompts for research, briefings, and podcasts

## Prerequisites

- Node.js 20 or higher
- Google Cloud project with NotebookLM Enterprise enabled
- Google Cloud authentication configured

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the following environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLOUD_PROJECT` | Yes | - | Your Google Cloud project ID |
| `NOTEBOOKLM_LOCATION` | No | `us` | Location: `us`, `eu`, or `global` |
| `NOTEBOOKLM_TIMEOUT_MS` | No | `120000` | API timeout in milliseconds |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warn`, `error` |

## Authentication

The server uses Google Cloud Application Default Credentials (ADC).

### Local Development

```bash
gcloud auth application-default login
```

### Production

Use a service account with the following IAM permissions:
- `discoveryengine.notebooks.*`
- `discoveryengine.sources.*`
- `discoveryengine.audioOverviews.*`
- `discoveryengine.conversations.*`

## Usage with MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "node",
      "args": ["/path/to/notebooklm-mcp-server/dist/index.js"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "your-project-id"
      }
    }
  }
}
```

### Via npx

```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": ["-y", "notebooklm-mcp-server"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "your-project-id"
      }
    }
  }
}
```

## Available Tools

### Notebook Management

| Tool | Description |
|------|-------------|
| `notebook_create` | Create a new notebook |
| `notebook_list` | List accessible notebooks |
| `notebook_delete` | Delete one or more notebooks |
| `notebook_share` | Share notebook via IAM |

### Source Management

| Tool | Description |
|------|-------------|
| `source_add` | Add sources (Drive, web, YouTube, text, file) |
| `source_list` | List sources in a notebook |
| `source_delete` | Delete sources from a notebook |

### Conversational Search

| Tool | Description |
|------|-------------|
| `notebook_query` | Query notebook with natural language, get cited answers |
| `notebook_summarize` | Generate structured summary of sources |

### Audio Overview

| Tool | Description |
|------|-------------|
| `audio_create` | Generate AI podcast from sources |
| `audio_get` | Get audio status and URL |
| `audio_delete` | Delete audio overview |

### Operations

| Tool | Description |
|------|-------------|
| `operation_status` | Check status of long-running operations |

## Available Resources

Browse notebook data using MCP resources:

| URI Template | Description |
|--------------|-------------|
| `notebooklm://notebooks/{id}` | Notebook metadata |
| `notebooklm://notebooks/{id}/sources` | List of sources |
| `notebooklm://notebooks/{id}/audio` | Audio overview status |

## Available Prompts

Pre-built prompt templates:

| Prompt | Description |
|--------|-------------|
| `research_assistant` | Conduct research using notebook sources |
| `document_briefing` | Generate executive briefing |
| `podcast_script` | Prepare audio overview generation |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev

# Lint
npm run lint

# Format
npm run format
```

## License

MIT
