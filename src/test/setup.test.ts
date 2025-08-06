import { describe, it, expect } from "vitest";

describe("Test Setup", () => {
  it("should be configured correctly", () => {
    expect(true).toBe(true);
  });

  it("should have DOM globals available", () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
  });

  it("should have mocked URL methods", () => {
    expect(window.URL.createObjectURL).toBeDefined();
    expect(window.URL.revokeObjectURL).toBeDefined();
  });
});
