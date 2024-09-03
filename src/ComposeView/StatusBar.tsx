import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StatusBarView, StatusBarDescriptor } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";

type ComposeStatusBarProps = {
  children: React.ReactNode;
  options?: StatusBarDescriptor;
};

type ComposeStatusBarContextValue = {
  view: StatusBarView | null;
};

const StatusBarContext = createContext<ComposeStatusBarContextValue>({
  view: null,
});

export const useStatusBar = () => useContext(StatusBarContext);

function StatusBar({ children, options }: ComposeStatusBarProps) {
  const { view: composeView } = useComposeView();
  const [statusBar, setStatusBar] = useState<StatusBarView | null>(null);

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeStatusBar must be wrapped in a ComposeView.");
      return;
    }

    const statusBar = composeView.addStatusBar(options);
    statusBar.on("destroy", () => {
      setStatusBar(null);
    });
    return () => statusBar.destroy();
  }, []);

  return (
    <StatusBarContext.Provider value={{ view: statusBar }}>
      {statusBar && createPortal(children, statusBar.el)}
    </StatusBarContext.Provider>
  );
}

export default StatusBar;
