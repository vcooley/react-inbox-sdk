import { Ref, createContext, useMemo, useRef } from "react";
import { ComposeButtonDescriptor } from "@inboxsdk/core";
import ComposeButtonView from "@inboxsdk/core/src/platform-implementation-js/views/compose-button-view";

import { useComposeView } from "./useComposeView";
import { makeHash } from "../utils/makeHash";

type ComposeButtonProps = ComposeButtonDescriptor & {
  children: React.ReactNode;
};

type ComposeButtonContextValue = {
  buttonRef: Ref<HTMLElement> | null;
  composeView: ComposeButtonView | null;
};

const ComposeButtonContext = createContext<ComposeButtonContextValue>({
  buttonRef: null,
  composeView: null,
});

function createClassHash() {
  return "inbox-react-" + makeHash(8);
}

function ComposeButton(props: ComposeButtonProps) {
  const composeView = useComposeView();
  const composeButtonRef = useRef<ComposeButtonView | null>(null);
  const composeButtonNodeRef = useRef<HTMLElement | null>(null);
  const didInit = useRef<boolean>(false);

  const { children, ...composeButtonDescriptor } = props;

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
  }

  const contextValue = useMemo(
    () => ({
      buttonRef: composeButtonNodeRef,
      composeView: composeButtonRef.current,
    }),
    [],
  );

  return (
    <ComposeButtonContext.Provider value={contextValue}>
      {children}
    </ComposeButtonContext.Provider>
  );
}

export default ComposeButton;
