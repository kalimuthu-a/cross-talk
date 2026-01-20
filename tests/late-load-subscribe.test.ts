import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Late-Loaded Subscribe", () => {
  it("TC-14-01: Late-loaded subscriber receives events from existing publisher", () => {
    const bus = new CrossTalk();
    const callbackB = vi.fn();

    // Simulate microfrontend A being loaded first (can publish)
    // Microfrontend B loads later and subscribes
    bus.subscribe("data-update", callbackB);
    bus.publish("data-update", "new-data");

    expect(callbackB).toHaveBeenCalledWith("new-data");
  });

  it("TC-14-02: Late subscription does not require publisher reload", () => {
    const bus = new CrossTalk();
    const callbackB = vi.fn();

    // Simulate microfrontend A has been publishing
    bus.publish("update", "early-event");

    // Microfrontend B loads later and subscribes
    bus.subscribe("update", callbackB);

    // Microfrontend A can still publish without reload
    bus.publish("update", "late-event");

    expect(callbackB).toHaveBeenCalledWith("late-event");
    expect(callbackB).not.toHaveBeenCalledWith("early-event");
  });

  it("TC-14-03: Multiple late subscribers work correctly", () => {
    const bus = new CrossTalk();
    const callbackB = vi.fn();
    const callbackC = vi.fn();

    // Simulate microfrontend A is the publisher
    // Microfrontend B subscribes at T+5 (simulated)
    bus.subscribe("ping", callbackB);

    // Microfrontend C subscribes at T+10 (simulated)
    bus.subscribe("ping", callbackC);

    // Microfrontend A publishes an event
    bus.publish("ping", "ping-payload");

    expect(callbackB).toHaveBeenCalledWith("ping-payload");
    expect(callbackC).toHaveBeenCalledWith("ping-payload");
  });

  it("TC-14-04: Late subscriber coexists with early subscribers", () => {
    const bus = new CrossTalk();
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    // Microfrontend A subscribes at load time
    bus.subscribe("notify", callbackA);

    // Microfrontend B subscribes later (simulated)
    bus.subscribe("notify", callbackB);

    // Event is published
    bus.publish("notify", "notification-payload");

    expect(callbackA).toHaveBeenCalledWith("notification-payload");
    expect(callbackB).toHaveBeenCalledWith("notification-payload");
  });
});
