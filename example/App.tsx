import InboxSDK from "react-inbox-sdk/InboxSDK";
import ThreadView, {
  Label,
  NoticeBar,
  SidebarContentPanel,
} from "react-inbox-sdk/Conversations/ThreadView";
import ComposeView, {
  ComposeButton,
  ComposeNotice,
} from "react-inbox-sdk/ComposeView";

const INBOX_SDK_APP_ID = process.env.INBOX_SDK_APP_ID ?? "";

function ThreadViewContent() {
  return (
    <ThreadView>
      <SidebarContentPanel
        contentPanelDescriptor={{
          el: document.createElement("div"),
          title: "I'm a thread view sidebar content panel!",
        }}
      >
        {null}
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

function ComposeViewContent() {
  return (
    <ComposeView>
      <ComposeNotice>
        <div style={{ backgroundColor: "red", color: "white" }}>
          I'm a compose notice!
        </div>
      </ComposeNotice>
      <ComposeButton
        composeButtonDescriptor={{
          onClick: () => console.log("Clicked!"),
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
      <ComposeViewContent />
    </InboxSDK>
  );
}

export default App;
