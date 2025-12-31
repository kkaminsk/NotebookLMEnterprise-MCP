## ADDED Requirements

### Requirement: Add Sources

The server SHALL provide a `source_add` tool for ingesting documents into a notebook.

#### Scenario: Add Google Drive source
- **WHEN** `source_add` is called with a source of type `google_drive` and valid Drive URI
- **THEN** the server SHALL initiate ingestion and return an LRO operation ID

#### Scenario: Add website source
- **WHEN** `source_add` is called with a source of type `website` and valid URL
- **THEN** the server SHALL initiate ingestion and return an LRO operation ID

#### Scenario: Add YouTube source
- **WHEN** `source_add` is called with a source of type `youtube` and valid YouTube video URL
- **THEN** the server SHALL initiate transcript ingestion and return an LRO operation ID

#### Scenario: Add raw text source
- **WHEN** `source_add` is called with a source of type `text` with content and optional title
- **THEN** the server SHALL initiate ingestion and return an LRO operation ID

#### Scenario: Add file upload source
- **WHEN** `source_add` is called with a source of type `file` with base64_content, mime_type, and filename
- **THEN** the server SHALL initiate ingestion and return an LRO operation ID

#### Scenario: Add multiple sources in batch
- **WHEN** `source_add` is called with an array of multiple sources
- **THEN** the server SHALL initiate batch ingestion and return an LRO operation ID for the batch

#### Scenario: Add source with invalid notebook
- **WHEN** `source_add` is called with a notebook_name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

#### Scenario: Add source exceeding size limit
- **WHEN** `source_add` is called with a source exceeding 500,000 words or 200MB
- **THEN** the server SHALL return a validation error indicating the size limit

#### Scenario: Add source to full notebook
- **WHEN** `source_add` is called on a notebook that already has 500 sources
- **THEN** the server SHALL return a resource_exhausted error indicating the source limit

#### Scenario: Add source with missing required fields
- **WHEN** `source_add` is called with a source missing required fields for its type
- **THEN** the server SHALL return a validation error indicating the missing fields

---

### Requirement: List Sources

The server SHALL provide a `source_list` tool for listing sources in a notebook.

#### Scenario: List all sources in notebook
- **WHEN** `source_list` is called with a valid notebook_name
- **THEN** the server SHALL return an array of source metadata including id, type, status, title, and word_count

#### Scenario: List sources with processing status
- **WHEN** `source_list` is called and some sources are still processing
- **THEN** the server SHALL include status field showing `PROCESSING`, `READY`, or `FAILED` for each source

#### Scenario: List sources in empty notebook
- **WHEN** `source_list` is called on a notebook with no sources
- **THEN** the server SHALL return an empty array

#### Scenario: List sources in non-existent notebook
- **WHEN** `source_list` is called with a notebook_name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

---

### Requirement: Delete Sources

The server SHALL provide a `source_delete` tool for removing sources from a notebook.

#### Scenario: Delete single source
- **WHEN** `source_delete` is called with one source name in `source_names`
- **THEN** the server SHALL delete the source and return confirmation

#### Scenario: Batch delete multiple sources
- **WHEN** `source_delete` is called with multiple source names
- **THEN** the server SHALL delete all specified sources and return confirmation for each

#### Scenario: Delete with partial failure
- **WHEN** `source_delete` is called with multiple sources and one does not exist
- **THEN** the server SHALL delete the existing sources and return partial success with error details for the missing source

#### Scenario: Delete with empty array
- **WHEN** `source_delete` is called with an empty `source_names` array
- **THEN** the server SHALL return a validation error indicating at least one source name is required

#### Scenario: Delete non-existent source
- **WHEN** `source_delete` is called with a source name that does not exist
- **THEN** the server SHALL return a not_found error with the source identifier
