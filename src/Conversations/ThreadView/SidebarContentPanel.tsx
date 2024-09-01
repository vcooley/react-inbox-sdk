import { createContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ContentPanelDescriptor, ContentPanelView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

type SidebarContentPanelContextValue = {
  view: ContentPanelView | null;
  containerElement: HTMLElement | null;
};

const SidebarContentPanelContext =
  createContext<SidebarContentPanelContextValue>({
    view: null,
    containerElement: null,
  });

type SidebarContentPanelProps = {
  children: React.ReactNode;
  contentPanelDescriptor?: Omit<ContentPanelDescriptor, "el"> & {
    /**
     * An element may be provided in the descriptor (which is required by the underlying SDK). If it's not provided, an empty div will be created instead.
     */
    el?: ContentPanelDescriptor["el"];
  };
};

function SidebarContentPanel({
  children,
  contentPanelDescriptor,
}: SidebarContentPanelProps) {
  const { view: threadView } = useThreadView();
  const sidebarContentPanelRef = useRef<ContentPanelView | null>(null);
  const [containerElement, setContainerElement] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    if (!threadView) {
      console.error("SidebarContentPanel must be wrapped in a ThreadView.");
      return;
    }

    const { el = document.createElement("div") } = contentPanelDescriptor ?? {};
    setContainerElement(el);

    sidebarContentPanelRef.current = threadView.addSidebarContentPanel({
      ...contentPanelDescriptor,
      el,
    });
    sidebarContentPanelRef.current.on("destroy", () => {
      sidebarContentPanelRef.current = null;
    });

    // NOTE: Inconsistency here. The view does not have a destroy event to call when an unmount
    // occurs. There is potentially a memory leak here as we can't tell the SDK to release the
    // sidebar content panel. Is it safe to remove it from the DOM ourselves?
    () => {
      setContainerElement(null);
      sidebarContentPanelRef.current = null;
    };
  }, []);

  return (
    containerElement &&
    sidebarContentPanelRef.current && (
      <SidebarContentPanelContext.Provider
        value={{
          view: sidebarContentPanelRef.current,
          containerElement: containerElement,
        }}
      >
        {sidebarContentPanelRef.current &&
          createPortal(children, containerElement)}
      </SidebarContentPanelContext.Provider>
    )
  );
}

export default SidebarContentPanel;
