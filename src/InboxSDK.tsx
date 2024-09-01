import { load, type InboxSDK as InboxSDKType } from "@inboxsdk/core";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

let sdk: InboxSDKType;

/** Get an instance of the SDK. */
export function getSdk(): InboxSDKType | undefined {
  return sdk;
}

// @ts-expect-error - We're not rendering children until the SDK is loaded
const InboxSDKContext = createContext<InboxSDKType>(null);

export const useInboxSDK = () => useContext(InboxSDKContext);

export default function InboxSDK({
  appId,
  instance,
  children,
}: {
  appId?: string;
  instance?: InboxSDKType;
  children?: ReactNode;
}) {
  const [, setRenderTrigger] = useState(0);
  useEffect(() => {
    if (sdk) return;
    if (!appId && !instance) {
      console.warn(
        "The InboxSDK React adapter was rendered without an app ID or sdk instance and will not render any of its children until one is provided.",
      );
      return;
    }

    if (instance) {
      sdk = instance;
      setRenderTrigger((current) => current + 1);
    } else if (appId) {
      load(2, appId).then((loaded) => {
        sdk = loaded;
        // Since we're keeping the SDK globally, we need to trigger a re-render manually
        setRenderTrigger((current) => current + 1);
      });
    }
  }, [appId, instance]);

  if (!sdk) return null;

  return (
    <InboxSDKContext.Provider value={sdk}>{children}</InboxSDKContext.Provider>
  );
}
