## 1. Source Add Tool

- [x] 1.1 Create `src/tools/source-add.ts` with tool implementation
- [x] 1.2 Implement Google Drive source type handling
- [x] 1.3 Implement website URL source type handling
- [x] 1.4 Implement YouTube video source type handling
- [x] 1.5 Implement raw text source type handling
- [x] 1.6 Implement file upload (base64) source type handling
- [x] 1.7 Add input validation for source type discrimination
- [x] 1.8 Return LRO operation ID for batch processing
- [x] 1.9 Register tool with MCP server
- [x] 1.10 Write unit tests for each source type

## 2. Source List Tool

- [x] 2.1 Create `src/tools/source-list.ts` with tool implementation
- [x] 2.2 Return source metadata (ID, type, status, title, word count)
- [x] 2.3 Register tool with MCP server
- [x] 2.4 Write unit tests with mocked client

## 3. Source Delete Tool

- [x] 3.1 Create `src/tools/source-delete.ts` with tool implementation
- [x] 3.2 Add input validation for source_names array
- [x] 3.3 Implement batch deletion with partial failure handling
- [x] 3.4 Register tool with MCP server
- [x] 3.5 Write unit tests with mocked client

## 4. Integration Testing

- [x] 4.1 Write integration test for source lifecycle (add -> list -> delete)
- [x] 4.2 Test LRO polling for source ingestion completion
