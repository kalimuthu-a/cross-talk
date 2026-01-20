# Shared State Read
The library MUST allow a microfrontend to read a shared state value by key.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can read a shared state value by key.
- Reading a missing key returns `undefined` or `null`.
- Returned values preserve their original data type.
- Reading returns the latest value for the key.

## Test Cases

### TC-05-01: Read existing state value
- **Given** the library is initialized
- **And** shared state key "user" has value `{ name: "Alice" }`
- **When** a microfrontend reads state key "user"
- **Then** the value `{ name: "Alice" }` is returned

### TC-05-02: Read non-existent state key returns undefined or null
- **Given** the library is initialized
- **And** no state has been set for key "missing-key"
- **When** a microfrontend reads state key "missing-key"
- **Then** `undefined` or `null` is returned

### TC-05-03: Read state preserves data type
- **Given** the library is initialized
- **And** shared state key "count" has value `42` (number)
- **When** a microfrontend reads state key "count"
- **Then** the value `42` is returned as a number

### TC-05-04: Read state returns current value
- **Given** the library is initialized
- **And** shared state key "version" is set to "1.0"
- **And** shared state key "version" is updated to "2.0"
- **When** a microfrontend reads state key "version"
- **Then** the value "2.0" is returned
