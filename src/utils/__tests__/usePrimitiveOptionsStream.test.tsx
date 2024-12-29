import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePrimitiveOptionsStream } from "../usePrimitiveOptionsStream";

describe("usePrimitiveOptionsStream", () => {
  it("should initialize with a stream and emitter", () => {
    const options = { title: "Test", count: 1 };
    const { result } = renderHook(() => usePrimitiveOptionsStream(options));

    expect(result.current.streamRef.current).toBeDefined();
    expect(result.current.emit).toBeDefined();
    // emitter should be null until there is an observer
    expect(result.current.emitterRef.current).toBeNull();
    result.current.streamRef.current!.observe();
    expect(result.current.emitterRef.current).toBeDefined();
  });

  it("should emit new options when primitive values change", async () => {
    let nextValue = { title: "Initial", count: 1 };
    const { result, rerender, unmount } = renderHook(
      (props) => usePrimitiveOptionsStream(props),
      { initialProps: nextValue }
    );

    let caseCount = 0;
    const promiseCase = new Promise<void>((res, rej) => {
      result.current.streamRef.current!.observe(
        (value) => {
          caseCount++;
          expect(value).toEqual(nextValue);
        },
        rej,
        res
      );
    });

    nextValue = { title: "Updated", count: 2 };
    rerender(nextValue);
    unmount();

    await promiseCase;

    // ensure we tested the correct number of values
    expect(caseCount).toBe(2);
  });

  it("should not emit when non-primitive values change", async () => {
    let nextValue = { title: "Initial", count: 1, onClick: () => {} };
    const { result, rerender, unmount } = renderHook(
      (props) => usePrimitiveOptionsStream(props),
      { initialProps: nextValue }
    );

    let caseCount = 0;
    const promiseCase = new Promise<void>((res, rej) => {
      result.current.streamRef.current!.observe(
        (value) => {
          caseCount++;
          expect(value).toEqual(nextValue);
        },
        rej,
        res
      );
    });

    nextValue = { ...nextValue, onClick: () => {} };
    rerender(nextValue);
    unmount();

    await promiseCase;

    // non-primative only changes shouldn't trigger a new value to be emitted
    expect(caseCount).toBe(1);
  });

  it("should cleanup refs on unmount", () => {
    const options = { title: "Test" };
    const { result, unmount } = renderHook(() =>
      usePrimitiveOptionsStream(options)
    );

    const stream = result.current.streamRef.current;
    stream?.observe();
    const emitter = result.current.emitterRef.current;

    expect(stream).toBeDefined();
    expect(emitter).toBeDefined();

    unmount();

    expect(result.current.streamRef.current).toBeNull();
    expect(result.current.emitterRef.current).toBeNull();
  });
});
