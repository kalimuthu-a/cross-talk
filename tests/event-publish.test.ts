import { describe, expect, it } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Publish Events", () => {
  it("TC-01-01: Publish event with string payload", () => {
    const bus = new CrossTalk();
    let received: unknown;

    bus.subscribe("user-login", (payload) => {
      received = payload;
    });

    expect(() => bus.publish("user-login", "user123")).not.toThrow();
    expect(received).toBe("user123");
  });

  it("TC-01-02: Publish event with object payload", () => {
    const bus = new CrossTalk();
    let received: unknown;
    const payload = { itemCount: 5, total: 99.99 };

    bus.subscribe("cart-updated", (data) => {
      received = data;
    });

    expect(() => bus.publish("cart-updated", payload)).not.toThrow();
    expect(received).toEqual(payload);
  });

  it("TC-01-03: Publish event with null payload", () => {
    const bus = new CrossTalk();
    let received: unknown = "unset";

    bus.subscribe("session-cleared", (payload) => {
      received = payload;
    });

    expect(() => bus.publish("session-cleared", null)).not.toThrow();
    expect(received).toBeNull();
  });

  it("TC-01-04: Publish event with empty name rejected", () => {
    const bus = new CrossTalk();

    expect(() => bus.publish("", "data")).toThrow();
    expect(() => bus.publish("   ", "data")).toThrow();
  });
});
