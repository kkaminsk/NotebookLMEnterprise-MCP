## ADDED Requirements

### Requirement: Create Audio Overview

The server SHALL provide an `audio_create` tool for generating AI podcast-style audio overviews.

#### Scenario: Create audio with default settings
- **WHEN** `audio_create` is called with only notebook_name
- **THEN** the server SHALL initiate audio generation and return an LRO operation ID

#### Scenario: Create audio with focus directive
- **WHEN** `audio_create` is called with `focus` set to "Analyze the regulatory risks"
- **THEN** the server SHALL initiate audio generation with the specified focus and return an LRO operation ID

#### Scenario: Create audio with language specification
- **WHEN** `audio_create` is called with `language` set to "en-GB"
- **THEN** the server SHALL generate audio in British English

#### Scenario: Create audio when one already exists
- **WHEN** `audio_create` is called on a notebook that already has an audio overview
- **THEN** the server SHALL return an error indicating the existing audio must be deleted first

#### Scenario: Create audio on empty notebook
- **WHEN** `audio_create` is called on a notebook with no sources
- **THEN** the server SHALL return an error indicating sources are required for audio generation

#### Scenario: Create audio on non-existent notebook
- **WHEN** `audio_create` is called with a notebook_name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

#### Scenario: Daily limit exceeded
- **WHEN** `audio_create` is called and the daily limit (20) has been reached
- **THEN** the server SHALL return a resource_exhausted error indicating the daily limit

---

### Requirement: Get Audio Overview

The server SHALL provide an `audio_get` tool for retrieving audio overview status and content.

#### Scenario: Get generating audio status
- **WHEN** `audio_get` is called while audio is being generated
- **THEN** the server SHALL return status `GENERATING`

#### Scenario: Get ready audio
- **WHEN** `audio_get` is called after audio generation completes successfully
- **THEN** the server SHALL return status `READY` with audio_uri, duration_seconds, and generated_at

#### Scenario: Get failed audio
- **WHEN** `audio_get` is called after audio generation fails
- **THEN** the server SHALL return status `FAILED` with error details

#### Scenario: Get audio when none exists
- **WHEN** `audio_get` is called on a notebook with no audio overview
- **THEN** the server SHALL return a not_found error indicating no audio overview exists

#### Scenario: Get audio on non-existent notebook
- **WHEN** `audio_get` is called with a notebook_name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

---

### Requirement: Delete Audio Overview

The server SHALL provide an `audio_delete` tool for removing audio overviews from notebooks.

#### Scenario: Delete existing audio
- **WHEN** `audio_delete` is called on a notebook with an audio overview
- **THEN** the server SHALL delete the audio and return confirmation

#### Scenario: Delete while generating
- **WHEN** `audio_delete` is called while audio is being generated
- **THEN** the server SHALL cancel generation and delete the audio

#### Scenario: Delete when none exists
- **WHEN** `audio_delete` is called on a notebook with no audio overview
- **THEN** the server SHALL return a not_found error indicating no audio overview exists

#### Scenario: Delete on non-existent notebook
- **WHEN** `audio_delete` is called with a notebook_name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

---

### Requirement: Audio Singleton Constraint

The server SHALL enforce that each notebook can have at most one audio overview at a time.

#### Scenario: Singleton enforced on create
- **WHEN** a notebook already has an audio overview
- **THEN** `audio_create` SHALL fail until the existing audio is deleted

#### Scenario: Delete enables new creation
- **WHEN** an audio overview is deleted
- **THEN** a new audio overview can be created on the same notebook
