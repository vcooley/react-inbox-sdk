import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ComposeNoticeView } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";
import { usePrimitiveOptionsStream } from "../utils/usePrimitiveOptionsStream";

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
    null
  );
  const { children, options = {} } = props;

  const { streamRef, emitterRef } = usePrimitiveOptionsStream(options);

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeNotice must be wrapped in a ComposeView.");
      return;
    }

    if (!streamRef.current) {
      console.error(
        "Missing options stream. Was this component cleaned up already?"
      );
      return;
    }

    const notice = composeView.addComposeNotice(streamRef.current as any);
    setComposeNotice(notice);
    // emitterRef.current?.emit(options);

    notice.on("destroy", () => {
      emitterRef.current?.end();
      setComposeNotice(null);
    });

    return () => {
      notice.destroy();
      emitterRef.current?.end();
    };
  }, [composeView]);

  return (
    <ComposeNoticeContext.Provider value={{ view: composeNotice }}>
      {composeNotice && createPortal(children, composeNotice.el)}
    </ComposeNoticeContext.Provider>
  );
}

export default ComposeNotice;
