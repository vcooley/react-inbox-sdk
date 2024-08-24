import { createContext, useRef } from "react";
import { SimpleElementView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

const NoticeBarContext = createContext<SimpleElementView | null>(null);

function NoticeBar({ children }: { children: React.ReactNode }) {
  const threadView = useThreadView();
  const didInit = useRef<boolean>(false);
  const noticeBarRef = useRef<SimpleElementView | null>(null);

  if (!didInit.current) {
    didInit.current = true;

    if (!threadView) {
      console.error("NoticeBar must be wrapped in a ThreadView.");
      return;
    }

    noticeBarRef.current = threadView.addNoticeBar();
  }

  return (
    <NoticeBarContext.Provider value={noticeBarRef.current}>
      {children}
    </NoticeBarContext.Provider>
  );
}

export default NoticeBar;
