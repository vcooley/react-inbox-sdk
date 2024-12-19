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

function isPrimitive(value: unknown): boolean {
  return (
    value === null ||
    ["string", "number", "boolean", "undefined"].includes(typeof value)
  );
}

function areOptionsPrimitiveValuesEqual(a: object, b: object): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => {
    const aValue = a[key as keyof typeof a];
    const bValue = b[key as keyof typeof b];

    if (!isPrimitive(aValue) || !isPrimitive(bValue)) return true;
    return aValue === bValue;
  });
}

function ComposeButton({ options, children }: ComposeButtonProps) {
  // We need to use a ref here because the click handler passed to the SDK does not receive any updates
  // on subsequent renders and referencing the props directly would cause it to have a stale reference.
  const handleClick = useRef(options.onClick);
  if (options.onClick !== handleClick.current) {
    handleClick.current = options.onClick;
  }

  const { view: composeView } = useComposeView();
  const composeButtonRef = useRef<ComposeButtonView | null>(null);
  const [composeButtonElement, setComposeButtonElement] =
    useState<HTMLDivElement | null>(null);

  // Create a stable stream that will live for the component's lifetime
  const optionsStreamRef = useRef<Stream<
    ComposeButtonDescriptor,
    never
  > | null>(null);
  const emitOptionsRef = useRef<
    ((value: ComposeButtonDescriptor) => void) | null
  >(null);

  const optionsPrimitivesRef = useRef(options);
  if (!areOptionsPrimitiveValuesEqual(options, optionsPrimitivesRef.current)) {
    optionsPrimitivesRef.current = options;
  }

  // Initialize the stream once
  if (!optionsStreamRef.current) {
    optionsStreamRef.current = Kefir.stream<ComposeButtonDescriptor, never>(
      (emitter) => {
        emitOptionsRef.current = (value) => emitter.emit(value);
        return () => {
          emitOptionsRef.current = null;
          optionsStreamRef.current = null;
        };
      }
    );
  }

  // Emit new options when they change
  useEffect(() => {
    emitOptionsRef.current?.(optionsPrimitivesRef.current);
  }, [optionsPrimitivesRef.current]);

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeButton must be wrapped in a ComposeView.");
      return;
    }

    if (!optionsStreamRef.current) {
      console.error(
        "Missing options stream. Was this component cleaned up already?"
      );
      return;
    }

    // InboxSDK doesn't expose a handle to the HTML element backing the button, so we need to
    // create a unique class name and query the DOM for it
    const classHash = createClassHash();

    // Create a stream that combines the options with our stable className and click handler
    const buttonStream = optionsStreamRef.current.map((options) => ({
      ...options,
      onClick: ((e) =>
        handleClick.current?.(e)) satisfies ComposeButtonDescriptor["onClick"],
      iconClass: options.iconClass
        ? `${classHash} ${options.iconClass}`
        : classHash,
    }));

    composeButtonRef.current = composeView.addButton(buttonStream);
    // For some reason, the button needs to be fully registered before it will listen to emitted
    // values. Emitting synchronously in the stream callback will not work correctly.
    emitOptionsRef.current?.(optionsPrimitivesRef.current);

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
