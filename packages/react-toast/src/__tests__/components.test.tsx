import React, { ReactNode } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ToastProvider } from "../context";
import { ToastContainer, Toaster } from "../components";
import { useToast } from "../useToast";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
});

// Test component that uses toast
function TestToastComponent() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success("Success toast")}>Show Success</button>
      <button onClick={() => toast.error("Error toast")}>Show Error</button>
      <button onClick={() => toast.info("Info toast", { position: "bottom-center" })}>Show Info Bottom</button>
      <button
        onClick={() =>
          toast.custom("Custom toast", {
            type: "warning",
            action: { label: "Action", onClick: () => {} },
            dismissible: true,
          })
        }
      >
        Show Custom
      </button>
      <button onClick={() => toast.dismissAll()}>Dismiss All</button>
    </div>
  );
}

describe("ToastContainer", () => {
  it("should render nothing when no toasts", () => {
    render(
      <ToastProvider>
        <ToastContainer position="top-right" />
      </ToastProvider>,
    );

    // Container should not be in DOM when empty
    expect(screen.queryByLabelText("Notificaciones top-right")).not.toBeInTheDocument();
  });

  it("should render toasts for specific position", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <ToastContainer position="top-right" />
        <ToastContainer position="bottom-center" />
      </ToastProvider>,
    );

    const successButton = screen.getByText("Show Success");
    const infoButtomButton = screen.getByText("Show Info Bottom");

    // Show success toast (default position: top-right)
    fireEvent.click(successButton);

    // Show info toast at bottom-center
    fireEvent.click(infoButtomButton);

    // Should have containers for both positions
    expect(screen.getByLabelText("Notificaciones top-right")).toBeInTheDocument();
    expect(screen.getByLabelText("Notificaciones bottom-center")).toBeInTheDocument();

    // Check toast content
    expect(screen.getByText("Success toast")).toBeInTheDocument();
    expect(screen.getByText("Info toast")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <ToastContainer position="top-right" className="custom-toasts" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Success"));

    const container = screen.getByLabelText("Notificaciones top-right");
    expect(container).toHaveClass("custom-toasts");
  });

  it("should handle toast dismissal", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <ToastContainer position="top-right" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Custom"));

    // Toast should be visible
    expect(screen.getByText("Custom toast")).toBeInTheDocument();

    // Find and click dismiss button
    const dismissButton = screen.getByLabelText("Cerrar notificación");
    fireEvent.click(dismissButton);

    // Wait for removal animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("Custom toast")).not.toBeInTheDocument();
  });

  it("should show action buttons", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <ToastContainer position="top-right" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Custom"));

    // Action button should be present
    const actionButton = screen.getByText("Action");
    expect(actionButton).toBeInTheDocument();
    expect(actionButton.tagName).toBe("BUTTON");
  });

  it("should show appropriate icons for toast types", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <ToastContainer position="top-right" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Success"));
    fireEvent.click(screen.getByText("Show Error"));

    // Icons are rendered as text content, check they're present
    expect(screen.getByText("✓")).toBeInTheDocument(); // Success icon
    expect(screen.getByText("✕")).toBeInTheDocument(); // Error icon (both close button and icon)
  });

  it("should auto-dismiss toasts after duration", () => {
    render(
      <ToastProvider config={{ defaultDuration: 1000 }}>
        <TestToastComponent />
        <ToastContainer position="top-right" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Success"));

    expect(screen.getByText("Success toast")).toBeInTheDocument();

    // Advance time by duration
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Wait for removal animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("Success toast")).not.toBeInTheDocument();
  });

  it("should handle multiple toasts correctly", () => {
    render(
      <ToastProvider config={{ maxToasts: 3 }}>
        <TestToastComponent />
        <ToastContainer position="top-right" />
      </ToastProvider>,
    );

    // Create multiple toasts
    fireEvent.click(screen.getByText("Show Success"));
    fireEvent.click(screen.getByText("Show Error"));
    fireEvent.click(screen.getByText("Show Success"));

    expect(screen.getAllByText("Success toast")).toHaveLength(2);
    expect(screen.getByText("Error toast")).toBeInTheDocument();
  });

  it("should dismiss all toasts", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <ToastContainer position="top-right" />
      </ToastProvider>,
    );

    // Create multiple toasts
    fireEvent.click(screen.getByText("Show Success"));
    fireEvent.click(screen.getByText("Show Error"));

    expect(screen.getByText("Success toast")).toBeInTheDocument();
    expect(screen.getByText("Error toast")).toBeInTheDocument();

    // Dismiss all
    fireEvent.click(screen.getByText("Dismiss All"));

    expect(screen.queryByText("Success toast")).not.toBeInTheDocument();
    expect(screen.queryByText("Error toast")).not.toBeInTheDocument();
  });
});

