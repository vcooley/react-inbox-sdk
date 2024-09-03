import { createContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SDKAttachmentCardView from "@inboxsdk/core/src/platform-implementation-js/views/conversations/attachment-card-view";
import { useMessageView } from "./useMessageView";

type AttachmentCardViewContextValue = {
  view: SDKAttachmentCardView | null;
};

const AttachmentCardViewContext = createContext<AttachmentCardViewContextValue>(
  {
    view: null,
  },
);

export default function AttachmentCard({
  children,
  options,
}: {
  children: React.ReactNode;
  options: Record<string, any>;
}) {
  const { view: messageView } = useMessageView();
  const [attachmentCard, setAttachmentCard] =
    useState<SDKAttachmentCardView | null>(null);

  useEffect(() => {
    if (!messageView) {
      console.error("AttachmentCardView must be wrapped in a MessageView.");
      return;
    }

    const attachmentCard = messageView.addAttachmentCardView(options);
    setAttachmentCard(attachmentCard);
    // NOTE: Inconsistency here. The view does not have a destroy event to call when an unmount occurs.
  }, []);

  return (
    <AttachmentCardViewContext.Provider value={{ view: null }}>
      {attachmentCard && createPortal(children, attachmentCard.getElement())}
    </AttachmentCardViewContext.Provider>
  );
}
