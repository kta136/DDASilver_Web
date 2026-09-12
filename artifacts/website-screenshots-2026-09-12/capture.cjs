/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node capture utility. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const base = 'https://www.ddasilver.com';
const allUrls = fs.readFileSync(path.join(root,'source-urls.txt'),'utf8').trim().split(/\r?\n/).map(s=>s.replace(/^\uFEFF/,''));
const urls = [...new Set([...allUrls.filter(u=>!new URL(u).pathname.startsWith('/products/')), ...allUrls.filter(u=>new URL(u).pathname.startsWith('/products/')).slice(0,2), ...['privacy','terms','cookies','rates-disclaimer','login'].map(p=>`${base}/${p}`)])];
const results = [];
const slug = url => new URL(url).pathname.replace(/^\/$/,'home').replace(/^\//,'').replace(/[^a-z0-9-]/gi,'--');
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function saveIndex(){
 fs.writeFileSync(path.join(root,'manifest.json'), JSON.stringify({base,capturedAt:new Date().toISOString(),viewports:{desktop:[1440,1000],mobile:[390,844]},pages:results},null,2));
 fs.writeFileSync(path.join(root,'index.html'),`<!doctype html><meta charset="utf-8"><title>DDA Silver screenshot archive</title><style>body{font:16px system-ui;margin:32px;background:#faf7f2;color:#29231d}input{padding:12px;width:70%;position:sticky;top:10px}article{padding:16px 0;border-bottom:1px solid #ccc}a{margin-right:20px;color:#784826}img{max-width:200px;max-height:160px;object-fit:cover;object-position:top;vertical-align:top}small{color:#666}</style><h1>DDA Silver — complete public website screenshots</h1><p>Live site · Desktop 1440 × 1000 · Mobile 390 × 844 · ${results.length}/${urls.length*2} page captures. Full-page PNGs include all vertical content. Section images are provided for non-product pages. Guest session; protected account/admin screens are outside this archive.</p><input placeholder="Filter by page or viewport" oninput="document.querySelectorAll('article').forEach(x=>x.hidden=!x.textContent.toLowerCase().includes(this.value.toLowerCase()))"><p><a href="manifest.json">Capture manifest</a></p>${results.map(r=>`<article><b>${esc(r.viewport)} · ${esc(r.route)}</b> <small>HTTP ${r.status??'error'}</small><p>${r.file?`<a href="${r.file}"><img loading="lazy" src="${r.file}"></a><a href="${r.file}">Full page PNG</a>`:''}${(r.sections||[]).map((s,i)=>`<a href="${s}">Section ${i+1}</a>`).join(' ')}${r.error?esc(r.error):''}</p></article>`).join('')}`);
}
async function settle(page){
 await page.evaluate(async()=>{await document.fonts.ready;const imgs=[...document.images]; imgs.forEach(i=>i.loading='eager');await Promise.race([Promise.all(imgs.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r}))),new Promise(r=>setTimeout(r,12000))]);});
 await page.waitForTimeout(300);
}
(async()=>{
 const browser=await chromium.connectOverCDP(process.argv[2]);
 for(const v of ['desktop','mobile'])fs.mkdirSync(path.join(root,v),{recursive:true});
 let queue=urls.flatMap(url=>['desktop','mobile'].map(viewport=>({url,viewport})));
 let next=0;
 await Promise.all(Array.from({length:6},async()=>{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  while(next<queue.length){
   const {url,viewport}=queue[next++];
   const name=slug(url), prefix=`${viewport}/${name}`;
   const record={route:new URL(url).pathname,url,viewport,sections:[]};
   try{
    await page.setViewportSize(viewport==='desktop'?{width:1440,height:1000}:{width:390,height:844});
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});record.status=response.status();
    await settle(page);
    const consent=page.getByRole('button',{name:'Essential only',exact:true});if(await consent.isVisible())await consent.click();
    await settle(page);
    record.title=await page.title();
    record.brokenImages=await page.evaluate(()=>[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.currentSrc));
    record.file=`${prefix}.png`;await page.screenshot({path:path.join(root,record.file),fullPage:true,animations:'disabled',timeout:60000});
    if(!new URL(url).pathname.startsWith('/products/')){
     const height=await page.evaluate(()=>document.documentElement.scrollHeight);const step=viewport==='desktop'?900:744;
     for(let y=0,i=1;y<height;y+=step,i++){
      await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(100);
      const file=`${prefix}--section-${String(i).padStart(2,'0')}.png`;
      await page.screenshot({path:path.join(root,file),animations:'disabled'});record.sections.push(file);
     }
    }
   }catch(e){record.error=String(e.message);}
   results.push(record);saveIndex();
   console.log(`${results.length}/${queue.length} ${viewport} ${record.route} ${record.error?'ERROR':record.status}`);
  }
  await context.close();
 }));
 saveIndex();await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
