## Why

The NotebookLM Enterprise MCP Server requires foundational infrastructure before any tools can be implemented. This includes project scaffolding, TypeScript configuration, MCP SDK integration, Google Cloud authentication, and centralized error handling.

## What Changes

- Initialize Node.js project with TypeScript configuration
- Integrate `@modelcontextprotocol/sdk` for MCP server framework
- Integrate `@google-cloud/discoveryengine` client library
- Implement Google Cloud authentication wrapper supporting ADC
- Create centralized error handling with typed error responses
- Implement configuration management via environment variables
- Add `operation_status` tool for LRO polling (foundational for async operations)

## Impact

- Affected specs: `mcp-server-core` (new capability)
- Affected code: Project root, `src/` directory structure
- Dependencies: None (first proposal)
