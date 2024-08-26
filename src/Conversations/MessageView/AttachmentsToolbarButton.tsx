import { useEffect } from "react";
import { useMessageView } from "./useMessageView";

export default function AttachmentsToolbarButton({
  cardOptions,
}: {
  /**
   * NOTE: children won't do anything for now. Use the cardOptions for customization.
   * see https://inboxsdk.github.io/inboxsdk-docs/conversations/#attachmentstoolbarbuttondescriptor
   */
  children?: React.ReactNode;
  cardOptions: Record<string, any>;
}) {
  const { view: messageView } = useMessageView();

  useEffect(() => {
    if (!messageView) {
      console.error(
        "AttachmentsToolbarButton must be wrapped in a MessageView.",
      );
      return;
    }

    // NOTE: Inconsistency here. This method returns nothing.
    messageView.addAttachmentsToolbarButton(cardOptions);

    // NOTE: Inconsistency here. The view does not have a destroy event to call when an unmount occurs.
  }, []);

  return null;
}
