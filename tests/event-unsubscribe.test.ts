import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Unsubscribe Events", () => {
  it("TC-03-01: Unsubscribed callback not invoked", () => {
    const bus = new CrossTalk();
    const handler = vi.fn();

    bus.subscribe("user-login", handler);
    bus.unsubscribe("user-login", handler);

    bus.publish("user-login", { userId: "123" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("TC-03-02: Other subscribers remain active after one unsubscribes", () => {
    const bus = new CrossTalk();
    const first = vi.fn();
    const second = vi.fn();

    bus.subscribe("notification", first);
    bus.subscribe("notification", second);
    bus.unsubscribe("notification", first);

    bus.publish("notification", "new-message");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith("new-message");
  });

  it("TC-03-03: Unsubscribe returns without error for valid subscription", () => {
    const bus = new CrossTalk();
    const handler = vi.fn();

    bus.subscribe("test-event", handler);

    expect(() => bus.unsubscribe("test-event", handler)).not.toThrow();
  });

  it("TC-03-04: Unsubscribe handles non-existent subscription gracefully", () => {
    const bus = new CrossTalk();
    const handler = vi.fn();

    expect(() => bus.unsubscribe("missing-event", handler)).not.toThrow();
  });
});
