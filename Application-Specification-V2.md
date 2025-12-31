# NotebookLM Enterprise MCP Server - Application Specification V2

## 1. Executive Summary

This document specifies an MCP (Model Context Protocol) server that exposes the Google Cloud NotebookLM Enterprise API capabilities to AI agents and LLM-powered applications. The server acts as a bridge between the MCP ecosystem and Google's source-grounded knowledge synthesis platform, enabling programmatic notebook management, multi-modal source ingestion, conversational search with citations, and AI-generated audio overview creation.

---

## 2. Project Purpose and Goals

### 2.1 Primary Purpose
Build an MCP server that enables AI assistants to interact with NotebookLM Enterprise, providing:
- **Source-Grounded Knowledge Synthesis**: Query curated document collections with cited, hallucination-resistant responses
- **Multi-Modal Content Ingestion**: Programmatically add documents, websites, YouTube videos, and raw text to notebooks
- **Audio Overview Generation**: Create AI-generated podcast-style discussions of source materials
- **Enterprise-Grade Security**: Leverage IAM, CMEK, and VPC-SC controls

### 2.2 Strategic Goals
| Goal | Description |
|------|-------------|
| **Democratize Access** | Make NotebookLM's capabilities available through the MCP protocol to any compatible AI agent |
| **Enable Automation** | Support automated workflows for research, analysis, and content generation |
| **Ensure Compliance** | Maintain enterprise security standards with proper authentication and data isolation |
| **Maximize Interoperability** | Integrate seamlessly with Vertex AI Agent Builder and other GCP services |

---

## 3. Tech Stack

### 3.1 Primary Technologies
- **Runtime**: Node.js 20+ / TypeScript 5.x
- **MCP Framework**: `@modelcontextprotocol/sdk`
- **Google Cloud SDK**: `google-cloud-discoveryengine` (v1alpha/v1beta)
- **Authentication**: Google Cloud Application Default Credentials (ADC)

### 3.2 Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "@google-cloud/discoveryengine": "^1.x",
    "google-auth-library": "^9.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vitest": "^1.x",
    "@types/node": "^20.x"
  }
}
```

---

## 4. Architecture Overview

### 4.1 System Context
```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Client                                │
│            (Claude Desktop, AI Agent, etc.)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ MCP Protocol (stdio/SSE)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NotebookLM MCP Server                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Tool Handler │  │ Resource     │  │ Prompt Templates       │ │
│  │              │  │ Provider     │  │                        │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────────────────┘ │
│         │                 │                                      │
│         └────────┬────────┘                                      │
│                  ▼                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Google Cloud Client Wrapper                    ││
│  │   (NotebookServiceClient, SourceServiceClient,              ││
│  │    AudioOverviewServiceClient, ConversationalSearchClient)  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────────┘
                          │ gRPC / REST (HTTPS)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Google Cloud Discovery Engine                       │
│                (discoveryengine.googleapis.com)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Notebooks  │  │   Sources   │  │   Audio Overviews       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Resource Hierarchy
```
projects/{project_number}/locations/{location}/notebooks/{notebook_id}
                                                    └── sources/{source_id}
                                                    └── audioOverviews/{audio_id}
                                                    └── conversations/{conversation_id}
```

### 4.3 Supported Locations
- Multi-regions: `us`, `eu`, `global`
- Endpoint mapping required for regional resources

---

## 5. MCP Tool Specifications

### 5.1 Notebook Management Tools

#### Tool: `notebook_create`
Creates a new NotebookLM notebook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `display_name` | string | Yes | Human-readable notebook name |
| `location` | string | No | GCP location (default: `us`) |
| `notebook_id` | string | No | Custom ID (auto-generated if omitted) |

**Returns**: Notebook resource name and metadata

---

#### Tool: `notebook_list`
Lists notebooks accessible to the authenticated user.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location` | string | No | Filter by location |
| `page_size` | number | No | Results per page (max: 100) |
| `recently_viewed` | boolean | No | Return only recently viewed |

**Returns**: Array of notebook summaries

---

#### Tool: `notebook_delete`
Deletes one or more notebooks.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_names` | string[] | Yes | Full resource names to delete |

**Returns**: Deletion confirmation

---

#### Tool: `notebook_share`
Shares a notebook with specified IAM principals.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Full resource name |
| `principals` | string[] | Yes | Email addresses or service accounts |
| `role` | string | Yes | `viewer` or `editor` |

