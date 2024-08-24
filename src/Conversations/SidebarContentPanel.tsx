import { createContext, useRef } from "react";
import { ContentPanelDescriptor, ContentPanelView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

const SidebarContentPanelContext = createContext<ContentPanelView | null>(null);
type SidebarContentPanelProps = ContentPanelDescriptor & {
  children: React.ReactNode;
};

function SidebarContentPanel({
  children,
  ...contentPanelDescriptor
}: SidebarContentPanelProps) {
  const threadView = useThreadView();
  const didInit = useRef<boolean>(false);
  const sidebarContentPanelRef = useRef<ContentPanelView | null>(null);

  if (!didInit.current) {
    didInit.current = true;

    if (!threadView) {
      console.error("SidebarContentPanel must be wrapped in a ThreadView.");
      return;
    }

    sidebarContentPanelRef.current = threadView.addSidebarContentPanel(
      contentPanelDescriptor,
    );
    sidebarContentPanelRef.current.on("destroy", () => {
      sidebarContentPanelRef.current = null;
    });
  }

  return (
    <SidebarContentPanelContext.Provider value={sidebarContentPanelRef.current}>
      {children}
    </SidebarContentPanelContext.Provider>
  );
}

export default SidebarContentPanel;
