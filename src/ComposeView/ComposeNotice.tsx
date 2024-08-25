import { createContext, useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ComposeNoticeView } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";

type ComposeNoticeProps = {
  children: React.ReactNode;
  composeNoticeDescriptor?: { orderHint?: number };
};

type ComposeNoticeContextValue = {
  view: ComposeNoticeView | null;
};

const ComposeNoticeContext = createContext<ComposeNoticeContextValue>({
  view: null,
});

export const useComposeNotice = () => useContext(ComposeNoticeContext);

function ComposeNotice(props: ComposeNoticeProps) {
  const { view: composeView } = useComposeView();
  const composeNoticeRef = useRef<ComposeNoticeView | null>(null);

  const { children, composeNoticeDescriptor } = props;

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeNotice must be wrapped in a ComposeView.");
      return;
    }

    const composeNotice = composeView.addComposeNotice(composeNoticeDescriptor);
    composeNotice.on("destroy", () => {
      composeNoticeRef.current = null;
    });
    return () => composeNotice.destroy();
  }, []);

  return (
    <ComposeNoticeContext.Provider value={{ view: composeNoticeRef.current }}>
      {composeNoticeRef.current &&
        createPortal(children, composeNoticeRef.current?.el)}
    </ComposeNoticeContext.Provider>
  );
}

export default ComposeNotice;
