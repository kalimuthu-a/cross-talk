import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Subscribe Events", () => {
  it("TC-02-01: Subscriber receives published event", () => {
    const bus = new CrossTalk();
    const handler = vi.fn();

    bus.subscribe("user-login", handler);

    bus.publish("user-login", { userId: "123" });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ userId: "123" });
  });

  it("TC-02-02: Multiple subscribers receive same event", () => {
    const bus = new CrossTalk();
    const first = vi.fn();
    const second = vi.fn();

    bus.subscribe("theme-changed", first);
    bus.subscribe("theme-changed", second);

    bus.publish("theme-changed", "dark");

    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith("dark");
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith("dark");
  });

  it("TC-02-03: Subscriber does not receive unrelated events", () => {
    const bus = new CrossTalk();
    const handler = vi.fn();

    bus.subscribe("user-login", handler);

    bus.publish("user-logout");

    expect(handler).not.toHaveBeenCalled();
  });

  it("TC-02-04: Subscriber receives correct payload type", () => {
    const bus = new CrossTalk();
    let received: number[] | undefined;

    bus.subscribe<number[]>("data-update", (payload) => {
      received = payload;
    });

    bus.publish("data-update", [1, 2, 3]);

    expect(received).toEqual([1, 2, 3]);
  });
});
