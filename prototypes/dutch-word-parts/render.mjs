// PROTOTYPE — ticket #148. Renders every Mermaid diagram on /prototype/dutch-word-parts/ to static SVG.
// Run from the repo root, with mermaid.min.js (11.17.2, from cdn.jsdelivr.net/npm/mermaid@11) in <scratch>:
//   node prototypes/dutch-word-parts/render.mjs <scratch> public/prototype/dutch-word-parts [filter-regex]
// It also writes <scratch>/check/<name>.png previews, which were looked at before hand-over.
// PROTOTYPE render script for #148: Mermaid source -> static SVG in public/, PNG preview in scratch.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("playwright");
const [S, OUT] = process.argv.slice(2);
const { words } = await import(pathToFileURL(process.cwd() + "/src/pages/prototype/_dutch-word-parts.data.ts"));

const fill = {
  stem: "fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#0b2a66",
  stem2: "fill:#dcfce7,stroke:#15803d,stroke-width:2px,color:#0f3d22",
  link: "fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,stroke-dasharray:5 4,color:#374151",
  affix: "fill:#ffedd5,stroke:#c2410c,stroke-width:2px,color:#6b2308",
  word: "fill:#ffffff,stroke:#111827,stroke-width:3px,color:#111827",
  lit: "fill:#f5f3ff,stroke:#6d28d9,stroke-width:1.5px,color:#3b1d78",
  meaning: "fill:#fef9c3,stroke:#a16207,stroke-width:2px,color:#422006",
};
const classDefs = Object.entries(fill).map(([k, v]) => `  classDef ${k} ${v}`).join("\n");
const q = (s) => s.replace(/"/g, "'");
const leaves = (parts) => parts.flatMap((p) => (p.children ? p.children : [p]));

const defs = {};

// B — split tree
for (const w of words) {
  const L = [`flowchart TB`, `  W["\`**${w.nl}**\`"]:::word`];
  if (w.situation === "control") {
    L.push(`  W --> N["\`parçalanmaz\nbir bütün\`"]:::link`, `  N --> M["\`**anlamı:** ${q(w.meaning.tr)}\`"]:::meaning`);
  } else {
    const leafIds = [];
    w.parts.forEach((p, i) => {
      const id = `P${i}`;
      L.push(`  W --> ${id}["\`**${p.nl}**\n${q(p.tr)}\`"]:::${p.role}`);
      if (p.children) {
        p.children.forEach((c, j) => {
          const cid = `P${i}_${j}`;
          L.push(`  ${id} --> ${cid}["\`**${c.nl}**\n${c.base ? "← " + c.base + " · " : ""}${q(c.tr)}\`"]:::${c.role}`);
          leafIds.push(cid);
        });
      } else leafIds.push(id);
    });
    L.push(`  ${leafIds.join(" & ")} --> LIT["\`**sözcüğü sözcüğüne:** ${q(w.literal.tr)}\`"]:::lit`);
    if (w.drift) L.push(`  LIT ==> DR["\`**neden?** ${q(w.drift.replace(/`/g, ""))}\`"]:::link`, `  DR ==> M["\`**anlamı:** ${q(w.meaning.tr)}\`"]:::meaning`);
    else L.push(`  LIT ==> M["\`**anlamı:** ${q(w.meaning.tr)}\`"]:::meaning`);
  }
  L.push(classDefs);
  defs[`B-${w.id}`] = L.join("\n");
}

// C — bricks
for (const w of words) {
  const lv = leaves(w.parts);
  const n = lv.length;
  const L = [`%%{init: {"themeVariables": {"fontSize": "22px"}}}%%`, `block-beta`, `  columns ${n}`];
  const nested = w.parts.some((p) => p.children);
  if (nested) {
    // consecutive plain parts merge into one group (rijk + -s- -> rijks); a part with children is its own group
    const groups = [];
    for (const p of w.parts) {
      const last = groups[groups.length - 1];
      if (!p.children && last && !last.children) { last.nl += p.nl.replace(/-/g, ""); last.span += 1; }
      else groups.push({ nl: p.children ? p.nl : p.nl.replace(/-/g, ""), span: p.children ? p.children.length : 1, children: p.children, role: p.role });
    }
    groups.forEach((g, i) => L.push(`  g${i}["${g.nl}"]:${g.span}`));
    w._groups = groups;
  }
  lv.forEach((p, i) => L.push(`  a${i}["${p.nl}${p.base ? " ← " + p.base : ""}"]`));
  lv.forEach((p, i) => L.push(`  b${i}["${q(p.tr)}"]`));
  if (w.situation !== "control") L.push(`  l["sözcüğü sözcüğüne: ${q(w.literal.tr)}"]:${n}`);
  L.push(`  m["= ${q(w.situation === "control" ? "parçalanmaz · " + w.meaning.tr : w.meaning.tr)}"]:${n}`);
  if (nested) w._groups.forEach((g, i) => L.push(`  class g${i} ${g.children ? g.role : "word"}`));
  if (w.situation !== "control") L.push(`  class l lit`);
  lv.forEach((p, i) => L.push(`  class a${i} ${p.role}`));
  lv.forEach((_, i) => L.push(`  class b${i} lit`));
  L.push(`  class m meaning`, classDefs);
  defs[`C-${w.id}`] = L.join("\n");
}
defs["C-rule"] = `%%{init: {"themeVariables": {"fontSize": "22px"}}}%%
railroad-ebnf-beta
samenstelling = woord, [ "s" | "en" ], woord ;`;

