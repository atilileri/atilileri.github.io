// PROTOTYPE for #178 — bundles src/ (React + the stageshow kit in ./kit) into
// one self-contained HTML file: public/prototype/bday26-hub.html.
//
//   node prototypes/178-bday26-hub/build.mjs
//
// Needs esbuild, react, react-dom and lucide-react. The site does not depend
// on them, so point STAGESHOW_MODULES at a node_modules that has them (the
// stageshow skill's own install does).
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const modules = process.env.STAGESHOW_MODULES ?? '/home/neo/projects/atilileri.github.io/.claude/skills/stageshow/node_modules'
const require = createRequire(join(modules, 'x.js'))
const esbuild = require('esbuild')

const out = await esbuild.build({
  entryPoints: [join(here, 'src/main.tsx')],
  bundle: true,
  write: false,
  outdir: 'out',
  format: 'iife',
  minify: true,
  jsx: 'automatic',
  target: 'es2020',
  nodePaths: [modules],
  // The kit's brand registry builds asset URLs from import.meta.url; no brand is used here
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"https://unused.invalid/"' },
  loader: { '.svg': 'dataurl', '.png': 'dataurl' },
  logLevel: 'warning',
})

const js = out.outputFiles.find((f) => f.path.endsWith('.js')).text
const css = out.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? ''
const safe = (s) => s.replace(/<\/(script|style)/gi, '<\\/$1')

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Hub prototipi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Fraunces:opsz,wght@9..144,700;9..144,800&family=Nunito:wght@400;600;700;800&family=Patrick+Hand&display=swap">
<style>${safe(css)}</style>
</head>
<body>
<!-- PROTOTYPE for #178 (throwaway, do not merge). Four variants of the birthday hub at /20261209/:
     ?variant=A|B|C|D, ?sample=yeni|orta|son. All progress is fake and in memory. -->
<div id="root"></div>
<script>${safe(js)}</script>
</body>
</html>
`
const target = join(here, '../../public/prototype/bday26-hub.html')
writeFileSync(target, html)
console.log(`wrote ${target} (${(html.length / 1024).toFixed(0)} KB)`)
