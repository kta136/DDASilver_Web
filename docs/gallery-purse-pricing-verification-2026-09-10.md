# Purse pricing and item-code correction — 10 September 2026

All 36 purses have owner-confirmed per-gram making charges and are live.
The rate transcript and document-level application record are retained in
[gallery-purse-making-2026-09-10.json](gallery-purse-making-2026-09-10.json).
PR-2 uses the owner's clarified ₹35/g charge.

## Final photo-confirmed charges and corrected codes

The owner supplied charges by the A–E photo comparison. The old import codes
were then replaced with consecutive codes after PR-31; this is a code correction,
not an inferred match to the earlier unmatched handwritten rows.

| Photo | Previous import code | Corrected code | Making charge |
| --- | --- | --- | --- |
| A — floral and striped panels, 405 g | PR-2201 | PR-32 | ₹15/g |
| B — woven lattice and gold clasp, 400 g | PR-2202 | PR-33 | ₹90/g |
| C — openwork scroll pattern, 450 g | PR-2203 | PR-34 | ₹15/g |
| D — peacock motif, 400 g | PR-2204 | PR-35 | ₹15/g |
| E — peacocks and red stones, 365 g | PR-2205 | PR-36 | ₹15/g |

Document IDs, product URLs, photos and weights were preserved. Product charges,
references and display order were saved using document revision guards, then
the active category coverage check passed before purse deferral was removed.
All 36 saved products were read back and checked for their exact rate, code and
position. Display order runs from 2010 to 2360 in increments of ten. Source
import manifests and asset mappings retain the corrected codes; mixed-gallery
publishing uses the same numeric purse display order on reimport.

Studio provides **Purses — item code order** using ascending display order,
with the item code shown in each product's subtitle. This avoids alphabetic
ordering such as PR-1, PR-10, PR-11, PR-2.

## Production checks

- `npm run check` passed: lint, TypeScript, 50 test files / 242 tests, and the
  production build.
- GitHub CI [34456555065](https://github.com/kta136/DDASilver_Web/actions/runs/34456555065)
  passed, including generated Sanity contracts and browser journeys. Deployment
  workflow [34456555123](https://github.com/kta136/DDASilver_Web/actions/runs/34456555123)
  passed for application commit `9737d201fcdf4e4a0f1a20abb83701801fa193df`.
- Coolify deployment `qbpztgb9oaj0rjiezfquyb8c` finished successfully. The
  post-deployment check at `2026-09-10T08:48:31Z` confirmed production version
  `9737d201fcdf`, healthy application/Sanity/pricing, all 36 purse prices, and the
  new Studio list configuration in the JavaScript actually served by `/studio`.
- Full catalogue audit: 631 products, zero pricing coverage failures. Deferred
  categories and gold retain their approved exclusions.
- Published price feed: 552 available estimates, zero unavailable estimates,
  and 79 excluded products (73 deferred boxes/gifts plus six gold products).
- Every purse total matched its verified weight, individual making charge and
  the actual persisted silver reference. The checked reference was ₹244,258/kg
  as of `2026-09-10T08:37:38.844Z`; it is verification evidence, not a fixed rate.
- Initial HTTP HTML contains prices and ordinary product links for all 36
  purses, in PR-1–PR-36 order across both gallery pages (24 plus 12 products).
- Gallery cards contain the price alone, without “Approx.” or a snapshot date.
- PR-33's dialog reused its card price and showed the corrected reference and
  rate date. All five corrected product pages showed their prices, codes and
  dates with JavaScript disabled; no structured-data Offer prices were added.
- Desktop and mobile screenshots were visually inspected. Mobile had no
  horizontal overflow and browser verification reported no runtime errors.
- The live Studio initially showed a connection setup screen because its
  production origin was missing from Sanity CORS. Added the exact credentialed
  origin `https://www.ddasilver.com` to project `f6i0fy2f`, then verified that
  `/studio` reaches the normal login-provider screen. The browser used for this
  check was signed out; the authenticated list is covered by its configuration,
  type/build checks and the ordered Content Lake readback.

The purse category has no generic making-charge fallback. Each future purse
requires a verified product override; the existing publishing coverage check
continues to enforce this.
