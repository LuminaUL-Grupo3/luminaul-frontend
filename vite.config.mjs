import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@features": fileURLToPath(new URL("./src/features", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      "@config": fileURLToPath(new URL("./src/config", import.meta.url)),
      "@types": fileURLToPath(new URL("./src/types", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "^/(posts|courses|join-requests|groups|auth|profiles|availability|availabilities|reviews|reports|moderation|moderations|notifications|admin|users|chats|health)": {
        target: process.env.BACKEND_URL || "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api": process.env.BACKEND_URL || "http://127.0.0.1:8000",
      "/uploads": process.env.BACKEND_URL || "http://127.0.0.1:8000",
      "/socket.io": { target: process.env.BACKEND_URL || "http://127.0.0.1:8000", ws: true },
    },
  },
});
