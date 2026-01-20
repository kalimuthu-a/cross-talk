import {
  DeliveryMode,
  EventCallback,
  LifecycleEvent,
  StateCallback,
  ICrossTalk
} from "./types";

// API version constant - update this when making breaking changes
const API_VERSION = "0.1.0";

// Declare process as a global variable to avoid TypeScript errors
declare const process: { env?: { NODE_ENV?: string } } | undefined;

// Helper to check if we're in development mode
const isDevelopment = (): boolean => {
  try {
    // Check if process.env exists (Node.js environment)
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
      return true;
    }
    // Check for browser development mode (Vite, Webpack, etc.)
    // @ts-ignore - import.meta may not be available in all environments
    if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'development') {
      return true;
    }
    // Default: assume production for safety
    return false;
  } catch {
    // In restricted environment, default to false (production)
    return false;
  }
};

// Shared state and lifecycle registry.
export class CrossTalk implements ICrossTalk {
  private readonly eventSubscribers = new Map<string, Set<EventCallback>>();
  private readonly sharedState = new Map<string, unknown>();
  private readonly stateSubscribers = new Map<string, Set<StateCallback>>();
  private readonly availableMicrofrontends = new Map<string, Record<string, unknown>>();
  private readonly lifecycleSubscribers = new Set<(event: LifecycleEvent) => void>();

