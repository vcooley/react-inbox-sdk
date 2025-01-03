import { ReactNode, useEffect, useMemo, useState } from "react";
import { MessageView as SDKMessageView } from "@inboxsdk/core";
import { MessageViewContext } from "./useMessageView";
import { useInboxSDK } from "../../InboxSDK";

type MessageViewWrapper = {
  id: number;
  view: SDKMessageView;
  isLoaded: boolean;
};

let sequenceId = 1;

/**
 *  Provides a message view context to its children. Its children will be rendered once per message view that is being displayed.
 */
export default function MessageView({
  children,
  all = false,
}: {
  children: ReactNode;
  all?: boolean;
}) {
  const sdk = useInboxSDK();

  const [messageViews, setMessageViews] = useState<MessageViewWrapper[]>([]);

  useEffect(
    () =>
      // TODO: handle effect cleanup
      sdk.Conversations.registerMessageViewHandlerAll((messageView) => {
        const id = sequenceId++;
        setMessageViews((current) => [
          ...current,
          // intentionally caching the load state for rendering purposes. This will be updated in the load event handler.
          { id, view: messageView, isLoaded: messageView.isLoaded() },
        ]);

        const loadHandler = () => {
          setMessageViews((current) => {
            const itemIndex = current.findIndex(
              ({ id: viewId }) => id === viewId
            );
            const item = current[itemIndex];
            if (itemIndex === -1) return current;
            if (item.isLoaded) return current;

            return current.with(itemIndex, {
              ...item,
              isLoaded: true,
            });
          });
        };
        messageView.once("load", loadHandler);

        const destroyHandler = () => {
          setMessageViews((current) =>
            current.filter(({ view }) => view !== messageView)
          );
          // InboxSDK probably handles this, but let's be safe
          messageView.off("load", loadHandler);
        };

        messageView.once("destroy", destroyHandler);
      }),
    []
  );

  const renderedMessageViews = useMemo(() => {
    if (all) {
      return messageViews;
    }
    return messageViews.filter(({ isLoaded }) => isLoaded);
  }, [messageViews]);

  return renderedMessageViews.map(({ id, view }) => (
    <MessageViewContext.Provider value={{ view }} key={id}>
      {children}
    </MessageViewContext.Provider>
  ));
}
