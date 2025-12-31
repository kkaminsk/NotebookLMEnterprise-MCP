## Context

This is the foundational layer for the NotebookLM Enterprise MCP Server. All subsequent proposals depend on this infrastructure being in place. The design must accommodate:
- Google Cloud Discovery Engine API (v1alpha) which may have breaking changes
- MCP protocol requirements for tool registration and invocation
- Enterprise security requirements (ADC, service accounts)

## Goals / Non-Goals

### Goals
- Establish project structure following TypeScript best practices
- Abstract Google Cloud client instantiation for testability
- Provide centralized error mapping from GCP errors to MCP error responses
- Support both stdio and SSE transport modes

### Non-Goals
- Implement business logic tools (covered in subsequent proposals)
- Implement MCP resources or prompts (covered in proposal 6)
- Handle CMEK or VPC-SC configuration (deployment concern)

## Decisions

### Project Structure
```
src/
├── index.ts              # Entry point, MCP server setup
├── config.ts             # Environment variable handling
├── clients/
│   └── discovery-engine.ts   # GCP client wrapper
├── tools/
│   └── operation-status.ts   # LRO polling tool
├── errors/
│   └── index.ts          # Error types and mapping
└── types/
    └── index.ts          # Shared TypeScript types
```

**Rationale**: Flat structure with clear separation. Avoids over-engineering; can be refactored as complexity grows.

### Client Wrapper Pattern
The `DiscoveryEngineClient` class wraps Google Cloud clients and handles:
- Client instantiation with proper endpoint selection based on location
- Credential management via ADC
- Request/response logging (debug mode)

**Rationale**: Insulates business logic from API version changes. When v1alpha becomes v1beta/GA, only the wrapper needs updating.

### Error Handling
Map Google Cloud error codes to MCP error responses:
| GCP Code | MCP Handling |
|----------|--------------|
| `INVALID_ARGUMENT` | Return validation error with details |
| `UNAUTHENTICATED` | Return auth error, prompt re-auth |
| `PERMISSION_DENIED` | Return permission error with guidance |
| `NOT_FOUND` | Return not found error |
| `RESOURCE_EXHAUSTED` | Return rate limit error, suggest retry |
| `INTERNAL` | Return internal error, log for debugging |

**Rationale**: Consistent error experience across all tools.

### Configuration
Environment variables with sensible defaults:
- `GOOGLE_CLOUD_PROJECT` (required)
- `NOTEBOOKLM_LOCATION` (default: `us`)
- `NOTEBOOKLM_TIMEOUT_MS` (default: `120000`)
- `LOG_LEVEL` (default: `info`)

**Rationale**: 12-factor app principles; no hardcoded values.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| v1alpha API instability | Client wrapper isolates changes |
| Authentication failures in CI | Document ADC setup; provide test fixtures |
| Regional endpoint complexity | Centralize endpoint selection in client wrapper |

## Open Questions

- Should we support multiple simultaneous projects/locations, or single project per server instance?
  - **Decision**: Single project per instance for simplicity; multi-project can be added later if needed.
