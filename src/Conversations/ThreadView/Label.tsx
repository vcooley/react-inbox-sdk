import { createContext, useRef } from "react";
import { createPortal } from "react-dom";
import { SimpleElementView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

type LabelContextValue = {
  view: SimpleElementView | null;
};

const LabelContext = createContext<LabelContextValue>({ view: null });

function Label({ children }: { children: React.ReactNode }) {
  const { view: threadView } = useThreadView();
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
    <LabelContext.Provider value={{ view: labelRef.current }}>
      {labelRef.current && createPortal(children, labelRef.current?.el)}
    </LabelContext.Provider>
  );
}

export default Label;
