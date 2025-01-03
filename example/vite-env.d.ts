/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INBOX_SDK_APP_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
