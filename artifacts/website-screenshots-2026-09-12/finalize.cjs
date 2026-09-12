/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node capture utility. */
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));
const extra=['mobile/home--cookie-banner.png','mobile/home--cookie-preferences.png','desktop/home--cookie-preferences.png','mobile/home--menu-open.png'];
m.interactiveScreenshots=extra;
m.scope='29 public main, category, collection, guide, policy and login pages, plus two product examples; desktop and mobile. Catalog pagination is represented by its initial page. Authenticated account and Sanity admin screens are excluded.';
const keep=new Set([...m.pages.flatMap(p=>[p.file,...p.sections]),...extra]);
for(const dir of ['desktop','mobile'])for(const name of fs.readdirSync(path.join(root,dir))){
 const relative=`${dir}/${name}`;
 const target=path.resolve(root,relative);
 if(!target.startsWith(path.resolve(root)+path.sep))throw Error('Path outside archive');
 if(name.endsWith('.png')&&!keep.has(relative))fs.unlinkSync(target);
}
for(const file of keep)if(!fs.existsSync(path.join(root,file)))throw Error(`Missing ${file}`);
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(m,null,2));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('complete public website screenshots','website page screenshots').replace('DDA Silver — complete public website screenshots','DDA Silver — website page screenshots');
html=html.replace('<input placeholder=',`<p>${m.scope}</p><h2>Menus and cookie preferences</h2><p>${extra.map(f=>`<a href="${f}">${f.replace('.png','')}</a>`).join(' · ')}</p><input placeholder=`);
fs.writeFileSync(path.join(root,'index.html'),html);
fs.writeFileSync(path.join(root,'README.md'),`# DDA Silver screenshot archive\n\nCaptured from https://www.ddasilver.com on 12 September 2026.\n\n${m.scope}\n\nOpen index.html to browse all captures. There are ${m.pages.length} full-page screenshots, ${m.pages.reduce((n,p)=>n+p.sections.length,0)} section screenshots and ${extra.length} interactive state screenshots. All captured routes returned HTTP 200; no broken images were detected.\n\nDesktop: 1440 × 1000. Mobile: 390 × 844. Full-page PNG height varies with content.\n`);
console.log(JSON.stringify({pages:m.pages.length,sections:m.pages.reduce((n,p)=>n+p.sections.length,0),extras:extra.length,total:keep.size}));
