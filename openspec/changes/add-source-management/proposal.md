## Why

Sources are the knowledge foundation of NotebookLM notebooks. The value of the platform is entirely determined by the quality and breadth of ingested documents. This proposal implements multi-modal source ingestion supporting Google Drive, websites, YouTube videos, raw text, and file uploads.

## What Changes

- Implement `source_add` tool for multi-modal source ingestion
- Implement `source_list` tool for listing sources in a notebook
- Implement `source_delete` tool for removing sources
- Handle asynchronous ingestion via LRO pattern

## Impact

- Affected specs: `source-management` (new capability)
- Affected code: `src/tools/source-*.ts`
- Dependencies: Requires `add-mcp-server-core` and `add-notebook-management` to be implemented first
