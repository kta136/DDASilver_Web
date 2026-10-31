/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS audit script. */
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const dir = __dirname;
const esc = s => s.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
async function main() {
  const inventory = JSON.parse(await fs.readFile(path.join(dir,'sanity-coin-inventory.json'),'utf8'));
  const assets = inventory.result.flatMap((p,pi) => p.gallery.map((g,gi) => ({index:0,productIndex:pi+1,galleryIndex:gi+1,category:p.categoryId,title:p.title,slug:p.slug,url:g.asset.url,filename:g.asset.originalFilename,dimensions:g.asset.dimensions})));
  await fs.mkdir(path.join(dir,'assessment-a-assets'),{recursive:true});
  for(let start=0;start<assets.length;start+=8) await Promise.all(assets.slice(start,start+8).map(async(a,i)=> {
    a.index=start+i+1;
    a.localPath=path.join(dir,'assessment-a-assets',`${String(a.index).padStart(3,'0')}-${a.filename}`);
    try { await fs.access(a.localPath); } catch {
      const r=await fetch(a.url); if(!r.ok) throw new Error(`${r.status}: ${a.url}`);
      await fs.writeFile(a.localPath,Buffer.from(await r.arrayBuffer()));
    }
  }));
  await fs.writeFile(path.join(dir,'assessment-a-index.json'),JSON.stringify(assets,null,2));
  for(let start=0;start<assets.length;start+=16) {
    const group=assets.slice(start,start+16), composites=[];
    for(let i=0;i<group.length;i++) {
      const a=group[i], x=(i%4)*300,y=Math.floor(i/4)*352;
      const thumb=await sharp(a.localPath).resize(292,292,{fit:'contain',background:'#fff'}).png().toBuffer();
      composites.push({input:thumb,left:x+4,top:y+4});
      const title=`${a.index}. ${a.title.replace('DDA ','')}`;
      const words=title.split(' '),lines=[''];for(const word of words){if((lines.at(-1)+' '+word).length>38)lines.push(word);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+word;}
      const text=lines.slice(0,3).map((s,j)=>`<text x="6" y="${17+j*16}" font-family="Arial" font-size="13" fill="#111">${esc(s)}</text>`).join('');
      composites.push({input:Buffer.from(`<svg width="300" height="56">${text}</svg>`),left:x,top:y+296});
    }
    const name=`assessment-a-sheet-${String(start/16+1).padStart(2,'0')}.png`;
    await sharp({create:{width:1200,height:Math.ceil(group.length/4)*352,channels:3,background:'#f0f0f0'}}).composite(composites).png().toFile(path.join(dir,name));
    console.log(name);
  }
  console.log(`Downloaded ${assets.length} unmodified CDN assets; silver ${assets.filter(a=>a.category==='category-coin').length}.`);
}
main().catch(e=>{console.error(e);process.exit(1)});
