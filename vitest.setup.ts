import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// RTL không tự cleanup giữa các test khi dùng Vitest (khác Jest).
afterEach(() => {
  cleanup();
});

// jsdom chưa implement matchMedia — nhiều hook trong repo (theme, mobile detection)
// gọi trực tiếp window.matchMedia nên cần polyfill tối thiểu.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
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
}

// jsdom không implement scrollIntoView/ResizeObserver — dùng ở vài component UI (modal, carousel).
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.ResizeObserver =
    window.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
}
