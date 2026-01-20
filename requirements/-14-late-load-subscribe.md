# Late-Loaded Subscribe
The library MUST allow a microfrontend loaded after others to subscribe to events without requiring other microfrontends to be reloaded.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- Late-loaded microfrontends can subscribe to events after initial load.
- Existing publishers deliver events without needing to reload.
- Late and early subscribers both receive events for the same name.
- Multiple late subscribers are supported.

## Test Cases

### TC-14-01: Late-loaded subscriber receives events from existing publisher
- **Given** the library is initialized
- **And** microfrontend A is loaded and can publish events
- **When** microfrontend B is loaded later and subscribes to event "data-update"
- **And** microfrontend A publishes event "data-update" with payload "new-data"
- **Then** microfrontend B receives the event with payload "new-data"

### TC-14-02: Late subscription does not require publisher reload
- **Given** the library is initialized
- **And** microfrontend A has been publishing events for some time
- **When** microfrontend B is loaded 10 seconds later and subscribes
- **Then** microfrontend A can deliver events to B without being reloaded

### TC-14-03: Multiple late subscribers work correctly
- **Given** the library is initialized
- **And** microfrontend A is the publisher
- **When** microfrontend B subscribes at T+5 seconds
- **And** microfrontend C subscribes at T+10 seconds
- **And** microfrontend A publishes an event
- **Then** both B and C receive the event

### TC-14-04: Late subscriber coexists with early subscribers
- **Given** the library is initialized
- **And** microfrontend A subscribes to "notify" at load time
- **When** microfrontend B subscribes to "notify" 5 seconds later
- **And** event "notify" is published
- **Then** both A and B receive the event
