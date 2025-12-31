## Why

Notebooks are the fundamental containers in NotebookLM. Before sources can be added or queries executed, notebooks must be created and managed. This proposal implements the notebook lifecycle management tools.

## What Changes

- Implement `notebook_create` tool for creating new notebooks
- Implement `notebook_list` tool for listing accessible notebooks
- Implement `notebook_delete` tool for batch notebook deletion
- Implement `notebook_share` tool for IAM-based sharing

## Impact

- Affected specs: `notebook-management` (new capability)
- Affected code: `src/tools/notebook-*.ts`
- Dependencies: Requires `add-mcp-server-core` to be implemented first
