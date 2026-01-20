# Lifecycle Unsubscribe
The library MUST allow a microfrontend to remove a previously registered lifecycle availability subscription.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- A microfrontend can remove a lifecycle subscription.
- Unsubscribed callbacks are not invoked on lifecycle events.
- Other lifecycle subscribers remain active after an unsubscribe.
- Unsubscribing a non-existent subscription is handled gracefully.

## Test Cases

### TC-22-01: Unsubscribed callback not invoked on lifecycle change
- **Given** the library is initialized
- **And** a microfrontend subscribes to lifecycle announcements
- **And** the microfrontend unsubscribes from lifecycle announcements
- **When** another microfrontend announces availability
- **Then** the previously registered callback is not invoked

### TC-22-02: Other lifecycle subscribers remain active
- **Given** the library is initialized
- **And** microfrontend A subscribes to lifecycle announcements
- **And** microfrontend B subscribes to lifecycle announcements
- **And** microfrontend A unsubscribes
- **When** microfrontend "new-mfe" announces availability
- **Then** microfrontend B's callback is still invoked

### TC-22-03: Unsubscribe returns without error
- **Given** the library is initialized
- **And** a microfrontend subscribes to lifecycle announcements
- **When** the microfrontend unsubscribes from lifecycle announcements
- **Then** no error is thrown

### TC-22-04: Unsubscribe handles non-existent subscription gracefully
- **Given** the library is initialized
- **When** a microfrontend attempts to unsubscribe from lifecycle announcements it never subscribed to
- **Then** no error is thrown
