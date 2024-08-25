import { createContext, useContext } from "react";
import { ComposeView } from "@inboxsdk/core";

type ComposeViewContextValue = {
  view: ComposeView | null;
};

export const ComposeViewContext = createContext<ComposeViewContextValue>({
  view: null,
});

export const useComposeView = () => useContext(ComposeViewContext);
