# Version Compatibility
The library MUST provide a way to determine whether a specified API version is supported.

## Implementation Requirement
- The library MUST be implemented in TypeScript (not JavaScript).

## Acceptance Criteria
- The library exposes a method to check if a version is supported.
- Supported and backward-compatible versions return `true`.
- Unsupported versions return `false`.
- Invalid version formats are handled gracefully.

## Test Cases

### TC-12-01: Current version is supported
- **Given** the library is initialized
- **And** the current API version is "1.0.0"
- **When** a microfrontend checks if version "1.0.0" is supported
- **Then** the result is `true`

### TC-12-02: Unsupported version returns false
- **Given** the library is initialized
- **And** the current API version is "1.0.0"
- **When** a microfrontend checks if version "99.0.0" is supported
- **Then** the result is `false`

### TC-12-03: Backward compatible version check
- **Given** the library is initialized
- **And** the current API version is "2.0.0"
- **And** version "1.0.0" is backward compatible
- **When** a microfrontend checks if version "1.0.0" is supported
- **Then** the result is `true`

### TC-12-04: Invalid version format handled
- **Given** the library is initialized
- **When** a microfrontend checks if version "invalid" is supported
- **Then** the result is `false` or an appropriate error is returned
