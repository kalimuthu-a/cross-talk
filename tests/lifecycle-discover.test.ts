import { describe, expect, it } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Lifecycle Discover", () => {
  it("TC-09-01: Query returns available microfrontends", () => {
    const bus = new CrossTalk();

    bus.announceAvailable("header-mfe");
    bus.announceAvailable("sidebar-mfe");

    const available = bus.getAvailable();

    expect(available).toContain("header-mfe");
    expect(available).toContain("sidebar-mfe");
    expect(available.length).toBe(2);
  });

  it("TC-09-02: Query returns empty when none available", () => {
    const bus = new CrossTalk();

    const available = bus.getAvailable();

    expect(available).toEqual([]);
    expect(available.length).toBe(0);
  });

  it("TC-09-03: Query excludes unavailable microfrontends", () => {
    const bus = new CrossTalk();

    bus.announceAvailable("temp-mfe");
    bus.announceUnavailable("temp-mfe");

    const available = bus.getAvailable();

    expect(available).not.toContain("temp-mfe");
    expect(available.length).toBe(0);
  });

  it("TC-09-04: Query reflects current state", () => {
    const bus = new CrossTalk();

    bus.announceAvailable("mfe-a");
    bus.announceAvailable("mfe-b");

    const available = bus.getAvailable();

    expect(available).toContain("mfe-a");
    expect(available).toContain("mfe-b");
    expect(available.length).toBe(2);
  });
});
