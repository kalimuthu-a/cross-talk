import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Lifecycle Unsubscribe", () => {
  it("TC-22-01: Unsubscribed callback not invoked on lifecycle change", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    const unsubscribe = bus.subscribeLifecycle(callback);
    unsubscribe();
    bus.announceAvailable("new-mfe");

    expect(callback).not.toHaveBeenCalled();
  });

  it("TC-22-02: Other lifecycle subscribers remain active", () => {
    const bus = new CrossTalk();
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    const unsubscribeA = bus.subscribeLifecycle(callbackA);
    bus.subscribeLifecycle(callbackB);

    unsubscribeA();
    bus.announceAvailable("new-mfe");

    expect(callbackA).not.toHaveBeenCalled();
    expect(callbackB).toHaveBeenCalledWith({
      id: "new-mfe",
      status: "available",
      metadata: undefined,
    });
  });

  it("TC-22-03: Unsubscribe returns without error", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    const unsubscribe = bus.subscribeLifecycle(callback);

    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("TC-22-04: Unsubscribe handles non-existent subscription gracefully", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    // Try to unsubscribe from a callback that was never subscribed
    expect(() => {
      bus.unsubscribeLifecycle(callback);
    }).not.toThrow();
  });

  it("TC-22-05: Unsubscribe using unsubscribeLifecycle method directly", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeLifecycle(callback);
    bus.unsubscribeLifecycle(callback);
    bus.announceAvailable("test-mfe");

    expect(callback).not.toHaveBeenCalled();
  });
});
