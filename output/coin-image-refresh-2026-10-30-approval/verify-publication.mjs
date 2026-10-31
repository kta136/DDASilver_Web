import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = 'public/images/gallery-ingestion/coin-image-refresh-2026-10-30/';
const read = async name => JSON.parse(await fs.readFile(base + name, 'utf8'));
const [manifest, mapping, before] = await Promise.all([read('sanity-gallery-manifest.json'), read('sanity-assets.json'), read('sanity-before-publication.json')]);
const json = async url => {const r=await fetch(url); if(!r.ok)throw Error(`HTTP ${r.status}: ${url}`);return r.json();};
const url=new URL('https://f6i0fy2f.api.sanity.io/v2026-08-09/data/query/production');
url.searchParams.set('query','*[_id in '+JSON.stringify(manifest.products.map(p=>p.id))+']');
const after=await json(url);
assert.equal(after.result.length,86);
const beforeById=new Map(before.result.map(p=>[p._id,p]));
const assets=new Map(mapping.assets.map(p=>[p.productId,p]));
const withoutGallery=p=>Object.fromEntries(Object.entries(p).filter(([key])=>!['gallery','_rev','_updatedAt'].includes(key)));
let preservedViews=0;
for(const p of after.result){
 const old=beforeById.get(p._id);
 assert.equal(p.gallery[0].asset._ref,assets.get(p._id).sanityAssetId,p._id+' cover');
 assert.deepEqual(p.gallery.slice(1),old.gallery,p._id+' existing views');
 assert.deepEqual(withoutGallery(p),withoutGallery(old),p._id+' metadata');
 preservedViews+=old.gallery.length;
}
await fs.writeFile(base+'sanity-after-publication.json',JSON.stringify(after,null,2)+'\n');
const first=await json('https://www.ddasilver.com/api/catalog?category=coin');
const pages=[first,...await Promise.all(Array.from({length:Math.ceil(first.total/first.pageSize)-1},(_,i)=>json('https://www.ddasilver.com/api/catalog?category=coin&page='+(i+2))))];
const products=pages.flatMap(p=>p.products);
assert.equal(products.length,86);
assert.equal(new Set(products.map(p=>p._id)).size,86);
for(const p of products){
 assert.ok(p.images[0].src.includes(assets.get(p._id).sanityAssetId.replace(/^image-/,'').replace(/-png$/,'.png')),p._id+' website cover');
 assert.equal(p.images[0].width,1254);
 assert.equal(p.images[0].height,1254);
}
const report={verifiedAt:new Date().toISOString(),publishedProducts:86,publishedCoverAssets:86,preservedGalleryViews:preservedViews,unchangedNonGalleryProductDocuments:86,websiteProducts:products.length,websiteNewCovers:86,websitePricesAvailable:products.filter(p=>p.estimate?.status==='available').length,websiteDegraded:pages.some(p=>p.degraded),allChecksPassed:true};
await fs.writeFile(base+'publication-verification.json',JSON.stringify(report,null,2)+'\n');
manifest.published=true;manifest.publishedAt=after.result[0]._updatedAt;manifest.verifiedAt=report.verifiedAt;manifest.verificationPath=base+'publication-verification.json';
await fs.writeFile(base+'sanity-gallery-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
