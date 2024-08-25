import { createContext, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { SimpleElementView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

type NoticeBarContextValue = { view: SimpleElementView | null };

const NoticeBarContext = createContext<NoticeBarContextValue>({
  view: null,
});

export const useNoticeBar = () => useContext(NoticeBarContext);

function NoticeBar({ children }: { children: React.ReactNode }) {
  const { view: threadView } = useThreadView();
  const didInit = useRef<boolean>(false);
  const noticeBarRef = useRef<SimpleElementView | null>(null);

  if (!didInit.current) {
    didInit.current = true;

    if (!threadView) {
      console.error("NoticeBar must be wrapped in a ThreadView.");
      return;
    }

    noticeBarRef.current = threadView.addNoticeBar();
    noticeBarRef.current.on("destroy", () => {
      noticeBarRef.current = null;
    });
  }

  return (
    <NoticeBarContext.Provider value={{ view: noticeBarRef.current }}>
      {noticeBarRef.current && createPortal(children, noticeBarRef.current?.el)}
    </NoticeBarContext.Provider>
  );
}

export default NoticeBar;
