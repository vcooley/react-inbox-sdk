import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ComposeButtonDescriptor } from "@inboxsdk/core";
import type ComposeButtonView from "@inboxsdk/core/src/platform-implementation-js/views/compose-button-view";

import { useComposeView } from "./useComposeView";
import { makeHash } from "../utils/makeHash";
import { usePrimitiveOptionsStream } from "../utils/usePrimitiveOptionsStream";

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

function ComposeButton({ options, children }: ComposeButtonProps) {
  const { view: composeView } = useComposeView();
  const composeButtonRef = useRef<ComposeButtonView | null>(null);
  const [composeButtonElement, setComposeButtonElement] =
    useState<HTMLDivElement | null>(null);

  const { streamRef, end } =
    usePrimitiveOptionsStream<ComposeButtonDescriptor>(options);

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

    const buttonElement = document.querySelector<HTMLDivElement>(
      `.${classHash}`
    );
    if (!buttonElement) {
      console.error("Couldn't find a compose button to attach to.");
      return;
    }
    setComposeButtonElement(buttonElement);

    composeButtonRef.current.on("destroy", () => {
      end();
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
