import "@testing-library/jest-dom";
import { vi } from "vitest";

// Setup DOM globals for testing
Object.defineProperty(global, "document", {
  value: {
    ...document,
    createElement: vi.fn(() => ({
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
});

// Mock window.URL.createObjectURL and revokeObjectURL for file download tests
Object.defineProperty(global.window, "URL", {
  writable: true,
  value: {
    createObjectURL: vi.fn(() => "mocked-url"),
    revokeObjectURL: vi.fn(),
  },
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};
