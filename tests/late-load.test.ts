import { describe, expect, it, vi } from "vitest";
import { crossTalk } from "../src/index";

describe("Late-Loaded Publish", () => {
  it("TC-04-01: Late-loaded microfrontend can publish to existing subscriber", () => {
    // Given the library is initialized (already done via import)
    // And microfrontend A subscribes to event "data-sync"
    const callbackA = vi.fn();
    crossTalk.subscribe("data-sync", callbackA);

    // When microfrontend B is loaded later and publishes event "data-sync" with payload "synced"
    // (Simulating loading later by just performing the action)
    crossTalk.publish("data-sync", "synced");

    // Then microfrontend A receives the event with payload "synced"
    expect(callbackA).toHaveBeenCalledWith("synced");
  });

  it("TC-04-02: Late-loaded microfrontend publishes without reload", async () => {
    // Given the library is initialized
    // And microfrontend A is loaded and subscribes to event "update"
    const callbackA = vi.fn();
    crossTalk.subscribe("update", callbackA);

    // When microfrontend B is loaded 100ms later (simulating 5 seconds with a shorter delay)
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // And microfrontend B publishes event "update"
    crossTalk.publish("update", { status: "updated" });

    // Then microfrontend A receives the event without being reloaded
    // (In a test context, this means the original callback still works)
    expect(callbackA).toHaveBeenCalledWith({ status: "updated" });
  });

  it("TC-04-03: Multiple late-loaded publishers work correctly", () => {
    // Given the library is initialized
    // And microfrontend A subscribes to event "ping"
    const received: string[] = [];
    crossTalk.subscribe("ping", (payload) => {
      received.push(payload as string);
    });

    // When microfrontend B is loaded and publishes "ping" with payload "B"
    crossTalk.publish("ping", "B");

    // And microfrontend C is loaded and publishes "ping" with payload "C"
    crossTalk.publish("ping", "C");

    // Then microfrontend A receives both events in order
    expect(received).toEqual(["B", "C"]);
  });
});
