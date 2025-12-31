## 1. Audio Create Tool

- [x] 1.1 Create `src/tools/audio-create.ts` with tool implementation
- [x] 1.2 Implement focus parameter for episode targeting
- [x] 1.3 Implement language parameter support
- [x] 1.4 Return LRO operation ID for generation tracking
- [x] 1.5 Handle singleton constraint (document existing audio must be deleted first)
- [x] 1.6 Register tool with MCP server
- [x] 1.7 Write unit tests with mocked client

## 2. Audio Get Tool

- [x] 2.1 Create `src/tools/audio-get.ts` with tool implementation
- [x] 2.2 Return status (GENERATING, READY, FAILED)
- [x] 2.3 Return audio_uri when ready
- [x] 2.4 Return duration and generation timestamp metadata
- [x] 2.5 Register tool with MCP server
- [x] 2.6 Write unit tests with mocked client

## 3. Audio Delete Tool

- [x] 3.1 Create `src/tools/audio-delete.ts` with tool implementation
- [x] 3.2 Handle deletion confirmation
- [x] 3.3 Register tool with MCP server
- [x] 3.4 Write unit tests with mocked client

## 4. Integration Testing

- [x] 4.1 Write integration test for audio lifecycle (create -> poll -> get -> delete)
- [x] 4.2 Test singleton constraint enforcement
- [x] 4.3 Test focus and language parameters
