# API Version
The library MUST expose its communication API version as a string.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- The API version is accessible from the library.
- The version is returned as a string.
- The version string follows a recognizable version format.
- The version value is consistent across calls.

## Test Cases

### TC-11-01: Version is accessible
- **Given** the library is initialized
- **When** a microfrontend requests the API version
- **Then** a version string is returned

### TC-11-02: Version is a string type
- **Given** the library is initialized
- **When** a microfrontend requests the API version
- **Then** the returned value is of type string

### TC-11-03: Version follows semantic format
- **Given** the library is initialized
- **When** a microfrontend requests the API version
- **Then** the version string matches a recognizable format (e.g., "1.0.0", "2.1", "1.0.0-beta")

### TC-11-04: Version is consistent
- **Given** the library is initialized
- **When** a microfrontend requests the API version multiple times
- **Then** the same version string is returned each time
