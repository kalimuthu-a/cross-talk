import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Event Subscriber Error Isolation", () => {
  it("TC-10-01: Error in one subscriber does not block others", () => {
    const bus = new CrossTalk();
    const subscriberA = vi.fn(() => {
      throw new Error("Subscriber A error");
    });
    const subscriberB = vi.fn();

    bus.subscribe("update", subscriberA);
    bus.subscribe("update", subscriberB);
    bus.publish("update", "test-payload");

    expect(subscriberB).toHaveBeenCalledWith("test-payload");
  });

  it("TC-10-02: All non-throwing subscribers receive event", () => {
    const bus = new CrossTalk();
    const subscriberA = vi.fn(() => {
      throw new Error("Subscriber A error");
    });
    const subscriberB = vi.fn();
    const subscriberC = vi.fn();

    bus.subscribe("broadcast", subscriberA);
    bus.subscribe("broadcast", subscriberB);
    bus.subscribe("broadcast", subscriberC);
    bus.publish("broadcast", "test-data");

    expect(subscriberB).toHaveBeenCalledWith("test-data");
    expect(subscriberC).toHaveBeenCalledWith("test-data");
  });

  it("TC-10-03: Error does not crash the library", () => {
    const bus = new CrossTalk();
    const subscriber = vi.fn(() => {
      throw new Error("Uncaught exception");
    });

    bus.subscribe("test-event", subscriber);
    bus.publish("test-event", "payload");

    // Verify library is still functional
    expect(() => {
      bus.publish("another-event", "payload");
      bus.subscribe("new-event", () => {});
      bus.getState("test-key");
    }).not.toThrow();
  });

  it("TC-10-04: Subsequent events still delivered after error", () => {
    const bus = new CrossTalk();
    const subscriberA = vi.fn((payload: string) => {
      if (payload === "first") {
        throw new Error("Error on first event");
      }
    });

    bus.subscribe("test", subscriberA);
    bus.publish("test", "first");
    bus.publish("test", "second");

    // Subscriber A should have been called twice (once for "first" that threw, once for "second")
    expect(subscriberA).toHaveBeenCalledTimes(2);
    expect(subscriberA).toHaveBeenCalledWith("first");
    expect(subscriberA).toHaveBeenCalledWith("second");
  });
});
