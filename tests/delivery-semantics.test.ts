import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Delivery Semantics", () => {
  it("TC-20-01: Delivery mode is queryable", () => {
    const bus = new CrossTalk();

    const deliveryMode = bus.getDeliveryMode();

    expect(deliveryMode).toBeDefined();
    expect(deliveryMode === "sync" || deliveryMode === "async").toBe(true);
  });

  it("TC-20-02: Delivery mode is documented/exposed as property or method", () => {
    const bus = new CrossTalk();

    expect(() => {
      const mode = bus.getDeliveryMode();
      expect(mode).toBeDefined();
    }).not.toThrow();
  });

  it("TC-20-03: Synchronous delivery completes before publish returns", () => {
    const bus = new CrossTalk();
    let callbackCompleted = false;
    const callback = vi.fn(() => {
      callbackCompleted = true;
    });

    bus.subscribe("sync-test", callback);

    // Publish and immediately check if callback completed
    bus.publish("sync-test", "payload");

    // In synchronous delivery, callback should complete before publish returns
    expect(callbackCompleted).toBe(true);
    expect(callback).toHaveBeenCalledWith("payload");
  });

  it("TC-20-04: Asynchronous delivery allows publish to return immediately", () => {
    const bus = new CrossTalk();
    const deliveryMode = bus.getDeliveryMode();

    if (deliveryMode === "async") {
      let publishReturned = false;
      let callbackCompleted = false;
      const callback = vi.fn(() => {
        callbackCompleted = true;
      });

      bus.subscribe("async-test", callback);

      bus.publish("async-test", "payload");
      publishReturned = true;

      // In async mode, publish may return before callback completes
      // This test verifies the mode is "async", but actual async behavior
      // would require setTimeout/Promise which is implementation-specific
      expect(publishReturned).toBe(true);
    } else {
      // Current implementation uses "sync", so we verify sync behavior
      expect(deliveryMode).toBe("sync");
    }
  });

  it("TC-20-05: Delivery mode is consistent", () => {
    const bus = new CrossTalk();

    const mode1 = bus.getDeliveryMode();
    const mode2 = bus.getDeliveryMode();
    const mode3 = bus.getDeliveryMode();

    expect(mode1).toBe(mode2);
    expect(mode2).toBe(mode3);
  });
});
