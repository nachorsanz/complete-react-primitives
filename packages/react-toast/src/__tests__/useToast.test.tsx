import React, { ReactNode } from "react";
import { renderHook, act, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useToast, useToastError, useToastWithDefaults } from "../useToast";
import { ToastProvider } from "../context";

// Test wrapper with ToastProvider
function TestWrapper({ children }: { children: ReactNode }) {
  return <ToastProvider config={{ maxToasts: 5, defaultDuration: 1000 }}>{children}</ToastProvider>;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useToast", () => {
  it("should throw error when used outside ToastProvider", () => {
    // Suppress error logging for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useToast());
    }).toThrow("useToast must be used within a ToastProvider");

    consoleSpy.mockRestore();
  });

  it("should return toast API with all methods", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    expect(toast).toHaveProperty("success");
    expect(toast).toHaveProperty("error");
    expect(toast).toHaveProperty("warning");
    expect(toast).toHaveProperty("info");
    expect(toast).toHaveProperty("loading");
    expect(toast).toHaveProperty("custom");
    expect(toast).toHaveProperty("dismiss");
    expect(toast).toHaveProperty("dismissAll");
    expect(toast).toHaveProperty("update");
    expect(toast).toHaveProperty("toasts");

    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
    expect(typeof toast.warning).toBe("function");
    expect(typeof toast.info).toBe("function");
    expect(typeof toast.loading).toBe("function");
    expect(typeof toast.custom).toBe("function");
    expect(typeof toast.dismiss).toBe("function");
    expect(typeof toast.dismissAll).toBe("function");
    expect(typeof toast.update).toBe("function");
    expect(Array.isArray(toast.toasts)).toBe(true);
  });

  it("should create success toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.success("Success message");
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("success");
    expect(toast.toasts[0].message).toBe("Success message");
  });

  it("should create error toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.error("Error message");
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("error");
    expect(toast.toasts[0].message).toBe("Error message");
  });

  it("should create warning toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.warning("Warning message");
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("warning");
    expect(toast.toasts[0].message).toBe("Warning message");
  });

  it("should create info toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.info("Info message");
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("info");
    expect(toast.toasts[0].message).toBe("Info message");
  });

  it("should create loading toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.loading("Loading message");
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("loading");
    expect(toast.toasts[0].message).toBe("Loading message");
  });

  it("should create custom toast with options", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.custom("Custom message", {
        type: "warning",
        position: "bottom-center",
        variant: "outlined",
        duration: 5000,
      });
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("warning");
    expect(toast.toasts[0].position).toBe("bottom-center");
    expect(toast.toasts[0].variant).toBe("outlined");
    expect(toast.toasts[0].duration).toBe(5000);
  });

  it("should return unique IDs for each toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    let id1: string, id2: string;

    act(() => {
      id1 = toast.success("Message 1");
      id2 = toast.success("Message 2");
    });

    expect(id1!).toBeDefined();
    expect(id2!).toBeDefined();
    expect(id1!).not.toBe(id2!);
    expect(toast.toasts).toHaveLength(2);
  });

  it("should dismiss specific toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    let toastId: string;
    act(() => {
      toastId = toast.success("Message to dismiss");
      toast.success("Another message");
    });

    expect(toast.toasts).toHaveLength(2);

    act(() => {
      toast.dismiss(toastId!);
    });

    // Should mark as removing
    expect(toast.toasts[0].removing).toBe(true);

    // Wait for removal animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].message).toBe("Another message");
  });

  it("should dismiss all toasts", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.success("Message 1");
      toast.error("Message 2");
      toast.info("Message 3");
    });

    expect(toast.toasts).toHaveLength(3);

    act(() => {
      toast.dismissAll();
    });

    expect(toast.toasts).toHaveLength(0);
  });

  it("should update existing toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    let toastId: string;
    act(() => {
      toastId = toast.loading("Loading...");
    });

    expect(toast.toasts[0].message).toBe("Loading...");
    expect(toast.toasts[0].type).toBe("loading");

    act(() => {
      toast.update(toastId!, "Success!", { type: "success" });
    });

    expect(toast.toasts[0].message).toBe("Success!");
    expect(toast.toasts[0].type).toBe("success");
  });

  it("should auto-dismiss toasts after duration", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    act(() => {
      toast.success("Auto dismiss message");
    });

    expect(toast.toasts).toHaveLength(1);

    // Advance time by duration (1000ms from config)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should be marked as removing
    expect(toast.toasts[0].removing).toBe(true);

    // Advance time for removal animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(toast.toasts).toHaveLength(0);
  });

  it("should respect maxToasts limit", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    // Create 6 toasts (limit is 5)
    act(() => {
      for (let i = 0; i < 6; i++) {
        toast.info(`Message ${i}`);
      }
    });

    expect(toast.toasts).toHaveLength(5);
    expect(toast.toasts[0].message).toBe("Message 5"); // Latest should be first
  });

  it("should call onClose callback when toast is dismissed", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    let toastId: string;
    act(() => {
      toastId = toast.custom("Message with callback", { onClose });
    });

    act(() => {
      toast.dismiss(toastId!);
    });

    // Wait for removal animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("should handle JSX content", () => {
    const { result } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const toast = result.current;

    const jsxContent = (
      <span>
        JSX <strong>content</strong>
      </span>
    );

    act(() => {
      toast.success(jsxContent);
    });

    expect(toast.toasts[0].message).toBe(jsxContent);
  });
});

