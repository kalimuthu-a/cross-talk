# Subscribe Events
The library MUST allow a microfrontend to subscribe to a named event and receive its data payload when the event is published.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can subscribe to a named event.
- Subscribers receive the published payload with the correct type.
- Multiple subscribers to the same event are all notified.
- Subscribers do not receive unrelated events.

## Test Cases

### TC-02-01: Subscriber receives published event
- **Given** the library is initialized
- **And** a microfrontend subscribes to event "user-login"
- **When** another microfrontend publishes "user-login" with payload `{ userId: "123" }`
- **Then** the subscriber callback is invoked with payload `{ userId: "123" }`

### TC-02-02: Multiple subscribers receive same event
- **Given** the library is initialized
- **And** two microfrontends subscribe to event "theme-changed"
- **When** an event "theme-changed" is published with payload "dark"
- **Then** both subscriber callbacks are invoked with payload "dark"

### TC-02-03: Subscriber does not receive unrelated events
- **Given** the library is initialized
- **And** a microfrontend subscribes to event "user-login"
- **When** an event "user-logout" is published
- **Then** the subscriber callback is not invoked

### TC-02-04: Subscriber receives correct payload type
- **Given** the library is initialized
- **And** a microfrontend subscribes to event "data-update"
- **When** an event "data-update" is published with payload `[1, 2, 3]`
- **Then** the subscriber receives an array `[1, 2, 3]`
