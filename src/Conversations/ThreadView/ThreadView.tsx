import { ReactNode, useEffect, useState } from "react";
import { ThreadView as SDKThreadView } from "@inboxsdk/core";
import { ThreadViewContext } from "./useThreadView";
import { useInboxSDK } from "../../InboxSDK";

export default function ThreadView({ children }: { children: ReactNode }) {
  const sdk = useInboxSDK();
  const [threadView, setThreadView] = useState<SDKThreadView | null>(null);

  useEffect(() => {
    let currentThreadView: SDKThreadView;

    return sdk.Conversations.registerThreadViewHandler((threadView) => {
      if (currentThreadView !== threadView) {
        currentThreadView = threadView;
        setThreadView(threadView);
      }

      threadView.on("destroy", () => {
        if (currentThreadView === threadView) {
          setThreadView(null);
        }
      });
    });
  }, []);

  return (
    threadView && (
      <ThreadViewContext.Provider value={{ view: threadView }}>
        {children}
      </ThreadViewContext.Provider>
    )
  );
}
