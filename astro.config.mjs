// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://atilileri.github.io",
  integrations: [
    mdx(),
    // The birthday games (/20261209/, spec #192) are a hidden present: the
    // pages carry noindex and nothing links to them, and this keeps every one
    // of their URLs out of the sitemap too. The RSS feed is built from the
    // blog collection alone, so it never saw them.
    sitemap({ filter: (page) => !page.includes("/20261209/") }),
  ],
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
