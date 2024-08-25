import { createContext, useContext, useRef } from "react";
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
    <StatusBarContext.Provider value={{ view: statusBarRef.current }}>
      {statusBarRef.current && createPortal(children, statusBarRef.current.el)}
    </StatusBarContext.Provider>
  );
}

export default StatusBar;
