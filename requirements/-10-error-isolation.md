# Event Subscriber Error Isolation
The library MUST ensure that an error thrown by one event subscriber does not prevent delivery to other subscribers of the same event.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- An error in one subscriber does not block delivery to other subscribers.
- The library remains functional after a subscriber throws an error.
- Subsequent events are still delivered even after an error occurs.

## Test Cases

### TC-10-01: Error in one subscriber does not block others
- **Given** the library is initialized
- **And** subscriber A for event "update" throws an error in its callback
- **And** subscriber B for event "update" has a valid callback
- **When** event "update" is published
- **Then** subscriber B's callback is still invoked

### TC-10-02: All non-throwing subscribers receive event
- **Given** the library is initialized
- **And** subscriber A throws an error
- **And** subscriber B executes normally
- **And** subscriber C executes normally
- **When** event "broadcast" is published
- **Then** both subscriber B and subscriber C receive the event

### TC-10-03: Error does not crash the library
- **Given** the library is initialized
- **And** a subscriber throws an uncaught exception
- **When** the event is published
- **Then** the library remains functional for subsequent operations

### TC-10-04: Subsequent events still delivered after error
- **Given** the library is initialized
- **And** subscriber A throws an error on event "first"
- **When** event "first" is published
- **And** event "second" is published
- **Then** subscriber A receives event "second" (if still subscribed)
