const {chromium}=require("playwright");const fs=require("fs");
(async()=>{const b=await chromium.connectOverCDP("http://127.0.0.1:9222");
for(const p of b.contexts()[0].pages()){
  if(!p.url().includes("gemini.google.com"))continue;
  const b64=await p.evaluate(async()=>{const imgs=[...document.querySelectorAll("img")].filter(i=>i.naturalWidth>=400&&i.src.startsWith("blob:"));if(!imgs.length)return null;const r=await fetch(imgs[0].src);const bl=await r.blob();return await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(bl)})}).catch(()=>null);
  if(b64){const [m,d]=b64.split(",");const ext=/jpeg/.test(m)?"jpg":"png";fs.writeFileSync(`/home/neo/projects/atilileri.github.io/public/prototype/dutch-hook-images/r3/default.${ext}`,Buffer.from(d,"base64"));console.log("recovered",ext,p.url().slice(0,60));break;}
}
await b.close();})().catch(e=>console.log("error",String(e).slice(0,200)));
