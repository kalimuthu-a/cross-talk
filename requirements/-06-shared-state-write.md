# Shared State Write
The library MUST allow a microfrontend to set a shared state value by key.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can set a shared state value by key.
- Setting a value overwrites any existing value for the same key.
- Complex objects and `null` values can be stored.
- Reads return the most recently written value.

## Test Cases

### TC-06-01: Write new state value
- **Given** the library is initialized
- **When** a microfrontend sets state key "theme" to value "dark"
- **Then** the state is stored without error

### TC-06-02: Overwrite existing state value
- **Given** the library is initialized
- **And** shared state key "counter" has value `5`
- **When** a microfrontend sets state key "counter" to value `10`
- **Then** reading state key "counter" returns `10`

### TC-06-03: Write complex object value
- **Given** the library is initialized
- **When** a microfrontend sets state key "user" to value `{ id: 1, roles: ["admin", "user"] }`
- **Then** reading state key "user" returns `{ id: 1, roles: ["admin", "user"] }`

### TC-06-04: Write null value
- **Given** the library is initialized
- **And** shared state key "session" has value `{ token: "abc" }`
- **When** a microfrontend sets state key "session" to `null`
- **Then** reading state key "session" returns `null`
