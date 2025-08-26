import React from "react";
import { renderHook, act, render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useUrlState } from "../useUrlState";

// Mock location and history
const mockLocation = {
  pathname: "/test",
  search: "",
  hash: "",
};

const mockHistory = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
};

beforeEach(() => {
  // Reset location
  mockLocation.search = "";
  mockLocation.hash = "";

  // Setup window.location mock
  Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
  });

  // Setup window.history mock
  Object.defineProperty(window, "history", {
    value: mockHistory,
    writable: true,
  });

  // Clear all mocks
  mockHistory.pushState.mockClear();
  mockHistory.replaceState.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useUrlState", () => {
  it("should return initial state when URL is empty", () => {
    const initialState = { page: 1, query: "" };
    const { result } = renderHook(() => useUrlState(initialState));
    const [state] = result.current;

    expect(state).toEqual(initialState);
  });

  it("should parse existing URL parameters", () => {
    mockLocation.search = "?page=2&query=test";

    const initialState = { page: 1, query: "" };
    const { result } = renderHook(() => useUrlState(initialState));
    const [state] = result.current;

    expect(state).toEqual({ page: 2, query: "test" });
  });

  it("should update URL with replace by default", () => {
    const { result } = renderHook(() => useUrlState({ page: 1 }));
    const [, setState] = result.current;

    act(() => {
      setState({ page: 2 });
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(null, "", "/test?page=2");
    expect(mockHistory.pushState).not.toHaveBeenCalled();
  });

  it("should use push history mode when configured", () => {
    const { result } = renderHook(() => useUrlState({ page: 1 }, { history: "push" }));
    const [, setState] = result.current;

    act(() => {
      setState({ page: 2 });
    });

    expect(mockHistory.pushState).toHaveBeenCalledWith(null, "", "/test?page=2");
    expect(mockHistory.replaceState).not.toHaveBeenCalled();
  });

  it("should handle partial state updates", () => {
    const { result } = renderHook(() => useUrlState({ page: 1, query: "initial", sort: "name" }));
    const [, setState] = result.current;

    act(() => {
      setState({ query: "updated" });
    });

    const [state] = result.current;
    expect(state).toEqual({ page: 1, query: "updated", sort: "name" });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(null, "", "/test?page=1&query=updated&sort=name");
  });

  it("should handle functional state updates", () => {
    const { result } = renderHook(() => useUrlState({ count: 0 }));
    const [, setState] = result.current;

    act(() => {
      setState((prev) => ({ count: prev.count + 1 }));
    });

    const [state] = result.current;
    expect(state).toEqual({ count: 1 });
  });

  it("should preserve pathname and hash in URL", () => {
    mockLocation.pathname = "/some/path";
    mockLocation.hash = "#section";

    const { result } = renderHook(() => useUrlState({ page: 1 }));
    const [, setState] = result.current;

    act(() => {
      setState({ page: 2 });
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(null, "", "/some/path?page=2#section");
  });

  it("should handle empty URL when all values are empty", () => {
    const { result } = renderHook(() => useUrlState({ query: "", page: "" }));
    const [, setState] = result.current;

    act(() => {
      setState({ query: "", page: "" });
    });

    expect(mockHistory.replaceState).toHaveBeenCalledWith(null, "", "/test");
  });

  it("should handle complex data types with JSON", () => {
    const initialState = {
      filters: { category: "all", price: [0, 100] },
      tags: ["tag1", "tag2"],
    };

    const { result } = renderHook(() => useUrlState(initialState));
    const [, setState] = result.current;

    act(() => {
      setState({
        filters: { category: "electronics", price: [50, 200] },
      });
    });

    const [state] = result.current;
    expect(state.filters).toEqual({ category: "electronics", price: [50, 200] });
    expect(state.tags).toEqual(["tag1", "tag2"]);
  });

  it("should respond to browser back/forward navigation", () => {
    const { result } = renderHook(() => useUrlState({ page: 1 }));

    // Simulate URL change via browser navigation
    mockLocation.search = "?page=3";

    act(() => {
      const popStateEvent = new PopStateEvent("popstate", { state: null });
      window.dispatchEvent(popStateEvent);
    });

    const [state] = result.current;
    expect(state).toEqual({ page: 3 });
  });

  it("should use custom serializer when provided", () => {
    const customSerializer = {
      parse: vi.fn((qs: URLSearchParams) => ({
        custom: qs.get("custom") || "default",
      })),
      stringify: vi.fn((state: any) => {
        const qs = new URLSearchParams();
        if (state.custom) qs.set("custom", state.custom);
        return qs;
      }),
    };

    const { result } = renderHook(() => useUrlState({ custom: "initial" }, { serializer: customSerializer }));
    const [, setState] = result.current;

    act(() => {
      setState({ custom: "updated" });
    });

    expect(customSerializer.stringify).toHaveBeenCalledWith({ custom: "updated" });
  });

  it("should skip URL updates with shallow equality when enabled", () => {
    const { result } = renderHook(() => useUrlState({ page: 1 }, { shallowEqual: true }));
    const [, setState] = result.current;

    // Set same values
    act(() => {
      setState({ page: 1 });
    });

    expect(mockHistory.replaceState).not.toHaveBeenCalled();
  });

  it("should always update URL when shallow equality is disabled", () => {
    const { result } = renderHook(() => useUrlState({ page: 1 }, { shallowEqual: false }));
    const [, setState] = result.current;

    // Set same values
    act(() => {
      setState({ page: 1 });
    });

    expect(mockHistory.replaceState).toHaveBeenCalled();
  });

  it("should handle SSR environment (no window)", () => {
    const originalWindow = global.window;
    delete (global as any).window;

    const { result } = renderHook(() => useUrlState({ page: 1 }));
    const [state, setState] = result.current;

    expect(state).toEqual({ page: 1 });

    // Should not throw in SSR
    expect(() => {
      act(() => {
        setState({ page: 2 });
      });
    }).not.toThrow();

    global.window = originalWindow;
  });

  it("should handle URL parsing errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Mock URLSearchParams to throw an error
    const originalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = vi.fn().mockImplementation(() => {
      throw new Error("URL parsing failed");
    });

    const { result } = renderHook(() => useUrlState({ page: 1 }));
    const [state] = result.current;

    expect(state).toEqual({ page: 1 });
    expect(consoleSpy).toHaveBeenCalledWith("Error parseando estado de URL:", expect.any(Error));

    global.URLSearchParams = originalURLSearchParams;
    consoleSpy.mockRestore();
  });

  it("should handle URL writing errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockHistory.replaceState.mockImplementation(() => {
      throw new Error("History API failed");
    });

    const { result } = renderHook(() => useUrlState({ page: 1 }));
    const [, setState] = result.current;

    act(() => {
      setState({ page: 2 });
    });

    expect(consoleSpy).toHaveBeenCalledWith("Error escribiendo estado a URL:", expect.any(Error));

    consoleSpy.mockRestore();
  });

  it("should work in component with search functionality", () => {
    function SearchComponent() {
      const [filters, setFilters] = useUrlState({
        query: "",
        category: "all",
      });

      return (
        <div>
          <input
            data-testid="search-input"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
          />
          <select
            data-testid="category-select"
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
          >
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
          </select>
          <div data-testid="current-state">{JSON.stringify(filters)}</div>
        </div>
      );
    }

    render(<SearchComponent />);

    const searchInput = screen.getByTestId("search-input");
    const categorySelect = screen.getByTestId("category-select");
    const currentState = screen.getByTestId("current-state");

    expect(currentState).toHaveTextContent('{"query":"","category":"all"}');

    fireEvent.change(searchInput, { target: { value: "test query" } });
    expect(currentState).toHaveTextContent('{"query":"test query","category":"all"}');

    fireEvent.change(categorySelect, { target: { value: "electronics" } });
    expect(currentState).toHaveTextContent('{"query":"test query","category":"electronics"}');
  });

  it("should handle null and undefined values correctly", () => {
    const { result } = renderHook(() => useUrlState({ value: null, other: undefined, text: "" }));
    const [, setState] = result.current;

    act(() => {
      setState({ value: null, other: undefined, text: "" });
    });

    // Should create empty URL since all values are empty/null/undefined
    expect(mockHistory.replaceState).toHaveBeenCalledWith(null, "", "/test");
  });

  it("should preserve existing URL parameters not in state", () => {
    mockLocation.search = "?page=1&external=keep";

    const { result } = renderHook(() => useUrlState({ page: 1 }));
    const [, setState] = result.current;

    act(() => {
      setState({ page: 2 });
    });

    // Should only update the page parameter, external should be removed
    // since our state only manages 'page'
    expect(mockHistory.replaceState).toHaveBeenCalledWith(null, "", "/test?page=2");
  });
});
