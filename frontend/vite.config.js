import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Mọi request bắt đầu bằng /api sẽ được chuyển sang backend Flask (cổng 5000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
