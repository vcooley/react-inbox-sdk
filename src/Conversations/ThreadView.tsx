import { ReactNode, useEffect, useState } from "react";
import { ThreadView as SDKThreadView } from "@inboxsdk/core";
import { ThreadViewContext } from "./useThreadView";
import { useInboxSDK } from "../InboxSDK";

/**
 *  Provides a compose view context to its children. Its children will be rendered once per compose view that is being displayed.
 */
export default function ThreadView({ children }: { children: ReactNode }) {
  const sdk = useInboxSDK();
  const [threadView, setThreadView] = useState<SDKThreadView | null>(null);

  useEffect(
    () =>
      sdk.Conversations.registerThreadViewHandler((composeView) => {
        setThreadView(composeView);
        composeView.on("destroy", () => setThreadView(null));
      }),
    [],
  );

  return (
    threadView && (
      <ThreadViewContext.Provider value={threadView}>
        {children}
      </ThreadViewContext.Provider>
    )
  );
}
