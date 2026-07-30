# Idol item-code terminology

**Status:** Approved terminology
**Scope:** Products in the `Idols` category
**Sanity field:** `reference`

## Canonical format

Every hollow idol uses this item-code format:

```text
HM-<DEITY_OR_DESIGN_CODE>-<SEQUENCE>
```

The code is shown at the beginning of the Sanity Item Name:

```text
HM-GN-1 — Ganesha Silver Idol with Arch
```

Weight and height must not appear in the item code or Item Name. They belong
only in the product description.

## Terminology

| Code | Meaning | Usage |
| --- | --- | --- |
| `HM` | Hollow Murti | Required prefix for every hollow idol |
| `BK` | Bal Krishna | All Bal Krishna and Laddu Gopal designs |
| `GN` | Ganesha | All Ganesha designs |
| `KS` | Khatu Shyam | All Khatu Shyam designs |
| `SH` | Shiva | All Shiva types, including Shiva Family designs |
| `HN` | Hanuman | All Hanuman types, including Panchmukhi Hanuman |
| `SB` | Sai Baba | All Sai Baba designs |
| `LN` | Lakshmi Narayan | Lakshmi Narayan group designs |
| `SR` | Saraswati | All Saraswati designs |
| `KB` | Kuber | All Kuber designs |
| `LG` | Lakshmi Ganesh | Reserved for Lakshmi Ganesh group designs |

`HN` is the only Hanuman code. Do not create separate codes for Panchmukhi,
standing, seated, or other Hanuman forms.

`SH` is the only Shiva code. Do not create a separate code for Shiva Family or
other Shiva forms.

## Sequence rules

1. Start each deity or design family at `1`.
2. Increase the number independently within that family.
3. Use positive whole numbers without zero-padding.
4. Never reuse or renumber an issued code, even if a product is unpublished.
5. A new color, pose, ornament, or design receives the next number in its
   existing family.
6. The importer must determine the highest existing numerical value for the
   selected prefix and assign the next value automatically.

Examples:

- The next Ganesha item after `HM-GN-3` is `HM-GN-4`.
- The next Shiva item after `HM-SH-3` is `HM-SH-4`.
- The next Hanuman item after `HM-HN-2` is `HM-HN-3`.
- The first future Lakshmi Ganesh item is `HM-LG-1`.

## Current idol assignments

| # | Item code | Sanity Item Name |
| ---: | --- | --- |
| 1 | `HM-BK-1` | HM-BK-1 — Bal Krishna / Laddu Gopal Silver Idol |
| 2 | `HM-BK-2` | HM-BK-2 — Kneeling Bal Krishna Silver Idol |
| 3 | `HM-GN-1` | HM-GN-1 — Ganesha Silver Idol with Arch |
| 4 | `HM-GN-2` | HM-GN-2 — Four-Arm Ganesha Silver Idol |
| 5 | `HM-KS-1` | HM-KS-1 — Khatu Shyam Silver Idol |
| 6 | `HM-GN-3` | HM-GN-3 — Ganesha Silver Idol with Yellow Dhoti |
| 7 | `HM-BK-3` | HM-BK-3 — Colored Bal Krishna Silver Idol |
| 8 | `HM-BK-4` | HM-BK-4 — Colored Crawling Bal Krishna Silver Idol |
| 9 | `HM-KB-2` | HM-KB-2 — Kuber Silver Idol on Throne |
| 10 | `HM-SH-1` | HM-SH-1 — Meditating Shiva Silver Idol |
| 11 | `HM-SH-2` | HM-SH-2 — Colored Meditating Shiva Silver Idol |
| 12 | `HM-SH-3` | HM-SH-3 — Shiva Family Silver Idol |
| 13 | `HM-HN-1` | HM-HN-1 — Panchmukhi Hanuman Silver Idol |
| 14 | `HM-SB-1` | HM-SB-1 — Sai Baba Silver Idol |
| 15 | `HM-HN-2` | HM-HN-2 — Colored Panchmukhi Hanuman Silver Idol |
| 16 | `HM-LN-1` | HM-LN-1 — Lakshmi Narayan Silver Idol on Sheshnag |
| 17 | `HM-SR-1` | HM-SR-1 — Saraswati Silver Idol with Veena |
| 18 | `HM-BK-5` | HM-BK-5 — Crawling Bal Krishna Silver Idol |
| 19 | `HM-KB-1` | HM-KB-1 — Seated Kuber Silver Idol |

## Sanity implementation

- Store the canonical code in the product `reference` field.
- Display the Item Name as `<item code> — <product title>`.
- Keep the slug descriptive and stable; do not add the item code to the slug.
- Keep image titles free of weight and height.
- Store weight and height only in `shortDescription`.
- Keep the product category, purity, idol construction, and deity references in
  their dedicated Sanity fields.
- Validate item codes against
  `^HM-[A-Z]{2}-[1-9][0-9]*$` before publishing or importing.

## Change control

New deity or design codes require catalog-owner approval and an update to this
document before use. Existing meanings must not be reassigned.

Catalog-owner-approved identity corrections may renumber affected items as a
controlled exception. The corrected assignments must be updated together in
the importer, this document, and Sanity.
