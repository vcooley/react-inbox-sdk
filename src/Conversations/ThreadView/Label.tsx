import { createContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SimpleElementView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

type LabelContextValue = {
  view: SimpleElementView | null;
};

const LabelContext = createContext<LabelContextValue>({ view: null });

function Label({ children }: { children: React.ReactNode }) {
  const { view: threadView } = useThreadView();
  const labelRef = useRef<SimpleElementView | null>(null);

  useEffect(() => {
    if (!threadView) {
      console.error("Label must be wrapped in a ThreadView.");
      return;
    }

    labelRef.current = threadView.addLabel();
    labelRef.current.on("destroy", () => {
      labelRef.current = null;
    });

    return () => labelRef.current?.destroy();
  }, []);
  return (
    <LabelContext.Provider value={{ view: labelRef.current }}>
      {labelRef.current && createPortal(children, labelRef.current?.el)}
    </LabelContext.Provider>
  );
}

export default Label;
