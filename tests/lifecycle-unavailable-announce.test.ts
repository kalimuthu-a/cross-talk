import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Lifecycle Unavailable Announce", () => {
  it("TC-15-01: Microfrontend announces unavailability", () => {
    const bus = new CrossTalk();

    bus.announceAvailable("widget-mfe");

    expect(() => {
      bus.announceUnavailable("widget-mfe");
    }).not.toThrow();
  });

  it("TC-15-02: Unavailability announcement notifies subscribers", () => {
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

  it("TC-15-03: Unavailable microfrontend removed from discovery", () => {
    const bus = new CrossTalk();

    bus.announceAvailable("old-mfe");
    expect(bus.getAvailable()).toContain("old-mfe");

    bus.announceUnavailable("old-mfe");

    const available = bus.getAvailable();
    expect(available).not.toContain("old-mfe");
  });

  it("TC-15-04: Announce unavailability for non-registered microfrontend", () => {
    const bus = new CrossTalk();

    expect(() => {
      bus.announceUnavailable("unknown-mfe");
    }).not.toThrow();

    // Verify it doesn't appear in available list
    expect(bus.getAvailable()).not.toContain("unknown-mfe");
  });
});
