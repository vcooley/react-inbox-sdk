import { load, type InboxSDK as InboxSDKType } from "@inboxsdk/core";
import { createContext, useEffect, useState, type ReactNode } from "react";

let sdk: InboxSDKType;

const InboxSDKContext = createContext<any>(null);

export default function InboxSDK({
  appId,
  children,
}: {
  appId: string;
  children: ReactNode;
}) {
  const [, setRenderTrigger] = useState(0);
  useEffect(() => {
    if (sdk) return;
    load(2, appId).then((loaded) => {
      sdk = loaded;
      // Since we're keeping the SDK globally, we need to trigger a re-render manually
      setRenderTrigger((current) => current + 1);
    });
  }, [appId]);

  if (!sdk) return null;

  return (
    <InboxSDKContext.Provider value={sdk}>{children}</InboxSDKContext.Provider>
  );
}
