export type EventCallback<T = unknown> = (payload: T) => void;
export type StateCallback<T = unknown> = (value: T) => void;

export type LifecycleStatus = "available" | "unavailable";

export type LifecycleEvent = {
  id: string;
  status: LifecycleStatus;
  metadata?: Record<string, unknown>;
};

export type DeliveryMode = "sync" | "async";

export interface ICrossTalk {
  publish(eventName: string, payload?: unknown): void;
  subscribe<T = unknown>(eventName: string, callback: EventCallback<T>): () => void;
  unsubscribe<T = unknown>(eventName: string, callback: EventCallback<T>): void;
  setState(key: string, value: unknown): void;
  getState<T = unknown>(key: string): T | undefined;
  subscribeState<T = unknown>(key: string, callback: StateCallback<T>): () => void;
  unsubscribeState<T = unknown>(key: string, callback: StateCallback<T>): void;
  announceAvailable(id: string, metadata?: Record<string, unknown>): void;
  announceUnavailable(id: string): void;
  getAvailable(): string[];
  getAvailableWithMetadata(): Array<{ id: string; metadata: Record<string, unknown> }>;
  isAvailable(id: string): boolean;
  getApiVersion(): string;
  isVersionSupported(version: string): boolean;
  getDeliveryMode(): DeliveryMode;
  scope(namespace: string): ICrossTalk;
  subscribeLifecycle(
    callback: (event: LifecycleEvent) => void,
    options?: { includeCurrentState?: boolean }
  ): () => void;
  unsubscribeLifecycle(callback: (event: LifecycleEvent) => void): void;
  destroy(): void;
}
