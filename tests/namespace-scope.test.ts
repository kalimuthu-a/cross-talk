import { describe, expect, it, vi } from "vitest";

import { CrossTalk } from "../src/core/CrossTalk";

describe("Event Namespacing", () => {
  it("TC-13-01: Namespaced events are isolated", () => {
    const bus = new CrossTalk();
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    const scopeA = bus.scope("mfe-a");
    const scopeB = bus.scope("mfe-b");

    scopeA.subscribe("click", callbackA);
    scopeB.subscribe("click", callbackB);
    scopeA.publish("click", "payload-a");

    expect(callbackA).toHaveBeenCalledWith("payload-a");
    expect(callbackB).not.toHaveBeenCalled();
  });

  it("TC-13-02: Same event name in different namespaces are distinct", () => {
    const bus = new CrossTalk();
    const callbackA = vi.fn();
    const callbackB = vi.fn();

    const cartScope = bus.scope("cart");
    const wishlistScope = bus.scope("wishlist");

    cartScope.subscribe("updated", callbackA);
    wishlistScope.subscribe("updated", callbackB);
    cartScope.publish("updated", "cart-data");

    expect(callbackA).toHaveBeenCalledWith("cart-data");
    expect(callbackB).not.toHaveBeenCalled();
  });

  it("TC-13-03: Namespace prefix is applied correctly", () => {
    const bus = new CrossTalk();
    const callback = vi.fn();
    const namespace = "header";
    const eventName = "menu-open";
    
    const scopedBus = bus.scope(namespace);
    scopedBus.subscribe(eventName, callback);
    scopedBus.publish(eventName, "open");

    expect(callback).toHaveBeenCalledWith("open");
    // Verify that we can also see it from the global bus with the prefix
    const globalCallback = vi.fn();
    bus.subscribe(`${namespace}:${eventName}`, globalCallback);
    bus.publish(`${namespace}:${eventName}`, "open-global");
    
    expect(globalCallback).toHaveBeenCalledWith("open-global");
    expect(callback).toHaveBeenCalledWith("open-global");
  });

  it("TC-13-04: Global events work alongside namespaced events", () => {
    const bus = new CrossTalk();
    const globalCallback = vi.fn();
    const namespacedCallback = vi.fn();

    const scopeA = bus.scope("mfe-a");

    bus.subscribe("app:ready", globalCallback);
    scopeA.subscribe("ready", namespacedCallback);
    
    bus.publish("app:ready", "global-payload");
    scopeA.publish("ready", "namespaced-payload");

    expect(globalCallback).toHaveBeenCalledWith("global-payload");
    expect(globalCallback).not.toHaveBeenCalledWith("namespaced-payload");
    expect(namespacedCallback).toHaveBeenCalledWith("namespaced-payload");
    expect(namespacedCallback).not.toHaveBeenCalledWith("global-payload");
  });
});
