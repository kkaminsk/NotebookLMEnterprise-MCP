## ADDED Requirements

### Requirement: Create Notebook

The server SHALL provide a `notebook_create` tool for creating new NotebookLM notebooks.

#### Scenario: Create notebook with display name only
- **WHEN** `notebook_create` is called with `display_name` set to "Q4 Analysis"
- **THEN** the server SHALL create a notebook in the default location and return the full resource name

#### Scenario: Create notebook with custom ID
- **WHEN** `notebook_create` is called with `display_name` "Q4 Analysis" and `notebook_id` "q4-analysis-2025"
- **THEN** the server SHALL create a notebook with the specified ID and return the full resource name

#### Scenario: Create notebook in specific location
- **WHEN** `notebook_create` is called with `display_name` "EU Data" and `location` "eu"
- **THEN** the server SHALL create the notebook in the EU region using the EU endpoint

#### Scenario: Create notebook with missing display name
- **WHEN** `notebook_create` is called without `display_name`
- **THEN** the server SHALL return a validation error indicating display_name is required

#### Scenario: Create notebook with duplicate ID
- **WHEN** `notebook_create` is called with a `notebook_id` that already exists
- **THEN** the server SHALL return an error indicating the notebook ID is already in use

---

### Requirement: List Notebooks

The server SHALL provide a `notebook_list` tool for listing accessible notebooks.

#### Scenario: List all notebooks
- **WHEN** `notebook_list` is called without filters
- **THEN** the server SHALL return an array of notebook summaries including name, display_name, and create_time

#### Scenario: List notebooks with pagination
- **WHEN** `notebook_list` is called with `page_size` set to 10
- **THEN** the server SHALL return at most 10 notebooks and include a next_page_token if more exist

#### Scenario: List recently viewed notebooks
- **WHEN** `notebook_list` is called with `recently_viewed` set to true
- **THEN** the server SHALL return notebooks ordered by most recent interaction

#### Scenario: List notebooks in specific location
- **WHEN** `notebook_list` is called with `location` set to "eu"
- **THEN** the server SHALL only return notebooks from the EU region

---

### Requirement: Delete Notebooks

The server SHALL provide a `notebook_delete` tool for removing notebooks.

#### Scenario: Delete single notebook
- **WHEN** `notebook_delete` is called with one notebook name in `notebook_names`
- **THEN** the server SHALL delete the notebook and return confirmation

#### Scenario: Batch delete multiple notebooks
- **WHEN** `notebook_delete` is called with multiple notebook names
- **THEN** the server SHALL delete all specified notebooks and return confirmation for each

#### Scenario: Delete with partial failure
- **WHEN** `notebook_delete` is called with multiple notebooks and one does not exist
- **THEN** the server SHALL delete the existing notebooks and return partial success with error details for the missing notebook

#### Scenario: Delete with empty array
- **WHEN** `notebook_delete` is called with an empty `notebook_names` array
- **THEN** the server SHALL return a validation error indicating at least one notebook name is required

#### Scenario: Delete non-existent notebook
- **WHEN** `notebook_delete` is called with a notebook name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier

---

### Requirement: Share Notebook

The server SHALL provide a `notebook_share` tool for granting access to notebooks via IAM.

#### Scenario: Share notebook with viewer role
- **WHEN** `notebook_share` is called with `role` "viewer" and `principals` ["user@example.com"]
- **THEN** the server SHALL grant `roles/discoveryengine.viewer` to the specified principal

#### Scenario: Share notebook with editor role
- **WHEN** `notebook_share` is called with `role` "editor" and `principals` ["user@example.com"]
- **THEN** the server SHALL grant `roles/discoveryengine.editor` to the specified principal

#### Scenario: Share notebook with multiple principals
- **WHEN** `notebook_share` is called with `principals` ["user1@example.com", "user2@example.com"]
- **THEN** the server SHALL grant the specified role to all principals

#### Scenario: Share notebook with service account
- **WHEN** `notebook_share` is called with `principals` ["sa@project.iam.gserviceaccount.com"]
- **THEN** the server SHALL grant the specified role to the service account

#### Scenario: Share notebook with invalid role
- **WHEN** `notebook_share` is called with `role` "admin"
- **THEN** the server SHALL return a validation error indicating valid roles are "viewer" or "editor"

#### Scenario: Share non-existent notebook
- **WHEN** `notebook_share` is called with a notebook name that does not exist
- **THEN** the server SHALL return a not_found error with the notebook identifier
