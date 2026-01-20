# Lifecycle Subscribe
The library MUST allow a microfrontend to subscribe to availability announcements from other microfrontends.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- Microfrontends can subscribe to lifecycle availability announcements.
- Subscribers receive notifications for availability and unavailability events.
- Multiple lifecycle subscribers are supported.
- Notifications include the microfrontend identifier and status.

## Test Cases

### TC-21-01: Subscriber notified when microfrontend becomes available
- **Given** the library is initialized
- **And** a microfrontend subscribes to lifecycle availability announcements
- **When** microfrontend "new-mfe" announces availability
- **Then** the subscriber callback is invoked with information about "new-mfe"

### TC-21-02: Subscriber notified when microfrontend becomes unavailable
- **Given** the library is initialized
- **And** a microfrontend subscribes to lifecycle announcements
- **And** microfrontend "temp-mfe" is available
- **When** microfrontend "temp-mfe" announces unavailability
- **Then** the subscriber callback is invoked indicating unavailability

### TC-21-03: Multiple lifecycle subscribers receive notifications
- **Given** the library is initialized
- **And** microfrontend A subscribes to lifecycle announcements
- **And** microfrontend B subscribes to lifecycle announcements
- **When** microfrontend "widget-mfe" announces availability
- **Then** both A and B receive the notification

### TC-21-04: Subscriber receives both availability and unavailability events
- **Given** the library is initialized
- **And** a microfrontend subscribes to lifecycle announcements
- **When** microfrontend "mfe-x" announces availability
- **And** microfrontend "mfe-x" announces unavailability
- **Then** the subscriber is notified of both events

### TC-21-05: Notification includes identifier and status
- **Given** the library is initialized
- **And** a microfrontend subscribes to lifecycle announcements
- **When** microfrontend "mfe-y" announces availability
- **Then** the subscriber receives a notification including identifier "mfe-y" and status "available"