describe("useToastError", () => {
  it("should return wrapper function", () => {
    const { result } = renderHook(() => useToastError(), { wrapper: TestWrapper });
    const withToastError = result.current;

    expect(typeof withToastError).toBe("function");
  });

  it("should show success toast on successful operation", async () => {
    const { result: toastResult } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const { result: errorResult } = renderHook(() => useToastError(), { wrapper: TestWrapper });

    const toast = toastResult.current;
    const withToastError = errorResult.current;

    const successfulOperation = vi.fn().mockResolvedValue("Success result");
    const wrappedOperation = withToastError(successfulOperation, {
      successMessage: "Operation completed!",
    });

    await act(async () => {
      await wrappedOperation();
    });

    expect(successfulOperation).toHaveBeenCalled();
    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("success");
    expect(toast.toasts[0].message).toBe("Operation completed!");
  });

  it("should show error toast on failed operation", async () => {
    const { result: toastResult } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const { result: errorResult } = renderHook(() => useToastError(), { wrapper: TestWrapper });

    const toast = toastResult.current;
    const withToastError = errorResult.current;

    const failedOperation = vi.fn().mockRejectedValue(new Error("Operation failed"));
    const wrappedOperation = withToastError(failedOperation, {
      errorMessage: "Something went wrong!",
    });

    await act(async () => {
      try {
        await wrappedOperation();
      } catch {
        // Expected to throw
      }
    });

    expect(failedOperation).toHaveBeenCalled();
    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("error");
    expect(toast.toasts[0].message).toBe("Something went wrong!");
  });

  it("should show loading toast during operation", async () => {
    const { result: toastResult } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const { result: errorResult } = renderHook(() => useToastError(), { wrapper: TestWrapper });

    const toast = toastResult.current;
    const withToastError = errorResult.current;

    let resolveOperation: (value: string) => void;
    const asyncOperation = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveOperation = resolve;
        }),
    );

    const wrappedOperation = withToastError(asyncOperation, {
      loadingMessage: "Processing...",
      successMessage: "Done!",
    });

    // Start operation
    const operationPromise = act(async () => {
      return wrappedOperation();
    });

    // Should show loading toast
    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("loading");
    expect(toast.toasts[0].message).toBe("Processing...");

    // Complete operation
    act(() => {
      resolveOperation!("Success");
    });

    await operationPromise;

    // Loading toast should be dismissed and success shown
    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].type).toBe("success");
    expect(toast.toasts[0].message).toBe("Done!");
  });

  it("should use functional message callbacks", async () => {
    const { result: toastResult } = renderHook(() => useToast(), { wrapper: TestWrapper });
    const { result: errorResult } = renderHook(() => useToastError(), { wrapper: TestWrapper });

    const toast = toastResult.current;
    const withToastError = errorResult.current;

    const successfulOperation = vi.fn().mockResolvedValue("Custom result");
    const wrappedOperation = withToastError(successfulOperation, {
      successMessage: (result) => `Operation completed with: ${result}`,
      errorMessage: (error) => `Failed with: ${error.message}`,
    });

    await act(async () => {
      await wrappedOperation();
    });

    expect(toast.toasts[0].message).toBe("Operation completed with: Custom result");
  });
});

describe("useToastWithDefaults", () => {
  it("should apply default options to all toast methods", () => {
    const { result } = renderHook(
      () =>
        useToastWithDefaults({
          position: "bottom-left",
          variant: "outlined",
          duration: 8000,
        }),
      { wrapper: TestWrapper },
    );

    const toast = result.current;

    act(() => {
      toast.success("Success with defaults");
    });

    expect(toast.toasts).toHaveLength(1);
    expect(toast.toasts[0].position).toBe("bottom-left");
    expect(toast.toasts[0].variant).toBe("outlined");
    expect(toast.toasts[0].duration).toBe(8000);
  });

  it("should allow overriding default options", () => {
    const { result } = renderHook(
      () =>
        useToastWithDefaults({
          position: "bottom-left",
          duration: 8000,
        }),
      { wrapper: TestWrapper },
    );

    const toast = result.current;

    act(() => {
      toast.success("Success with override", {
        position: "top-center",
        duration: 2000,
      });
    });

    expect(toast.toasts[0].position).toBe("top-center");
    expect(toast.toasts[0].duration).toBe(2000);
  });
});
