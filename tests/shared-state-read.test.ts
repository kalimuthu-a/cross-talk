import { describe, expect, it } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Shared State Read", () => {
  it("TC-05-01: Read existing state value", () => {
    const bus = new CrossTalk();
    const userValue = { name: "Alice" };

    bus.setState("user", userValue);
    const result = bus.getState("user");

    expect(result).toEqual(userValue);
  });

  it("TC-05-02: Read non-existent state key returns undefined or null", () => {
    const bus = new CrossTalk();

    const result = bus.getState("missing-key");

    expect(result === undefined || result === null).toBe(true);
  });

  it("TC-05-03: Read state preserves data type", () => {
    const bus = new CrossTalk();
    const countValue = 42;

    bus.setState("count", countValue);
    const result = bus.getState<number>("count");

    expect(result).toBe(42);
    expect(typeof result).toBe("number");
  });

  it("TC-05-04: Read state returns current value", () => {
    const bus = new CrossTalk();

    bus.setState("version", "1.0");
    bus.setState("version", "2.0");
    const result = bus.getState<string>("version");

    expect(result).toBe("2.0");
  });
});
