import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ComposeButtonDescriptor } from "@inboxsdk/core";
import ComposeButtonView from "@inboxsdk/core/src/platform-implementation-js/views/compose-button-view";
import Kefir from "kefir";
import type { Stream, Emitter } from "kefir";

import { useComposeView } from "./useComposeView";
import { makeHash } from "../utils/makeHash";
import { arePrimitiveValuesEqual } from "../utils/primitiveUtils";

type ComposeButtonProps = {
  children?: React.ReactNode;
  options: ComposeButtonDescriptor;
};

type ComposeButtonContextValue = {
  buttonElement: HTMLDivElement | null;
  view: ComposeButtonView | null;
};

const ComposeButtonContext = createContext<ComposeButtonContextValue>({
  buttonElement: null,
  view: null,
});

export const useComposeButton = () => useContext(ComposeButtonContext);

function createClassHash() {
  return "inbox-react-" + makeHash(8);
}

/**
 * Provides a stream given an options object. This stream will only emit new values when its primitive
 * values change. Non-primitive values should be handled at a higher level.
 *
 * @see {ComposeButton} for an example with a non-primitive click handler.
 *
 */
function usePrimitiveOptionsStream<T extends object>(options: T) {
  // Create a stable stream that will live for the component's lifetime
  const optionsStreamRef = useRef<Stream<T, never> | null>(null);
  const emitOptionsRef = useRef<((value: T) => void) | null>(null);

  // Track primitive values in options
  const optionsPrimitivesRef = useRef(options);
  if (!arePrimitiveValuesEqual(options, optionsPrimitivesRef.current)) {
    optionsPrimitivesRef.current = options;
  }

  // Initialize the stream once
  if (!optionsStreamRef.current) {
    optionsStreamRef.current = Kefir.stream<T, never>((emitter) => {
      emitOptionsRef.current = (value) => emitter.emit(value);
      return () => {
        emitOptionsRef.current = null;
        optionsStreamRef.current = null;
      };
    });
  }

  // Emit new options when they change
  useEffect(() => {
    emitOptionsRef.current?.(optionsPrimitivesRef.current);
  }, [optionsPrimitivesRef.current]);

  return {
    streamRef: optionsStreamRef,
    emitOptionsRef: emitOptionsRef,
  };
}

function ComposeButton({ options, children }: ComposeButtonProps) {
  // We need to use a ref here because the click handler passed to the SDK does not receive any updates
  // on subsequent renders and referencing the props directly would cause it to have a stale reference.

  const { view: composeView } = useComposeView();
  const composeButtonRef = useRef<ComposeButtonView | null>(null);
  const [composeButtonElement, setComposeButtonElement] =
    useState<HTMLDivElement | null>(null);

  const { streamRef, emitOptionsRef } = usePrimitiveOptionsStream(options);

  const handleClickRef = useRef(options.onClick);
  if (handleClickRef.current !== options.onClick) {
    handleClickRef.current = options.onClick;
  }

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeButton must be wrapped in a ComposeView.");
      return;
    }

    if (!streamRef.current) {
      console.error(
        "Missing options stream. Was this component cleaned up already?"
      );
      return;
    }

    // InboxSDK doesn't expose a handle to the HTML element backing the button, so we need to
    // create a unique class name and query the DOM for it
    const classHash = createClassHash();

    // Create a stream that combines the options with our stable className and click handler
    const buttonStream = streamRef.current.map((options) => ({
      ...options,
      onClick: ((e) =>
        handleClickRef.current?.(
          e
        )) satisfies ComposeButtonDescriptor["onClick"],
      iconClass: options.iconClass
        ? `${classHash} ${options.iconClass}`
        : classHash,
    }));

    composeButtonRef.current = composeView.addButton(buttonStream);
    // For some reason, the button needs to be fully registered before it will listen to emitted
    // values. Emitting synchronously in the stream callback will not work correctly.
    emitOptionsRef.current?.(options);

    const buttonElement = document.querySelector<HTMLDivElement>(
      `.${classHash}`
    );
    if (!buttonElement) {
      console.error("Couldn't find a compose button to attach to.");
      return;
    }
    setComposeButtonElement(buttonElement);

    composeButtonRef.current.on("destroy", () => {
      composeButtonRef.current = null;
      setComposeButtonElement(null);
    });

    // NOTE: Inconsistency here. The view does not have a destroy event to call when an unmount occurs.
    // We will try to call destroy anyway so that if the API is added in the future, we're covered.
    return () => {
      if (composeButtonRef.current) {
        // @ts-expect-error -- see comment above
        composeButtonRef.current?.destroy?.();
      }
    };
  }, []);

  const contextValue: ComposeButtonContextValue = useMemo(
    () => ({
      buttonElement: composeButtonElement,
      view: composeButtonRef.current,
    }),
    [composeButtonElement]
  );

  return (
    <ComposeButtonContext.Provider value={contextValue}>
      {composeButtonElement &&
        children &&
        createPortal(children, composeButtonElement)}
    </ComposeButtonContext.Provider>
  );
}

export default ComposeButton;
