import { createContext, useEffect, useRef } from "react";
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

// NOTE: Inconsistency here. The descriptor needs to provide `el` instead of the add method returning an `el` property.
function SidebarContentPanel({
  children,
  contentPanelDescriptor,
}: SidebarContentPanelProps) {
  const { view: threadView } = useThreadView();
  const sidebarContentPanelRef = useRef<ContentPanelView | null>(null);

  useEffect(() => {
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

    // NOTE: Inconsistency here. The view does not have a destroy event to call when an unmount occurs.
  }, []);

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
