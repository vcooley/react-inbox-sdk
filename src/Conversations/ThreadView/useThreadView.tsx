import { ThreadView } from "@inboxsdk/core";
import { createContext, useContext } from "react";

export const ThreadViewContext = createContext<{ view: ThreadView | null }>({
  view: null,
});

export const useThreadView = () => useContext(ThreadViewContext);
