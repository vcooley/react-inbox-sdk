import { load, type InboxSDK as InboxSDKType } from "@inboxsdk/core";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

let sdk: InboxSDKType;

/**
 * Get the instance of the SDK. The SDK loads asynchronously, so this can return undefined when it's
 * not ready. You should only use this when you need access to the SDK outside of a React component
 * or hook. Otherwise, prefer using `useInboxSDK` to access the SDK instance.
 * */
export function getSdk(): InboxSDKType | undefined {
  return sdk;
}

// @ts-expect-error - We're not rendering children until the SDK is loaded
const InboxSDKContext = createContext<InboxSDKType>(null);

export const useInboxSDK = () => useContext(InboxSDKContext);

type InboxSDKProps = {
  /**
   * The app id of your application. Either `appId` or `instance` is required. An app id can be
   * created at https://www.inboxsdk.com/register
   */
  appId?: string;
  /**
   * Options passed to the SDK's load function.
   */
  loadOptions?: Parameters<typeof load>[2];
  /**
   * Use this option if you already have an instance of the sdk loaded and want to use the same
   * one for the React adapter. If this is provided, `appId` and `loadOptions` will have no effect
   */
  instance?: InboxSDKType;
  children?: ReactNode;
};

export default function InboxSDK({
  appId,
  loadOptions,
  instance,
  children,
}: InboxSDKProps) {
  const [, setRenderTrigger] = useState(0);
  useEffect(() => {
    if (sdk) return;

    if (instance) {
      sdk = instance;
      setRenderTrigger((current) => current + 1);
    } else {
      // We'll load the SDK even if we don't have an app id, which is useful for initial development of an app
      load(2, appId ?? "", loadOptions).then((loaded) => {
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
