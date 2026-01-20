# Shared State Unsubscribe
The library MUST allow a microfrontend to remove a previously registered shared state change subscription.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can remove a shared state change subscription.
- Unsubscribed callbacks are not invoked on updates.
- Other subscribers remain active after an unsubscribe.
- Unsubscribing a non-existent subscription is handled gracefully.

## Test Cases

### TC-18-01: Unsubscribed callback not invoked on state change
- **Given** the library is initialized
- **And** a microfrontend subscribes to changes for state key "theme"
- **And** the microfrontend unsubscribes from state key "theme"
- **When** state key "theme" is updated
- **Then** the previously registered callback is not invoked

### TC-18-02: Other subscribers remain active after one unsubscribes
- **Given** the library is initialized
- **And** microfrontend A subscribes to changes for state key "config"
- **And** microfrontend B subscribes to changes for state key "config"
- **And** microfrontend A unsubscribes
- **When** state key "config" is updated
- **Then** microfrontend B's callback is still invoked

### TC-18-03: Unsubscribe returns without error
- **Given** the library is initialized
- **And** a microfrontend subscribes to state key "data"
- **When** the microfrontend unsubscribes from state key "data"
- **Then** no error is thrown

### TC-18-04: Unsubscribe handles non-existent subscription gracefully
- **Given** the library is initialized
- **When** a microfrontend attempts to unsubscribe from a state key it never subscribed to
- **Then** no error is thrown
