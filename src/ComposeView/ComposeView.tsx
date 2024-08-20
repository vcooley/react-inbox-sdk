import { ReactNode, useEffect, useState } from "react";
import { ComposeView as SDKComposeView } from "@inboxsdk/core";
import { ComposeViewContext } from "./useComposeView";
import { useInboxSDK } from "../InboxSDK";

type ComposeViewWrapper = {
  id: number;
  view: SDKComposeView;
};

let sequenceId = 1;

/**
 *  Provides a compose view context to its children. Its children will be rendered once per compose view that is being displayed.
 */
export default function ComposeView({ children }: { children: ReactNode }) {
  const sdk = useInboxSDK();

  const [composeViews, setComposeViews] = useState<ComposeViewWrapper[]>([]);

  useEffect(
    () =>
      sdk.Compose.registerComposeViewHandler((composeView) => {
        const id = sequenceId++;
        setComposeViews((current) => [...current, { id, view: composeView }]);

        composeView.on("destroy", () =>
          setComposeViews((current) =>
            current.filter(({ view }) => view !== composeView),
          ),
        );
      }),
    [],
  );

  return composeViews.map(({ id, view }) => (
    <ComposeViewContext.Provider value={view} key={id}>
      {children}
    </ComposeViewContext.Provider>
  ));
}
