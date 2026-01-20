import { describe, expect, it } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Version Compatibility", () => {
  it("TC-12-01: Current version is supported", () => {
    const bus = new CrossTalk();
    const currentVersion = bus.getApiVersion();

    const isSupported = bus.isVersionSupported(currentVersion);

    expect(isSupported).toBe(true);
  });

  it("TC-12-02: Unsupported version returns false", () => {
    const bus = new CrossTalk();

    const isSupported = bus.isVersionSupported("99.0.0");

    expect(isSupported).toBe(false);
  });

  it("TC-12-03: Backward compatible version check", () => {
    const bus = new CrossTalk();
    const currentVersion = bus.getApiVersion();

    // Since current version is "0.1.0", versions starting with "0." should be supported
    // This tests backward compatibility within the same major version (0.x)
    const isSupported = bus.isVersionSupported("0.0.1");

    expect(isSupported).toBe(true);
  });

  it("TC-12-04: Invalid version format handled", () => {
    const bus = new CrossTalk();

    const isSupported = bus.isVersionSupported("invalid");

    expect(isSupported).toBe(false);
  });
});
