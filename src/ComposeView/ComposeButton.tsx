import { Ref, createContext, useContext, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ComposeButtonDescriptor } from "@inboxsdk/core";
import ComposeButtonView from "@inboxsdk/core/src/platform-implementation-js/views/compose-button-view";

import { useComposeView } from "./useComposeView";
import { makeHash } from "../utils/makeHash";

type ComposeButtonProps = {
  children: React.ReactNode;
  composeButtonDescriptor: ComposeButtonDescriptor;
};

type ComposeButtonContextValue = {
  elementRef: Ref<HTMLElement> | null;
  view: ComposeButtonView | null;
};

const ComposeButtonContext = createContext<ComposeButtonContextValue>({
  elementRef: null,
  view: null,
});

export const useComposeButton = () => useContext(ComposeButtonContext);

function createClassHash() {
  return "inbox-react-" + makeHash(8);
}

function ComposeButton(props: ComposeButtonProps) {
  const { view: composeView } = useComposeView();
  const composeButtonRef = useRef<ComposeButtonView | null>(null);
  const composeButtonNodeRef = useRef<HTMLElement | null>(null);
  const didInit = useRef<boolean>(false);

  const { children, composeButtonDescriptor } = props;

  if (!didInit.current) {
    didInit.current = true;

    if (!composeView) {
      console.error("ComposeButton must be wrapped in a ComposeView.");
      return;
    }

    // InboxSDK doesn't expose a handle to the HTML element backing the button, so we need to
    // create a unique class name and query the DOM for it
    const { iconClass } = composeButtonDescriptor;
    const classHash = createClassHash();
    const className = iconClass ? classHash + " " + iconClass : classHash;

    composeButtonRef.current = composeView.addButton({
      ...composeButtonDescriptor,
      iconClass: className,
    });
    composeButtonNodeRef.current = document.querySelector(`.${className}`);

    if (!composeButtonNodeRef.current) {
      console.error("Couldn't find a compose button to attach to.");
    }

    composeButtonRef.current.on("destroy", () => {
      composeButtonRef.current = null;
      composeButtonNodeRef.current = null;
    });
  }

  const contextValue: ComposeButtonContextValue = useMemo(
    () => ({
      elementRef: composeButtonNodeRef,
      view: composeButtonRef.current,
    }),
    [],
  );

  return (
    <ComposeButtonContext.Provider value={contextValue}>
      {composeButtonNodeRef.current &&
        createPortal(children, composeButtonNodeRef.current)}
    </ComposeButtonContext.Provider>
  );
}

export default ComposeButton;
