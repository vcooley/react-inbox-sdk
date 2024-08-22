import { createContext, useContext, useRef } from "react";
import { StatusBarView, StatusBarDescriptor } from "@inboxsdk/core";

import { useComposeView } from "./useComposeView";

type ComposeStatusBarProps = StatusBarDescriptor & {
  children: React.ReactNode;
};

type ComposeStatusBarContextValue = {
  statusBar: StatusBarView | null;
};

const StatusBarContext = createContext<ComposeStatusBarContextValue>({
  statusBar: null,
});

export const useStatusBar = () => useContext(StatusBarContext);

function StatusBar(props: ComposeStatusBarProps) {
  const composeView = useComposeView();
  const statusBarRef = useRef<StatusBarView | null>(null);
  const didInit = useRef<boolean>(false);

  const { children, ...statusBarDescriptor } = props;

  if (!didInit.current) {
    didInit.current = true;

    if (!composeView) {
      console.error("ComposeStatusBar must be wrapped in a ComposeView.");
      return;
    }

    const statusBar = composeView.addStatusBar(statusBarDescriptor);
    statusBar.on("destroy", () => {
      statusBarRef.current = null;
    });
  }

  return (
    <StatusBarContext.Provider value={{ statusBar: statusBarRef.current }}>
      {children}
    </StatusBarContext.Provider>
  );
}

export default StatusBar;
