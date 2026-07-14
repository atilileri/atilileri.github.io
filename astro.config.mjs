// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
// React integration hosts the /proto/* showcase decks (e.g. Spectacle, #7).
import react from "@astrojs/react";

export default defineConfig({
  site: "https://atilileri.github.io",
  integrations: [mdx(), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
