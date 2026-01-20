# Late-Loaded Publish
The library MUST allow a microfrontend loaded after others to publish events without requiring other microfrontends to be reloaded.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- Late-loaded microfrontends can publish events to existing subscribers.
- Existing microfrontends are not required to reload to receive events.
- Multiple late-loaded publishers can publish without conflicts.
- Event delivery order is preserved for sequential publishes.

## Test Cases

### TC-04-01: Late-loaded microfrontend can publish to existing subscriber
- **Given** the library is initialized
- **And** microfrontend A subscribes to event "data-sync"
- **When** microfrontend B is loaded later and publishes event "data-sync" with payload "synced"
- **Then** microfrontend A receives the event with payload "synced"

### TC-04-02: Late-loaded microfrontend publishes without reload
- **Given** the library is initialized
- **And** microfrontend A is loaded and subscribes to event "update"
- **When** microfrontend B is loaded 5 seconds later
- **And** microfrontend B publishes event "update"
- **Then** microfrontend A receives the event without being reloaded

### TC-04-03: Multiple late-loaded publishers work correctly
- **Given** the library is initialized
- **And** microfrontend A subscribes to event "ping"
- **When** microfrontend B is loaded and publishes "ping" with payload "B"
- **And** microfrontend C is loaded and publishes "ping" with payload "C"
- **Then** microfrontend A receives both events in order
