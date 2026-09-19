// PROTOTYPE route 3: drive the learner's signed-in Gemini over CDP and save the generated image.
const {chromium}=require("playwright");const fs=require("fs");
const [name,style]=process.argv.slice(2);
const OUT="/home/neo/projects/atilileri.github.io/public/prototype/dutch-hook-images/r3";
const scene="an angry chef in white chef's clothes with a name tag reading GORDON hides behind a long living-room curtain, raising a padel racket like a spatula; only his shoes under the curtain and his furious face peeking round its edge are visible; the curtain is labelled 'gordijn'.";
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.connectOverCDP("http://127.0.0.1:9222");
  const ctx=b.contexts()[0];const p=await ctx.newPage();
  await p.goto("https://gemini.google.com/app",{waitUntil:"domcontentloaded"});
  await p.waitForTimeout(4000);
  const tmp=p.getByRole("button",{name:"Temporary chat"});
  if(await tmp.count()){await tmp.first().click();await p.waitForTimeout(2500);}
  const box=p.locator('[contenteditable="true"][aria-label="Enter a prompt for Gemini"]');
  await box.click();
  await p.keyboard.insertText(`Create an image, square, ${style}: ${scene}`);await p.waitForTimeout(800);
  const t0=Date.now();await p.keyboard.press("Enter");
  let src=null;
  for(let i=0;i<90 && !src;i++){
    await p.waitForTimeout(2000);
    src=await p.evaluate(()=>{const imgs=[...document.querySelectorAll("img")].filter(i=>i.naturalWidth>=400&&!/avatar|profile|logo/i.test(i.src+i.alt));return imgs.length?imgs[imgs.length-1].src:null});
  }
  const secs=Math.round((Date.now()-t0)/1000);
  if(!src){await p.screenshot({path:`${OUT}/${name}-FAILED.png`});
    const text=await p.evaluate(()=>{const m=[...document.querySelectorAll("message-content, model-response")];return m.length?m[m.length-1].innerText.slice(0,400):document.body.innerText.slice(-400)});
    console.log(JSON.stringify({name,ok:false,secs,text}));await b.close();return;}
  await p.waitForTimeout(3000);
  const img=p.locator(`img[src="${src}"]`).last();
  let saved="element-screenshot";
  const b64=await p.evaluate(async u=>{try{const r=await fetch(u);const bl=await r.blob();return await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(bl)})}catch(e){return null}},src);
  if(b64){const [meta,data]=b64.split(",");const ext=/jpeg/.test(meta)?"jpg":/webp/.test(meta)?"webp":"png";fs.writeFileSync(`${OUT}/${name}.${ext}`,Buffer.from(data,"base64"));saved="full-res "+ext;}
  else {await p.mouse.move(0,0);await img.screenshot({path:`${OUT}/${name}.png`});}
  console.log(JSON.stringify({name,ok:true,secs,saved,src:src.slice(0,80)}));
  await b.close();
})().catch(e=>{console.log(JSON.stringify({name,ok:false,error:String(e).slice(0,300)}));process.exit(1)});
