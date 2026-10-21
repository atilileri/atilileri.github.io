import { defineCollection, z } from "astro:content";
import { file, glob } from "astro/loaders";

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

// The Dutch learning journey, written by the docent skill
// (.agents/skills/docent/SITE.md holds the formats these schemas check).

const dutchLessons = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/nederlands/lessons" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    objective: z.string(),
    items: z.array(z.string()).default([]),
  }),
});

const dutchTeksten = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/nederlands/teksten" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    session: z.string(),
    items: z.array(z.string()).default([]),
    gist: z.string(),
    prompts: z.array(z.string()).default([]),
  }),
});

const answered = {
  answer: z.string().optional(),
  answered: z.coerce.date().optional(),
  feedback: z.string().optional(),
  skipped: z.boolean().optional(),
};

const prompt = z.discriminatedUnion("type", [
  z.object({
    id: z.string().regex(/^P\d+$/),
    type: z.literal("item"),
    item: z.string(),
    direction: z.enum(["recognition", "production"]),
    ask: z.string(),
    verdict: z.enum(["correct", "close", "incorrect"]).optional(),
    ...answered,
  }),
  z.object({
    id: z.string().regex(/^P\d+$/),
    type: z.literal("open"),
    objective: z.string(),
    ask: z.string(),
    ...answered,
  }),
]);

const dutchSessions = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/nederlands/sessions" }),
  schema: z.object({
    title: z.string(),
    // The day of the first run; a resumed Session keeps it.
    date: z.coerce.date(),
    theme: z.string(),
    objective: z.string(),
    angle: z.string(),
    lessons: z.array(z.string()).default([]),
    teksten: z.array(z.string()).default([]),
    episode: z
      .object({ title: z.string(), url: z.url(), date: z.coerce.date() })
      .optional(),
    intakes: z.array(z.number()).default([]),
    limits: z.array(z.string()).default([]),
    prompts: z.array(prompt).default([]),
  }),
});

// The inventory is read straight from docs/dutch/, never copied. Docent never
// opens it; it goes through the skill's items.mjs.
const dutchItems = defineCollection({
  loader: file("docs/dutch/items.yml"),
  schema: z
    .object({
      nl: z.string(),
      article: z.enum(["de", "het"]).optional(),
      tr: z.string(),
      en: z.string(),
      bridge: z.string().optional(),
      hook: z.string().optional(),
      trap: z.object({ from: z.enum(["en", "tr"]), text: z.string() }).optional(),
      split: z.any().optional(),
    })
    .passthrough(),
});

export const collections = { blog, garden, dutchLessons, dutchTeksten, dutchSessions, dutchItems };
