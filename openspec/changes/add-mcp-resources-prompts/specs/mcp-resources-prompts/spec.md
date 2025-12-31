## ADDED Requirements

### Requirement: Notebook Resource

The server SHALL expose notebooks as browsable MCP resources.

#### Scenario: List notebook resource
- **WHEN** an MCP client requests the resource `notebooklm://notebooks/{notebook_id}`
- **THEN** the server SHALL return notebook metadata as JSON including name, display_name, create_time, and source_count

#### Scenario: Browse notebook with valid ID
- **WHEN** an MCP client requests a valid notebook resource URI
- **THEN** the server SHALL return the resource with mime_type `application/json`

#### Scenario: Browse notebook with invalid ID
- **WHEN** an MCP client requests a notebook resource URI that does not exist
- **THEN** the server SHALL return a not_found error

---

### Requirement: Sources Resource

The server SHALL expose notebook sources as browsable MCP resources.

#### Scenario: List sources resource
- **WHEN** an MCP client requests the resource `notebooklm://notebooks/{notebook_id}/sources`
- **THEN** the server SHALL return an array of source metadata as JSON

#### Scenario: Sources include metadata
- **WHEN** sources resource is requested
- **THEN** each source SHALL include id, type, status, title, and word_count

---

### Requirement: Audio Resource

The server SHALL expose audio overviews as browsable MCP resources.

#### Scenario: Get audio resource when ready
- **WHEN** an MCP client requests `notebooklm://notebooks/{notebook_id}/audio` and audio is ready
- **THEN** the server SHALL return audio metadata including status, audio_uri, duration_seconds

#### Scenario: Get audio resource when generating
- **WHEN** an MCP client requests audio resource while generation is in progress
- **THEN** the server SHALL return status `GENERATING`

#### Scenario: Get audio resource when none exists
- **WHEN** an MCP client requests audio resource and no audio exists
- **THEN** the server SHALL return a not_found error

---

### Requirement: Resource URI Templates

The server SHALL expose resource URI templates for client discovery.

#### Scenario: Templates listed in server capabilities
- **WHEN** an MCP client connects and queries server capabilities
- **THEN** the server SHALL advertise resource templates for notebooks, sources, and audio

#### Scenario: Template format
- **WHEN** resource templates are listed
- **THEN** each template SHALL include uri_template, name, description, and mime_type

---

### Requirement: Research Assistant Prompt

The server SHALL provide a `research_assistant` prompt template for conducting research.

#### Scenario: Invoke research assistant prompt
- **WHEN** `research_assistant` prompt is invoked with `topic` and `notebook_name`
- **THEN** the server SHALL return a structured prompt for querying the notebook about the topic

#### Scenario: Research assistant requires topic
- **WHEN** `research_assistant` prompt is invoked without `topic`
- **THEN** the server SHALL return a validation error indicating topic is required

#### Scenario: Research assistant requires notebook_name
- **WHEN** `research_assistant` prompt is invoked without `notebook_name`
- **THEN** the server SHALL return a validation error indicating notebook_name is required

---

### Requirement: Document Briefing Prompt

The server SHALL provide a `document_briefing` prompt template for generating executive briefings.

#### Scenario: Invoke document briefing prompt
- **WHEN** `document_briefing` prompt is invoked with `notebook_name`
- **THEN** the server SHALL return a structured prompt for generating a briefing

#### Scenario: Document briefing with audience
- **WHEN** `document_briefing` prompt is invoked with `audience` set to "executive"
- **THEN** the server SHALL tailor the prompt for executive-level communication

#### Scenario: Document briefing audiences
- **WHEN** `document_briefing` prompt is invoked with `audience`
- **THEN** valid audiences SHALL include "executive", "technical", and "general"

---

### Requirement: Podcast Script Prompt

The server SHALL provide a `podcast_script` prompt template for audio overview generation.

#### Scenario: Invoke podcast script prompt
- **WHEN** `podcast_script` prompt is invoked with `notebook_name`
- **THEN** the server SHALL return a structured prompt for generating an audio overview

#### Scenario: Podcast script with focus
- **WHEN** `podcast_script` prompt is invoked with `focus` set to "key takeaways"
- **THEN** the server SHALL include the focus directive in the prompt

---

### Requirement: Prompt Argument Definitions

The server SHALL provide structured argument definitions for all prompts.

#### Scenario: Prompt arguments listed
- **WHEN** an MCP client queries available prompts
- **THEN** each prompt SHALL include name, description, and arguments array

#### Scenario: Argument includes metadata
- **WHEN** prompt arguments are listed
- **THEN** each argument SHALL include name, description, and required flag
