import { createContext, useContext } from "react";
import { ComposeView } from "@inboxsdk/core";

export const ComposeViewContext = createContext<ComposeView | null>(null);

export const useComposeView = () => useContext(ComposeViewContext);
