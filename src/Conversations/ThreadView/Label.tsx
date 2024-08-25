import { createContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SimpleElementView } from "@inboxsdk/core";

import { useThreadView } from "./useThreadView";

type LabelContextValue = {
  view: SimpleElementView | null;
};

const LabelContext = createContext<LabelContextValue>({ view: null });

function Label({ children }: { children: React.ReactNode }) {
  const { view: threadView } = useThreadView();
  const [label, setLabel] = useState<SimpleElementView | null>(null);

  useEffect(() => {
    if (!threadView) {
      console.error("Label must be wrapped in a ThreadView.");
      return;
    }

    const label = threadView.addLabel();
    setLabel(label);

    label.on("destroy", () => {
      setLabel(null);
    });

    return () => {
      label.destroy();
    };
  }, []);

  return (
    <LabelContext.Provider value={{ view: label }}>
      {label && createPortal(children, label.el)}
    </LabelContext.Provider>
  );
}

export default Label;
