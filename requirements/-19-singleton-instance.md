# Shared Instance
The library MUST provide a single shared instance accessible to all microfrontends within the same page.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- All microfrontends receive the same library instance on the page.
- Shared state is visible across microfrontends via the instance.
- Events published by one microfrontend can be received by another.
- Multiple script loads return the same shared instance.

## Test Cases

### TC-19-01: Same instance returned to all microfrontends
- **Given** the library is loaded on a page
- **When** microfrontend A accesses the library instance
- **And** microfrontend B accesses the library instance
- **Then** both receive the same instance (referential equality)

### TC-19-02: State is shared across microfrontends
- **Given** the library is initialized
- **And** microfrontend A sets state "shared-key" to "value-from-A"
- **When** microfrontend B reads state "shared-key"
- **Then** the value is "value-from-A"

### TC-19-03: Events cross microfrontend boundaries
- **Given** the library is initialized
- **And** microfrontend A subscribes to event "cross-mfe"
- **When** microfrontend B publishes event "cross-mfe"
- **Then** microfrontend A receives the event

### TC-19-04: Multiple script loads return same instance
- **Given** the library script is loaded multiple times on the page
- **When** each script load accesses the library
- **Then** all access points return the same shared instance
