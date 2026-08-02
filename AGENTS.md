<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Product gallery ingestion is an end-to-end task

When a request asks to extract, enhance, clean, prepare, or generate product
images for the gallery or for Sanity, follow
[`docs/product-gallery-ingestion.md`](docs/product-gallery-ingestion.md).
Unless the user explicitly narrows the scope, complete the whole delivery in
the first pass:

1. Preserve the source photographs unchanged.
2. Use the approved DDA Silver background at
   `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`.
3. Use each real product photograph as the sole source of truth. AI-assisted
   compositing and retouching may change the background, lighting, colour cast,
   reflections, and presentation, but must not redesign the product, alter its
   proportions, or invent/remove decorative details.
4. Deliver square 1254 x 1254 gallery PNGs with consistent framing and useful,
   stable filenames.
5. In the same pass, create unique titles, concise descriptions, descriptive
   alt text, purity, weight, and the applicable physical dimensions (height,
   width, or diameter) for every item.
6. Produce and validate a Sanity-ready manifest. Use `category-utensils` for
   utensils and record any schema mismatch as a blocker instead of silently
   dropping metadata.

"Ready for the gallery" is not complete when only image files exist. It means
the branded images and their matching Sanity metadata are both ready for a dry
run or upload. Do not write to Sanity unless the user also authorizes the
upload.
