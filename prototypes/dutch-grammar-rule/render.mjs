// PROTOTYPE — ticket #153. Renders every Mermaid diagram on /prototype/dutch-grammar-rule/ to static SVG.
// Run from the repo root, with mermaid.min.js (11.17.2, from cdn.jsdelivr.net/npm/mermaid@11) in <scratch>:
//   node prototypes/dutch-grammar-rule/render.mjs <scratch> public/prototype/dutch-grammar-rule [filter-regex]
// It also writes <scratch>/check/<name>.png previews, at 390 px and at 820 px — both are looked at by eye
// before hand-over, because #148 was decided at 390 px.
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("playwright");
const [S, OUT] = process.argv.slice(2);

const fill = {
  de: "fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#0b2a66",
  het: "fill:#ffedd5,stroke:#c2410c,stroke-width:2px,color:#6b2308",
  q: "fill:#ffffff,stroke:#111827,stroke-width:2px,color:#111827",
  slot: "fill:#f3f4f6,stroke:#6b7280,stroke-width:2px,color:#374151",
  verb: "fill:#dcfce7,stroke:#15803d,stroke-width:3px,color:#0f3d22",
  moved: "fill:#f5f3ff,stroke:#6d28d9,stroke-width:3px,color:#3b1d78",
  note: "fill:#fef9c3,stroke:#a16207,stroke-width:2px,color:#422006",
};
const classDefs = Object.entries(fill).map(([k, v]) => `  classDef ${k} ${v}`).join("\n");
const defs = {};

// ───────── C — Mermaid flowchart ─────────
// Classification is the natural fit. Movement and slots are drawn anyway, to find where it stops working.

defs["C-dehet"] = `flowchart TB
  S(["bir ad"]):::q
  S --> Q1{"çoğul mu?"}:::q
  Q1 -- evet --> DE1["de<br/>her zaman"]:::de
  Q1 -- hayır --> Q2{"-je ile mi<br/>bitiyor?"}:::q
  Q2 -- evet --> HET1["het<br/>her zaman"]:::het
  Q2 -- hayır --> Q3{"-ment · -isme · -sel<br/>ad olmuş mastar<br/>dil · renk · ge-...?"}:::q
  Q3 -- evet --> HET2["het"]:::het
  Q3 -- hayır --> DE2["de<br/>sözlüğün ~%75'i"]:::de
  DE2 -.-> EZ["kalanı ezber:<br/>adı hep tanımlığıyla öğren"]:::note
${classDefs}`;

// v2 of C-scheidbaar: LR shrank to unreadable at 390 px, so the movement runs top-to-bottom instead.
defs["C-scheidbaar"] = `flowchart TB
  O["opbellen<br/>sözlükte bitişik"]:::q
  O --> P["bel<br/>2. yuvada kalır"]:::verb
  O --> Q["op<br/>sona gider"]:::moved
  P --> Z["Ik bel mijn moeder op."]:::note
  Q --> Z
  Z --> Y{"yan cümle<br/>ya da mastar?"}:::q
  Y -- evet --> YB["yine yapışır<br/>... dat ik haar opbel"]:::verb
  Y -- hayır --> YN["ayrı kalır"]:::moved
${classDefs}`;

// v2 of C-v2: the abstract three-slot row taught nothing prose does not. The real error is inversie,
// and a decision is what a flowchart draws best — so the drawing asks the question the learner gets wrong.
defs["C-v2"] = `flowchart TB
  S(["düz bir cümle kur"]):::q
  S --> Q1{"1. yuvaya ne koydun?"}:::q
  Q1 -- "özne · ik" --> A["Ik lees de krant.<br/>özne · eylem"]:::verb
  Q1 -- "zaman · elke dag" --> B["Elke dag lees ik de krant.<br/>eylem · özne"]:::moved
  Q1 -- "nesne · de krant" --> C["De krant lees ik elke dag.<br/>eylem · özne"]:::moved
  A --> N["çekimli eylem<br/>her üçünde de 2. yuvada"]:::note
  B --> N
  C --> N
  N -.-> X["Elke dag ik lees ...<br/>bozuk"]:::het
${classDefs}`;

// v2 of C-getallen: the first draw repeated the parts in two rows and never showed the inversion.
// The teaching point IS the crossing, so the crossing is what it draws.
// v3: the subgraph + invisible-link attempt stacked vertically and lost the crossing. Two plain columns
// in LR keep it — and the X between them IS the rule.
defs["C-getallen"] = `flowchart LR
  T1["seksen<br/>80"]:::slot
  T2["dört<br/>4"]:::moved
  N1["vier"]:::moved
  N3["tachtig"]:::slot
  T1 --> N3
  T2 --> N1
  N1 --> W["vierentachtig<br/>84 · tek sözcük"]:::verb
  N3 --> W
${classDefs}`;

// ───────── D — Mermaid block ─────────
// A sentence as a row of labelled slots. The natural fit for V2 and for the separable verb.

const blockInit = `%%{init: {"themeVariables": {"fontSize": "20px"}}}%%\n`;

defs["D-v2"] = blockInit + `block-beta
  columns 4
  h1["1. yuva"] h2["2. yuva — çekimli eylem"] h3["3."] h4["kalanı"]
  a1["Ik"] a2["lees"] a3["elke dag"] a4["de krant"]
  b1["Elke dag"] b2["lees"] b3["ik"] b4["de krant"]
  c1["De krant"] c2["lees"] c3["ik"] c4["elke dag"]
  d1["De man met de hoed"] d2["loopt"] d3["naar huis"] d4[" "]
  class h1 slot
  class h2 verb
  class h3 slot
  class h4 slot
  class a2 verb
  class b2 verb
  class c2 verb
  class d2 verb
  class b1 moved
  class c1 moved
  class b3 moved
  class c3 moved
${classDefs}`;

