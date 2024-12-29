import { useCallback, useEffect, useRef } from "react";
import Kefir from "kefir";
import type { Emitter, Stream } from "kefir";
import { arePrimitiveValuesEqual, isPrimitive } from "./primitives";

/**
 * A hook that creates a Kefir stream for managing options with primitive value comparison.
 * Useful for optimizing re-renders when only primitive values in options change.
 */
export function usePrimitiveOptionsStream<T extends object>(options: T) {
  const streamRef = useRef<Stream<T, Error> | null>(null);
  const emitterRef = useRef<Emitter<T, Error> | null>(null);
  // primitive options value that we will check for equality in order to emit changes
  const optionsPrimitivesRef = useRef(options);

  const emit = useCallback((options: T) => {
    emitterRef.current?.value(options);
  }, []);
  const error = useCallback((err: Error) => {
    emitterRef.current?.error(err);
  }, []);
  const end = useCallback(() => {
    emitterRef.current?.end();
  }, []);

  // Check the primitive values of the options and emit if they change
  if (!arePrimitiveValuesEqual(options, optionsPrimitivesRef.current)) {
    optionsPrimitivesRef.current = options;
    emit(optionsPrimitivesRef.current);
  }

  useEffect(() => {
    const cleanup = () => {
      end();
      emitterRef.current = null;
      streamRef.current = null;
    };

    if (!streamRef.current) {
      streamRef.current = Kefir.stream<T, Error>((emitter) => {
        emitterRef.current = emitter;
        emit(options);
      });
    }
    return cleanup;
  }, []);

  return {
    streamRef,
    emitterRef,
    emit,
    error,
    end,
  };
}
