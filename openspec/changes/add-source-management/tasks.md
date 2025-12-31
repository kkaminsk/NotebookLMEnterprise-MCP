## 1. Source Add Tool

- [ ] 1.1 Create `src/tools/source-add.ts` with tool implementation
- [ ] 1.2 Implement Google Drive source type handling
- [ ] 1.3 Implement website URL source type handling
- [ ] 1.4 Implement YouTube video source type handling
- [ ] 1.5 Implement raw text source type handling
- [ ] 1.6 Implement file upload (base64) source type handling
- [ ] 1.7 Add input validation for source type discrimination
- [ ] 1.8 Return LRO operation ID for batch processing
- [ ] 1.9 Register tool with MCP server
- [ ] 1.10 Write unit tests for each source type

## 2. Source List Tool

- [ ] 2.1 Create `src/tools/source-list.ts` with tool implementation
- [ ] 2.2 Return source metadata (ID, type, status, title, word count)
- [ ] 2.3 Register tool with MCP server
- [ ] 2.4 Write unit tests with mocked client

## 3. Source Delete Tool

- [ ] 3.1 Create `src/tools/source-delete.ts` with tool implementation
- [ ] 3.2 Add input validation for source_names array
- [ ] 3.3 Implement batch deletion with partial failure handling
- [ ] 3.4 Register tool with MCP server
- [ ] 3.5 Write unit tests with mocked client

## 4. Integration Testing

- [ ] 4.1 Write integration test for source lifecycle (add -> list -> delete)
- [ ] 4.2 Test LRO polling for source ingestion completion
