import { createContext, useRef } from "react";
import { SimpleElementView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

const LabelContext = createContext<SimpleElementView | null>(null);

function Label({ children }: { children: React.ReactNode }) {
  const threadView = useThreadView();
  const didInit = useRef<boolean>(false);
  const labelRef = useRef<SimpleElementView | null>(null);

  if (!didInit.current) {
    didInit.current = true;

    if (!threadView) {
      console.error("Label must be wrapped in a ThreadView.");
      return;
    }

    labelRef.current = threadView.addLabel();
    labelRef.current.on("destroy", () => {
      labelRef.current = null;
    });
  }

  return (
    <LabelContext.Provider value={labelRef.current}>
      {children}
    </LabelContext.Provider>
  );
}

export default Label;
