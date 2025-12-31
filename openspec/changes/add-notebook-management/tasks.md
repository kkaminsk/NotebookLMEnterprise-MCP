## 1. Notebook Create Tool

- [x] 1.1 Create `src/tools/notebook-create.ts` with tool implementation
- [x] 1.2 Add input validation for display_name (required), location, notebook_id
- [x] 1.3 Register tool with MCP server
- [x] 1.4 Write unit tests with mocked client

## 2. Notebook List Tool

- [x] 2.1 Create `src/tools/notebook-list.ts` with tool implementation
- [x] 2.2 Implement pagination support with page_size parameter
- [x] 2.3 Implement recently_viewed filter option
- [x] 2.4 Register tool with MCP server
- [x] 2.5 Write unit tests with mocked client

## 3. Notebook Delete Tool

- [x] 3.1 Create `src/tools/notebook-delete.ts` with tool implementation
- [x] 3.2 Add input validation for notebook_names array (required, non-empty)
- [x] 3.3 Implement batch deletion with partial failure handling
- [x] 3.4 Register tool with MCP server
- [x] 3.5 Write unit tests with mocked client

## 4. Notebook Share Tool

- [x] 4.1 Create `src/tools/notebook-share.ts` with tool implementation
- [x] 4.2 Add input validation for notebook_name, principals, role
- [x] 4.3 Map role parameter to IAM roles (viewer -> roles/discoveryengine.viewer, editor -> roles/discoveryengine.editor)
- [x] 4.4 Register tool with MCP server
- [x] 4.5 Write unit tests with mocked client

## 5. Integration Testing

- [x] 5.1 Write integration test for notebook lifecycle (create -> list -> share -> delete)
