import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Lifecycle Announce", () => {
  it("TC-08-01: Microfrontend announces availability", () => {
    const bus = new CrossTalk();

    expect(() => {
      bus.announceAvailable("header-mfe");
    }).not.toThrow();
  });

  it("TC-08-02: Availability announcement includes identifier", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeLifecycle(callback);
    bus.announceAvailable("nav-mfe");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      id: "nav-mfe",
      status: "available",
      metadata: undefined,
    });
  });

  it("TC-08-03: Multiple microfrontends can announce availability", () => {
    const bus = new CrossTalk();

    expect(() => {
      bus.announceAvailable("header-mfe");
      bus.announceAvailable("footer-mfe");
    }).not.toThrow();
  });

  it("TC-08-04: Announcement can include metadata", () => {
    const bus = new CrossTalk();
    const metadata = { version: "1.0" };

    expect(() => {
      bus.announceAvailable("widget-mfe", metadata);
    }).not.toThrow();

    // Verify metadata is stored
    const callback = vi.fn();
    bus.subscribeLifecycle(callback);
    bus.announceAvailable("widget-mfe-2", metadata);

    expect(callback).toHaveBeenCalledWith({
      id: "widget-mfe-2",
      status: "available",
      metadata,
    });
  });
});
