# State Change Subscriber Error Isolation
The library MUST ensure that an error thrown by one state change subscriber does not prevent delivery to other subscribers of the same state change.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- An error in one state subscriber does not block other subscribers.
- State updates remain intact even if a subscriber throws.
- The library continues to function after subscriber errors.
- Subsequent state updates still notify subscribers.

## Test Cases

### TC-16-01: Error in one state subscriber does not block others
- **Given** the library is initialized
- **And** subscriber A for state key "config" throws an error in its callback
- **And** subscriber B for state key "config" has a valid callback
- **When** state key "config" is updated
- **Then** subscriber B's callback is still invoked

### TC-16-02: All non-throwing state subscribers receive update
- **Given** the library is initialized
- **And** subscriber A throws an error
- **And** subscriber B executes normally
- **And** subscriber C executes normally
- **And** all subscribe to state key "settings"
- **When** state key "settings" is updated
- **Then** both subscriber B and subscriber C receive the update

### TC-16-03: Error does not corrupt state
- **Given** the library is initialized
- **And** a state subscriber throws an error when notified
- **When** state key "data" is set to `{ value: 100 }`
- **Then** reading state key "data" returns `{ value: 100 }`

### TC-16-04: Library remains functional after subscriber error
- **Given** the library is initialized
- **And** a state subscriber throws an error
- **When** the state is updated (triggering the error)
- **And** a subsequent state update is made
- **Then** all subscribers are notified of the subsequent update
