# Lifecycle Discover
The library MUST allow a microfrontend to query which other microfrontends are currently available.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can query the list of currently available microfrontends.
- The query returns an empty list when none are available.
- Unavailable microfrontends are excluded from results.
- The list reflects the latest availability state.

## Test Cases

### TC-09-01: Query returns available microfrontends
- **Given** the library is initialized
- **And** microfrontend "header-mfe" has announced availability
- **And** microfrontend "sidebar-mfe" has announced availability
- **When** a microfrontend queries available microfrontends
- **Then** the result includes "header-mfe" and "sidebar-mfe"

### TC-09-02: Query returns empty when none available
- **Given** the library is initialized
- **And** no microfrontends have announced availability
- **When** a microfrontend queries available microfrontends
- **Then** an empty list is returned

### TC-09-03: Query excludes unavailable microfrontends
- **Given** the library is initialized
- **And** microfrontend "temp-mfe" announced availability
- **And** microfrontend "temp-mfe" announced unavailability
- **When** a microfrontend queries available microfrontends
- **Then** the result does not include "temp-mfe"

### TC-09-04: Query reflects current state
- **Given** the library is initialized
- **And** microfrontend "mfe-a" has announced availability
- **When** microfrontend "mfe-b" announces availability
- **And** a microfrontend queries available microfrontends
- **Then** the result includes both "mfe-a" and "mfe-b"
