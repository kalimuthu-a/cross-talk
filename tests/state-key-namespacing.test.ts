import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("State Key Namespacing", () => {
  it("TC-17-01: Namespaced state keys are isolated", () => {
    const bus = new CrossTalk();
    const userA = { name: "Alice" };
    const userB = { name: "Bob" };

    bus.setState("mfe-a:user", userA);
    bus.setState("mfe-b:user", userB);

    const result = bus.getState<{ name: string }>("mfe-a:user");
    expect(result).toEqual(userA);
    expect(result).not.toEqual(userB);
  });

  it("TC-17-02: Same key name in different namespaces are distinct", () => {
    const bus = new CrossTalk();

    bus.setState("cart:total", 100);
    bus.setState("order:total", 250);

    const cartTotal = bus.getState<number>("cart:total");
    const orderTotal = bus.getState<number>("order:total");

    expect(cartTotal).toBe(100);
    expect(orderTotal).toBe(250);
  });

  it("TC-17-03: Namespace prefix applied to subscriptions", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    bus.subscribeState("header:visible", callback);
    bus.setState("footer:visible", true);

    expect(callback).not.toHaveBeenCalled();
  });

  it("TC-17-04: Namespaced and global keys coexist", () => {
    const bus = new CrossTalk();

    bus.setState("global-theme", "dark");
    bus.setState("mfe-a:theme", "light");

    const globalTheme = bus.getState<string>("global-theme");
    const namespacedTheme = bus.getState<string>("mfe-a:theme");

    expect(globalTheme).toBe("dark");
    expect(namespacedTheme).toBe("light");
  });

  it("TC-17-05: Scoped state keys work with scope() method", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();

    const scopeA = bus.scope("mfe-a");
    const scopeB = bus.scope("mfe-b");

    scopeA.setState("user", { name: "Alice" });
    scopeB.setState("user", { name: "Bob" });

    const userA = scopeA.getState<{ name: string }>("user");
    const userB = scopeB.getState<{ name: string }>("user");

    expect(userA).toEqual({ name: "Alice" });
    expect(userB).toEqual({ name: "Bob" });

    // Test subscriptions with scoped keys
    scopeA.subscribeState("config", callback);
    scopeA.setState("config", { debug: true });

    expect(callback).toHaveBeenCalledWith({ debug: true });

    // Verify other scope doesn't trigger
    callback.mockClear();
    scopeB.setState("config", { debug: false });
    expect(callback).not.toHaveBeenCalled();
  });
});
