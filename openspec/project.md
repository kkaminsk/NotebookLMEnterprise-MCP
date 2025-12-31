# Project Context

## Purpose

Build an MCP (Model Context Protocol) server that exposes Google Cloud NotebookLM Enterprise API capabilities to AI agents and LLM-powered applications. The server enables:

- **Source-Grounded Knowledge Synthesis**: Query curated document collections with cited, hallucination-resistant responses
- **Multi-Modal Content Ingestion**: Programmatically add documents, websites, YouTube videos, and raw text to notebooks
- **Audio Overview Generation**: Create AI-generated podcast-style discussions of source materials
- **Enterprise-Grade Security**: Leverage IAM, CMEK, and VPC-SC controls

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x
- **MCP Framework**: `@modelcontextprotocol/sdk`
- **Google Cloud SDK**: `@google-cloud/discoveryengine` (v1alpha/v1beta)
- **Authentication**: `google-auth-library` with Application Default Credentials (ADC)
- **Testing**: Vitest
- **Build**: TypeScript compiler (tsc)

## Project Conventions

### Code Style

- Use ESLint with TypeScript recommended rules
- Prettier for formatting (2-space indent, single quotes, no semicolons)
- Naming conventions:
  - Files: `kebab-case.ts`
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Types/Interfaces: `PascalCase` (prefix interfaces with `I` only when needed for disambiguation)

### Architecture Patterns

- **Client Wrapper Pattern**: Abstract Google Cloud API calls behind a client wrapper to handle API version changes
- **Tool Handler Pattern**: Each MCP tool implemented as a separate handler function
- **Error Boundary Pattern**: Centralized error handling with typed error responses
- **Long-Running Operation (LRO) Polling**: Async operations return operation IDs; separate tool for status checking

### Testing Strategy

- **Unit Tests**: Mock Google Cloud clients, test input validation and error paths
- **Integration Tests**: Use dedicated test GCP project for full API lifecycle testing
- **E2E Tests**: Test via MCP client to verify tool registration and resource browsing
- **Coverage Target**: 80% for core functionality

### Git Workflow

- **Main Branch**: `main` (protected, requires PR)
- **Feature Branches**: `feature/<change-id>` matching OpenSpec change IDs
- **Commit Convention**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **PR Requirements**: Passing tests, OpenSpec validation, code review

## Domain Context

### NotebookLM Concepts

- **Notebook**: A container for sources and conversations; maps to Discovery Engine data store
- **Source**: A document (PDF, Drive file, website, YouTube video, or raw text) indexed for retrieval
- **Audio Overview**: AI-generated podcast-style audio discussing notebook sources (singleton per notebook)
- **Conversation**: Stateful Q&A session maintaining context across multiple queries
- **Citation**: Reference linking an answer span to a specific source location (page/timestamp)

### Google Cloud Context

- **Discovery Engine**: Backend service powering NotebookLM (discoveryengine.googleapis.com)
- **Resource Hierarchy**: `projects/{project}/locations/{location}/notebooks/{notebook_id}`
- **Supported Locations**: `us`, `eu`, `global`
- **API Version**: Currently v1alpha (expect schema changes before GA)

### MCP Context

- **Tools**: Callable functions exposed to AI agents
- **Resources**: Browsable data exposed via URI templates
- **Prompts**: Pre-defined prompt templates for common workflows

## Important Constraints

### Technical Constraints

- API is in **v1alpha** - must design for schema changes
- Audio overview has **singleton constraint** - only one per notebook
- Source ingestion is **asynchronous** - requires LRO polling
- Regional endpoints required - requests must match resource location

### Quota Limits (Enterprise Tier)

| Resource | Limit |
|----------|-------|
| Notebooks per user | 500 |
| Sources per notebook | 500 |
| Words per source | 500,000 |
| Audio generations per day | 20 |
| Queries per day | 500 |

### Security Constraints

- Service account requires specific `discoveryengine.*` IAM permissions
- Production deployments should use CMEK and VPC-SC
- Avoid storing credentials in code; use ADC or workload identity

### Licensing

- NotebookLM Enterprise requires ~$9/user/month license (bundled with Gemini Enterprise)
- Seat-based pricing, not consumption-based

## External Dependencies

### Google Cloud APIs

| API | Endpoint | Purpose |
|-----|----------|---------|
| Discovery Engine | `discoveryengine.googleapis.com` | Core NotebookLM functionality |
| Cloud KMS | `cloudkms.googleapis.com` | CMEK support (optional) |
| IAM | `iam.googleapis.com` | Permission management |

### NPM Packages

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP server framework |
| `@google-cloud/discoveryengine` | NotebookLM API client |
| `google-auth-library` | GCP authentication |

### Reference Documentation

- [NotebookLM Enterprise Docs](https://cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs)
- [Discovery Engine API Reference](https://cloud.google.com/generative-ai-app-builder/docs/reference/rpc)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
