import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]firebase[\\/]|[\\/]@firebase[\\/]/.test(id)) return "firebase";
          if (/[\\/]recharts[\\/]|[\\/]d3-[^\\/]+[\\/]|[\\/]victory-vendor[\\/]/.test(id)) return "charts";
          if (/[\\/]leaflet[\\/]/.test(id)) return "maps";
          if (/[\\/]framer-motion[\\/]|[\\/]motion-dom[\\/]|[\\/]motion-utils[\\/]/.test(id)) return "motion";
          if (/[\\/]react-router[\\/]|[\\/]@remix-run[\\/]/.test(id)) return "router";
          if (/[\\/]lucide-react[\\/]/.test(id)) return "icons";
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
        },
      },
    },
  },
});
