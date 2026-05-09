# atilileri.github.io

Personal website and digital garden of Atil İleri, built with [Astro](https://astro.build). Deployed to [GitHub Pages](https://atilileri.github.io).

## Architecture

### Core Framework
- **[Astro](https://astro.build) 6.1.5** - Static site generator with zero client-side JavaScript by default
- **Node.js >= 22.12.0** - Runtime requirement (ES modules)
- **TypeScript** - Type-safe configuration and component development

### Styling
- **[Tailwind CSS 4.0](https://tailwindcss.com)** - Utility-first CSS via Vite plugin (`@tailwindcss/vite`)
- No custom CSS framework; all styling via Tailwind utilities

### Content System
Astro Content Collections with Zod schema validation:

| Collection | Location | Schema Fields |
|------------|----------|---------------|
| `blog` | `src/content/blog/` | `title`, `description`, `pubDate`, `updatedDate?`, `heroImage?`, `tags[]`, `draft`, `lang` (en/tr), `translationId?` |
| `garden` | `src/content/garden/` | `title`, `description?`, `lastUpdated`, `status` (seedling/budding/evergreen), `tags[]` |
| `projects` | `src/content/projects/` | `title`, `description`, `image?`, `link?`, `github?`, `tags[]`, `featured`, `order` |
| `sports` | `src/content/sports/` | `title`, `role?`, `location`, `startDate`, `endDate?`, `current`, `image?`, `type` (sports/volunteering) |

Content loaded via `astro/loaders` glob loader for `**/*.{md,mdx}` files.

### Integrations
- `@astrojs/mdx` - MDX support for JSX components in markdown
- `@astrojs/sitemap` - Automatic sitemap generation
- `@astrojs/rss` - RSS feed generation
- `sharp` - Image optimization

## Project Structure

```
├── src/
│   ├── components/          # Reusable Astro components
│   │   ├── Footer.astro
│   │   ├── PipelineVisualizer.astro
│   │   └── TopBar.astro
│   ├── content/             # Markdown/MDX content collections
│   │   ├── blog/           # 15+ posts
│   │   ├── garden/         # Digital garden entries
│   │   ├── projects/       # Portfolio projects
│   │   └── sports/         # Sports/volunteering history
│   ├── content.config.ts   # Collection schemas (Zod)
│   ├── layouts/            # Page layout templates
│   ├── pages/              # File-based routing
│   │   ├── index.astro     # Homepage
│   │   ├── cv.astro        # CV/Resume page
│   │   ├── now.astro       # /now page
│   │   ├── sports.astro    # Sports timeline
│   │   ├── blog/           # Blog index + posts
│   │   ├── garden/         # Digital garden
│   │   ├── portfolio/      # Projects showcase
│   │   └── rss.xml.js      # RSS feed endpoint
│   └── styles/             # Global styles
├── public/                 # Static assets (images, fonts)
├── astro.config.mjs        # Site config + integrations
├── tsconfig.json           # TypeScript configuration
└── dist/                   # Build output (gitignored)
```

## Development

### Prerequisites
- Node.js >= 22.12.0
- npm

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:4321
npm run build        # Production build to ./dist/
npm run preview      # Preview production build locally
```

### Configuration
Site URL configured in `astro.config.mjs`:
```javascript
export default defineConfig({
  site: "https://atilileri.github.io",
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

## Deployment

**Target:** GitHub Pages via GitHub Actions

**Workflow:** `.github/workflows/deploy.yml`
- Triggers: Push to `main`/`master`, or manual dispatch
- Build: `withastro/action@v3` with Node.js 24
- Deploy: `actions/deploy-pages@v4`
- Permissions: `pages: write`, `id-token: write`

The site builds to `./dist/` and deploys automatically on every push.

## Dependencies

```json
{
  "astro": "^6.1.5",
  "@astrojs/mdx": "^5.0.0",
  "@astrojs/rss": "^4.0.0",
  "@astrojs/sitemap": "^3.3.0",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/vite": "^4.0.0",
  "sharp": "^0.33.0"
}
```

All dependencies are ESM-only (`"type": "module"`).
