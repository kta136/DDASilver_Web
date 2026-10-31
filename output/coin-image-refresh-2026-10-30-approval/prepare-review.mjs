import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const base = path.join(root, 'public/images/gallery-ingestion/coin-image-refresh-2026-10-30');
const manifestPath = path.join(base, 'sanity-gallery-manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
if (manifest.published) throw Error('This batch is published; do not overwrite its publication records.');
const approved = JSON.parse(await fs.readFile(path.join(root, 'output/coin-image-refresh-2026-10-30-approval/preview-manifest.json'), 'utf8'));
for (const p of manifest.products.filter(p => p.status === 'owner-approved')) {
  const preview = approved.products.find(row => row.id === p.id);
  if (!preview?.imageSha256) throw Error(`Missing approved preview evidence: ${p.number}`);
  p.imageSha256 = preview.imageSha256.toUpperCase();
  p.imageDimensions = {width:preview.width, height:preview.height, format:preview.format, fullyDecoded:preview.fullyDecoded};
  p.visualReviewNotes = preview.reviewNotes;
}
const ids = manifest.products.map(p => p.id);
const query = '*[_id in $ids]';
const url = new URL('https://f6i0fy2f.api.sanity.io/v2026-08-09/data/query/production');
url.searchParams.set('query', query);
url.searchParams.set('$ids', JSON.stringify(ids));
const response = await fetch(url);
if (!response.ok) throw Error(`Read-only Sanity fetch failed: ${response.status}`);
const snapshot = await response.json();
if (snapshot.result?.length !== 86) throw Error('Expected 86 existing product documents');
snapshot.fetchedAt = new Date().toISOString();
await fs.writeFile(path.join(base, 'sanity-before-image-refresh.json'), JSON.stringify(snapshot, null, 2) + '\n');
const byId = new Map(snapshot.result.map(p => [p._id, p]));
const hash = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const dimensions = ['heightInches', 'widthInches', 'depthInches', 'diameterInches'];
const proposals = [];
let dimensionsAvailable = 0;
let sourceViews = 0;
for (const p of manifest.products) {
  const existing = byId.get(p.id);
  if (!existing?._rev || existing.reference !== p.reference) throw Error(`Product identity changed: ${p.id}`);
  if (hash(await fs.readFile(p.sourcePath)) !== p.sourceSha256) throw Error(`Source modified: ${p.number}`);
  const image = await fs.readFile(path.resolve(root, p.imagePath));
  if (hash(image) !== p.imageSha256) throw Error(`Cover modified: ${p.number}`);
  const metadata = await sharp(image).metadata();
  if (metadata.width !== 1254 || metadata.height !== 1254 || metadata.format !== 'png') throw Error(`Invalid image: ${p.number}`);
  await sharp(image).raw().toBuffer();
  p.existingRevision = existing._rev;
  p.metadataSource = 'sanity-before-image-refresh.json';
  p.recordType = 'alternateGalleryImage';
  p.createProduct = false;
  p.parentProductId = existing._id;
  p.parentReference = existing.reference;
  p.updateParentMetadata = false;
  p.existingGalleryRaw = existing.gallery || [];
  sourceViews += p.existingGalleryRaw.length;
  for (const field of dimensions) {
    delete p[field];
    if (existing[field] != null) p[field] = existing[field];
  }
  const hasDimensions = dimensions.some(field => typeof p[field] === 'number' && p[field] > 0);
  if (hasDimensions) dimensionsAvailable++;
  p.publishBlockers = hasDimensions ? [] : ['Physical dimensions are absent from the existing Sanity product. Leave them unchanged for this image-only refresh; verify before any full product republication.'];
  p.existingMetadata = Object.fromEntries(['title', 'slug', 'shortDescription', 'material', 'purity', 'weightGrams', 'pricing', 'coinShape', ...dimensions].filter(field => existing[field] !== undefined).map(field => [field, existing[field]]));
  proposals.push({number:p.number, productId:existing._id, reference:p.reference, title:existing.title, revisionAtPreparation:existing._rev, action:'Prepend one refreshed cover; retain every existing gallery image in its current order.', imagePath:p.imagePath, imageSha256:p.imageSha256, alt:p.alt, existingGallery:existing.gallery || [], allowedFields:['gallery'], updateProductMetadata:false, uploadAuthorized:false});
}
manifest.readyForSanityAssetUpload = true;
manifest.readyForProductPublish = false;
manifest.uploadAuthorized = false;
manifest.published = false;
manifest.completedAt = new Date().toISOString();
manifest.sourceFormat = 'PNG';
manifest.originalPngSourceCount = 86;
manifest.originalSourceCountNote = 'Legacy validator counts JPEGs only. This batch uses 86 distinct existing PNG product images, all verified by SHA-256.';
manifest.publishBlockers = ['Sanity upload has not been authorized for this coin refresh.', 'The existing mixed-gallery publisher appends alternate images. The cover-first publication plan requires a reviewed gallery reorder after attachment; do not apply this manifest as-is.'];
manifest.metadataReviewNotes = ['Existing catalogue purity is retained as metadata context. Some photographed stamps read 999 or 9999; no purity or pricing change is proposed.', 'This is an image-only proposal: no products, prices, weights, titles, descriptions or dimensions will be replaced.'];
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile(path.join(base, 'image-only-publication-plan.json'), JSON.stringify({schemaVersion:1, batchId:manifest.batchId, executable:false, uploadAuthorized:false, projectId:'f6i0fy2f', dataset:'production', preparedAt:manifest.completedAt, products:proposals}, null, 2) + '\n');

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href = file => path.relative(base, file).split(path.sep).map(encodeURIComponent).join('/');
const cards = manifest.products.map(p => `<article id="coin-${p.number}" data-search="${esc((p.title+' '+p.reference).toLowerCase())}"><h2>${p.number}. ${esc(p.title)}</h2><p>${esc(p.reference)} · ${p.weightGrams}g · ${esc(p.coinShape)}</p><div class="pair"><figure><a href="${href(p.sourcePath)}"><img loading="lazy" width="1254" height="1254" src="${href(p.sourcePath)}" alt="Original photograph of ${esc(p.title)}"></a><figcaption>Original</figcaption></figure><figure><a href="${href(path.resolve(root,p.imagePath))}"><img loading="lazy" width="1254" height="1254" src="${href(path.resolve(root,p.imagePath))}" alt="${esc(p.alt)}"></a><figcaption>Refreshed cover</figcaption></figure></div></article>`).join('\n');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DDA Silver · Coin image review</title><style>*{box-sizing:border-box}body{margin:0;background:#f6f3ef;color:#282522;font:16px/1.5 system-ui,sans-serif}header,main{max-width:1320px;margin:auto;padding:28px}header{padding-bottom:0}h1{font-size:32px;line-height:1.15;margin:0 0 12px}h2{font-size:18px;margin:0}p{margin:8px 0 16px;color:#615950}input{width:100%;max-width:580px;padding:12px;border:1px solid #b8aea3;border-radius:6px;font:inherit;background:white}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{background:white;border:1px solid #e3dcd4;border-radius:10px;padding:18px;min-width:0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}img{width:100%;height:auto;display:block;border:1px solid #eee8e1}figcaption{text-align:center;font-size:14px;margin-top:6px}article[hidden]{display:none}a{color:#80502f}@media(max-width:800px){main{grid-template-columns:1fr;padding:16px}header{padding:20px}h1{font-size:26px}}</style><header><h1>Coin image review</h1><p>86 refreshed silver coin covers · 1254 × 1254 PNG · AI-assisted presentation using existing images</p><p>The original photos remain preserved. The proposed update adds each refreshed cover first and retains every existing gallery view. No Sanity upload has been made.</p><label for="search">Find a coin</label><br><input id="search" type="search" placeholder="Search by design, weight or reference"><p id="count" aria-live="polite">86 products</p><p>Click an image to inspect it at full size. <a href="gallery-review.csv">Metadata CSV</a> · <a href="validation-report.json">Validation report</a></p></header><main>${cards}</main><script>const search=document.querySelector('#search');const cards=[...document.querySelectorAll('article')];search.addEventListener('input',()=>{const query=search.value.toLowerCase().trim();let count=0;for(const card of cards){card.hidden=!card.dataset.search.includes(query);if(!card.hidden)count++}document.querySelector('#count').textContent=count+' products'});</script></html>`;
await fs.writeFile(path.join(base, 'review.html'), html);
console.log(JSON.stringify({products:86, validImages:86, preservedSources:86, existingGalleryViews:sourceViews, productsWithPhysicalDimensions:dimensionsAvailable, published:false, review:path.join(base,'review.html')},null,2));
