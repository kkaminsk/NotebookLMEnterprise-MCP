## 1. Audio Create Tool

- [ ] 1.1 Create `src/tools/audio-create.ts` with tool implementation
- [ ] 1.2 Implement focus parameter for episode targeting
- [ ] 1.3 Implement language parameter support
- [ ] 1.4 Return LRO operation ID for generation tracking
- [ ] 1.5 Handle singleton constraint (document existing audio must be deleted first)
- [ ] 1.6 Register tool with MCP server
- [ ] 1.7 Write unit tests with mocked client

## 2. Audio Get Tool

- [ ] 2.1 Create `src/tools/audio-get.ts` with tool implementation
- [ ] 2.2 Return status (GENERATING, READY, FAILED)
- [ ] 2.3 Return audio_uri when ready
- [ ] 2.4 Return duration and generation timestamp metadata
- [ ] 2.5 Register tool with MCP server
- [ ] 2.6 Write unit tests with mocked client

## 3. Audio Delete Tool

- [ ] 3.1 Create `src/tools/audio-delete.ts` with tool implementation
- [ ] 3.2 Handle deletion confirmation
- [ ] 3.3 Register tool with MCP server
- [ ] 3.4 Write unit tests with mocked client

## 4. Integration Testing

- [ ] 4.1 Write integration test for audio lifecycle (create -> poll -> get -> delete)
- [ ] 4.2 Test singleton constraint enforcement
- [ ] 4.3 Test focus and language parameters
