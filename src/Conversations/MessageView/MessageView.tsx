import { ReactNode, useEffect, useState } from "react";
import { MessageView as SDKMessageView } from "@inboxsdk/core";
import { MessageViewContext } from "./useMessageView";
import { useInboxSDK } from "../../InboxSDK";

type MessageViewWrapper = {
  id: number;
  view: SDKMessageView;
};

let sequenceId = 1;

/**
 *  Provides a message view context to its children. Its children will be rendered once per message view that is being displayed.
 */
export default function MessageView({ children }: { children: ReactNode }) {
  const sdk = useInboxSDK();

  const [messageViews, setMessageViews] = useState<MessageViewWrapper[]>([]);

  useEffect(
    () =>
      sdk.Conversations.registerMessageViewHandler((messageView) => {
        const id = sequenceId++;
        setMessageViews((current) => [...current, { id, view: messageView }]);

        messageView.on("destroy", () =>
          setMessageViews((current) =>
            current.filter(({ view }) => view !== messageView),
          ),
        );
      }),
    [],
  );

  return messageViews.map(({ id, view }) => (
    <MessageViewContext.Provider value={{ view }} key={id}>
      {children}
    </MessageViewContext.Provider>
  ));
}
