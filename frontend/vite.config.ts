import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === "true" ? "/hotel-admin-dashboard/" : "/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom", "react-redux", "@reduxjs/toolkit"],
          "vendor-mui": ["@mui/material", "@emotion/react", "@emotion/styled", "@mui/icons-material"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-icons": ["lucide-react", "react-icons"],
          "vendor-utils": ["dayjs", "xlsx", "file-saver", "sweetalert2", "idb-keyval"],
        },
      },
    },
  },
});
