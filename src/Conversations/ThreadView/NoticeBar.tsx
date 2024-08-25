import { createContext, useContext, useEffect, useState } from "react";
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
  const [noticeBar, setNoticeBar] = useState<SimpleElementView | null>(null);

  useEffect(() => {
    if (!threadView) {
      console.error("NoticeBar must be wrapped in a ThreadView.");
      return;
    }

    const noticeBar = threadView.addNoticeBar();
    setNoticeBar(noticeBar);
    noticeBar.on("destroy", () => {
      setNoticeBar(null);
    });

    return () => noticeBar.destroy();
  }, []);

  return (
    <NoticeBarContext.Provider value={{ view: noticeBar }}>
      {noticeBar && createPortal(children, noticeBar.el)}
    </NoticeBarContext.Provider>
  );
}

export default NoticeBar;
