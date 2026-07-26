import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

   base: "/Controle-Financeiro/",
// https://<user>.github.io/controle-financeiro/ via GitHub Pages.
// If deploying to Vercel/Netlify (custom domain root) change base to "/".
export default defineConfig({
  plugins: [react()],
  base: "/controle-financeiro/",
});
