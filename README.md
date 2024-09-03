A React adapter for [InboxSDK](https://inboxsdk.github.io/inboxsdk-docs/). This allow you to run your React application directly in Gmail.

**This project is in an experimental phase and only supports a subset of the InboxSDK API. The API this library exposes is subject to change with any release.**

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

### Ejecting from the React Wrapper
You can use the hooks exported from the library to "eject" from the React InboxSDK wrapper and use it natively.
You can use this feature to use components from the InboxSDK library that aren't exposed by the React wrapper yet.
```tsx
import { useInboxSDK } from "react-inbox-sdk";
import { ComposeView, useComposeView } from "react-inbox-sdk/ComposeView";

function EjectingComposeButton() {
  const { view: composeView } = useComposeView();
  const inboxSDK = useInboxSDK();

  useEffect(() => {
    let butterBar;
    if (composeView.isReply) {
      butterBar = inboxSDK.ButterBar.showMessage("This is a reply");
      butterBar.on("destroy", () => butterBar = null);
    }
    // Remember to clean up your mess!
    () => {
      butterBar?.destroy();
    }
  }, []);
  
  return null;
}

function App() {
  return (
    <InboxSDK appId={'123abc'}>
      <ComposeView>
        <EjectingComposeButton />
      </ComposeView>
    </InboxSDK>
  );
}
```

### Ejecting from the React Wrapper
You can use the hooks exported from the library to "eject" from the React InboxSDK wrapper and use it natively.
You can use this feature to use components from the InboxSDK library that aren't exposed by the React wrapper yet.
```tsx
import { useInboxSDK } from "react-inbox-sdk";
import { ComposeView, useComposeView } from "react-inbox-sdk/ComposeView";

function EjectingComposeButton() {
  const { view: composeView } = useComposeView();
  const inboxSDK = useInboxSDK();

  useEffect(() => {
    let butterBar;
    if (composeView.isReply) {
      butterBar = inboxSDK.ButterBar.showMessage("This is a reply");
      butterBar.on("destroy", () => butterBar = null);
    }
    // Remember to clean up your mess!
    () => {
      butterBar?.destroy();
    }
  }, []);
  
  return null;
}

function App() {
  return (
    <ComposeView>
      <EjectingComposeButton />
    </ComposeView>
  );
}
```

### Using Actions exposed by views
```tsx
function AttachFileComposeButton() {
  const { view: composeView } = useComposeView();
  const inboxSDK = useInboxSDK();
  const attachFile = () => {
    const file = new File(["hello world"], "hello.txt");
    composeView.attachFiles([file]);
  }
  
  return <ComposeButton onClick={attachFile} />;
}

function App() {
  return (
    <ComposeView>
      <EjectingComposeButton />
    </ComposeView>
  );
}
```


## Library Structure
This library implements components for the underlying library that attempt to follow the conventions set there,
and are generally set under a root level view component that must wrap the UI components.


For example, in [InboxSDK's Compose namespace](https://inboxsdk.github.io/inboxsdk-docs/compose/),
the root level view component is called `ComposeView` (exported from `react-inbox-sdk/ComposeView`).
There are several components that are added via methods starting with "add", `addComposeButton`, `addComposeNotice`, and `addStatusBar`.
The corresponding components exported by this library are `ComposeButton`, `ComposeNotice`, and `StatusBar` respectively.

In order to implement actions, such as adding an attachment in the compose view,
you can use the hooks to call actions at the appropriate time.
For example, `useComposeView` hook to access the underlying compose view,
and then call such as `attachFiles` that are on the exposed compose view object.


## Supported Views
The following views are currently supported in the library:
- [x] InboxSDK loader
- [] Lists
- [x] ComposeView
- [x] Conversations
- [] Toolbars
- [] Router
- [] AppMenu
- [] NavMenu
- [] Widgets
- [] ButterBar
- [] Search
- [] User
- [] Global
- [] Keyboard Shortcuts
- [] Common Data Types

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
