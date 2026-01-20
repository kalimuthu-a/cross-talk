# Unsubscribe Events
The library MUST allow a microfrontend to remove a previously registered event subscription.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can remove a previously registered event subscription.
- Unsubscribed callbacks are no longer invoked for that event.
- Unsubscribing does not affect other active subscribers.
- Unsubscribing a non-existent subscription is handled gracefully.

## Test Cases

### TC-03-01: Unsubscribed callback not invoked
- **Given** the library is initialized
- **And** a microfrontend subscribes to event "user-login"
- **And** the microfrontend unsubscribes from "user-login"
- **When** an event "user-login" is published
- **Then** the previously registered callback is not invoked

### TC-03-02: Other subscribers remain active after one unsubscribes
- **Given** the library is initialized
- **And** microfrontend A subscribes to event "notification"
- **And** microfrontend B subscribes to event "notification"
- **And** microfrontend A unsubscribes from "notification"
- **When** an event "notification" is published
- **Then** microfrontend B's callback is still invoked

### TC-03-03: Unsubscribe returns without error for valid subscription
- **Given** the library is initialized
- **And** a microfrontend subscribes to event "test-event"
- **When** the microfrontend unsubscribes from "test-event"
- **Then** no error is thrown

### TC-03-04: Unsubscribe handles non-existent subscription gracefully
- **Given** the library is initialized
- **When** a microfrontend attempts to unsubscribe from an event it never subscribed to
- **Then** no error is thrown
