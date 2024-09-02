import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ComposeButtonDescriptor } from "@inboxsdk/core";
import ComposeButtonView from "@inboxsdk/core/src/platform-implementation-js/views/compose-button-view";

import { useComposeView } from "./useComposeView";
import { makeHash } from "../utils/makeHash";

type ComposeButtonProps = {
  children: React.ReactNode;
  onClick: ComposeButtonDescriptor["onClick"] | undefined;
  composeButtonDescriptor?: Omit<ComposeButtonDescriptor, "onClick">;
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

function ComposeButton(props: ComposeButtonProps) {
  // We need to use a ref here because the click handler passed to the SDK does not receive any updates on subsequent renders
  const handleClick = useRef(props.onClick);
  useEffect(() => {
    handleClick.current = (e) => props.onClick?.(e);
  }, [props.onClick]);

  const { view: composeView } = useComposeView();
  const composeButtonRef = useRef<ComposeButtonView | null>(null);
  const [composeButtonElement, setComposeButtonElement] =
    useState<HTMLDivElement | null>(null);

  const { children, composeButtonDescriptor } = props;

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeButton must be wrapped in a ComposeView.");
      return;
    }

    // InboxSDK doesn't expose a handle to the HTML element backing the button, so we need to
    // create a unique class name and query the DOM for it
    const { iconClass } = composeButtonDescriptor ?? {};
    const classHash = createClassHash();
    const className = iconClass ? classHash + " " + iconClass : classHash;

    composeButtonRef.current = composeView.addButton({
      ...composeButtonDescriptor,
      onClick: (e) => handleClick.current?.(e),
      iconClass: className,
    });

    const buttonElement = document.querySelector<HTMLDivElement>(
      `.${className}`,
    );

    if (!buttonElement) {
      console.error("Couldn't find a compose button to attach to.");
      return;
    }

    console.log(composeButtonRef.current);
    setComposeButtonElement(buttonElement);

    composeButtonRef.current.on("destroy", () => {
      composeButtonRef.current = null;
      setComposeButtonElement(null);
    });

    // NOTE: Inconsistency here. The view does not have a destroy event to call when an unmount occurs.
  }, []);

  const contextValue: ComposeButtonContextValue = useMemo(
    () => ({
      buttonElement: composeButtonElement,
      view: composeButtonRef.current,
    }),
    [],
  );

  return (
    <ComposeButtonContext.Provider value={contextValue}>
      {composeButtonElement && createPortal(children, composeButtonElement)}
    </ComposeButtonContext.Provider>
  );
}

export default ComposeButton;
