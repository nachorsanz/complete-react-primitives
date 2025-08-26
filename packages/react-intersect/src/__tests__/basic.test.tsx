import { describe, it, expect } from "vitest";
import { useInView } from "../useInView";
import { renderHook } from "@testing-library/react";

describe("Basic useInView test", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => useInView());
    const [ref, inView, entry] = result.current;

    expect(typeof ref).toBe("function");
    expect(inView).toBe(false);
    expect(entry).toBe(null);
  });

  it("should accept options", () => {
    const options = { threshold: 0.5 };
    const { result } = renderHook(() => useInView(options));
    const [ref] = result.current;

    expect(typeof ref).toBe("function");
  });
});
