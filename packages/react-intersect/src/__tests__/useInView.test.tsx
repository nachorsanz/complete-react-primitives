import React from "react";
import { renderHook, render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useInView } from "../useInView";

// Mock IntersectionObserver
const mockObserver = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockObserver.mockClear();
  mockUnobserve.mockClear();
  mockDisconnect.mockClear();

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
    observe: mockObserver,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    callback,
    options,
  }));

  // Mock window object
  global.window = global.window || {};
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useInView", () => {
  it("should return initial state correctly", () => {
    const { result } = renderHook(() => useInView());
    const [ref, inView, entry] = result.current;

    expect(typeof ref).toBe("function");
    expect(inView).toBe(false);
    expect(entry).toBe(null);
  });

  it("should create IntersectionObserver when ref is set", () => {
    const { result } = renderHook(() => useInView());
    const [ref] = result.current;

    const element = document.createElement("div");
    ref(element);

    expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {});
    expect(mockObserver).toHaveBeenCalledWith(element);
  });

  it("should pass options to IntersectionObserver", () => {
    const options = {
      root: null,
      rootMargin: "10px",
      threshold: 0.5,
    };

    const { result } = renderHook(() => useInView(options));
    const [ref] = result.current;

    const element = document.createElement("div");
    ref(element);

    expect(global.IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), options);
  });

  it("should handle intersection changes", () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserver,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useInView());
    const [ref] = result.current;

    const element = document.createElement("div");
    ref(element);

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: element,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    } as IntersectionObserverEntry;

    observerCallback!([mockEntry]);

    const [, inView, entry] = result.current;
    expect(inView).toBe(true);
    expect(entry).toBe(mockEntry);
  });

  it("should disconnect observer with once option", () => {
    let observerCallback: (entries: IntersectionObserverEntry[]) => void;

    global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserver,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    const { result } = renderHook(() => useInView({ once: true }));
    const [ref] = result.current;

    const element = document.createElement("div");
    ref(element);

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: element,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: 1,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    } as IntersectionObserverEntry;

    observerCallback!([mockEntry]);

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("should fallback to visible when IntersectionObserver is not supported", () => {
    // Remove IntersectionObserver support
    delete (global as any).IntersectionObserver;

    const { result } = renderHook(() => useInView());
    const [ref, initialInView] = result.current;

    expect(initialInView).toBe(false);

    const element = document.createElement("div");
    ref(element);

    const [, inView] = result.current;
    expect(inView).toBe(true);
  });

  it("should handle SSR environment (no window)", () => {
    const originalWindow = global.window;
    delete (global as any).window;

    const { result } = renderHook(() => useInView());
    const [ref, inView, entry] = result.current;

    expect(typeof ref).toBe("function");
    expect(inView).toBe(false);
    expect(entry).toBe(null);

    // Should not throw when ref is called
    expect(() => ref(document.createElement("div"))).not.toThrow();

    global.window = originalWindow;
  });

  it("should cleanup observer on unmount", () => {
    const { result, unmount } = renderHook(() => useInView());
    const [ref] = result.current;

    const element = document.createElement("div");
    ref(element);

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("should cleanup and recreate observer when ref changes", () => {
    const { result } = renderHook(() => useInView());
    const [ref] = result.current;

    const element1 = document.createElement("div");
    const element2 = document.createElement("div");

    ref(element1);
    expect(mockObserver).toHaveBeenCalledWith(element1);

    // Clear first, then set new element
    ref(null);
    expect(mockDisconnect).toHaveBeenCalled();

    mockDisconnect.mockClear();
    ref(element2);
    expect(mockObserver).toHaveBeenCalledWith(element2);
  });

  it("should handle observer creation errors gracefully", () => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => {
      throw new Error("Observer creation failed");
    });

    // Mock console.warn to avoid test output pollution
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() => useInView());
    const [ref, inView] = result.current;

    const element = document.createElement("div");
    ref(element);

    expect(consoleSpy).toHaveBeenCalledWith("Error creando IntersectionObserver:", expect.any(Error));
    expect(inView).toBe(true); // Should fallback to visible

    consoleSpy.mockRestore();
  });

  it("should work in component", () => {
    function TestComponent() {
      const [ref, inView] = useInView();
      return (
        <div ref={ref} data-testid="test-element">
          {inView ? "Visible" : "Not visible"}
        </div>
      );
    }

    render(<TestComponent />);

    const element = screen.getByTestId("test-element");
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent("Not visible");
  });
});
