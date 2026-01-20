import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Lifecycle Subscribe", () => {
  it("TC-21-01: Subscriber notified when microfrontend becomes available", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeLifecycle(callback);
    bus.announceAvailable("new-mfe");

    expect(callback).toHaveBeenCalledWith({
      id: "new-mfe",
      status: "available",
      metadata: undefined,
    });
  });

  it("TC-21-02: Subscriber notified when microfrontend becomes unavailable", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeLifecycle(callback);
    bus.announceAvailable("temp-mfe");
    bus.announceUnavailable("temp-mfe");

    expect(callback).toHaveBeenCalledWith({
      id: "temp-mfe",
      status: "unavailable",
    });
  });

  it("TC-21-03: Multiple lifecycle subscribers receive notifications", () => {
    const bus = new CrossTalk();
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    bus.subscribeLifecycle(callbackA);
    bus.subscribeLifecycle(callbackB);
    bus.announceAvailable("widget-mfe");

    expect(callbackA).toHaveBeenCalledWith({
      id: "widget-mfe",
      status: "available",
      metadata: undefined,
    });
    expect(callbackB).toHaveBeenCalledWith({
      id: "widget-mfe",
      status: "available",
      metadata: undefined,
    });
  });

  it("TC-21-04: Subscriber receives both availability and unavailability events", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeLifecycle(callback);
    bus.announceAvailable("mfe-x");
    bus.announceUnavailable("mfe-x");

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, {
      id: "mfe-x",
      status: "available",
      metadata: undefined,
    });
    expect(callback).toHaveBeenNthCalledWith(2, {
      id: "mfe-x",
      status: "unavailable",
    });
  });

  it("TC-21-05: Notification includes identifier and status", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeLifecycle(callback);
    bus.announceAvailable("mfe-y", { version: "1.0" });

    expect(callback).toHaveBeenCalledWith({
      id: "mfe-y",
      status: "available",
      metadata: { version: "1.0" },
    });
  });
});
