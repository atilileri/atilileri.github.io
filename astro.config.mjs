// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://atilileri.github.io",
  integrations: [mdx(), sitemap()],
  vite: {
    // @ts-expect-error two copies of Vite's types are installed — Astro
    // bundles its own under `astro/node_modules/vite`, and `@tailwindcss/vite`
    // pulls one to the root — so the plugin type does not match by identity.
    // The plugin itself is fine; only the types disagree. Delete this line
    // once the two resolve to one copy: `@ts-expect-error` fails when the
    // error it suppresses is gone, so it cleans itself up.
    plugins: [tailwindcss()],
  },
});
