import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "^/(posts|courses|join-requests|groups|auth|profiles|availabilities|reviews|reports|moderations|admin|users|chats|health)": {
        target: process.env.BACKEND_URL || "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api": process.env.BACKEND_URL || "http://127.0.0.1:8000",
      "/uploads": process.env.BACKEND_URL || "http://127.0.0.1:8000",
      "/socket.io": { target: process.env.BACKEND_URL || "http://127.0.0.1:8000", ws: true },
    },
  },
});
