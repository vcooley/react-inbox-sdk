import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ComposeNoticeView } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";

type ComposeNoticeProps = {
  children: React.ReactNode;
  options?: { orderHint?: number; height?: number };
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
  const [composeNotice, setComposeNotice] = useState<ComposeNoticeView | null>(
    null
  );
  const { children, options = {} } = props;

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeNotice must be wrapped in a ComposeView.");
      return;
    }

    const notice = composeView.addComposeNotice(options);
    setComposeNotice(notice);

    notice.on("destroy", () => {
      setComposeNotice(null);
    });

    return () => {
      notice.destroy();
    };
  }, [composeView]);

  return (
    <ComposeNoticeContext.Provider value={{ view: composeNotice }}>
      {composeNotice && createPortal(children, composeNotice.el)}
    </ComposeNoticeContext.Provider>
  );
}

export default ComposeNotice;
