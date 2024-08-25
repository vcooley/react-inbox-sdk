import InboxSDK from "react-inbox-sdk/InboxSDK";
import ThreadView, {
  NoticeBar,
} from "react-inbox-sdk/Conversations/ThreadView";
import { useNoticeBar } from "react-inbox-sdk/Conversations/ThreadView/NoticeBar";
import { createPortal } from "react-dom";

const INBOX_SDK_APP_ID = process.env.INBOX_SDK_APP_ID ?? "";

function MyNoticeBar() {
  const noticeBar = useNoticeBar();
  if (!noticeBar) return null;
  return createPortal(
    <div style={{ backgroundColor: "red", color: "white" }}>Hello World!</div>,
    noticeBar.el,
  );
}

function App() {
  console.log("Rendered React App");
  return (
    <InboxSDK appId={INBOX_SDK_APP_ID}>
      <ThreadView>
        <NoticeBar>
          <MyNoticeBar />
        </NoticeBar>
      </ThreadView>
    </InboxSDK>
  );
}

export default App;
