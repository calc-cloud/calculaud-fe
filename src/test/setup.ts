import "@testing-library/jest-dom";
import { vi } from "vitest";

// Import all mocks to ensure they're loaded
import "./mocks";

// Mock window.URL.createObjectURL and revokeObjectURL for file download tests
Object.defineProperty(window, "URL", {
  writable: true,
  value: {
    createObjectURL: vi.fn(() => "mocked-url"),
    revokeObjectURL: vi.fn(),
  },
});

// Mock HTMLAnchorElement.click method to prevent navigation errors
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  const element = originalCreateElement.call(document, tagName);

  if (tagName === "a") {
    // Mock the click method to prevent navigation
    element.click = vi.fn();
  }

  return element;
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock window.matchMedia for responsive components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// Mock missing DOM methods for pointer events
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
}

if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = vi.fn();
}

if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = vi.fn();
}

// Mock missing DOM methods for focus
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = vi.fn();
}
