import React from "react";
import { renderHook, act, render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useStorage } from "../useStorage";

// Mock localStorage and sessionStorage
const createMockStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

const mockLocalStorage = createMockStorage();
const mockSessionStorage = createMockStorage();

beforeEach(() => {
  global.localStorage = mockLocalStorage as any;
  global.sessionStorage = mockSessionStorage as any;

  // Clear all mocks
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockSessionStorage.getItem.mockClear();
  mockSessionStorage.setItem.mockClear();
  mockSessionStorage.removeItem.mockClear();

  // Clear storage
  mockLocalStorage.clear();
  mockSessionStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useStorage", () => {
  it("should return initial value when storage is empty", () => {
    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [value] = result.current;

    expect(value).toBe("initial");
  });

  it("should persist value to localStorage by default", () => {
    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [, setValue] = result.current;

    act(() => {
      setValue("new value");
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test-key", expect.stringContaining("new value"));
  });

  it("should use sessionStorage when area is session", () => {
    const { result } = renderHook(() => useStorage("test-key", "initial", { area: "session" }));
    const [, setValue] = result.current;

    act(() => {
      setValue("session value");
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith("test-key", expect.stringContaining("session value"));
  });

  it("should handle object values with JSON serialization", () => {
    const initialObj = { foo: "bar", count: 0 };
    const { result } = renderHook(() => useStorage("test-key", initialObj));
    const [, setValue] = result.current;

    const newObj = { foo: "baz", count: 1 };
    act(() => {
      setValue(newObj);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test-key", expect.stringContaining(JSON.stringify(newObj)));
  });

  it("should retrieve existing value from storage", () => {
    const storedValue = { v: "stored value" };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedValue));

    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [value] = result.current;

    expect(value).toBe("stored value");
  });

  it("should handle TTL expiration", () => {
    const pastTime = Date.now() - 1000; // 1 second ago
    const expiredValue = { v: "expired", e: pastTime };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredValue));

    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [value] = result.current;

    expect(value).toBe("initial");
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key");
  });

  it("should set TTL when configured", () => {
    const ttl = 5000; // 5 seconds
    const { result } = renderHook(() => useStorage("test-key", "initial", { ttl }));
    const [, setValue] = result.current;

    const beforeTime = Date.now();
    act(() => {
      setValue("value with ttl");
    });
    const afterTime = Date.now();

    const setItemCall = mockLocalStorage.setItem.mock.calls[0];
    const storedData = JSON.parse(setItemCall[1]);

    expect(storedData.e).toBeGreaterThanOrEqual(beforeTime + ttl);
    expect(storedData.e).toBeLessThanOrEqual(afterTime + ttl);
  });

  it("should use functional updates", () => {
    const { result } = renderHook(() => useStorage("test-key", 0));
    const [, setValue] = result.current;

    act(() => {
      setValue((prev) => prev + 1);
    });

    const [value] = result.current;
    expect(value).toBe(1);
  });

  it("should remove value from storage", () => {
    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [, , removeValue] = result.current;

    act(() => {
      removeValue();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key");

    const [value] = result.current;
    expect(value).toBe("initial");
  });

  it("should handle cross-tab synchronization", () => {
    const { result } = renderHook(() => useStorage("test-key", "initial", { crossTab: true }));

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent("storage", {
      key: "test-key",
      newValue: JSON.stringify({ v: "value from another tab" }),
      storageArea: localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    const [value] = result.current;
    expect(value).toBe("value from another tab");
  });

  it("should ignore storage events for different keys", () => {
    const { result } = renderHook(() => useStorage("test-key", "initial", { crossTab: true }));

    const [initialValue] = result.current;

    // Simulate storage event for different key
    const storageEvent = new StorageEvent("storage", {
      key: "different-key",
      newValue: JSON.stringify({ v: "different value" }),
      storageArea: localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    const [value] = result.current;
    expect(value).toBe(initialValue);
  });

  it("should use migrate function for data migration", () => {
    const oldFormat = "old string format";
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldFormat));

    const migrate = vi.fn((raw: unknown) => {
      if (typeof raw === "string") {
        return { text: raw, version: 2 };
      }
      return raw;
    });

    const { result } = renderHook(() => useStorage("test-key", { text: "", version: 1 }, { migrate }));

    const [value] = result.current;
    expect(migrate).toHaveBeenCalledWith(oldFormat);
    expect(value).toEqual({ text: "old string format", version: 2 });
  });

  it("should handle non-JSON storage without json option", () => {
    const { result } = renderHook(() => useStorage("test-key", "initial", { json: false }));
    const [, setValue] = result.current;

    act(() => {
      setValue("plain string");
    });

    // Should store the value directly without JSON wrapper
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test-key", expect.objectContaining({ v: "plain string" }));
  });

  it("should handle storage errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [, setValue] = result.current;

    act(() => {
      setValue("value that fails to store");
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error escribiendo storage key "test-key":', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it("should handle SSR environment (no window)", () => {
    const originalWindow = global.window;
    delete (global as any).window;

    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [value, setValue, removeValue] = result.current;

    expect(value).toBe("initial");

    // Should not throw in SSR
    expect(() => {
      act(() => {
        setValue("new value");
        removeValue();
      });
    }).not.toThrow();

    global.window = originalWindow;
  });

  it("should work in component", () => {
    function TestComponent() {
      const [count, setCount] = useStorage("counter", 0);

      return (
        <div>
          <span data-testid="count">{count}</span>
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
        </div>
      );
    }

    render(<TestComponent />);

    const countElement = screen.getByTestId("count");
    const button = screen.getByText("Increment");

    expect(countElement).toHaveTextContent("0");

    fireEvent.click(button);
    expect(countElement).toHaveTextContent("1");
  });

  it("should handle invalid JSON gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue("invalid json {");

    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [value] = result.current;

    expect(value).toBe("initial");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle storage access errors", () => {
    const originalLocalStorage = global.localStorage;
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Mock localStorage to throw (e.g., in private browsing mode)
    Object.defineProperty(global, "localStorage", {
      get() {
        throw new Error("Access denied");
      },
    });

    const { result } = renderHook(() => useStorage("test-key", "initial"));
    const [value] = result.current;

    expect(value).toBe("initial");
    expect(consoleSpy).toHaveBeenCalled();

    global.localStorage = originalLocalStorage;
    consoleSpy.mockRestore();
  });
});
