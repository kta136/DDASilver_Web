# DDA Silver: SEO and AI discovery audit

Date: 26 August 2026  
Website: [www.ddasilver.com](https://www.ddasilver.com/)  
Scope: recommendations only; no application, Sanity, Cloudflare, or search-account settings changed.

This is the original pre-change audit. See [implementation status](seo-ai-implementation-2026-08-26.md) for the subsequently authorized changes and remaining checks.

## Assessment

The website already has a sound crawlable catalog. The biggest opportunities are clearer product identities, useful buying information, stronger local-business evidence, and deliberate AI search access controls. Making content accessible does not guarantee that a search engine will index it or that an AI assistant will recommend it.

## What was checked

- Fetched and parsed all **581 URLs in the live sitemap**: **569 products**, **7 categories**, and **5 other pages**.
- Checked response status, canonical URL, title, description, H1, JSON-LD, product specifications, and product-image alt text in the returned HTML.
- Inspected the rendered homepage in Chrome, plus the relevant local Next.js, Sanity, metadata, sitemap, and robots code. The existing graph was used for navigation; its older snapshot was corroborated against current files.
- Probed a product page using Googlebot, bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, and Claude-User user-agent strings. All returned HTTP 200 with readable product content and metadata. These tests originate from this machine, **not verified crawler IP addresses**, so they cannot establish what Cloudflare serves to the real crawlers.
- Checked HTTP/HTTPS and apex/www redirects, one legacy URL, one missing product, and sample pagination/filter URLs.
- Reviewed current official Google, OpenAI, Anthropic, Perplexity, and Cloudflare guidance.

Not checked: private Search Console/Bing Webmaster Tools reports, Business Profile ownership, analytics performance, actual crawler logs, or product measurements against physical stock. The browser Lighthouse attempt failed with `NO_FCP`; its zero values are invalid, not site scores. No reliable performance score or field Core Web Vitals claim is made here. The crawl covers sitemap URLs, not every possible filter combination.

## Existing strengths to preserve

| Check | Live result |
| --- | --- |
| Sitemap responses | All 581 returned HTTP 200 |
| Canonicals | All 581 point to their own URL |
| H1 and descriptions | One H1 and a nonempty meta description on every sitemap page; no duplicate meta descriptions |
| Product markup | All 569 have parseable Product JSON-LD and a purity property |
| Product photographs | No empty alt text on product-page main images, including related cards |
| Discovery | Product/category links and sample pagination links exist in initial HTML; sample page 2 has its own canonical |
| Business schema | JewelryStore and WebSite markup, phone, address, and opening hours are present |
| Redirects | HTTPS/apex consolidation works; old booking URL redirects to /rates |
| Missing products | Tested nonexistent product returns HTTP 404 and noindex |
| Sitemap images | Product image URLs and product modification dates are included |

These observations establish technical availability, **not how many products Google or Bing have indexed**.

## Priority 1: fix clear defects and data gaps

### 1. Restore the homepage's featured products

The [homepage](https://www.ddasilver.com/) displays its featured section heading but no product cards. There are **zero direct product-detail links** on the homepage in both raw HTML and the rendered browser.

Check the four-product Sanity query, published `featured` flags, decoding, and cache freshness. Select four genuine representative products, render their cards on the server, and handle an empty selection deliberately. Do not substitute fictional stock. Add a check that alerts on an unexpectedly empty featured selection.

Separately, replace the current concept bowl hero and default business/social image with an approved real showroom or product photograph when suitable assets are available.

### 2. Make product titles distinguish the actual items

**233 titles contain application-generated ellipses. Six duplicate-title groups affect 20 product pages.** Some collisions come from truncation; others come from products sharing the same descriptive name. The helper clips page titles at 48 characters before the brand suffix.

Use concise, deliberately composed titles that preserve the feature distinguishing each item, such as its verified weight, size, finish, or design. Give Sanity an optional SEO title with a sensible fallback. Do not change stable product URLs solely to change titles.

For example, the two Durga-on-lion products are currently given the same title, despite their published specifications being 17 g and 160 g. Suitable alternatives are:

- `Durga Silver Idol on Lion, 17 g | DDA Silver`
- `Durga Silver Idol on Lion, 160 g | DDA Silver`

Keep their displayed names, structured names, and specifications consistent. Add a generated-title uniqueness check across the published catalog; merely increasing the character limit will not resolve all collisions.

### 3. Correct the gold category title

[/category/gold](https://www.ddasilver.com/category/gold) currently has the title **“Silver Gold Coins & Bars in Agra | DDA Silver”**. The category template prepends “Silver” indiscriminately, including in CollectionPage markup.

Use `Gold Coins & Bars in Agra | DDA Silver` and category-aware naming. Keep the existing canonical URL.

### 4. Complete the product facts that are missing

| Category | Products | Missing standalone weight field | Missing SKU/reference |
| --- | ---: | ---: | ---: |
| Coin | 86 | 33 | 0 |
| Gifts | 79 | 4 | 0 |
| Purse | 35 | 0 | 0 |
| Gold Coins & Bars | 6 | 0 | 0 |
| Utensils | 139 | 0 | 31 |
| Idols | 210 | 0 | 0 |
| Jhula | 14 | 0 | 0 |
| **Total** | **569** | **37** | **31** |

For example, the [10 g oval anniversary coin](https://www.ddasilver.com/products/dda-10-gram-oval-anniversary-silver-coin) states its weight in its name and sentence, but has no structured Weight property or corresponding specification row.

Populate authoritative Sanity fields from verified records, then use those fields in the visible specification table and JSON-LD. Inspect variant-based products separately before treating a missing standalone weight as an error. Assign missing references using the business's existing item-code convention; do not invent manufacturer GTINs. Add applicable dimensions where verified, particularly purse dimensions and coin diameters. Never estimate measurements from photographs.

## Priority 2: give customers and assistants better answers

### 5. Expand category pages and a few useful collections

The seven category pages currently have a short introductory sentence. The Sanity category description is capped at 240 characters. Add separate structured editorial fields instead of trying to fit everything into a meta description.

Improve the existing coins, idols, utensils, purses, and gifts pages with concise information on the actual range, applicable purities, dimensions, selection considerations, and how to enquire in Agra. Avoid repeating a large block on every product.

Create a small number of genuinely curated, internally linked collections where the catalog supports them, for example:

- Silver Ganesha idols
- Lakshmi–Ganesha silver idol pairs
- Silver pooja thali sets
- Silver wedding gifts

Current filters are useful for browsing, but arbitrary filter URLs canonicalize back to their category. Keep ordinary filters controlled; use stable, editorial landing pages for valuable selections rather than indexing every combination. Do not create a separate near-identical page for every deity, weight, purity, and city.

### 6. Add useful product and showroom information

Product descriptions currently contain **16–32 words, with a median of 22**. This is not a ranking violation, and there is no target word count. It does leave room for useful facts when available: construction, finish, what is included, approximate-versus-exact weight, care instructions, and the difference between similar designs.

Publish store-approved answers to real customer questions: how to choose a silver gift, what the displayed purity means, how to care for particular finishes, how quotations work, and which services the showroom actually offers. Link advice to relevant products. Do not assert hallmarking, shipping, engraving, buyback, safety benefits, or return terms without confirmation. FAQs should help visitors; special FAQ markup is not an AI visibility requirement.

### 7. Strengthen the business identity

Live JewelryStore markup has no `sameAs`, verified map place URL, coordinates, or postal code. The current map URL is a text search rather than an unambiguous place link.

Confirm the exact Google Business Profile, address/postcode, map pin, official social profiles, phone, opening hours, and brand spelling. Use the same verified details in the website, Business Profile, Bing Places, and relevant public listings. Do not confuse a registered office with the showroom.

Add real showroom/team photographs, accurately distinguish the DDA family history from the establishment date of DDA Silver, and link the sister brands consistently. Encourage genuine customer reviews without incentives or fabricated testimonials. Never apply a shop's overall rating to every product.

### 8. Make the public rates page useful without JavaScript

The initial HTML at [/rates](https://www.ddasilver.com/rates) shows dashes and a connection-not-started message, not actual rates. This does not prove that the live browser feed is broken; it means a crawler that does not execute the feed has little rate information to extract.

Render a short-lived **public-only** server snapshot with the rate type, currency, unit, purity where applicable, and explicit update time/timezone. Keep live browser updates. Define when cached data becomes stale and label or remove it accordingly. Never expose signed-in or privileged customer rates through HTML, JSON-LD, caches, or crawler endpoints.

Add a short explanation of public reference rates versus a final product quotation. Do not imply that a reference bullion rate is a retail product price.

## AI crawler policy: distinguish discovery from training

The live robots.txt is **not just the application file**: Cloudflare prepends managed rules. It contains `search=yes,ai-train=no,use=reference`, blocks GPTBot, ClaudeBot, Google-Extended and several other agents, and then includes the app's public allow/private disallow rules. `ai-input` is not explicitly specified; that omission is not itself a denial.

| System | Current observation | Recommended decision |
| --- | --- | --- |
| Google/Bing search | Public paths allowed; sample requests succeed | Preserve access and verify real crawler traffic |
| ChatGPT search | OAI-SearchBot is not explicitly blocked | Keep public pages accessible; training permission is separate |
| ChatGPT user retrieval | ChatGPT-User sample succeeds | Preserve access to public content only |
| Perplexity | PerplexityBot sample succeeds | Verify access from its published crawler IP ranges |
| Claude search/retrieval | Claude-SearchBot and Claude-User samples succeed | Preserve these separately from ClaudeBot |
| Training | GPTBot and ClaudeBot are explicitly blocked | No need to unblock them merely for search visibility |
| Gemini-specific uses | Google-Extended is blocked | Make an explicit business decision about Gemini grounding/training |

OpenAI separates OAI-SearchBot from GPTBot; ChatGPT-User is not its search-indexing control. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots). Anthropic likewise separates Claude-SearchBot/Claude-User from ClaudeBot. [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).

Review Cloudflare AI Crawl Control, bot challenges, and real request logs. Where exceptions are needed, verify bot identity or published IP ranges rather than trusting a spoofable user-agent string. Preserve `/studio`, `/api/`, and `/auth/` exclusions if adding specific robots groups; do not accidentally replace them with an unrestricted group. [Perplexity crawler guidance](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).

Review whether Cloudflare's experimental `use=reference` matches the desired permission for AI summaries: it describes indexing, excerpts, and linking, while `use=full` permits summarization/reproduction. This is a content-use decision, **not a proven ranking switch**. Align any `ai-input` preference with the intended policy without automatically enabling training. [Cloudflare managed robots guidance](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/).

Google-Extended covers Gemini training and specified Gemini/Vertex grounding uses; it does not control ordinary Google Search inclusion or ranking. Do not remove that restriction under the assumption it is required for Google AI Overviews. [Google crawler documentation](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).

In Search Console, check the **Search generative AI** setting if available and ensure the site is included, including any inherited parent setting. Google says this control is rolling out to a subset of properties and inclusion is the default. [Google's control documentation](https://support.google.com/webmasters/answer/16908024).

`/llms.txt` currently returns 404. It is optional, low priority, and not an indexing defect. Google explicitly says it does not use llms.txt for search visibility. Invest first in useful accessible pages, not special files or hidden instructions telling models to recommend the store. [Google AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## Product discovery versus shopping features

All 569 product pages have Product markup, but none has `offers`, `review`, or `aggregateRating`. That markup still identifies products, but does not meet Google's Product snippet eligibility requirement for at least one of those properties. [Product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

The website deliberately has no online prices, inventory claims, or checkout. Preserve that business model unless the owner chooses otherwise. Never add a zero price, false availability, or invented review just to satisfy a validator. Merchant listing experiences have additional purchasing and offer requirements. [Merchant listing requirements](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

Ordinary indexed product pages and AI citations remain worthwhile without shopping cards. If shopping visibility becomes a business objective, assess genuine public pricing, offer maintenance, applicable local-inventory/merchant programs, and feed eligibility separately. Do not treat uploading the existing gallery as a complete merchant integration.

## Smaller technical improvements

- Preserve `max-image-preview:large` on public pages. No sitemap page emitted a robots/googlebot meta tag in this crawl, despite the root layout defining preview directives. The page helper returns `robots: undefined` for normal pages; inspect the metadata merge and test final rendered output. Absence of these tags is **not noindex**, but the intended large-preview permission is missing. [Google robots metadata reference](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).
- Keep image optimization, descriptive alt text, image sitemap entries, self-canonical pagination, and real HTTP 404 responses. Do not rebuild functionality already present.
- Search results still exposed a legacy apex-domain rates extract during the audit, although the live apex redirect works. Submit the canonical sitemap and inspect selected URLs in Search Console; a stale search extract does not prove that the redirect is broken.
- Use field Core Web Vitals and a successful mobile lab run to prioritize performance work. Do not infer performance from the failed Lighthouse run or HTML size alone.
- Keep existing product-view, WhatsApp, phone, and directions events; verify collection and configure the relevant conversions rather than adding duplicate analytics events.

## Suggested delivery order and verification

| Stage | Work | Acceptance check |
| --- | --- | --- |
| First | Featured products, duplicate titles, gold naming, missing verified weights/references, preview directives | Four approved cards; no duplicate final product titles; correct gold label; visible and structured facts match |
| Next | Cloudflare/log review, Search Console/Bing sitemap checks, verified local identity | Real crawlers can access public content; private paths remain excluded; business details agree |
| Then | Improve existing category content and publish a few curated collections and customer guides | Unique useful content, real product links, stable canonicals, no unsupported claims |
| Rates | Public server snapshot with freshness and privacy safeguards | Readable without JavaScript; stale data labelled; no personal rates leaked |
| Ongoing measurement | Search/AI visibility and qualified enquiries | Compare indexed products, non-brand impressions/clicks, cited landing pages, and enquiry conversions against a baseline |

Use Search Console's generative AI performance report where it is available, plus analytics referrals and server logs; referral data does not capture every AI-assisted visit. Keep a small repeatable set of discovery questions for manual citation checks, but treat those as samples, not universal rankings. [Google's measurement guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## Implementation map

| Area | Local source |
| --- | --- |
| Title composition and metadata inheritance | [seo.ts](D:/Projects/DDASilver_Web/src/lib/seo.ts:7) |
| Product metadata and JSON-LD | [Product page](D:/Projects/DDASilver_Web/src/app/(site)/products/[slug]/page.tsx:43) |
| Category naming and content | [Category page](D:/Projects/DDASilver_Web/src/app/(site)/category/[slug]/page.tsx:25) |
| Featured selection and concept hero | [Homepage](D:/Projects/DDASilver_Web/src/app/(site)/page.tsx:30) |
| Product and editorial schema extensions | [Product schema](D:/Projects/DDASilver_Web/src/sanity/schemaTypes/product.ts:88), [category schema](D:/Projects/DDASilver_Web/src/sanity/schemaTypes/category.ts:39) |
| Business identity | [Root layout](D:/Projects/DDASilver_Web/src/app/layout.tsx:114), [site settings](D:/Projects/DDASilver_Web/src/lib/site.ts:1) |
| Public rates rendering | [Rates page](D:/Projects/DDASilver_Web/src/app/(site)/rates/page.tsx:1) |
| Origin robots rules | [robots.ts](D:/Projects/DDASilver_Web/src/app/robots.ts:1); Cloudflare's managed additions are outside this file |

The companion [URL audit CSV](D:/Projects/DDASilver_Web/docs/audits/seo-ai-discovery-2026-08-26.csv) records each sitemap page and flags duplicate titles, truncated titles, and missing product fields for follow-up.
