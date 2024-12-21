import { useEffect, useRef } from "react";
import Kefir from "kefir";
import type { Stream } from "kefir";
import { arePrimitiveValuesEqual } from "./primitiveUtils";

/**
 * A hook that creates a Kefir stream for managing options with primitive value comparison.
 * Useful for optimizing re-renders when only primitive values in options change.
 */
export function usePrimitiveOptionsStream<T extends object>(options: T) {
  // Create a stable stream that will live for the component's lifetime
  const streamRef = useRef<Stream<T, never> | null>(null);
  const emitOptionsRef = useRef<((value: T) => void) | null>(null);

  // Track primitive values in options
  const optionsPrimitivesRef = useRef(options);
  if (!arePrimitiveValuesEqual(options, optionsPrimitivesRef.current)) {
    optionsPrimitivesRef.current = options;
  }

  // Initialize the stream once
  if (!streamRef.current) {
    streamRef.current = Kefir.stream<T, never>((emitter) => {
      emitOptionsRef.current = (value) => emitter.emit(value);
      return () => {
        emitOptionsRef.current = null;
        streamRef.current = null;
      };
    });
  }

  // Emit new options when they change
  useEffect(() => {
    emitOptionsRef.current?.(optionsPrimitivesRef.current);
  }, [optionsPrimitivesRef.current]);

  return {
    streamRef,
    emitOptionsRef,
  };
}
