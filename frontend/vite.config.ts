import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendProxyTarget = process.env.VITE_BACKEND_PROXY_TARGET ?? "http://127.0.0.1:8000";
const backendWebSocketTarget = backendProxyTarget.replace(/^http/, "ws");

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": backendProxyTarget,
      "/health": backendProxyTarget,
      "/ws": {
        target: backendWebSocketTarget,
        ws: true
      }
    }
  }
});
