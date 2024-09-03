import InboxSDK from "react-inbox-sdk/InboxSDK";
import {
  ThreadView,
  Label,
  NoticeBar,
  SidebarContentPanel,
} from "react-inbox-sdk/Conversations/ThreadView";
import {
  MessageView,
  AttachmentsToolbarButton,
} from "react-inbox-sdk/Conversations/MessageView";
import {
  ComposeView,
  ComposeButton,
  ComposeNotice,
} from "react-inbox-sdk/ComposeView";
import { useState } from "react";

const INBOX_SDK_APP_ID = process.env.INBOX_SDK_APP_ID ?? "";

function ThreadViewContent() {
  return (
    <ThreadView>
      <SidebarContentPanel>
        <h3>I'm a thread view sidebar content panel!</h3>
      </SidebarContentPanel>
      <Label>
        <div style={{ backgroundColor: "red", color: "white" }}>
          I'm a thread view label!
        </div>
      </Label>
      <NoticeBar>
        <div style={{ backgroundColor: "red", color: "white" }}>
          I'm a thread view notice bar!
        </div>
      </NoticeBar>
    </ThreadView>
  );
}

function MessageViewContent() {
  return (
    <MessageView>
      <AttachmentsToolbarButton
        options={{
          section: "MORE",
          title:
            "https://lh5.googleusercontent.com/itq66nh65lfCick8cJ-OPuqZ8OUDTIxjCc25dkc4WUT1JG8XG3z6-eboCu63_uDXSqMnLRdlvQ=s128-h128-e365",
          iconUrl: "https://google.com/",
          onClick: () => alert("Hello from the attachment toolbar"),
          orderHint: 1,
        }}
      />
    </MessageView>
  );
}

function ComposeViewContent() {
  const [clickCount, setClickCount] = useState(0);
  const onClick = () => {
    // NOTE: We're intentionally not using the callback passed to onClick to illustrate that the button works without a callback state setter.
    setClickCount(clickCount + 1);
  };

  return (
    <ComposeView>
      <ComposeNotice>
        <div style={{ backgroundColor: "red", color: "white" }}>
          I'm a compose notice! You've clicked the compose button {clickCount}{" "}
          times.
        </div>
      </ComposeNotice>
      <ComposeButton
        onClick={onClick}
        options={{
          iconUrl:
            "https://lh5.googleusercontent.com/itq66nh65lfCick8cJ-OPuqZ8OUDTIxjCc25dkc4WUT1JG8XG3z6-eboCu63_uDXSqMnLRdlvQ=s128-h128-e365",
          title: "I'm a compose button",
        }}
      >
        {null}
      </ComposeButton>
    </ComposeView>
  );
}

function App() {
  return (
    <InboxSDK appId={INBOX_SDK_APP_ID}>
      <ThreadViewContent />
      <MessageViewContent />
      <ComposeViewContent />
    </InboxSDK>
  );
}

export default App;
