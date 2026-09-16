import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// If you deploy this to GitHub Pages as a *project* site
// (https://<user>.github.io/<repo>/), set base to "/<repo>/".
// If you deploy to a *user/organization* site, a custom domain, or
// Vercel/Netlify (root domain), leave it as "/".
const BASE_PATH = "/kabadisetu/";

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/favicon-32.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "KabadiSetu — Kabadi se Recycler tak",
        short_name: "KabadiSetu",
        description: "Vernacular, offline-first e-waste collection & formal recycling platform prototype.",
        lang: "hi",
        start_url: BASE_PATH,
        scope: BASE_PATH,
        display: "standalone",
        orientation: "any",
        background_color: "#EDEAE0",
        theme_color: "#1F4D3D",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      },
    }),
  ],
});
