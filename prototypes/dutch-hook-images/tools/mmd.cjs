const {chromium}=require("playwright");const fs=require("fs");
const def=`flowchart TB
  V["opbellen · telefonla aramak"]:::verb
  V -- "çekimli kısım 2. sıraya" --> B["bel"]:::part
  V -- "ön ek cümle sonuna" --> O["op"]:::prefix
  B ~~~ S
  O ~~~ S
  subgraph S["Ik bel je morgen op. — Seni yarın ararım."]
    direction LR
    s1["1 · Ik"] --> s2["2 · bel"]:::part --> s3["je"] --> s4["morgen"] --> s5["son · op"]:::prefix
  end
  classDef verb fill:#fff4d6,stroke:#b8860b,stroke-width:2px
  classDef part fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px
  classDef prefix fill:#fde2e1,stroke:#b91c1c,stroke-width:2px`;
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.setContent(`<div id=m></div><script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>`);
await p.waitForFunction(()=>window.mermaid);
const svg=await p.evaluate(async d=>{mermaid.initialize({startOnLoad:false,theme:"base",fontFamily:"Inter, Arial, sans-serif",htmlLabels:false,flowchart:{htmlLabels:false}});const r=await mermaid.render("opbellen",d);return r.svg},def);
fs.writeFileSync(process.argv[2],svg);
await p.setContent(`<body style="margin:0;background:#fff">${svg}</body>`);await p.setViewportSize({width:800,height:700});
await p.screenshot({path:process.argv[3],fullPage:true});await b.close()})();