defs["D-scheidbaar"] = blockInit + `block-beta
  columns 5
  s["sözlükte"]:5
  t1["op"] t2["bellen"] t3[" "]:3
  u["cümlede"]:5
  v1["Ik"] v2["bel"] v3["mijn moeder"] v4[" "] v5["op"]
  w1["Hij"] w2["komt"] w3["om acht uur"] w4[" "] w5["aan"]
  x1["Ik"] x2["neem"] x3["mijn broer"] x4["morgen"] x5["mee"]
  t1 --> v5
  class s note
  class u note
  class t1 moved
  class t2 verb
  class v2 verb
  class w2 verb
  class x2 verb
  class v5 moved
  class w5 moved
  class x5 moved
${classDefs}`;

defs["D-getallen"] = blockInit + `block-beta
  columns 3
  a["4"] b["ve"] c["80"]
  d["vier"] e["en"] f["tachtig"]
  g["vierentachtig = 84"]:3
  h["Türkçe: seksen dört — ters sırada"]:3
  class a moved
  class c slot
  class d moved
  class f slot
  class b slot
  class e slot
  class g verb
  class h note
${classDefs}`;

defs["D-dehet"] = blockInit + `block-beta
  columns 2
  h1["her zaman de"] h2["her zaman het"]
  a1["çoğullar<br/>de huizen"] a2["-je küçültme<br/>het huisje"]
  b1["tekillerin ~%75'i<br/>de man"] b2["-ment · -isme · -sel<br/>het argument"]
  c1[" "] c2["ad olmuş mastar<br/>het zwemmen"]
  d1[" "] d2["dil · renk · ge-<br/>het Nederlands"]
  class h1 de
  class h2 het
  class a1 de
  class b1 de
  class a2 het
  class b2 het
  class c2 het
  class d2 het
${classDefs}`;

// ───────── E — Mermaid railroad-ebnf-beta ─────────
// Railroad diagrams exist to draw the permitted orders of a sequence. No earlier ticket has tried this.

// Abstract slot names taught nothing, so every rule here is drawn with the words the learner will say.
// The choice column is what railroad does that prose cannot: it shows one fixed step after many free ones.
defs["E-v2"] = `railroad-ebnf-beta
hoofdzin = ( "Ik" | "Elke dag" | "De krant" | "De man met de hoed" ), "lees", rest ;`;

defs["E-v2-abstract"] = `railroad-ebnf-beta
hoofdzin = voorveld, werkwoord, ( onderwerp | "" ), rest ;`;

defs["E-scheidbaar"] = `railroad-ebnf-beta
zin = "Ik", "bel", ( "mijn moeder" | "haar morgen" | "" ), "op" ;`;

defs["E-dehet"] = `railroad-ebnf-beta
de = ( meervoud | "de man" | "de vrouw" ) ;`;

defs["E-dehet-regel"] = `railroad-ebnf-beta
het = ( "-je" | "-ment" | "-isme" | "-sel" | infinitief | taal | kleur ) ;`;

defs["E-getallen"] = `railroad-ebnf-beta
getal = ( "een" | "twee" | "drie" | "vier" ), "en", ( "twintig" | "veertig" | "tachtig" ) ;`;

defs["E-zin"] = `railroad-ebnf-beta
bijzin = "omdat", onderwerp, rest, werkwoord ;`;

// ───────── render ─────────
const only = process.argv[4] ? new RegExp(process.argv[4]) : null;
fs.mkdirSync(S + "/check", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<div></div>`);
await p.addScriptTag({ path: S + "/mermaid.min.js" });
await p.evaluate(() => mermaid.initialize({ startOnLoad: false, theme: "base", fontFamily: "Inter, Arial, sans-serif", flowchart: { htmlLabels: false }, block: { padding: 10 } }));
for (const [k, d] of Object.entries(defs)) {
  if (only && !only.test(k)) continue;
  const t = Date.now();
  const r = await p.evaluate(async ([k, d]) => { try { return { ok: true, svg: (await mermaid.render("m" + k.replace(/\W/g, ""), d)).svg }; } catch (e) { return { ok: false, err: String(e.message || e).slice(0, 300) }; } }, [k, d]);
  if (!r.ok) { console.log(k, "FAIL", r.err); continue; }
  // an <img> parses SVG as strict XML: an unclosed <br> from a label breaks the whole image
  r.svg = r.svg.replace(/<br>/g, "<br/>");
  fs.writeFileSync(`${OUT}/${k}.svg`, r.svg);
  fs.writeFileSync(`${S}/check/${k}.mmd`, d);
  for (const w of [390, 820]) {
    const q2 = await b.newPage({ viewport: { width: w, height: 600 } });
    await q2.setContent(`<body style="margin:0;background:#fff"><div style="max-width:${w - 40}px;margin:20px">${r.svg}</div></body>`);
    await q2.waitForTimeout(150);
    await q2.screenshot({ path: `${S}/check/${k}-${w}.png`, fullPage: true });
    await q2.close();
  }
  console.log(k, "OK", r.svg.length, (Date.now() - t) + "ms");
}
await b.close();
