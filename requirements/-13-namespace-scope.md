# Event Namespacing
The library MUST allow a microfrontend to scope its event names to avoid collisions with other microfrontends.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- Microfrontends can namespace event names to avoid collisions.
- Events in different namespaces are isolated from each other.
- Namespaced and global events can coexist.
- Namespaced publish/subscribe uses the correct scoped name.

## Test Cases

### TC-13-01: Namespaced events are isolated
- **Given** the library is initialized
- **And** microfrontend A subscribes to event "mfe-a:click"
- **And** microfrontend B subscribes to event "mfe-b:click"
- **When** event "mfe-a:click" is published
- **Then** only microfrontend A's callback is invoked

### TC-13-02: Same event name in different namespaces are distinct
- **Given** the library is initialized
- **And** microfrontend A subscribes to "cart:updated"
- **And** microfrontend B subscribes to "wishlist:updated"
- **When** event "cart:updated" is published with payload "cart-data"
- **Then** microfrontend A receives "cart-data"
- **And** microfrontend B does not receive any event

### TC-13-03: Namespace prefix is applied correctly
- **Given** the library is initialized
- **And** a microfrontend uses namespace "header"
- **When** the microfrontend publishes event "menu-open"
- **Then** the effective event name is scoped (e.g., "header:menu-open")

### TC-13-04: Global events work alongside namespaced events
- **Given** the library is initialized
- **And** a subscriber listens to global event "app:ready"
- **And** a subscriber listens to namespaced event "mfe-a:ready"
- **When** both events are published
- **Then** each subscriber receives only their respective event
