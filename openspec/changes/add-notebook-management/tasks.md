## 1. Notebook Create Tool

- [ ] 1.1 Create `src/tools/notebook-create.ts` with tool implementation
- [ ] 1.2 Add input validation for display_name (required), location, notebook_id
- [ ] 1.3 Register tool with MCP server
- [ ] 1.4 Write unit tests with mocked client

## 2. Notebook List Tool

- [ ] 2.1 Create `src/tools/notebook-list.ts` with tool implementation
- [ ] 2.2 Implement pagination support with page_size parameter
- [ ] 2.3 Implement recently_viewed filter option
- [ ] 2.4 Register tool with MCP server
- [ ] 2.5 Write unit tests with mocked client

## 3. Notebook Delete Tool

- [ ] 3.1 Create `src/tools/notebook-delete.ts` with tool implementation
- [ ] 3.2 Add input validation for notebook_names array (required, non-empty)
- [ ] 3.3 Implement batch deletion with partial failure handling
- [ ] 3.4 Register tool with MCP server
- [ ] 3.5 Write unit tests with mocked client

## 4. Notebook Share Tool

- [ ] 4.1 Create `src/tools/notebook-share.ts` with tool implementation
- [ ] 4.2 Add input validation for notebook_name, principals, role
- [ ] 4.3 Map role parameter to IAM roles (viewer -> roles/discoveryengine.viewer, editor -> roles/discoveryengine.editor)
- [ ] 4.4 Register tool with MCP server
- [ ] 4.5 Write unit tests with mocked client

## 5. Integration Testing

- [ ] 5.1 Write integration test for notebook lifecycle (create -> list -> share -> delete)
