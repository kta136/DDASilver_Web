import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('artifacts/dda-redesign-2026-09-12/implementation-b/verification');
await mkdir(out,{recursive:true});
const source=JSON.parse(await readFile('artifacts/website-screenshots-2026-09-12/manifest.json','utf8'));
const routes=[...new Set(source.pages.map(p=>p.route))];
const captureRoutes=new Set(['/','/products','/rates','/about','/contact','/guides','/privacy','/login',routes.find(r=>r.startsWith('/category/')),routes.find(r=>r.startsWith('/products/'))]);
const browser=await chromium.launch({headless:true});
const results=[];
await Promise.all([['desktop',1536,1024],['mobile',390,844]].map(async ([name,width,height])=>{
 const context=await browser.newContext({viewport:{width,height}});
 await context.addInitScript(()=>localStorage.setItem('dda-consent-v1',JSON.stringify({analytics:false,advertising:false,updatedAt:new Date().toISOString()})));
 const page=await context.newPage();
 for(const route of routes){
  const errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);
  try{
   const response=await page.goto('http://localhost:3000'+route,{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('h1').waitFor();
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(500);
   const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent,brokenImages:[...document.images].filter(i=>i.complete&&i.currentSrc&&i.naturalWidth===0).map(i=>i.alt)}));
   const file=name+'-'+(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'.png';
   if(captureRoutes.has(route))await page.screenshot({path:path.join(out,file),fullPage:true});
   results.push({route,viewport:name,status:response.status(),...state,errors,screenshot:captureRoutes.has(route)?file:null});
   console.log(name,route,response.status(),state.scrollWidth>width?'OVERFLOW':'OK');
  }catch(error){results.push({route,viewport:name,error:String(error)});console.log(name,route,String(error));}
  page.off('pageerror',listener);
 }
 await context.close();
}));
await browser.close();
await writeFile(path.join(out,'report.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({checked:results.length,issues:results.filter(r=>r.error||r.status!==200||r.scrollWidth>r.width||r.errors?.length||r.brokenImages?.length)},null,2));
