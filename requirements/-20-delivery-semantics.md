# Delivery Semantics
The library MUST expose whether notifications are delivered synchronously or asynchronously.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- The delivery mode is queryable as "sync" or "async".
- The delivery mode API is accessible without error.
- For synchronous delivery, callbacks complete before publish returns.
- For asynchronous delivery, publish may return before callbacks complete.

## Test Cases

### TC-20-01: Delivery mode is queryable
- **Given** the library is initialized
- **When** a microfrontend queries the delivery semantics
- **Then** a value indicating "sync" or "async" is returned

### TC-20-02: Delivery mode is documented/exposed as property or method
- **Given** the library is initialized
- **When** a microfrontend accesses the delivery mode API
- **Then** the delivery mode is accessible without error

### TC-20-03: Synchronous delivery completes before publish returns
- **Given** the library uses synchronous delivery
- **And** a subscriber is registered for event "sync-test"
- **When** an event "sync-test" is published
- **Then** the subscriber callback completes before the publish call returns

### TC-20-04: Asynchronous delivery allows publish to return immediately
- **Given** the library uses asynchronous delivery
- **And** a subscriber is registered for event "async-test"
- **When** an event "async-test" is published
- **Then** the publish call may return before subscriber callbacks complete
