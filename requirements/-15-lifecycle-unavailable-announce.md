# Lifecycle Unavailable Announce
The library MUST allow a microfrontend to announce when it becomes unavailable.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can announce unavailability with an identifier.
- Lifecycle subscribers are notified of unavailability.
- Unavailable microfrontends are removed from discovery results.
- Announcing unavailability for unknown microfrontends is handled gracefully.

## Test Cases

### TC-15-01: Microfrontend announces unavailability
- **Given** the library is initialized
- **And** microfrontend "widget-mfe" has announced availability
- **When** microfrontend "widget-mfe" announces it is unavailable
- **Then** the announcement is accepted without error

### TC-15-02: Unavailability announcement notifies subscribers
- **Given** the library is initialized
- **And** a lifecycle subscriber is registered
- **And** microfrontend "temp-mfe" is available
- **When** microfrontend "temp-mfe" announces unavailability
- **Then** the subscriber receives notification of unavailability

### TC-15-03: Unavailable microfrontend removed from discovery
- **Given** the library is initialized
- **And** microfrontend "old-mfe" has announced availability
- **When** microfrontend "old-mfe" announces unavailability
- **And** a query for available microfrontends is made
- **Then** "old-mfe" is not in the result

### TC-15-04: Announce unavailability for non-registered microfrontend
- **Given** the library is initialized
- **And** microfrontend "unknown-mfe" never announced availability
- **When** microfrontend "unknown-mfe" announces unavailability
- **Then** no error is thrown (graceful handling)