  /**
   * Validates that a string is non-empty and contains more than just whitespace
   * @param value - The string to validate
   * @param fieldName - The name of the field (for error messages)
   * @throws {Error} If the value is empty or contains only whitespace
   */
  private validateNonEmptyString(value: string, fieldName: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error(`${fieldName} must be a non-empty string.`);
    }
  }

  /**
   * Publishes an event with an optional payload to all subscribers
   * @param eventName - The name of the event to publish (non-empty string)
   * @param payload - Optional data payload to send with the event
   * @throws {Error} If eventName is empty or whitespace-only
   * @example
   * ```typescript
   * crossTalk.publish('user-login', { userId: '123' });
   * crossTalk.publish('session-cleared', null);
   * ```
   */
  publish(eventName: string, payload?: unknown): void {
    this.validateNonEmptyString(eventName, "Event name");

    const subscribers = this.eventSubscribers.get(eventName);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    for (const callback of subscribers) {
      try {
        callback(payload);
      } catch (error) {
        // Error isolation: log in development but continue notifying other subscribers
        if (isDevelopment()) {
          console.error(`[CrossTalk] Error in event subscriber for "${eventName}":`, error);
        }
      }
    }
  }

  /**
   * Subscribes to a named event and receives its data payload when published
   * @param eventName - The name of the event to subscribe to (non-empty string)
   * @param callback - Function to call when the event is published
   * @returns Unsubscribe function. IMPORTANT: Call this to prevent memory leaks
   * @throws {Error} If eventName is empty or whitespace-only
   * @example
   * ```typescript
   * const unsubscribe = crossTalk.subscribe('user-login', (data) => {
   *   console.log('User logged in:', data);
   * });
   * // Later, to cleanup:
   * unsubscribe();
   * ```
   */
  subscribe<T = unknown>(eventName: string, callback: EventCallback<T>): () => void {
    this.validateNonEmptyString(eventName, "Event name");

    const subscribers = this.eventSubscribers.get(eventName) ?? new Set();
    subscribers.add(callback as EventCallback);
    this.eventSubscribers.set(eventName, subscribers);

    return () => {
      this.unsubscribe(eventName, callback);
    };
  }

  /**
   * Removes a previously registered event subscription
   * @param eventName - The name of the event to unsubscribe from
   * @param callback - The callback function to remove
   * @remarks Handles non-existent subscriptions gracefully (no error thrown)
   */
  unsubscribe<T = unknown>(eventName: string, callback: EventCallback<T>): void {
    const subscribers = this.eventSubscribers.get(eventName);
    if (!subscribers) {
      return;
    }

    subscribers.delete(callback as EventCallback);
    if (subscribers.size === 0) {
      this.eventSubscribers.delete(eventName);
    }
  }

  /**
   * Sets a shared state value by key, overwriting any existing value
   * @param key - The state key (non-empty string)
   * @param value - The value to store (can be any type, including null)
   * @throws {Error} If key is empty or whitespace-only
   * @example
   * ```typescript
   * crossTalk.setState('theme', 'dark');
   * crossTalk.setState('user', { id: 1, roles: ['admin'] });
   * crossTalk.setState('session', null); // Clear session
   * ```
   */
  setState(key: string, value: unknown): void {
    this.validateNonEmptyString(key, "State key");

    this.sharedState.set(key, value);

    const subscribers = this.stateSubscribers.get(key);
    if (subscribers) {
      for (const callback of subscribers) {
        try {
          callback(value);
        } catch (error) {
          // Error isolation: log in development but continue notifying other subscribers
          if (isDevelopment()) {
            console.error(`[CrossTalk] Error in state subscriber for key "${key}":`, error);
          }
        }
      }
    }
  }

  /**
   * Reads a shared state value by key
   * @param key - The state key to read (non-empty string)
   * @returns The value stored for the key, or undefined if not set
   * @throws {Error} If key is empty or whitespace-only
   * @example
   * ```typescript
   * const theme = crossTalk.getState<string>('theme');
   * const user = crossTalk.getState<{ id: number }>('user');
   * ```
   */
  getState<T = unknown>(key: string): T | undefined {
    this.validateNonEmptyString(key, "State key");

    return this.sharedState.get(key) as T | undefined;
  }

  /**
   * Subscribes to changes for a specific shared state key
   * @param key - The state key to watch for changes (non-empty string)
   * @param callback - Function to call when the state changes
   * @returns Unsubscribe function. IMPORTANT: Call this to prevent memory leaks
   * @throws {Error} If key is empty or whitespace-only
   * @remarks If the key already has a value, callback is immediately invoked with current value
   * @example
   * ```typescript
   * const unsubscribe = crossTalk.subscribeState('theme', (newTheme) => {
   *   console.log('Theme changed to:', newTheme);
   * });
   * // Later, to cleanup:
   * unsubscribe();
   * ```
   */
  subscribeState<T = unknown>(key: string, callback: StateCallback<T>): () => void {
    this.validateNonEmptyString(key, "State key");

    const subscribers = this.stateSubscribers.get(key) ?? new Set();
    subscribers.add(callback as StateCallback);
    this.stateSubscribers.set(key, subscribers);

    // Immediately deliver current value if it exists (Requirement TC-07-05)
    if (this.sharedState.has(key)) {
      try {
        callback(this.sharedState.get(key) as T);
      } catch (error) {
        // Error isolation: log in development
        if (isDevelopment()) {
          console.error(`[CrossTalk] Error in initial state delivery for key "${key}":`, error);
        }
      }
    }

    return () => {
      this.unsubscribeState(key, callback);
    };
  }

  /**
   * Removes a previously registered shared state change subscription
   * @param key - The state key to unsubscribe from
   * @param callback - The callback function to remove
   * @remarks Handles non-existent subscriptions gracefully (no error thrown)
   */
  unsubscribeState<T = unknown>(key: string, callback: StateCallback<T>): void {
    const subscribers = this.stateSubscribers.get(key);
    if (!subscribers) {
      return;
    }

    subscribers.delete(callback as StateCallback);
    if (subscribers.size === 0) {
      this.stateSubscribers.delete(key);
    }
  }

  /**
   * Announces that a microfrontend has become available
   * @param id - The unique identifier for the microfrontend (non-empty string)
   * @param metadata - Optional metadata about the microfrontend (e.g., version info)
   * @throws {Error} If id is empty or whitespace-only
   * @example
   * ```typescript
   * crossTalk.announceAvailable('header-mfe', { version: '1.0' });
   * ```
   */
  announceAvailable(id: string, metadata?: Record<string, unknown>): void {
    this.validateNonEmptyString(id, "Microfrontend identifier");

    this.availableMicrofrontends.set(id, metadata ?? {});
    this.notifyLifecycle({ id, status: "available", metadata });
  }

  /**
   * Announces that a microfrontend has become unavailable
   * @param id - The unique identifier for the microfrontend (non-empty string)
   * @throws {Error} If id is empty or whitespace-only
   * @remarks Handles gracefully if the microfrontend was never registered (no error)
   * @example
   * ```typescript
   * crossTalk.announceUnavailable('header-mfe');
   * ```
   */
  announceUnavailable(id: string): void {
    this.validateNonEmptyString(id, "Microfrontend identifier");

    if (this.availableMicrofrontends.has(id)) {
      this.availableMicrofrontends.delete(id);
      this.notifyLifecycle({ id, status: "unavailable" });
    }
  }

  private notifyLifecycle(event: LifecycleEvent): void {
    for (const callback of this.lifecycleSubscribers) {
      try {
        callback(event);
      } catch (error) {
        // Error isolation: log in development but continue notifying other subscribers
        if (isDevelopment()) {
          console.error(`[CrossTalk] Error in lifecycle subscriber for "${event.id}" (${event.status}):`, error);
        }
      }
    }
  }

  /**
   * Subscribes to lifecycle availability announcements from microfrontends
   * @param callback - Function to call when microfrontends become available/unavailable
   * @param options - Optional configuration
   * @param options.includeCurrentState - If true, immediately invokes callback for all currently available MFEs
   * @returns Unsubscribe function. IMPORTANT: Call this to prevent memory leaks
   * @example
   * ```typescript
   * // Subscribe to future changes only
   * const unsubscribe = crossTalk.subscribeLifecycle((event) => {
   *   console.log(`${event.id} is now ${event.status}`);
   * });
   * 
   * // Subscribe and get current state immediately
   * const unsubscribe2 = crossTalk.subscribeLifecycle((event) => {
   *   console.log(`${event.id} is now ${event.status}`);
   * }, { includeCurrentState: true });
   * 
   * // Later, to cleanup:
   * unsubscribe();
   * ```
   */
  subscribeLifecycle(
    callback: (event: LifecycleEvent) => void,
    options?: { includeCurrentState?: boolean }
  ): () => void {
    this.lifecycleSubscribers.add(callback);

    // Optionally deliver current state of all available microfrontends
    if (options?.includeCurrentState) {
      for (const [id, metadata] of this.availableMicrofrontends.entries()) {
        try {
          callback({ id, status: "available", metadata });
        } catch (error) {
          // Error isolation: log in development
          if (isDevelopment()) {
            console.error(`[CrossTalk] Error in lifecycle subscriber for "${id}" (available):`, error);
          }
        }
      }
    }

    return () => {
      this.unsubscribeLifecycle(callback);
    };
  }

  /**
   * Removes a previously registered lifecycle subscription
   * @param callback - The callback function to remove
   * @remarks Handles non-existent subscriptions gracefully (no error thrown)
   */
  unsubscribeLifecycle(callback: (event: LifecycleEvent) => void): void {
    this.lifecycleSubscribers.delete(callback);
  }

  /**
   * Queries which microfrontends are currently available
   * @returns Array of microfrontend identifiers
   * @example
   * ```typescript
   * const available = crossTalk.getAvailable();
   * console.log('Available:', available); // ['header-mfe', 'footer-mfe']
   * ```
   */
  getAvailable(): string[] {
    return Array.from(this.availableMicrofrontends.keys());
  }

  /**
   * Queries which microfrontends are currently available along with their metadata
   * @returns Array of objects containing id and metadata for each available microfrontend
   * @example
   * ```typescript
   * const available = crossTalk.getAvailableWithMetadata();
   * console.log(available); // [{ id: 'header-mfe', metadata: { version: '1.0' } }]
   * ```
   */
  getAvailableWithMetadata(): Array<{ id: string; metadata: Record<string, unknown> }> {
    return Array.from(this.availableMicrofrontends.entries()).map(
      ([id, metadata]) => ({ id, metadata })
    );
  }

  /**
   * Checks if a specific microfrontend is currently available
   * @param id - The microfrontend identifier to check
   * @returns true if the microfrontend is available, false otherwise
   * @example
   * ```typescript
   * if (crossTalk.isAvailable('header-mfe')) {
   *   console.log('Header is available');
   * }
   * ```
   */
  isAvailable(id: string): boolean {
    return this.availableMicrofrontends.has(id);
  }

  /**
   * Gets the communication API version of the library
   * @returns The API version string (semantic versioning format)
   * @example
   * ```typescript
   * const version = crossTalk.getApiVersion(); // "0.1.0"
   * ```
   */
  getApiVersion(): string {
    return API_VERSION;
  }

  /**
   * Determines whether a specified API version is supported by this library
   * @param version - The version string to check (semantic versioning format)
   * @returns true if the version is supported, false otherwise
   * @remarks
   * - Exact version match always returns true
   * - For 0.x versions (pre-release): All 0.x versions are considered compatible
   * - For 1.x and above: Same major version with minor <= current minor is supported
   * - Invalid version formats return false
   * @example
   * ```typescript
   * crossTalk.isVersionSupported('0.1.0'); // true
   * crossTalk.isVersionSupported('99.0.0'); // false
   * crossTalk.isVersionSupported('invalid'); // false
   * ```
   */
  isVersionSupported(version: string): boolean {
    if (!version) return false;
    
    // Validate semantic version format (major.minor.patch with optional pre-release)
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(-[\w.]+)?$/;
    const match = version.match(semverRegex);
    if (!match) return false; // Invalid format
    
    const [, major, minor, patch] = match;
    const currentVersion = API_VERSION;
    const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(v => v.split('-')[0]);
    
    // Exact version match
    if (version === currentVersion) return true;
    
    // For 0.x versions (pre-1.0), consider all 0.x versions as compatible
    // This is intentionally permissive during the pre-release development phase
    // TODO: Before 1.0 release, consider implementing stricter 0.x compatibility rules
    if (major === "0" && currentMajor === "0") {
      return true;
    }
    
    // For 1.x and above: support backward compatible versions (same major, minor <= current)
    if (major === currentMajor) {
      const minorNum = parseInt(minor, 10);
      const currentMinorNum = parseInt(currentMinor, 10);
      return minorNum <= currentMinorNum;
    }
    
    return false;
  }

  /**
   * Gets the delivery semantics mode of the library
   * @returns "sync" for synchronous delivery or "async" for asynchronous delivery
   * @remarks
   * - Synchronous: Callbacks complete before publish/setState returns
   * - Asynchronous: publish/setState may return before callbacks complete
   * @example
   * ```typescript
   * const mode = crossTalk.getDeliveryMode(); // "sync"
   * ```
   */
  getDeliveryMode(): DeliveryMode {
    return "sync";
  }

  /**
   * Destroys the CrossTalk instance, clearing all state and subscribers
   * @remarks
   * - Should only be called on the root instance, not on scoped instances
   * - Useful for testing or complete teardown scenarios
   * - After calling destroy(), the instance should not be used
   * @example
   * ```typescript
   * crossTalk.destroy(); // Clear everything
   * ```
   */
  destroy(): void {
    // Clear all subscribers and state
    this.eventSubscribers.clear();
    this.stateSubscribers.clear();
    this.sharedState.clear();
    this.availableMicrofrontends.clear();
    this.lifecycleSubscribers.clear();
  }

  /**
   * Creates a namespaced instance that automatically prefixes all event and state keys
   * @param namespace - The namespace to use as a prefix (non-empty string)
   * @returns A new scoped CrossTalk instance
   * @throws {Error} If namespace is empty or whitespace-only
   * @remarks
   * - Namespaced events and state are isolated from other namespaces
   * - Lifecycle methods are NOT namespaced (they operate globally)
   * - Supports nested namespacing via scope().scope()
   * @example
   * ```typescript
   * const headerScope = crossTalk.scope('header');
   * headerScope.publish('menu-open', true); // Actually publishes 'header:menu-open'
   * 
   * // Nested namespacing
   * const subScope = headerScope.scope('nav'); // Creates 'header:nav' namespace
   * ```
   */
  scope(namespace: string): ICrossTalk {
    this.validateNonEmptyString(namespace, "Namespace");

    return {
      publish: (eventName, payload) => {
        this.validateNonEmptyString(eventName, "Event name");
        return this.publish(`${namespace}:${eventName}`, payload);
      },
      subscribe: (eventName, callback) => {
        this.validateNonEmptyString(eventName, "Event name");
        return this.subscribe(`${namespace}:${eventName}`, callback);
      },
      unsubscribe: (eventName, callback) => {
        this.validateNonEmptyString(eventName, "Event name");
        return this.unsubscribe(`${namespace}:${eventName}`, callback);
      },
      setState: (key, value) => {
        this.validateNonEmptyString(key, "State key");
        return this.setState(`${namespace}:${key}`, value);
      },
      getState: (key) => {
        this.validateNonEmptyString(key, "State key");
        return this.getState(`${namespace}:${key}`);
      },
      subscribeState: (key, callback) => {
        this.validateNonEmptyString(key, "State key");
        return this.subscribeState(`${namespace}:${key}`, callback);
      },
      unsubscribeState: (key, callback) => {
        this.validateNonEmptyString(key, "State key");
        return this.unsubscribeState(`${namespace}:${key}`, callback);
      },
      announceAvailable: (id, metadata) => this.announceAvailable(id, metadata),
      announceUnavailable: (id) => this.announceUnavailable(id),
      getAvailable: () => this.getAvailable(),
      getAvailableWithMetadata: () => this.getAvailableWithMetadata(),
      isAvailable: (id) => this.isAvailable(id),
      getApiVersion: () => this.getApiVersion(),
      isVersionSupported: (v) => this.isVersionSupported(v),
      getDeliveryMode: () => this.getDeliveryMode(),
      scope: (innerNamespace) => {
        this.validateNonEmptyString(innerNamespace, "Namespace");
        return this.scope(`${namespace}:${innerNamespace}`);
      },
      subscribeLifecycle: (callback, options) => this.subscribeLifecycle(callback, options),
      unsubscribeLifecycle: (callback) => this.unsubscribeLifecycle(callback),
      destroy: () => {
        throw new Error("destroy() should only be called on the root CrossTalk instance, not on scoped instances.");
      },
    };
  }
}
