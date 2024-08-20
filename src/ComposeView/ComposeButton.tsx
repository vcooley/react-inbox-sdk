import { createContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ComposeButtonDescriptor } from "@inboxsdk/core";
import ComposeButtonView from "@inboxsdk/core/src/platform-implementation-js/views/compose-button-view";

import { useComposeView } from "./useComposeView";
import { makeHash } from "../utils/makeHash";

type ComposeButtonProps = ComposeButtonDescriptor & {
  children: React.ReactNode;
};

const ComposeButtonContext = createContext<ComposeButtonView | null>(null);

function createClassHash() {
  return "inbox-react-" + makeHash(8);
}

function ComposeButton(props: ComposeButtonProps) {
  const composeView = useComposeView();
  const composeButtonRef = useRef<ComposeButtonView | null>(null);
  const composeButtonNode = useRef<HTMLElement | null>(null);
  const { children, iconClass, ...composeButtonDescriptor } = props;

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeButton must be wrapped in a ComposeView.");
      return;
    }

    // InboxSDK doesn't expose a handle to the HTML element backing the button, so we need to
    // create a unique class name and query the DOM for it
    const classHash = createClassHash();
    const className = iconClass ? classHash + " " + iconClass : classHash;
    composeButtonRef.current = composeView.addButton({
      ...composeButtonDescriptor,
      iconClass: className,
    });
    composeButtonNode.current = document.querySelector(`.${className}`);
  }, []);

  return (
    <ComposeButtonContext.Provider value={composeButtonRef.current}>
      {composeButtonNode.current &&
        createPortal(children, composeButtonNode.current)}
    </ComposeButtonContext.Provider>
  );
}

export default ComposeButton;
