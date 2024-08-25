import InboxSDK from "react-inbox-sdk/InboxSDK";
import ThreadView, {
  NoticeBar,
} from "react-inbox-sdk/Conversations/ThreadView";

const INBOX_SDK_APP_ID = process.env.INBOX_SDK_APP_ID ?? "";

function App() {
  return (
    <InboxSDK appId={INBOX_SDK_APP_ID}>
      <ThreadView>
        <NoticeBar>
          <div style={{ backgroundColor: "red", color: "white" }}>
            Hello World!
          </div>
        </NoticeBar>
      </ThreadView>
    </InboxSDK>
  );
}

export default App;
