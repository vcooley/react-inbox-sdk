import { ThreadView } from "@inboxsdk/core";
import { createContext, useContext } from "react";

export const ThreadViewContext = createContext<ThreadView | null>(null);

export const useThreadView = () => useContext(ThreadViewContext);
