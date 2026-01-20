# State Key Namespacing
The library MUST allow a microfrontend to scope its shared state keys to avoid collisions with other microfrontends.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- Microfrontends can namespace shared state keys.
- Namespaced keys are isolated from other namespaces.
- Subscriptions respect namespace scoping.
- Namespaced and global keys can coexist.

## Test Cases

### TC-17-01: Namespaced state keys are isolated
- **Given** the library is initialized
- **And** microfrontend A sets state "mfe-a:user" to `{ name: "Alice" }`
- **And** microfrontend B sets state "mfe-b:user" to `{ name: "Bob" }`
- **When** microfrontend A reads state "mfe-a:user"
- **Then** the value is `{ name: "Alice" }`

### TC-17-02: Same key name in different namespaces are distinct
- **Given** the library is initialized
- **And** state "cart:total" is set to `100`
- **And** state "order:total" is set to `250`
- **When** state "cart:total" is read
- **Then** the value is `100`

### TC-17-03: Namespace prefix applied to subscriptions
- **Given** the library is initialized
- **And** a microfrontend subscribes to state changes for "header:visible"
- **When** state "footer:visible" is updated
- **Then** the subscriber is not notified

### TC-17-04: Namespaced and global keys coexist
- **Given** the library is initialized
- **And** state "global-theme" is set to "dark"
- **And** state "mfe-a:theme" is set to "light"
- **When** both keys are read
- **Then** "global-theme" returns "dark" and "mfe-a:theme" returns "light"
