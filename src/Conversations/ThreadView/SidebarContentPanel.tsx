import { createContext, useRef } from "react";
import { createPortal } from "react-dom";
import { ContentPanelDescriptor, ContentPanelView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

type SidebarContentPanelContextValue = { view: ContentPanelView | null };

const SidebarContentPanelContext =
  createContext<SidebarContentPanelContextValue>({
    view: null,
  });

type SidebarContentPanelProps = {
  children: React.ReactNode;
  contentPanelDescriptor: ContentPanelDescriptor;
};

function SidebarContentPanel({
  children,
  contentPanelDescriptor,
}: SidebarContentPanelProps) {
  const { view: threadView } = useThreadView();
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
    <SidebarContentPanelContext.Provider
      value={{ view: sidebarContentPanelRef.current }}
    >
      {sidebarContentPanelRef.current &&
        createPortal(children, contentPanelDescriptor.el)}
    </SidebarContentPanelContext.Provider>
  );
}

export default SidebarContentPanel;
