# Gold coin and bar reference codes

Approved on 8 October 2026. The Sanity `reference` field uses `GC-<sequence>`
for Gold Coins and `GB-<sequence>` for Gold Bars. These codes appear in product
details and WhatsApp enquiries. Product titles remain unchanged.

## Assignments

| Product | Previous reference | Canonical reference |
| --- | --- | --- |
| 4 g Queen Victoria gold coin | DDA-GOLD-20260822-075 | GC-1 |
| 8 g Queen Victoria gold coin | DDA-GOLD-20260822-072 | GC-2 |
| 1 g fine gold bar | DDA-GOLD-20260822-054 | GB-1 |
| 2 g classical profile fine gold bar | DDA-GOLD-20260822-076 | GB-2 |
| 5 g classical profile fine gold bar | DDA-GOLD-20260822-063 | GB-3 |
| 10 g classical profile fine gold bar | DDA-GOLD-20260822-071 | GB-4 |

## Numbering and imports

- Each sequence starts at 1 and uses positive integers without zero-padding.
- Ascending weight determined the initial assignments only. Issued codes are
  permanent and must never be reused or renumbered, including unpublished items.
- Future products receive the next unused number in their own sequence. Check
  published products, drafts, and recorded assignments before issuing a code;
  the next currently unissued codes are `GC-3` and `GB-5`.
- The machine-readable assignments are in
  [`gold-reference-mapping.json`](../scripts/sanity/gold-reference-mapping.json).
  The batch generator uses this fixed mapping and rejects unassigned gold items.
- Keep the source manifest, review CSV, and Sanity asset mapping synchronized.
  Reference normalization preserves document IDs, slugs, image assets, metadata,
  pricing, and display order.

## Default gallery order

The owner-selected Recommended order is **1 g bar, 2 g bar, 5 g bar, 10 g bar,
4 g coin, 8 g coin** (`GB-1`, `GB-2`, `GB-3`, `GB-4`, `GC-1`, `GC-2`).
The mapping records the corresponding Sanity `displayOrder` values, reusing the
six existing gold display slots. The mixed-gallery publisher uses these saved
values so reimports retain the order. Explicit price and weight sorting remain
available through the existing gallery controls.

Run `npm run sanity:order-gold-products` for a dry run and
`npm run sanity:order-gold-products:apply` to update only `displayOrder`, with
the same identity, revision, and unchanged-content checks as reference migration.

## Migration

Run `npm run sanity:normalize-gold-references` for a dry run, then
`npm run sanity:normalize-gold-references:apply` to apply it to the recorded
Sanity project and dataset. The migration checks identities and reference
collisions using raw perspective, updates published records and existing drafts
in a revision-guarded transaction, and verifies all other content is unchanged.
Draft changes are not published. Repeating the command makes no further changes.

The Queen Victoria purity maintenance script accepts both legacy and canonical
references so it can run before or after the reference migration.

## Verification on 8 October 2026

- Applied six published reference changes in `f6i0fy2f/production`; no matching
  drafts or reference collisions were present. Full document readback and an
  independent before/after comparison confirmed all other content was unchanged.
- A second migration dry run reported zero changes. The Queen Victoria purity
  maintenance dry run passed both before and after migration.
- The existing mixed-gallery publisher dry run validated the 80 source records
  and their asset mappings, with all 76 existing product candidates marked SKIP.
- Verified all six public product pages returned HTTP 200, displayed their new
  references, and included the same codes in WhatsApp enquiry links. No previous
  references remained in those page responses.
- Targeted ESLint and TypeScript checks passed. The existing product-details,
  WhatsApp, and catalog-domain suites passed all 24 tests. The batch generator
  returned all six fixed assignments and rejected an unassigned gold record.
- Applied the subsequent default-order request by changing four published
  `displayOrder` values; all six products retained their other fields. Both
  migration dry runs then reported zero changes. Live HTML checks
  confirmed bars at 1, 2, 5, and 10 g followed by coins at 4 and 8 g. Targeted
  ESLint, TypeScript, and the importer dry run passed after the ordering change.
