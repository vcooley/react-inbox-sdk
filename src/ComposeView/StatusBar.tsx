import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StatusBarView, StatusBarDescriptor } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";

type ComposeStatusBarProps = StatusBarDescriptor & {
  children: React.ReactNode;
};

type ComposeStatusBarContextValue = {
  view: StatusBarView | null;
};

const StatusBarContext = createContext<ComposeStatusBarContextValue>({
  view: null,
});

export const useStatusBar = () => useContext(StatusBarContext);

function StatusBar(props: ComposeStatusBarProps) {
  const { view: composeView } = useComposeView();
  const [statusBar, setStatusBar] = useState<StatusBarView | null>(null);

  const { children, ...statusBarDescriptor } = props;

  useEffect(() => {
    if (!composeView) {
      console.error("ComposeStatusBar must be wrapped in a ComposeView.");
      return;
    }

    const statusBar = composeView.addStatusBar(statusBarDescriptor);
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
