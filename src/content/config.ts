import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const garden = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lastUpdated: z.date(),
    status: z.enum(["seedling", "budding", "evergreen"]).default("seedling"),
    tags: z.array(z.string()).default([]),
  }),
});

const uses = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.enum(["hardware", "software", "desk", "sports"]),
    icon: z.string().optional(),
    order: z.number().default(0),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    link: z.string().optional(),
    github: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const sports = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    role: z.string().optional(),
    location: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    current: z.boolean().default(false),
    image: z.string().optional(),
    type: z.enum(["sports", "volunteering"]),
  }),
});

export const collections = { blog, garden, uses, projects, sports };
