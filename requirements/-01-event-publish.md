# Publish Events
The library MUST allow a microfrontend to publish a named event with an associated data payload.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can publish an event by name with a payload.
- Payloads of common types (string, object, null) are accepted without error.
- Publishing with an empty event name is rejected or throws an error.

## Test Cases

### TC-01-01: Publish event with string payload
- **Given** the library is initialized
- **When** a microfrontend publishes an event named "user-login" with payload "user123"
- **Then** the event is accepted without error

### TC-01-02: Publish event with object payload
- **Given** the library is initialized
- **When** a microfrontend publishes an event named "cart-updated" with payload `{ itemCount: 5, total: 99.99 }`
- **Then** the event is accepted without error

### TC-01-03: Publish event with null payload
- **Given** the library is initialized
- **When** a microfrontend publishes an event named "session-cleared" with payload `null`
- **Then** the event is accepted without error

### TC-01-04: Publish event with empty name rejected
- **Given** the library is initialized
- **When** a microfrontend attempts to publish an event with an empty string name
- **Then** the library rejects the operation or throws an error
