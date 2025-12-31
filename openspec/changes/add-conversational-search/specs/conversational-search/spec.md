## ADDED Requirements

### Requirement: Query Notebook

The server SHALL provide a `notebook_query` tool for natural language Q&A with source citations.

#### Scenario: Single query with citations
- **WHEN** `notebook_query` is called with a query "What are the main risks?"
- **THEN** the server SHALL return an answer with citations linking claims to source locations

#### Scenario: Query without citations
- **WHEN** `notebook_query` is called with `include_citations` set to false
- **THEN** the server SHALL return only the answer text without citation metadata

#### Scenario: Multi-turn conversation
- **WHEN** `notebook_query` is called with a `conversation_id` from a previous query
- **THEN** the server SHALL maintain context and answer based on conversation history

#### Scenario: Start new conversation
- **WHEN** `notebook_query` is called without a `conversation_id`
- **THEN** the server SHALL start a new conversation and return a new `conversation_id`

#### Scenario: Query empty notebook
- **WHEN** `notebook_query` is called on a notebook with no sources
- **THEN** the server SHALL return a response indicating no sources are available to answer the query

#### Scenario: Query non-existent notebook
- **WHEN** `notebook_query` is called with a notebook_name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

#### Scenario: Citation structure
- **WHEN** `notebook_query` returns citations
- **THEN** each citation SHALL include text_span (start/end), source_id, source_title, and page_or_timestamp when available

---

### Requirement: Summarize Notebook

The server SHALL provide a `notebook_summarize` tool for generating structured summaries of notebook sources.

#### Scenario: Generate default summary
- **WHEN** `notebook_summarize` is called with only notebook_name
- **THEN** the server SHALL return a comprehensive summary of all sources with citations

#### Scenario: Generate focused summary
- **WHEN** `notebook_summarize` is called with `focus` set to "financial risks"
- **THEN** the server SHALL return a summary focused on the specified topic

#### Scenario: Generate bullet point summary
- **WHEN** `notebook_summarize` is called with `format` set to "bullet_points"
- **THEN** the server SHALL return the summary as a bulleted list

#### Scenario: Generate paragraph summary
- **WHEN** `notebook_summarize` is called with `format` set to "paragraph"
- **THEN** the server SHALL return the summary as flowing paragraphs

#### Scenario: Generate FAQ summary
- **WHEN** `notebook_summarize` is called with `format` set to "faq"
- **THEN** the server SHALL return the summary as question-and-answer pairs

#### Scenario: Summarize empty notebook
- **WHEN** `notebook_summarize` is called on a notebook with no sources
- **THEN** the server SHALL return a response indicating no sources are available to summarize

#### Scenario: Summarize non-existent notebook
- **WHEN** `notebook_summarize` is called with a notebook_name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

---

### Requirement: Citation Metadata

The server SHALL provide structured citation metadata linking answer content to source documents.

#### Scenario: Citation includes source reference
- **WHEN** an answer includes a cited claim
- **THEN** the citation SHALL include the source_id and source_title

#### Scenario: Citation includes text span
- **WHEN** an answer includes a cited claim
- **THEN** the citation SHALL include start_index and end_index marking the cited text in the answer

#### Scenario: Citation includes page number for documents
- **WHEN** a citation references a PDF or document source
- **THEN** the citation SHALL include page_or_timestamp with the page number

#### Scenario: Citation includes timestamp for video
- **WHEN** a citation references a YouTube video source
- **THEN** the citation SHALL include page_or_timestamp with the video timestamp
