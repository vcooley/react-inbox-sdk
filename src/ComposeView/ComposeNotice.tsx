import { createContext, useContext, useRef } from "react";
import { ComposeNoticeView } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";

type ComposeNoticeProps = {
  children: React.ReactNode;
  orderHint?: number;
};

type ComposeNoticeContextValue = {
  composeNotice: ComposeNoticeView | null;
};

const ComposeNoticeContext = createContext<ComposeNoticeContextValue>({
  composeNotice: null,
});

export const useComposeNotice = () => useContext(ComposeNoticeContext);

function ComposeNotice(props: ComposeNoticeProps) {
  const composeView = useComposeView();
  const composeNoticeRef = useRef<ComposeNoticeView | null>(null);
  const didInit = useRef<boolean>(false);

  const { children, ...composeNoticeDescriptor } = props;

  if (!didInit.current) {
    didInit.current = true;

    if (!composeView) {
      console.error("ComposeNotice must be wrapped in a ComposeView.");
      return;
    }

    const composeNotice = composeView.addComposeNotice(composeNoticeDescriptor);
    composeNotice.on("destroy", () => {
      composeNoticeRef.current = null;
    });
  }

  return (
    <ComposeNoticeContext.Provider
      value={{ composeNotice: composeNoticeRef.current }}
    >
      {children}
    </ComposeNoticeContext.Provider>
  );
}

export default ComposeNotice;
