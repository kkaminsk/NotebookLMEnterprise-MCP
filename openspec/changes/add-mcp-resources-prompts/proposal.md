## Why

MCP supports Resources (browsable data) and Prompts (pre-defined templates) in addition to Tools. This proposal implements resource providers for notebook browsing and prompt templates for common workflows, completing the full MCP integration.

## What Changes

- Implement MCP resource provider for notebooks, sources, and audio
- Implement prompt templates for research assistant, document briefing, and podcast script workflows
- Add resource URI templates following `notebooklm://` scheme

## Impact

- Affected specs: `mcp-resources-prompts` (new capability)
- Affected code: `src/resources/`, `src/prompts/`
- Dependencies: Requires all previous proposals to be implemented first