// D — family and topic
defs["D-beeld"] = `mindmap
  root((beeld · resim))
    voorbeeld · örnek
    afbeelding · tasvir
    beeldscherm · ekran
    beeldhouwer · heykeltıraş`;
defs["D-tel"] = `mindmap
  root((tel · say-))
    tellen · saymak
    telwoord · sayı sözcüğü
    optellen · toplamak
    aftellen · geri saymak
    teller · sayaç`;
defs["D-prinsjesdag"] = `mindmap
  root((Prinsjesdag))
    Eylül'ün üçüncü salısı
    troonrede
      Kral okur
    miljoenennota
      Maliye Bakanı sunar
      rijksbegroting ile birlikte`;
defs["D-sankey"] = `---
config:
  sankey:
    showValues: false
    width: 760
    height: 380
---
sankey-beta
voor,voorbeeld,1
voor,voorwoord,1
beeld,voorbeeld,1
beeld,afbeelding,1
woord,voorwoord,1
woord,telwoord,1
woord,woordenboek,1
tel,telwoord,1
tel,tellen,1`;

// E — origin and bridges
const tlConfig = `---
config:
  themeVariables:
    fontSize: 22px
---
`;
const md = (bold, rest) => `"\`**${bold}**\n${rest}\`"`;
defs["E-miljoen-chain"] = `flowchart LR
  A[${md("mille", "İtalyanca · bin")}]:::lit --> B[${md("milione", "+ -one büyütme eki · büyük bin")}]:::lit
  B --> C[${md("miljoen", "1510 · Fransızcadan")}]:::stem --> D[${md("1.000.000", "17. yüzyılda kesinleşir")}]:::meaning
${classDefs}`;
defs["E-gordijn-chain"] = `flowchart LR
  A[${md("cortina", "Geç Latince")}]:::lit --> B[${md("curtine", "Eski Fransızca")}]:::lit
  B --> C[${md("gardîne", "Orta Felemenkçe")}]:::lit --> D[${md("gordijn", "ilk kez 1285")}]:::stem
${classDefs}`;
defs["E-miljoen"] = tlConfig + `timeline
  title miljoen — ‘büyük bin’
  İtalyanca : milione = mille ‘bin’ + -one
  13. yüzyıl : Avrupa dillerine yayılır
  1510 : Felemenkçede ilk kez, Fransızcadan
  17. yüzyıl : kesin değeri 1.000.000 olur`;
defs["E-gordijn"] = tlConfig + `timeline
  title gordijn
  Geç Latince : cortina
  Eski Fransızca : curtine
  Orta Felemenkçe : gardîne
  1285 : Felemenkçede ilk kez`;
defs["E-nota"] = `venn-beta
  set NL["nota (nl)"]
  set TR["nota (tr)"]
  set EN["note (en)"]
  union NL,TR,EN["yazılı not"]`;

const only = process.argv[4] ? new RegExp(process.argv[4]) : null;
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<div></div>`);
await p.addScriptTag({ path: S + "/mermaid.min.js" });
await p.evaluate(() => mermaid.initialize({ startOnLoad: false, theme: "base", fontFamily: "Inter, Arial, sans-serif", flowchart: { htmlLabels: false }, block: { padding: 10 } }));
for (const [k, d] of Object.entries(defs)) {
  if (only && !only.test(k)) continue;
  const t = Date.now();
  const r = await p.evaluate(async ([k, d]) => { try { return { ok: true, svg: (await mermaid.render("m" + k.replace(/\W/g, ""), d)).svg }; } catch (e) { return { ok: false, err: String(e.message || e).slice(0, 200) }; } }, [k, d]);
  if (!r.ok) { console.log(k, "FAIL", r.err); continue; }
  // an <img> parses SVG as strict XML: an unclosed <br> from a markdown label breaks the whole image
  r.svg = r.svg.replace(/<br>/g, "<br/>");
  fs.writeFileSync(`${OUT}/${k}.svg`, r.svg);
  fs.writeFileSync(`${S}/check/${k}.mmd`, d);
  const q2 = await b.newPage({ viewport: { width: 820, height: 600 } });
  await q2.setContent(`<body style="margin:0;background:#fff"><div style="max-width:800px">${r.svg}</div></body>`);
  await q2.waitForTimeout(150);
  await q2.screenshot({ path: `${S}/check/${k}.png`, fullPage: true });
  await q2.close();
  console.log(k, "OK", r.svg.length, (Date.now() - t) + "ms");
}
await b.close();
