import path from "path";

import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: process.env.VITE_DEV_SERVER_HOST || "::",
    port: parseInt(process.env.VITE_DEV_SERVER_PORT || "8080", 10),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
