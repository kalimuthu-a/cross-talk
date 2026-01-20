import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Shared State Subscribe", () => {
  it("TC-07-01: Subscriber notified on state change", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeState("theme", callback);
    bus.setState("theme", "light");

    expect(callback).toHaveBeenCalledWith("light");
  });

  it("TC-07-02: Subscriber receives updated value", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.setState("count", 1);
    bus.subscribeState("count", callback);
    bus.setState("count", 2);

    expect(callback).toHaveBeenCalledTimes(2); // Once for immediate delivery, once for update
    expect(callback).toHaveBeenLastCalledWith(2);
  });

  it("TC-07-03: Subscriber not notified for other keys", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeState("userA", callback);
    bus.setState("userB", { name: "Bob" });

    expect(callback).not.toHaveBeenCalled();
  });

  it("TC-07-04: Multiple subscribers notified", () => {
    const bus = new CrossTalk();
    const callbackA = vi.fn();
    const callbackB = vi.fn();
    const configValue = { debug: true };

    bus.subscribeState("config", callbackA);
    bus.subscribeState("config", callbackB);
    bus.setState("config", configValue);

    expect(callbackA).toHaveBeenCalledWith(configValue);
    expect(callbackB).toHaveBeenCalledWith(configValue);
  });

  it("TC-07-05: Subscriber immediately receives current value", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.setState("language", "en");
    bus.subscribeState("language", callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("en");
  });
});
