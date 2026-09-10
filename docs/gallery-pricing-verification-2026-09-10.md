# Gallery pricing verification — 10 September 2026

Implementation is ready for rollout review. Public pricing is still disabled in
Sanity; no application deployment was performed as part of these checks.

## Applied configuration

- Owner-confirmed category charges and deferred categories were saved in Sanity.
- 347 reviewed finish labels were saved: 112 coins/Hatris/Singhasans and
  235 idols. The owner confirmed HM-GN-16 (Ganesha with Cobra Hood) as hollow
  steel polish after viewing its photo. Its saved label and inherited ₹30/g making
  charge were read back successfully. Construction and gallery sections were preserved.
- The hosted “DDA Silver production revalidation” webhook now includes
  `galleryPricing`, deity and image-asset events, draft/release exclusions and
  a deletion-aware projection. Its enabled state, destination and authentication
  were preserved. The updated rule was read back successfully.
- The final catalogue audit checked all 631 products with zero pricing gaps.
  The 109 products in deferred categories and six gold products are excluded
  from pricing requirements; all remaining 516 products have coverage.

## Checks completed

- Sanity schema extraction/type generation passed.
- ESLint, TypeScript and the production build passed.
- 49 test files / 238 tests passed, including rate boundaries, manual totals,
  explicit zero, category/import validation, outage retention and storage locking.
- Separate Linux Docker containers using a shared test volume as UID 1000 passed
  seed/restart/replacement checks, primary corruption with backup recovery and
  abandoned-lock recovery. This was an isolated test volume, not the production
  application's mount.
- Chromium desktop (1440 px) and mobile (390 px) checks passed without runtime
  errors or horizontal overflow. Cards show only the amount, with no “Approx.”
  prefix or date; details show the dated disclosure. Dialogs retain their card's
  estimate while newly requested full pages pick up a changed rate.
- With JavaScript disabled, prices remain visible on gallery and full product
  pages. Parsing the initial HTTP HTML confirms ordinary product `href` links
  and the price as visible text. No structured-data `Offer` was added.
- No pricing, rates or catalogue polling occurred during a 35-second idle browser
  observation. Browser tests used an isolated synthetic rate, never written to
  Sanity or the production reference store.
- A real anonymous feed seed subsequently passed, preserving its source timestamp
  in the local ignored `.gallery-pricing` store. The first local attempt had no
  configured feed URL; the successful retry respected the persisted five-minute
  gate. This local reference is not a substitute for seeding the production mount.

## Local warm-response timing

Two warmup requests followed by ten complete HTML-response samples per route on
the same local machine. These are server response observations, not Core Web
Vitals or production latency guarantees.

| Route | Before median | Pricing median | Pricing slowest sample |
| --- | ---: | ---: | ---: |
| `/` | 6.7 ms | 30.4 ms | 39.4 ms |
| `/products` | 28.8 ms | 49.3 ms | 56.1 ms |
| `/products/dda-10-gram-silver-coin` | 16.6 ms | 32.4 ms | 39.1 ms |

The measured increase was about 16–24 ms. Catalogue caching remains enabled;
the due upstream refresh runs after the response.

## Remaining activation steps

Mount and verify the actual production persistent directory across replacement containers, seed it
from the live feed, deploy the verified code and then enable Gallery Pricing.
The [implementation and rollout guide](gallery-pricing.md) contains the commands,
storage requirements and rollback procedure. Search Console verification must
use the deployed, enabled production pages; local HTML checks cannot establish
Google indexing or a price's appearance in search results.
