# CrossTalk

A lightweight communication library for microfrontend architectures. CrossTalk enables event-driven communication, shared state management, and lifecycle coordination between microfrontends.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Runtime Model & Limitations](#runtime-model--limitations)
- [API Reference](#api-reference)
  - [Events](#events)
  - [Shared State](#shared-state)
  - [Lifecycle Management](#lifecycle-management)
  - [Version Management](#version-management)
  - [Namespacing](#namespacing)
  - [Utility Methods](#utility-methods)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install cross-talk
```

## Getting Started

### Using the Singleton Instance

The easiest way to use CrossTalk is through the provided singleton instance:

```typescript
import { crossTalk } from 'cross-talk';

// Publish an event
crossTalk.publish('user-login', { userId: '123' });

// Subscribe to events
const unsubscribe = crossTalk.subscribe('user-login', (data) => {
  console.log('User logged in:', data);
});
```

### Creating a Custom Instance

You can also create your own instance:

```typescript
import { CrossTalk } from 'cross-talk';

const myCrossTalk = new CrossTalk();
myCrossTalk.publish('custom-event', { data: 'value' });
```

## Runtime Model & Limitations

- **Same runtime only**: CrossTalk is an in-memory coordinator. It works when your microfrontends run in the **same JavaScript context** (same `window` / same `globalThis`). It does **not** communicate across different browser tabs, different windows, or different iframes that do not share the same global object.
- **Singleton behavior**: The exported `crossTalk` singleton is cached on `globalThis` under the key `__crossTalkSingleton__`, so multiple bundles importing `cross-talk` in the same runtime will share one instance.
- **ESM-first package**: This package is published as ESM (`"type": "module"`). Use `import` syntax.
- **Delivery semantics**: Event/state/lifecycle callbacks are delivered **synchronously** (see `getDeliveryMode()`), and callback errors are isolated in development mode (see [Error Handling](#error-handling)).

## API Reference

### Events

CrossTalk provides a pub/sub system for event-driven communication between microfrontends.

#### `publish(eventName: string, payload?: unknown): void`

Publishes an event with an optional payload to all subscribers.

**Parameters:**
- `eventName` (string, required): The name of the event to publish. Must be a non-empty string.
- `payload` (unknown, optional): Optional data payload to send with the event. Can be any type including `null` or `undefined`.

**Throws:**
- `Error`: If `eventName` is empty or contains only whitespace.

**Example:**
```typescript
// Publish an event with data
crossTalk.publish('user-login', { userId: '123', username: 'john' });

// Publish an event without payload
crossTalk.publish('session-cleared');

// Publish with null payload
crossTalk.publish('data-reset', null);
```

**Behavior:**
- If no subscribers exist for the event, the method returns silently (no error).
- All subscribers are notified synchronously.
- Errors in subscriber callbacks are isolated (logged in development mode but don't stop other subscribers from being notified).

---

#### `subscribe<T = unknown>(eventName: string, callback: EventCallback<T>): () => void`

Subscribes to a named event and receives its data payload when published.

**Parameters:**
- `eventName` (string, required): The name of the event to subscribe to. Must be a non-empty string.
- `callback` (function, required): Function to call when the event is published. Receives the payload as its argument.

**Returns:**
- `() => void`: An unsubscribe function. **IMPORTANT**: Call this function to prevent memory leaks.

**Throws:**
- `Error`: If `eventName` is empty or contains only whitespace.

**Example:**
```typescript
// Subscribe to an event
const unsubscribe = crossTalk.subscribe('user-login', (data) => {
  console.log('User logged in:', data);
  // TypeScript will infer the type if you provide a type parameter
});

// Subscribe with explicit typing
const unsubscribeTyped = crossTalk.subscribe<{ userId: string }>('user-login', (data) => {
  console.log('User ID:', data.userId);
});

// Multiple subscribers can listen to the same event
const unsubscribe1 = crossTalk.subscribe('theme-change', (theme) => {
  console.log('Subscriber 1:', theme);
});

const unsubscribe2 = crossTalk.subscribe('theme-change', (theme) => {
  console.log('Subscriber 2:', theme);
});

// Cleanup: Always unsubscribe when done
unsubscribe();
```

**Best Practice:**
Always store and call the unsubscribe function when your component unmounts or when you no longer need the subscription:

```typescript
class MyComponent {
  private unsubscribe?: () => void;

  componentDidMount() {
    this.unsubscribe = crossTalk.subscribe('data-updated', this.handleDataUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  handleDataUpdate = (data: unknown) => {
    // Handle the update
  };
}
```

---

#### `unsubscribe<T = unknown>(eventName: string, callback: EventCallback<T>): void`

Removes a previously registered event subscription.

**Parameters:**
- `eventName` (string, required): The name of the event to unsubscribe from.
- `callback` (function, required): The exact callback function that was used in `subscribe()`.

**Example:**
```typescript
const handler = (data: unknown) => {
  console.log('Received:', data);
};

// Subscribe
crossTalk.subscribe('my-event', handler);

// Later, unsubscribe using the same callback reference
crossTalk.unsubscribe('my-event', handler);
```

**Note:**
- This method handles non-existent subscriptions gracefully (no error thrown).
- You typically don't need to call this directly if you use the unsubscribe function returned by `subscribe()`.

---

### Shared State

CrossTalk provides a shared state management system that allows microfrontends to read, write, and subscribe to state changes.

#### `setState(key: string, value: unknown): void`

Sets a shared state value by key, overwriting any existing value.

**Parameters:**
- `key` (string, required): The state key. Must be a non-empty string.
- `value` (unknown, required): The value to store. Can be any type, including `null` or `undefined`.

**Throws:**
- `Error`: If `key` is empty or contains only whitespace.

**Example:**
```typescript
// Store a string value
crossTalk.setState('theme', 'dark');

// Store an object
crossTalk.setState('user', { 
  id: 1, 
  name: 'John Doe', 
  roles: ['admin', 'user'] 
});

// Store an array
crossTalk.setState('cart-items', [
  { id: 1, name: 'Product 1', price: 10 },
  { id: 2, name: 'Product 2', price: 20 }
]);

// Clear a value (set to null)
crossTalk.setState('session', null);

// Update existing state
crossTalk.setState('theme', 'light'); // Overwrites previous 'dark' value
```

**Behavior:**
- Setting state immediately notifies all subscribers to that key.
- Subscribers are called synchronously.
- Errors in subscriber callbacks are isolated (logged in development mode but don't stop other subscribers from being notified).

---

#### `getState<T = unknown>(key: string): T | undefined`

Reads a shared state value by key.

**Parameters:**
- `key` (string, required): The state key to read. Must be a non-empty string.

**Returns:**
- `T | undefined`: The value stored for the key, or `undefined` if not set.

**Throws:**
- `Error`: If `key` is empty or contains only whitespace.

**Example:**
```typescript
// Read state with type inference
const theme = crossTalk.getState<string>('theme');
console.log(theme); // 'dark' or undefined

// Read state with explicit typing
const user = crossTalk.getState<{ id: number; name: string }>('user');
if (user) {
  console.log('User ID:', user.id);
}

// Check if state exists
const cartItems = crossTalk.getState<Array<{ id: number }>>('cart-items');
if (cartItems && cartItems.length > 0) {
  console.log('Cart has items');
}
```

**Best Practice:**
Always check for `undefined` before using the returned value:

```typescript
const theme = crossTalk.getState<string>('theme');
if (theme !== undefined) {
  applyTheme(theme);
} else {
  applyDefaultTheme();
}
```

---

#### `subscribeState<T = unknown>(key: string, callback: StateCallback<T>): () => void`

Subscribes to changes for a specific shared state key.

**Parameters:**
- `key` (string, required): The state key to watch for changes. Must be a non-empty string.
- `callback` (function, required): Function to call when the state changes. Receives the new value as its argument.

**Returns:**
- `() => void`: An unsubscribe function. **IMPORTANT**: Call this function to prevent memory leaks.

**Throws:**
- `Error`: If `key` is empty or contains only whitespace.

**Behavior:**
- If the key already has a value when you subscribe, the callback is **immediately invoked** with the current value (late-load support).
- Subsequent changes to the state will trigger the callback again.

**Example:**
```typescript
// Subscribe to state changes
const unsubscribe = crossTalk.subscribeState('theme', (newTheme) => {
  console.log('Theme changed to:', newTheme);
  updateUITheme(newTheme);
});

// Subscribe with explicit typing
const unsubscribeUser = crossTalk.subscribeState<{ id: number; name: string }>(
  'user',
  (user) => {
    if (user) {
      console.log('User updated:', user.name);
    } else {
      console.log('User cleared');
    }
  }
);

// If state already exists, callback is called immediately
crossTalk.setState('theme', 'dark');
const unsubscribe2 = crossTalk.subscribeState('theme', (theme) => {
  console.log('Current theme:', theme); // Immediately logs 'dark'
});

// Cleanup
unsubscribe();
```

**Late-Load Pattern:**
This method supports the "late-load" pattern where subscribers can get the current state immediately:

```typescript
// Microfrontend A sets state early
crossTalk.setState('config', { apiUrl: 'https://api.example.com' });

// Microfrontend B loads later and subscribes
// It immediately receives the current config value
const unsubscribe = crossTalk.subscribeState('config', (config) => {
  initializeWithConfig(config); // Called immediately with current value
});
```

---

#### `unsubscribeState<T = unknown>(key: string, callback: StateCallback<T>): void`

Removes a previously registered shared state change subscription.

**Parameters:**
- `key` (string, required): The state key to unsubscribe from.
- `callback` (function, required): The exact callback function that was used in `subscribeState()`.

**Example:**
```typescript
const handler = (value: unknown) => {
  console.log('State changed:', value);
};

// Subscribe
crossTalk.subscribeState('theme', handler);

// Later, unsubscribe using the same callback reference
crossTalk.unsubscribeState('theme', handler);
```

**Note:**
- This method handles non-existent subscriptions gracefully (no error thrown).
- You typically don't need to call this directly if you use the unsubscribe function returned by `subscribeState()`.

---

### Lifecycle Management

CrossTalk provides lifecycle management to track when microfrontends become available or unavailable.

#### `announceAvailable(id: string, metadata?: Record<string, unknown>): void`

Announces that a microfrontend has become available.

**Parameters:**
- `id` (string, required): The unique identifier for the microfrontend. Must be a non-empty string.
- `metadata` (object, optional): Optional metadata about the microfrontend (e.g., version info, capabilities).

**Throws:**
- `Error`: If `id` is empty or contains only whitespace.

**Example:**
```typescript
// Announce availability without metadata
crossTalk.announceAvailable('header-mfe');

// Announce with metadata
crossTalk.announceAvailable('header-mfe', {
  version: '1.2.3',
  apiVersion: '2.0',
  capabilities: ['navigation', 'search']
});

// Multiple microfrontends can announce themselves
crossTalk.announceAvailable('header-mfe', { version: '1.0' });
crossTalk.announceAvailable('footer-mfe', { version: '2.0' });
crossTalk.announceAvailable('sidebar-mfe', { version: '1.5' });
```

**Use Case:**
Typically called when a microfrontend finishes loading:

```typescript
// In your microfrontend initialization
async function initializeMicrofrontend() {
  try {
    await loadDependencies();
    await setupRoutes();
    
    // Announce that we're ready
    crossTalk.announceAvailable('my-mfe', {
      version: '1.0.0',
      loadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}
```

---

#### `announceUnavailable(id: string): void`

Announces that a microfrontend has become unavailable.

**Parameters:**
- `id` (string, required): The unique identifier for the microfrontend. Must be a non-empty string.

**Throws:**
- `Error`: If `id` is empty or contains only whitespace.

**Example:**
```typescript
// Announce that a microfrontend is no longer available
crossTalk.announceUnavailable('header-mfe');
```

**Use Case:**
Typically called when a microfrontend is being unloaded or destroyed:

```typescript
// In your microfrontend cleanup
function cleanupMicrofrontend() {
  // Clean up resources
  removeEventListeners();
  clearTimers();
  
  // Announce that we're shutting down
  crossTalk.announceUnavailable('my-mfe');
}
```

**Note:**
- This method handles gracefully if the microfrontend was never registered (no error thrown).

---

#### `subscribeLifecycle(callback: (event: LifecycleEvent) => void, options?: { includeCurrentState?: boolean }): () => void`

Subscribes to lifecycle availability announcements from microfrontends.

**Parameters:**
- `callback` (function, required): Function to call when microfrontends become available/unavailable. Receives a `LifecycleEvent` object.
- `options` (object, optional): Optional configuration.
  - `includeCurrentState` (boolean, optional): If `true`, immediately invokes the callback for all currently available microfrontends.

**Returns:**
- `() => void`: An unsubscribe function. **IMPORTANT**: Call this function to prevent memory leaks.

**LifecycleEvent Type:**
```typescript
type LifecycleEvent = {
  id: string;                    // Microfrontend identifier
  status: 'available' | 'unavailable';
  metadata?: Record<string, unknown>;  // Optional metadata
};
```

**Example:**
```typescript
// Subscribe to future changes only
const unsubscribe = crossTalk.subscribeLifecycle((event) => {
  console.log(`${event.id} is now ${event.status}`);
  if (event.metadata) {
    console.log('Metadata:', event.metadata);
  }
});

// Subscribe and get current state immediately
const unsubscribeWithState = crossTalk.subscribeLifecycle(
  (event) => {
    console.log(`${event.id} is now ${event.status}`);
  },
  { includeCurrentState: true }
);

// Example: Wait for a specific microfrontend
const unsubscribeWait = crossTalk.subscribeLifecycle((event) => {
  if (event.id === 'header-mfe' && event.status === 'available') {
    console.log('Header microfrontend is ready!');
    initializeHeaderFeatures();
  }
});

// Cleanup
unsubscribe();
```

**Late-Load Pattern:**
Use `includeCurrentState: true` to support late-loading microfrontends:

```typescript
// Microfrontend A announces early
crossTalk.announceAvailable('header-mfe', { version: '1.0' });

// Microfrontend B loads later
crossTalk.subscribeLifecycle(
  (event) => {
    if (event.status === 'available') {
      console.log('Available:', event.id);
    }
  },
  { includeCurrentState: true } // Immediately receives 'header-mfe'
);
```

---

#### `unsubscribeLifecycle(callback: (event: LifecycleEvent) => void): void`

Removes a previously registered lifecycle subscription.

**Parameters:**
- `callback` (function, required): The exact callback function that was used in `subscribeLifecycle()`.

**Example:**
```typescript
const handler = (event: LifecycleEvent) => {
  console.log('Lifecycle event:', event);
};

// Subscribe
crossTalk.subscribeLifecycle(handler);

// Later, unsubscribe
crossTalk.unsubscribeLifecycle(handler);
```

**Note:**
- This method handles non-existent subscriptions gracefully (no error thrown).
- You typically don't need to call this directly if you use the unsubscribe function returned by `subscribeLifecycle()`.

---

#### `getAvailable(): string[]`

Queries which microfrontends are currently available.

**Returns:**
- `string[]`: Array of microfrontend identifiers that are currently available.

**Example:**
```typescript
// Get list of available microfrontends
const available = crossTalk.getAvailable();
console.log('Available:', available); 
// Output: ['header-mfe', 'footer-mfe', 'sidebar-mfe']

// Check if any microfrontends are available
if (crossTalk.getAvailable().length > 0) {
  console.log('Some microfrontends are loaded');
}

// Wait for a specific microfrontend
function waitForMicrofrontend(id: string) {
  if (crossTalk.getAvailable().includes(id)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    const unsubscribe = crossTalk.subscribeLifecycle((event) => {
      if (event.id === id && event.status === 'available') {
        unsubscribe();
        resolve();
      }
    });
  });
}

await waitForMicrofrontend('header-mfe');
```

---

#### `getAvailableWithMetadata(): Array<{ id: string; metadata: Record<string, unknown> }>`

Queries which microfrontends are currently available along with their metadata.

**Returns:**
- `Array<{ id: string; metadata: Record<string, unknown> }>`: Array of objects containing `id` and `metadata` for each available microfrontend.

**Example:**
```typescript
// Get available microfrontends with metadata
const available = crossTalk.getAvailableWithMetadata();
console.log(available);
// Output: [
//   { id: 'header-mfe', metadata: { version: '1.0' } },
//   { id: 'footer-mfe', metadata: { version: '2.0', apiVersion: '2.0' } }
// ]

// Filter by version
const v2Microfrontends = crossTalk
  .getAvailableWithMetadata()
  .filter(mfe => mfe.metadata?.apiVersion === '2.0');

// Find specific microfrontend metadata
const headerMetadata = crossTalk
  .getAvailableWithMetadata()
  .find(mfe => mfe.id === 'header-mfe')?.metadata;
```

---

#### `isAvailable(id: string): boolean`

Checks if a specific microfrontend is currently available.

**Parameters:**
- `id` (string, required): The microfrontend identifier to check.

**Returns:**
- `boolean`: `true` if the microfrontend is available, `false` otherwise.

**Example:**
```typescript
// Check if a microfrontend is available
if (crossTalk.isAvailable('header-mfe')) {
  console.log('Header is available');
  initializeHeaderFeatures();
} else {
  console.log('Header not yet loaded');
}

// Conditional rendering based on availability
function renderMicrofrontend() {
  if (crossTalk.isAvailable('sidebar-mfe')) {
    return <SidebarComponent />;
  }
  return <LoadingSpinner />;
}
```

---

### Version Management

CrossTalk provides version management to ensure compatibility between different versions of the library.

#### `getApiVersion(): string`

Gets the communication API version of the library.

**Returns:**
- `string`: The API version string in semantic versioning format (e.g., `"1.0.0"`).

**Example:**
```typescript
const version = crossTalk.getApiVersion();
console.log('CrossTalk API version:', version); // "1.0.0"

// Use for debugging or logging
console.log(`Using CrossTalk v${crossTalk.getApiVersion()}`);
```

---

#### `isVersionSupported(version: string): boolean`

Determines whether a specified API version is supported by this library.

**Parameters:**
- `version` (string, required): The version string to check (semantic versioning format).

**Returns:**
- `boolean`: `true` if the version is supported, `false` otherwise.

**Version Compatibility Rules:**
- **Exact version match**: Always returns `true`.
- **Pre-release versions (0.x)**: All `0.x` versions are considered compatible with each other.
- **Stable versions (1.x+)**: Same major version with minor version less than or equal to current minor is supported.
- **Invalid formats**: Returns `false`.

**Example:**
```typescript
// Check version compatibility
crossTalk.isVersionSupported('1.0.0'); // true (exact match)
crossTalk.isVersionSupported('0.2.0'); // true (0.x versions are compatible)
crossTalk.isVersionSupported('1.0.0'); // false (different major version)
crossTalk.isVersionSupported('invalid'); // false (invalid format)

// Use for version checking
function checkCompatibility(requiredVersion: string) {
  if (!crossTalk.isVersionSupported(requiredVersion)) {
    throw new Error(
      `Required version ${requiredVersion} is not supported. ` +
      `Current version: ${crossTalk.getApiVersion()}`
    );
  }
}

checkCompatibility('1.0.0'); // OK
```

---

### Namespacing

CrossTalk supports namespacing to isolate events and state between different parts of your application.

#### `scope(namespace: string): ICrossTalk`

Creates a namespaced instance that automatically prefixes all event and state keys.

**Parameters:**
- `namespace` (string, required): The namespace to use as a prefix. Must be a non-empty string.

**Returns:**
- `ICrossTalk`: A new scoped CrossTalk instance with all event and state methods namespaced.

**Important Notes:**
- Namespaced events and state are isolated from other namespaces.
- Lifecycle methods (`announceAvailable`, `subscribeLifecycle`, etc.) are **NOT** namespaced - they operate globally.
- Supports nested namespacing via `scope().scope()`.
- The `destroy()` method cannot be called on scoped instances (throws an error).

**Example:**
```typescript
// Create a namespaced instance
const headerScope = crossTalk.scope('header');

// These operations are automatically prefixed with 'header:'
headerScope.publish('menu-open', true);
// Actually publishes 'header:menu-open'

headerScope.setState('isExpanded', true);
// Actually sets state key 'header:isExpanded'

const unsubscribe = headerScope.subscribe('menu-open', (data) => {
  console.log('Header menu opened:', data);
});

// Nested namespacing
const navScope = headerScope.scope('nav');
// Creates namespace 'header:nav'

navScope.publish('item-clicked', { id: 1 });
// Actually publishes 'header:nav:item-clicked'

// Lifecycle methods are global (not namespaced)
headerScope.announceAvailable('header-mfe');
// Same as: crossTalk.announceAvailable('header-mfe')

// Scoped instances cannot be destroyed
headerScope.destroy(); // Throws Error
```

**Use Case:**
Use namespacing to prevent conflicts between different microfrontends or modules:

```typescript
// In header microfrontend
const headerScope = crossTalk.scope('header');
headerScope.publish('menu-toggle'); // 'header:menu-toggle'

// In footer microfrontend
const footerScope = crossTalk.scope('footer');
footerScope.publish('menu-toggle'); // 'footer:menu-toggle'

// No conflict! They're isolated
```

---

### Utility Methods

#### `getDeliveryMode(): DeliveryMode`

Gets the delivery semantics mode of the library.

**Returns:**
- `DeliveryMode`: Either `"sync"` for synchronous delivery or `"async"` for asynchronous delivery.

**Current Behavior:**
- Currently always returns `"sync"` (synchronous delivery).
- Synchronous delivery means callbacks complete before `publish()` or `setState()` returns.

**Example:**
```typescript
const mode = crossTalk.getDeliveryMode();
console.log('Delivery mode:', mode); // "sync"

if (crossTalk.getDeliveryMode() === 'sync') {
  console.log('Callbacks execute synchronously');
}
```

---

#### `destroy(): void`

Destroys the CrossTalk instance, clearing all state and subscribers.

**Important Notes:**
- Should **only** be called on the root instance, not on scoped instances.
- Useful for testing or complete teardown scenarios.
- After calling `destroy()`, the instance should not be used.
- Calling `destroy()` on a scoped instance throws an error.

**Example:**
```typescript
// Destroy the root instance
crossTalk.destroy(); // Clears everything

// In tests
describe('CrossTalk', () => {
  beforeEach(() => {
    crossTalk.destroy(); // Clean slate for each test
  });
  
  it('should work', () => {
    // Test code
  });
});

// Scoped instances cannot be destroyed
const scoped = crossTalk.scope('test');
scoped.destroy(); // Throws Error: "destroy() should only be called on the root CrossTalk instance"
```

---

## Best Practices

### 1. Always Unsubscribe

Always store and call unsubscribe functions to prevent memory leaks:

```typescript
class MyComponent {
  private unsubscribers: Array<() => void> = [];

  componentDidMount() {
    this.unsubscribers.push(
      crossTalk.subscribe('event', this.handleEvent),
      crossTalk.subscribeState('state', this.handleStateChange),
      crossTalk.subscribeLifecycle(this.handleLifecycle)
    );
  }

  componentWillUnmount() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}
```

### 2. Use TypeScript Types

Leverage TypeScript's type system for better type safety:

```typescript
interface User {
  id: number;
  name: string;
}

// Type-safe state operations
const nextUser: User = { id: 1, name: 'John' };
crossTalk.setState('user', nextUser);
const user = crossTalk.getState<User>('user');

// Type-safe event subscriptions
crossTalk.subscribe<User>('user-updated', (user) => {
  console.log(user.name); // TypeScript knows user has 'name' property
});
```

### 3. Use Namespaces for Isolation

Use namespaces to prevent conflicts between different parts of your application:

```typescript
// Each microfrontend uses its own namespace
const headerScope = crossTalk.scope('header');
const footerScope = crossTalk.scope('footer');
const sidebarScope = crossTalk.scope('sidebar');
```

### 4. Handle Undefined State

Always check for `undefined` when reading state:

```typescript
const theme = crossTalk.getState<string>('theme');
if (theme !== undefined) {
  applyTheme(theme);
} else {
  applyDefaultTheme();
}
```

### 5. Use Lifecycle Management

Announce availability when your microfrontend loads:

```typescript
async function initializeMicrofrontend() {
  try {
    await loadDependencies();
    crossTalk.announceAvailable('my-mfe', { version: '1.0.0' });
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

function cleanupMicrofrontend() {
  crossTalk.announceUnavailable('my-mfe');
}
```

### 6. Leverage Late-Load Support

Use `includeCurrentState: true` and immediate state delivery for late-loading scenarios:

```typescript
// Subscriber gets current state immediately if it exists
crossTalk.subscribeState('config', (config) => {
  // Called immediately if state exists, or when state changes
});

// Lifecycle subscriber gets current available microfrontends
crossTalk.subscribeLifecycle(
  (event) => { /* ... */ },
  { includeCurrentState: true }
);
```

---

## Error Handling

CrossTalk implements error isolation to ensure that errors in one subscriber don't affect others:

- **Event subscribers**: Errors in event callbacks are logged in development mode but don't prevent other subscribers from being notified.
- **State subscribers**: Errors in state change callbacks are logged in development mode but don't prevent other subscribers from being notified.
- **Lifecycle subscribers**: Errors in lifecycle callbacks are logged in development mode but don't prevent other subscribers from being notified.

**Development Mode Detection:**
- Checks `process.env.NODE_ENV !== 'production'` (Node.js)
- Checks `import.meta.env.MODE === 'development'` (Vite/Webpack)
- Defaults to production mode for safety

**Example:**
```typescript
// Even if this subscriber throws an error, other subscribers still get notified
crossTalk.subscribe('event', () => {
  throw new Error('Something went wrong');
});

crossTalk.subscribe('event', () => {
  console.log('This still gets called'); // ✅
});

crossTalk.publish('event', {}); // Both subscribers are called
```

---

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Contributing

- **Bug reports / features**: Open an issue with a minimal reproduction.
- **Pull requests**: Please include tests (Vitest) and keep the public API documented in `README.md`.

## License

MIT. See `LICENSE`.
