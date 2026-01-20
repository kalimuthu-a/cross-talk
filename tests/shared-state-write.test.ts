import { describe, expect, it } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Shared State Write", () => {
  it("TC-06-01: Write new state value", () => {
    const bus = new CrossTalk();

    bus.setState("theme", "dark");

    // Verify state is stored without error
    const result = bus.getState<string>("theme");
    expect(result).toBe("dark");
  });

  it("TC-06-02: Overwrite existing state value", () => {
    const bus = new CrossTalk();

    bus.setState("counter", 5);
    bus.setState("counter", 10);

    const result = bus.getState<number>("counter");
    expect(result).toBe(10);
  });

  it("TC-06-03: Write complex object value", () => {
    const bus = new CrossTalk();
    const userValue = { id: 1, roles: ["admin", "user"] };

    bus.setState("user", userValue);

    const result = bus.getState<{ id: number; roles: string[] }>("user");
    expect(result).toEqual(userValue);
  });

  it("TC-06-04: Write null value", () => {
    const bus = new CrossTalk();

    bus.setState("session", { token: "abc" });
    bus.setState("session", null);

    const result = bus.getState<{ token: string } | null>("session");
    expect(result).toBeNull();
  });
});
