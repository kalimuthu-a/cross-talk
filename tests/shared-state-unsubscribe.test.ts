import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Shared State Unsubscribe", () => {
  it("TC-18-01: Unsubscribed callback not invoked on state change", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    const unsubscribe = bus.subscribeState("theme", callback);
    unsubscribe();
    bus.setState("theme", "dark");

    expect(callback).not.toHaveBeenCalled();
  });

  it("TC-18-02: Other subscribers remain active after one unsubscribes", () => {
    const bus = new CrossTalk();
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    const unsubscribeA = bus.subscribeState("config", callbackA);
    bus.subscribeState("config", callbackB);

    unsubscribeA();
    bus.setState("config", { debug: true });

    expect(callbackA).not.toHaveBeenCalled();
    expect(callbackB).toHaveBeenCalledWith({ debug: true });
  });

  it("TC-18-03: Unsubscribe returns without error", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    const unsubscribe = bus.subscribeState("data", callback);

    expect(() => {
      unsubscribe();
    }).not.toThrow();
  });

  it("TC-18-04: Unsubscribe handles non-existent subscription gracefully", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    // Try to unsubscribe from a key we never subscribed to
    expect(() => {
      bus.unsubscribeState("never-subscribed", callback);
    }).not.toThrow();
  });

  it("TC-18-05: Unsubscribe using unsubscribeState method directly", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeState("test", callback);
    bus.unsubscribeState("test", callback);
    bus.setState("test", "value");

    expect(callback).not.toHaveBeenCalled();
  });
});
