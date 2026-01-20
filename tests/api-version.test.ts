import { describe, expect, it } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("API Version", () => {
  it("TC-11-01: Version is accessible", () => {
    const bus = new CrossTalk();

    const version = bus.getApiVersion();

    expect(version).toBeDefined();
    expect(typeof version).toBe("string");
  });

  it("TC-11-02: Version is a string type", () => {
    const bus = new CrossTalk();

    const version = bus.getApiVersion();

    expect(typeof version).toBe("string");
  });

  it("TC-11-03: Version follows semantic format", () => {
    const bus = new CrossTalk();

    const version = bus.getApiVersion();

    // Check if version matches semantic version format (e.g., "1.0.0", "2.1", "1.0.0-beta")
    // Pattern: major.minor.patch or major.minor with optional pre-release/build identifiers
    const semanticVersionPattern = /^\d+\.\d+(\.\d+)?(-[a-zA-Z0-9-]+)?(\.[a-zA-Z0-9-]+)?$/;
    expect(version).toMatch(semanticVersionPattern);
  });

  it("TC-11-04: Version is consistent", () => {
    const bus = new CrossTalk();

    const version1 = bus.getApiVersion();
    const version2 = bus.getApiVersion();
    const version3 = bus.getApiVersion();

    expect(version1).toBe(version2);
    expect(version2).toBe(version3);
    expect(version1).toBe(version3);
  });
});
