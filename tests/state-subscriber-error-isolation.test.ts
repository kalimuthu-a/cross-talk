import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("State Change Subscriber Error Isolation", () => {
  it("TC-16-01: Error in one state subscriber does not block others", () => {
    const bus = new CrossTalk();
    const subscriberA = vi.fn(() => {
      throw new Error("Subscriber A error");
    });
    const subscriberB = vi.fn();

    bus.subscribeState("config", subscriberA);
    bus.subscribeState("config", subscriberB);
    bus.setState("config", { debug: true });

    expect(subscriberB).toHaveBeenCalledWith({ debug: true });
  });

  it("TC-16-02: All non-throwing state subscribers receive update", () => {
    const bus = new CrossTalk();
    const subscriberA = vi.fn(() => {
      throw new Error("Subscriber A error");
    });
    const subscriberB = vi.fn();
    const subscriberC = vi.fn();

    bus.subscribeState("settings", subscriberA);
    bus.subscribeState("settings", subscriberB);
    bus.subscribeState("settings", subscriberC);
    bus.setState("settings", { theme: "dark" });

    expect(subscriberB).toHaveBeenCalledWith({ theme: "dark" });
    expect(subscriberC).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("TC-16-03: Error does not corrupt state", () => {
    const bus = new CrossTalk();
    const subscriber = vi.fn(() => {
      throw new Error("Error when notified");
    });

    bus.subscribeState("data", subscriber);
    bus.setState("data", { value: 100 });

    const result = bus.getState<{ value: number }>("data");
    expect(result).toEqual({ value: 100 });
  });

  it("TC-16-04: Library remains functional after subscriber error", () => {
    const bus = new CrossTalk();
    const subscriberA = vi.fn(() => {
      throw new Error("Error on first update");
    });
    const subscriberB = vi.fn();

    bus.subscribeState("test", subscriberA);
    bus.subscribeState("test", subscriberB);

    // First update triggers error
    bus.setState("test", "first-value");

    // Subsequent update should still work
    bus.setState("test", "second-value");

    expect(subscriberB).toHaveBeenCalledTimes(2);
    expect(subscriberB).toHaveBeenCalledWith("first-value");
    expect(subscriberB).toHaveBeenCalledWith("second-value");
  });
});
