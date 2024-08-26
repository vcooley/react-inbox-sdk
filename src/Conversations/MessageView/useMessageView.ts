import { createContext, useContext } from "react";
import { MessageView } from "@inboxsdk/core";

type MessageViewContextValue = {
  view: MessageView | null;
};

export const MessageViewContext = createContext<MessageViewContextValue>({
  view: null,
});

export const useMessageView = () => useContext(MessageViewContext);
