# Shared State Changes
The library MUST allow a microfrontend to subscribe to changes for a shared state key.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can subscribe to changes for a specific state key.
- Subscribers receive the updated value when the key changes.
- Subscribing to a key with an existing value immediately delivers the current value.
- Subscribers are not notified for updates to other keys.
- Multiple subscribers to the same key are all notified.

## Test Cases

### TC-07-01: Subscriber notified on state change
- **Given** the library is initialized
- **And** a microfrontend subscribes to changes for state key "theme"
- **When** another microfrontend sets state key "theme" to "light"
- **Then** the subscriber callback is invoked with the new value "light"

### TC-07-02: Subscriber receives updated value
- **Given** the library is initialized
- **And** shared state key "count" has value `1`
- **And** a microfrontend subscribes to changes for state key "count"
- **When** state key "count" is updated to `2`
- **Then** the subscriber callback receives value `2`

### TC-07-03: Subscriber not notified for other keys
- **Given** the library is initialized
- **And** a microfrontend subscribes to changes for state key "userA"
- **When** state key "userB" is updated
- **Then** the subscriber callback is not invoked

### TC-07-04: Multiple subscribers notified
- **Given** the library is initialized
- **And** microfrontend A subscribes to changes for state key "config"
- **And** microfrontend B subscribes to changes for state key "config"
- **When** state key "config" is updated to `{ debug: true }`
- **Then** both subscriber callbacks are invoked with `{ debug: true }`

### TC-07-05: Subscriber immediately receives current value
- **Given** the library is initialized
- **And** shared state key "language" has value "en"
- **When** a microfrontend subscribes to changes for state key "language"
- **Then** the subscriber callback is immediately invoked with value "en"
