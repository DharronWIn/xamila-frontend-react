import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Remplace NOM_DU_REPO par le nom de ton dépôt GitHub
const repoName = "xamila-frontend-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: `/${repoName}/`, // <-- Ajouté pour GitHub Pages
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "xamila-frontend-react.onrender.com",
      "xamila-app-backend-nestjs.onrender.com",
      "localhost",
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
