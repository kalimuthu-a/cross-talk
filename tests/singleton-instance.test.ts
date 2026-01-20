import { describe, expect, it, vi } from "vitest";

import { crossTalk } from "../src/core/singleton";
import { CrossTalk } from "../src/core/CrossTalk";

describe("Shared Instance", () => {
  it("TC-19-01: Same instance returned to all microfrontends", () => {
    // Simulate multiple microfrontends accessing the singleton
    const instanceA = crossTalk;
    const instanceB = crossTalk;

    expect(instanceA).toBe(instanceB);
    expect(instanceA === instanceB).toBe(true);
  });

  it("TC-19-02: State is shared across microfrontends", () => {
    // Simulate microfrontend A setting state
    crossTalk.setState("shared-key", "value-from-A");

    // Simulate microfrontend B reading state
    const value = crossTalk.getState<string>("shared-key");

    expect(value).toBe("value-from-A");
  });

  it("TC-19-03: Events cross microfrontend boundaries", () => {
    const callback = vi.fn();

    // Simulate microfrontend A subscribing
    crossTalk.subscribe("cross-mfe", callback);

    // Simulate microfrontend B publishing
    crossTalk.publish("cross-mfe", "payload-from-B");

    expect(callback).toHaveBeenCalledWith("payload-from-B");
  });

  it("TC-19-04: Multiple script loads return same instance", () => {
    // Simulate multiple script loads accessing the library
    const instance1 = crossTalk;
    const instance2 = crossTalk;
    const instance3 = crossTalk;

    expect(instance1).toBe(instance2);
    expect(instance2).toBe(instance3);
    expect(instance1).toBe(instance3);
  });

  it("TC-19-05: Singleton instance is CrossTalk instance", () => {
    expect(crossTalk).toBeInstanceOf(CrossTalk);
  });
});
