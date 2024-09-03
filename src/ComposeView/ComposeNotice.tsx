import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ComposeNoticeView } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";

type ComposeNoticeProps = {
  children: React.ReactNode;
  options?: { orderHint?: number };
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
    null,
  );

  const { children, options: composeNoticeDescriptor } = props;

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeNotice must be wrapped in a ComposeView.");
      return;
    }

    const composeNotice = composeView.addComposeNotice(composeNoticeDescriptor);
    setComposeNotice(composeNotice);
    composeNotice.on("destroy", () => {
      setComposeNotice(null);
    });
    return () => composeNotice.destroy();
  }, []);

  return (
    <ComposeNoticeContext.Provider value={{ view: composeNotice }}>
      {composeNotice && createPortal(children, composeNotice.el)}
    </ComposeNoticeContext.Provider>
  );
}

export default ComposeNotice;
