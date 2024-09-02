A React adapter for [InboxSDK](https://inboxsdk.github.io/inboxsdk-docs/). This allow you to run your React application directly in Gmail.

**This project is in an experimental phase and only supports a subset of the InboxSDK API.**

## Usage
See the project in `example/` for a fully working example, including configuration that you can use to get your own application started.

### Basic Example
```tsx
import InboxSDK from "react-inbox-sdk/InboxSDK";
import { ComposeView, ComposeButton } from "react-inbox-sdk/ComposeView";

function App() {
  return (
    // You must provide an app id to InboxSDK in order to use the SDK.
    <InboxSDK appId={'123abc'}>
      {/* This view will render all of its children for each compose view visible on the page */}
      <ComposeView>
        {/* A button that will be rendered in every compose view */}
        <ComposeButton
          onClick={() => alert("Hello World!")}
        />
      </ComposeView>
    </InboxSDK>
  )
}
```

## Caveats

- You may expect this code will only render a button in compose view that is a child of a thread view, such as a reply or forward message compose view.
```tsx
<InboxSDK appId={'123abc'}>
  <ThreadView>
    <ComposeView>
      <ComposeButton onClick={() => alert("Hello World!")} />
    </ComposeView>
  </ThreadView>
</InboxSDK>
```
However, this behavior is not currently supported. Instead, this code will render a button even
in a new message compose view, but only if a thread is open.
In order to accomplish the expected behavior, you can create an intermediate component that checks
for the existence of a thread view and renders the button only if the thread view exists.
```tsx
import { useThreadView } from "react-inbox-sdk/Conversations/ThreadView";

function ThreadOnlyComposeButton() {
  const { view: threadView } = useThreadView();
  if (!threadView) return null;
  return (
    <ComposeButton
      onClick={() => alert("Hello World!")}
    />
  );
}
```

- InboxSDK supports modifying the underlying values passed to its view creation components using
data streams. This is not currently supported by this adapter. You'll need to unmount and remount
on of this library's components to update the underlying SDK's view.
- Only Compose and Conversation views are provided at this time.