**Returns**: Updated IAM policy

---

### 5.2 Source Management Tools

#### Tool: `source_add`
Adds one or more sources to a notebook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Target notebook resource name |
| `sources` | SourceInput[] | Yes | Array of source definitions |

**SourceInput Schema**:
```typescript
type SourceInput =
  | { type: 'google_drive'; uri: string }
  | { type: 'website'; url: string }
  | { type: 'youtube'; video_url: string }
  | { type: 'text'; content: string; title?: string }
  | { type: 'file'; base64_content: string; mime_type: string; filename: string }
```

**Returns**: Long-running operation ID for batch processing

---

#### Tool: `source_list`
Lists all sources in a notebook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Target notebook resource name |

**Returns**: Array of source metadata (ID, type, status, word count)

---

#### Tool: `source_delete`
Removes sources from a notebook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source_names` | string[] | Yes | Full resource names to delete |

**Returns**: Deletion confirmation

---

### 5.3 Conversational Search Tools

#### Tool: `notebook_query`
Queries a notebook with natural language and returns cited answers.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Target notebook resource name |
| `query` | string | Yes | Natural language question |
| `conversation_id` | string | No | Continue existing conversation |
| `include_citations` | boolean | No | Include source citations (default: true) |

**Returns**:
```typescript
{
  answer: string;
  citations: Array<{
    text_span: { start: number; end: number };
    source_id: string;
    source_title: string;
    page_or_timestamp?: string;
  }>;
  conversation_id: string;
}
```

---

#### Tool: `notebook_summarize`
Generates a summary of all sources in a notebook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Target notebook resource name |
| `focus` | string | No | Optional focus area for summary |
| `format` | string | No | `bullet_points`, `paragraph`, `faq` |

**Returns**: Structured summary with citations

---

### 5.4 Audio Overview Tools

#### Tool: `audio_create`
Generates an AI podcast-style audio overview.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Target notebook resource name |
| `focus` | string | No | Episode focus directive |
| `language` | string | No | Language code (default: `en-US`) |

**Returns**: Long-running operation ID

**Note**: Singleton constraint - only one audio overview per notebook. Delete existing before creating new.

---

#### Tool: `audio_get`
Retrieves the current audio overview for a notebook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Target notebook resource name |

**Returns**:
```typescript
{
  status: 'GENERATING' | 'READY' | 'FAILED';
  audio_uri?: string;
  duration_seconds?: number;
  generated_at?: string;
}
```

---

#### Tool: `audio_delete`
Deletes the audio overview from a notebook.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notebook_name` | string | Yes | Target notebook resource name |

**Returns**: Deletion confirmation

---

### 5.5 Operation Management Tools

#### Tool: `operation_status`
Checks the status of a long-running operation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation_id` | string | Yes | Operation resource name |

**Returns**: Operation status, progress, and result if complete

---

## 6. MCP Resource Specifications

### 6.1 Notebook Resources
Expose notebooks as browsable MCP resources:

```
notebooklm://notebooks/{notebook_id}
notebooklm://notebooks/{notebook_id}/sources
notebooklm://notebooks/{notebook_id}/audio
```

### 6.2 Resource Templates
```typescript
{
  uri_template: "notebooklm://notebooks/{notebook_id}",
  name: "NotebookLM Notebook",
  description: "A NotebookLM notebook with sources and conversation history",
  mime_type: "application/json"
}
```

---

## 7. MCP Prompt Templates

### 7.1 Research Assistant Prompt
```yaml
name: research_assistant
description: Conduct research using NotebookLM sources
arguments:
  - name: topic
    description: Research topic or question
    required: true
  - name: notebook_name
    description: Notebook to query
    required: true
```

### 7.2 Document Briefing Prompt
```yaml
name: document_briefing
description: Generate an executive briefing from notebook sources
arguments:
  - name: notebook_name
    required: true
  - name: audience
    description: Target audience (executive, technical, general)
    required: false
```

### 7.3 Podcast Script Prompt
```yaml
name: podcast_script
description: Generate audio overview with custom focus
arguments:
  - name: notebook_name
    required: true
  - name: focus
    description: Specific angle or theme for the podcast
    required: false
```

---

## 8. Configuration

### 8.1 Environment Variables
```bash
# Required
GOOGLE_CLOUD_PROJECT=your-project-id

