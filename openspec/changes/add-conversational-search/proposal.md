## Why

The core value proposition of NotebookLM is source-grounded Q&A with citations. This proposal implements the conversational search capabilities that allow AI agents to query notebooks and receive answers with provenance information linking claims to specific source locations.

## What Changes

- Implement `notebook_query` tool for natural language Q&A with citations
- Implement `notebook_summarize` tool for generating structured summaries
- Support conversation state management for multi-turn dialogues

## Impact

- Affected specs: `conversational-search` (new capability)
- Affected code: `src/tools/notebook-query.ts`, `src/tools/notebook-summarize.ts`
- Dependencies: Requires `add-mcp-server-core`, `add-notebook-management`, and `add-source-management` to be implemented first
