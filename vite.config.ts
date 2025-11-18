import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Reduce noisy bundle warnings and improve code-splitting for Vercel builds
  build: {
    // Increase the default 500kb warning threshold; does not change actual bundle size limits
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Create separate vendor chunks so the app chunk stays smaller
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
          ui: ["clsx", "class-variance-authority", "lucide-react", "sonner"],
          charts: ["recharts"],
          date: ["date-fns"],
        },
      },
    },
  },
}));