# Optional
NOTEBOOKLM_LOCATION=us                    # Default location
NOTEBOOKLM_TIMEOUT_MS=120000              # API timeout
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json  # Service account key
```

### 8.2 MCP Server Configuration
```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": ["-y", "notebooklm-mcp-server"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "my-project-123"
      }
    }
  }
}
```

---

## 9. Security Considerations

### 9.1 Authentication Flow
1. **Development**: Use `gcloud auth application-default login`
2. **Production**: Use service account with minimal permissions
3. **Impersonation**: Prefer short-lived tokens over JSON key files

### 9.2 Required IAM Permissions
```yaml
Minimum permissions for MCP server service account:
  - discoveryengine.notebooks.create
  - discoveryengine.notebooks.get
  - discoveryengine.notebooks.list
  - discoveryengine.notebooks.delete
  - discoveryengine.sources.create
  - discoveryengine.sources.get
  - discoveryengine.sources.list
  - discoveryengine.sources.delete
  - discoveryengine.audioOverviews.create
  - discoveryengine.audioOverviews.get
  - discoveryengine.audioOverviews.delete
  - discoveryengine.conversations.converse
```

### 9.3 Data Protection
- Enable CMEK for sensitive deployments
- Configure VPC-SC perimeter for production
- Data is NOT used for model training (Enterprise tier)

---

## 10. Error Handling

### 10.1 Error Categories
| Error Code | Meaning | Handling Strategy |
|------------|---------|-------------------|
| `400 INVALID_ARGUMENT` | Malformed request or unsupported source | Return detailed validation error |
| `401 UNAUTHENTICATED` | Invalid/expired credentials | Prompt re-authentication |
| `403 PERMISSION_DENIED` | Insufficient IAM permissions | Return permission guidance |
| `404 NOT_FOUND` | Resource doesn't exist | Return resource not found |
| `429 RESOURCE_EXHAUSTED` | Rate limit or quota exceeded | Implement exponential backoff |
| `500 INTERNAL` | Server error | Retry with backoff |

### 10.2 Quota Limits (Enterprise Tier)
| Resource | Limit |
|----------|-------|
| Notebooks per user | 500 |
| Sources per notebook | 500 |
| Words per source | 500,000 |
| Audio generations per day | 20 |
| Queries per day | 500 |

---

## 11. Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Project setup with TypeScript and MCP SDK
- [ ] Google Cloud authentication wrapper
- [ ] Basic notebook CRUD operations
- [ ] Error handling framework

### Phase 2: Source Management
- [ ] Multi-modal source ingestion (Drive, URL, YouTube, text)
- [ ] Batch source operations with LRO polling
- [ ] Source status and metadata retrieval

### Phase 3: Conversational Search
- [ ] Query tool with citation extraction
- [ ] Conversation state management
- [ ] Summary generation with formatting options

### Phase 4: Audio Overview
- [ ] Audio generation with focus directives
- [ ] LRO polling for generation status
- [ ] Audio retrieval and management

### Phase 5: MCP Resources & Prompts
- [ ] Resource provider implementation
- [ ] Prompt template system
- [ ] Documentation and examples

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Mock Google Cloud clients
- Test tool input validation
- Test error handling paths

### 12.2 Integration Tests
- Use dedicated test GCP project
- Test full notebook lifecycle
- Verify citation accuracy

### 12.3 E2E Tests
- Test via MCP client
- Verify tool registration
- Test resource browsing

---

## 13. Appendix

### 13.1 API Version Considerations
The NotebookLM Enterprise API is currently in **v1alpha**. Implementation should:
- Abstract API calls behind a client wrapper
- Prepare for schema changes as API matures to GA
- Monitor Google Cloud release notes

### 13.2 Pricing Model
- **License**: ~$9/user/month (bundled with Gemini Enterprise)
- **Cost Structure**: Seat-based, not consumption-based
- **Implication**: Favorable for high-volume automated workflows

### 13.3 Related Resources
- [NotebookLM Enterprise Documentation](https://cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs)
- [Discovery Engine API Reference](https://cloud.google.com/generative-ai-app-builder/docs/reference/rpc)
- [MCP Protocol Specification](https://modelcontextprotocol.io)

---

*Document Version: 2.0*
*Last Updated: 2025-12-30*
