import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: ["index.ts", "@inboxsdk/core/background.js"],
      output: { entryFileNames: "[name].js" },
    },
  },
});
