import { createContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ContentPanelDescriptor, ContentPanelView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";
import { usePrimitiveOptionsStream } from "../../utils/usePrimitiveOptionsStream";

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
  // In order to ensure a clean API with a stable element reference, we're not exposing the wrapper
  // element directly, and instead providing it within this component.
  options?: Omit<ContentPanelDescriptor, "el">;
};

function SidebarContentPanel({
  children,
  options = {},
}: SidebarContentPanelProps) {
  const { view: threadView } = useThreadView();
  const sidebarContentPanelRef = useRef<ContentPanelView | null>(null);
  const containerElementRef = useRef<HTMLElement | null>(null);

  const { streamRef, end } = usePrimitiveOptionsStream(options);

  useEffect(() => {
    if (!threadView) {
      console.error("SidebarContentPanel must be wrapped in a ThreadView.");
      return;
    }

    if (!streamRef.current) {
      console.error(
        "Missing options stream. Was this component cleaned up already?"
      );
      return;
    }

    const el = document.createElement("div");
    containerElementRef.current = el;

    const panelStream = streamRef.current.map((options) => ({
      ...options,
      el,
    }));

    sidebarContentPanelRef.current =
      threadView.addSidebarContentPanel(panelStream);

    sidebarContentPanelRef.current.on("destroy", () => {
      end();
      sidebarContentPanelRef.current = null;
      containerElementRef.current = null;
    });

    return () => {
      end();
      sidebarContentPanelRef.current?.remove();
    };
  }, [threadView]);

  return (
    containerElementRef.current &&
    sidebarContentPanelRef.current && (
      <SidebarContentPanelContext.Provider
        value={{
          view: sidebarContentPanelRef.current,
          containerElement: containerElementRef.current,
        }}
      >
        {createPortal(children, containerElementRef.current)}
      </SidebarContentPanelContext.Provider>
    )
  );
}

export default SidebarContentPanel;
