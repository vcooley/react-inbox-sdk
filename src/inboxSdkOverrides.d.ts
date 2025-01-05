// Overrides for inboxsdk when the types they provide do not match the implementation
import "@inboxsdk/core";
import { Descriptor, ContentPanelView } from "@inboxsdk/core";
import { Observable } from "kefir";

type ComposeNoticeOptions = { orderHint?: number; height?: number } | undefined;

declare module "@inboxsdk/core" {
  interface ComposeView {
    addComposeNotice(
      options: Descriptor<ComposeNoticeOptions | undefined>
    ): ComposeNoticeView;
  }
  interface ContentPanelView {
    destroy(): void;
  }
}
