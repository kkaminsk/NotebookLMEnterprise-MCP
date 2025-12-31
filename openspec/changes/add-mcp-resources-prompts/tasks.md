## 1. Resource Provider Implementation

- [ ] 1.1 Create `src/resources/index.ts` with resource provider setup
- [ ] 1.2 Implement notebook resource template (`notebooklm://notebooks/{notebook_id}`)
- [ ] 1.3 Implement sources resource template (`notebooklm://notebooks/{notebook_id}/sources`)
- [ ] 1.4 Implement audio resource template (`notebooklm://notebooks/{notebook_id}/audio`)
- [ ] 1.5 Register resource templates with MCP server
- [ ] 1.6 Implement resource content handlers returning JSON metadata

## 2. Prompt Template Implementation

- [ ] 2.1 Create `src/prompts/index.ts` with prompt template setup
- [ ] 2.2 Implement `research_assistant` prompt template
- [ ] 2.3 Implement `document_briefing` prompt template
- [ ] 2.4 Implement `podcast_script` prompt template
- [ ] 2.5 Register prompt templates with MCP server

## 3. Testing

- [ ] 3.1 Write unit tests for resource URI parsing
- [ ] 3.2 Write unit tests for resource content handlers
- [ ] 3.3 Write unit tests for prompt argument validation
- [ ] 3.4 Write E2E test for resource browsing via MCP client
- [ ] 3.5 Write E2E test for prompt invocation via MCP client

## 4. Documentation

- [ ] 4.1 Document available resources in README
- [ ] 4.2 Document available prompts with usage examples
- [ ] 4.3 Add example client usage for resources and prompts
