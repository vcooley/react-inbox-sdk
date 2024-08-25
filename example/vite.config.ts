import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "react-inbox-sdk": "../dist" },
  },
  build: {
    rollupOptions: {
      input: [
        "index.tsx",
        "@inboxsdk/core/background.js",
        "@inboxsdk/core/pageWorld.js",
      ],
      output: { entryFileNames: "[name].js" },
    },
  },
});
