import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "sequel-heftiness-grit.ngrok-free.dev",
      "catalyst-treasury-trembl-ala.trycloudflare.com",
    ],
    proxy: {
      "/token": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
});