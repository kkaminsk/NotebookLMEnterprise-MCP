## 1. Project Setup

- [x] 1.1 Initialize npm project with `package.json`
- [x] 1.2 Configure TypeScript with `tsconfig.json` (ES2022, strict mode)
- [x] 1.3 Add ESLint and Prettier configuration
- [x] 1.4 Install dependencies: `@modelcontextprotocol/sdk`, `@google-cloud/discoveryengine`, `google-auth-library`
- [x] 1.5 Install dev dependencies: `typescript`, `vitest`, `@types/node`

## 2. Core Infrastructure

- [x] 2.1 Create `src/config.ts` with environment variable parsing and validation
- [x] 2.2 Create `src/types/index.ts` with shared TypeScript types
- [x] 2.3 Create `src/errors/index.ts` with error types and GCP-to-MCP error mapping
- [x] 2.4 Create `src/clients/discovery-engine.ts` with client wrapper class

## 3. MCP Server Setup

- [x] 3.1 Create `src/index.ts` with MCP server initialization
- [x] 3.2 Register stdio transport handler
- [x] 3.3 Implement server metadata (name, version, capabilities)

## 4. Operation Status Tool

- [x] 4.1 Create `src/tools/operation-status.ts` implementing LRO polling
- [x] 4.2 Register `operation_status` tool with MCP server
- [x] 4.3 Add input validation for operation ID format

## 5. Testing

- [x] 5.1 Create `vitest.config.ts`
- [x] 5.2 Write unit tests for config parsing
- [x] 5.3 Write unit tests for error mapping
- [x] 5.4 Write unit tests for operation status tool (mocked client)

## 6. Documentation

- [x] 6.1 Update README with setup instructions
- [x] 6.2 Add example MCP client configuration
