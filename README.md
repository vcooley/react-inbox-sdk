A React adapter for InboxSDK

## Usage

```tsx
<InboxSDK appId={'123abc'}>
  <ComposeView>
    <ComposeView.Button onClick={() => alert("Hello World!")} />
  </ComposeView>
</InboxSDK>
```

## Open Questions

- Users would expect this code to only render in compose views that are children of a thread view. How can this behavoir be supported?
```tsx
<InboxSDK appId={'123abc'}>
  <ThreadView>
    <ComposeView>
      <ComposeView.Button onClick={() => alert("Hello World!")} />
    </ComposeView>
  </ThreadView>
</InboxSDK>
```