describe("Toaster", () => {
  it("should automatically render containers for all positions", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <Toaster />
      </ToastProvider>,
    );

    // Initially no containers should be rendered
    expect(screen.queryByLabelText(/Notificaciones/)).not.toBeInTheDocument();

    // Show toasts at different positions
    fireEvent.click(screen.getByText("Show Success")); // top-right
    fireEvent.click(screen.getByText("Show Info Bottom")); // bottom-center

    // Should have containers for both positions
    expect(screen.getByLabelText("Notificaciones top-right")).toBeInTheDocument();
    expect(screen.getByLabelText("Notificaciones bottom-center")).toBeInTheDocument();
  });

  it("should apply className to all containers", () => {
    render(
      <ToastProvider>
        <TestToastComponent />
        <Toaster className="global-toasts" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Success"));

    const container = screen.getByLabelText("Notificaciones top-right");
    expect(container).toHaveClass("global-toasts");
  });

  it("should handle complex toast scenarios", () => {
    function ComplexTestComponent() {
      const toast = useToast();

      return (
        <div>
          <button
            onClick={() => {
              toast.success("Success 1", { position: "top-left" });
              toast.error("Error 1", { position: "top-right" });
              toast.warning("Warning 1", { position: "bottom-left" });
              toast.info("Info 1", { position: "bottom-right" });
            }}
          >
            Show Multiple Positions
          </button>
        </div>
      );
    }

    render(
      <ToastProvider>
        <ComplexTestComponent />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Multiple Positions"));

    // Should have 4 different containers
    expect(screen.getByLabelText("Notificaciones top-left")).toBeInTheDocument();
    expect(screen.getByLabelText("Notificaciones top-right")).toBeInTheDocument();
    expect(screen.getByLabelText("Notificaciones bottom-left")).toBeInTheDocument();
    expect(screen.getByLabelText("Notificaciones bottom-right")).toBeInTheDocument();

    // Check all toasts are present
    expect(screen.getByText("Success 1")).toBeInTheDocument();
    expect(screen.getByText("Error 1")).toBeInTheDocument();
    expect(screen.getByText("Warning 1")).toBeInTheDocument();
    expect(screen.getByText("Info 1")).toBeInTheDocument();
  });
});

describe("Toast variants and styling", () => {
  it("should apply different variants correctly", () => {
    function VariantTestComponent() {
      const toast = useToast();

      return (
        <div>
          <button onClick={() => toast.success("Filled", { variant: "filled" })}>Filled</button>
          <button onClick={() => toast.success("Outlined", { variant: "outlined" })}>Outlined</button>
          <button onClick={() => toast.success("Minimal", { variant: "minimal" })}>Minimal</button>
        </div>
      );
    }

    render(
      <ToastProvider>
        <VariantTestComponent />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Filled"));
    fireEvent.click(screen.getByText("Outlined"));
    fireEvent.click(screen.getByText("Minimal"));

    // All should be rendered (we can't easily test CSS styles in jsdom)
    expect(screen.getAllByText("Filled")).toHaveLength(1);
    expect(screen.getAllByText("Outlined")).toHaveLength(1);
    expect(screen.getAllByText("Minimal")).toHaveLength(1);
  });

  it("should handle custom icons", () => {
    function CustomIconComponent() {
      const toast = useToast();

      return <button onClick={() => toast.success("Custom icon", { icon: "🎉" })}>Custom Icon</button>;
    }

    render(
      <ToastProvider>
        <CustomIconComponent />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Custom Icon"));

    expect(screen.getByText("🎉")).toBeInTheDocument();
    expect(screen.getByText("Custom icon")).toBeInTheDocument();
  });

  it("should handle JSX content", () => {
    function JSXContentComponent() {
      const toast = useToast();

      return (
        <button
          onClick={() =>
            toast.success(
              <div>
                <strong>Bold text</strong>
                <span> and normal text</span>
              </div>,
            )
          }
        >
          JSX Content
        </button>
      );
    }

    render(
      <ToastProvider>
        <JSXContentComponent />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("JSX Content"));

    expect(screen.getByText("Bold text")).toBeInTheDocument();
    expect(screen.getByText("and normal text")).toBeInTheDocument();
  });

  it("should show loading animation for loading type", () => {
    function LoadingComponent() {
      const toast = useToast();

      return <button onClick={() => toast.loading("Loading...")}>Show Loading</button>;
    }

    render(
      <ToastProvider>
        <LoadingComponent />
        <Toaster />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByText("Show Loading"));

    expect(screen.getByText("⟳")).toBeInTheDocument(); // Loading icon
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
