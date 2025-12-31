## Why

NotebookLM's Audio Overview ("Deep Dive" podcast) is its most distinctive feature with no equivalent in the commodity API market. This proposal implements the audio generation capabilities that allow AI agents to create engaging podcast-style discussions of source materials.

## What Changes

- Implement `audio_create` tool for generating AI podcast-style overviews
- Implement `audio_get` tool for retrieving audio overview status and content
- Implement `audio_delete` tool for removing audio overviews
- Handle singleton constraint (one audio per notebook) and LRO pattern

## Impact

- Affected specs: `audio-overview` (new capability)
- Affected code: `src/tools/audio-*.ts`
- Dependencies: Requires `add-mcp-server-core` and `add-notebook-management` to be implemented first
