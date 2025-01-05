import { ReactNode, useEffect, useState } from "react";
import { ThreadView as SDKThreadView } from "@inboxsdk/core";

import { ThreadViewContext } from "./useThreadView";
import { useInboxSDK } from "../../InboxSDK";

export default function ThreadView({ children }: { children: ReactNode }) {
  const sdk = useInboxSDK();
  const [threadView, setThreadView] = useState<SDKThreadView | null>(null);
  // Not ideal, but the most straightforward way to ensure we get the correct children relying on
  // the thread view added to the new thread view is to trigger a re-render via key change when a
  // new thread view is added.
  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    let currentThreadView: SDKThreadView;

    return sdk.Conversations.registerThreadViewHandler((threadView) => {
      if (currentThreadView !== threadView) {
        currentThreadView = threadView;
        setThreadView(threadView);
        setRenderTrigger((current) => current + 1);
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
      <ThreadViewContext.Provider
        key={renderTrigger}
        value={{ view: threadView }}
      >
        {children}
      </ThreadViewContext.Provider>
    )
  );
}
