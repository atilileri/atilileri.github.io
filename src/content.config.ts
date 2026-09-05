import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    lang: z.enum(['en', 'tr']).default('en'),
    translationId: z.string().optional(),
  }),
});

const garden = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/garden" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lastUpdated: z.coerce.date(),
    // How far the thing has grown.
    status: z.enum(["seedling", "budding", "evergreen"]).default("seedling"),
    // What the thing is. Decides nothing about layout; it labels the card.
    kind: z.enum(["project", "deck", "note"]).default("note"),
    tags: z.array(z.string()).default([]),
    // Where to go. An internal path, or an external URL.
    link: z.string().optional(),
    github: z.string().optional(),
    // Featured entries fill the bento at the top, in `order`. The rest flow
    // into the grid below, newest first.
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

export const collections = { blog, garden };
