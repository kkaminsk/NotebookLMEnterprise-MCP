## ADDED Requirements

### Requirement: MCP Server Initialization

The server SHALL initialize as a valid MCP server exposing tools to connected clients.

#### Scenario: Server starts successfully with valid configuration
- **WHEN** the server is started with valid `GOOGLE_CLOUD_PROJECT` environment variable
- **THEN** the server SHALL register with MCP protocol and await client connections

#### Scenario: Server fails with missing project configuration
- **WHEN** the server is started without `GOOGLE_CLOUD_PROJECT` environment variable
- **THEN** the server SHALL exit with error code 1 and log a descriptive error message

---

### Requirement: Google Cloud Authentication

The server SHALL authenticate with Google Cloud using Application Default Credentials (ADC).

#### Scenario: Authentication succeeds with ADC
- **WHEN** valid ADC credentials are available in the environment
- **THEN** the server SHALL successfully instantiate Google Cloud clients

#### Scenario: Authentication fails with invalid credentials
- **WHEN** ADC credentials are missing or invalid
- **THEN** the server SHALL return an `UNAUTHENTICATED` error to tool invocations with guidance to run `gcloud auth application-default login`

---

### Requirement: Configuration Management

The server SHALL read configuration from environment variables with sensible defaults.

#### Scenario: Default location is used when not specified
- **WHEN** `NOTEBOOKLM_LOCATION` is not set
- **THEN** the server SHALL use `us` as the default location

#### Scenario: Custom location is respected
- **WHEN** `NOTEBOOKLM_LOCATION` is set to `eu`
- **THEN** the server SHALL use the EU regional endpoint for API calls

#### Scenario: Custom timeout is respected
- **WHEN** `NOTEBOOKLM_TIMEOUT_MS` is set to `300000`
- **THEN** the server SHALL use 300 seconds as the API timeout

---

### Requirement: Error Handling

The server SHALL map Google Cloud errors to structured MCP error responses.

#### Scenario: Rate limit error is mapped correctly
- **WHEN** Google Cloud returns `RESOURCE_EXHAUSTED` error
- **THEN** the server SHALL return an error with code `rate_limit_exceeded` and include retry guidance

#### Scenario: Permission error is mapped correctly
- **WHEN** Google Cloud returns `PERMISSION_DENIED` error
- **THEN** the server SHALL return an error with code `permission_denied` and include required IAM permissions

#### Scenario: Not found error is mapped correctly
- **WHEN** Google Cloud returns `NOT_FOUND` error
- **THEN** the server SHALL return an error with code `not_found` and include the resource identifier

---

### Requirement: Operation Status Tool

The server SHALL provide an `operation_status` tool for checking long-running operation status.

#### Scenario: Check pending operation status
- **WHEN** `operation_status` is called with a valid operation ID for an in-progress operation
- **THEN** the server SHALL return status `RUNNING` with progress metadata if available

#### Scenario: Check completed operation status
- **WHEN** `operation_status` is called with a valid operation ID for a completed operation
- **THEN** the server SHALL return status `DONE` with the operation result

#### Scenario: Check failed operation status
- **WHEN** `operation_status` is called with a valid operation ID for a failed operation
- **THEN** the server SHALL return status `FAILED` with error details

#### Scenario: Invalid operation ID format
- **WHEN** `operation_status` is called with an invalid operation ID format
- **THEN** the server SHALL return a validation error describing the expected format
