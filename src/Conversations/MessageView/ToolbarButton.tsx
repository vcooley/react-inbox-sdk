import { useEffect } from "react";
import { MessageViewToolbarButtonDescriptor } from "@inboxsdk/core";
import { useMessageView } from "./useMessageView";

type ToolbarButtonProps = {
  /**
   * NOTE: children won't do anything for now. Use the descriptor prop for customization.
   */
  children?: React.ReactNode;
  toolbarButtonDescriptor: MessageViewToolbarButtonDescriptor;
};

function ToolbarButton({ toolbarButtonDescriptor }: ToolbarButtonProps) {
  const { view: messageView } = useMessageView();

  useEffect(() => {
    if (!messageView) {
      console.error("ToolbarButton must be wrapped in a MessageView.");
      return;
    }
    const toolbarButton = messageView.addToolbarButton(toolbarButtonDescriptor);
    console.log(toolbarButton);

    // NOTE: Inconsistency here. The view does not have a destroy event to call when an unmount occurs.
  }, []);

  return null;
}

export default ToolbarButton;
