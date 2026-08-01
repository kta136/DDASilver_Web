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
| `NK` | Guru Nanak | All Guru Nanak designs |
| `RK` | Radha Krishna | All Radha Krishna group designs |
| `DG` | Durga | All Durga designs |
| `JG` | Jagannath | Jagannath designs, including Balabhadra and Subhadra groups |
| `KM` | Kamdhenu | All Kamdhenu cow-and-calf designs |
| `LG` | Lakshmi Ganesh | Reserved for Lakshmi Ganesh group designs |
| `RM` | Rama | All Lord Rama and Ram Mandir designs |
| `LB` | Laughing Buddha | All Laughing Buddha designs |
| `MA` | Maharaja Agrasen | All Maharaja Agrasen designs |
| `EL` | Auspicious Elephant | All auspicious elephant designs |
| `OW` | Auspicious Owl | All auspicious owl designs |

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
- The next Shiva item after `HM-SH-4` is `HM-SH-5`.
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
| 20 | `HM-BK-6` | HM-BK-6 — Bal Krishna Silver Idol with Butter Pot |
| 21 | `HM-NK-1` | HM-NK-1 — Seated Guru Nanak Silver Idol |
| 22 | `HM-RK-1` | HM-RK-1 — Radha Krishna Silver Idol with Peacock |
| 23 | `HM-BK-7` | HM-BK-7 — Painted Bal Krishna Silver Idol with Butter Pot |
| 24 | `HM-RK-2` | HM-RK-2 — Painted Radha Krishna Silver Idol with Peacock |
| 25 | `HM-DG-1` | HM-DG-1 — Painted Durga Silver Idol on Lion |
| 26 | `HM-JG-1` | HM-JG-1 — Painted Jagannath Balabhadra Subhadra Silver Idol |
| 27 | `HM-KM-1` | HM-KM-1 — Painted Kamdhenu Silver Idol with Om Blanket |
| 28 | `HM-SH-4` | HM-SH-4 — Shivling Silver Idol with Cobra |
| 29 | `HM-SR-2` | HM-SR-2 — Saraswati Silver Idol on Lotus with Veena |
| 30 | `HM-RK-3` | HM-RK-3 — Painted Standing Radha Krishna Silver Idol |
| 31 | `HM-BK-8` | HM-BK-8 — Large Crawling Bal Krishna Silver Idol |
| 32 | `HM-LN-2` | HM-LN-2 — Painted Standing Lakshmi Narayan Silver Idol Set |
| 33 | `HM-KM-2` | HM-KM-2 — Painted Kamdhenu Silver Idol with Yellow Blanket |
| 34 | `HM-GN-4` | HM-GN-4 — Painted Four-Arm Ganesha Silver Idol on Lotus |
| 35 | `HM-GN-5` | HM-GN-5 — Painted Ganesha Silver Idol with Pink Turban |
| 36 | `HM-GN-6` | HM-GN-6 — Ganesha Silver Idol with Silver Turban |
| 37 | `HM-GN-7` | HM-GN-7 — Painted Ganesha Silver Idol on Lotus with Orange Dhoti |
| 38 | `HM-GN-8` | HM-GN-8 — Painted Seated Ganesha Silver Idol with Yellow Dhoti |
| 39 | `HM-GN-9` | HM-GN-9 — Four-Arm Ganesha Silver Idol on Lotus |
| 40 | `HM-GN-10` | HM-GN-10 — Painted Four-Arm Ganesha Silver Idol with Yellow Dhoti |
| 41 | `HM-GN-11` | HM-GN-11 — Painted Four-Arm Ganesha Silver Idol with Red Stole |
| 42 | `HM-GN-12` | HM-GN-12 — Painted Ganesha Silver Idol on Mushak |
| 43 | `HM-GN-13` | HM-GN-13 — Five Ganesha Silver Idol Set |
| 44 | `HM-LB-1` | HM-LB-1 — Painted Laughing Buddha Silver Idol |
| 45 | `HM-SH-5` | HM-SH-5 — Painted Shiva Family Silver Idol with Nandi |
| 46 | `HM-MA-1` | HM-MA-1 — Maharaja Agrasen Silver Idol on Throne |
| 47 | `HM-BK-9` | HM-BK-9 — Painted Crawling Bal Krishna Silver Idol |
| 48 | `HM-BK-10` | HM-BK-10 — Yashoda with Bal Krishna Silver Idol |
| 49 | `HM-EL-1` | HM-EL-1 — Auspicious Elephant Silver Idol |
| 50 | `HM-LN-3` | HM-LN-3 — Painted Lakshmi Narayan Silver Idol on Sheshnag |
| 51 | `HM-SR-3` | HM-SR-3 — Saraswati Silver Idol on Swan with Veena |
| 52 | `HM-OW-1` | HM-OW-1 — Auspicious Owl Silver Idol |
| 53 | `HM-GN-14` | HM-GN-14 — Ganesha Silver Idol Riding Mushak |
| 54 | `HM-GN-15` | HM-GN-15 — Painted Ganesha Silver Idol Worshipping Shivling |
| 55 | `HM-RK-4` | HM-RK-4 — Radha Krishna Silver Idol with Flute |
| 56 | `HM-RK-5` | HM-RK-5 — Painted Radha Krishna Silver Idol with Flute |
| 57 | `HM-RK-6` | HM-RK-6 — Painted Standing Radha Krishna Silver Idol in Yellow |
| 58 | `HM-RK-7` | HM-RK-7 — Painted Standing Radha Krishna Silver Idol in Red and Green |
| 59 | `HM-RK-8` | HM-RK-8 — Radha Krishna Silver Idol with Cow |
| 60 | `HM-RK-9` | HM-RK-9 — Radha Krishna Silver Idol with Flute on Lotus |
| 61 | `HM-RK-10` | HM-RK-10 — Painted Seated Radha Krishna Silver Idol |
| 62 | `HM-RK-11` | HM-RK-11 — Painted Standing Radha Krishna Silver Idol on Lotus |
| 63 | `HM-RK-12` | HM-RK-12 — Painted Radha Krishna Silver Idol Pair |
| 64 | `HM-RK-13` | HM-RK-13 — Seated Radha Krishna Silver Idol |
| 65 | `HM-LG-1` | HM-LG-1 — Lakshmi Ganesha Silver Idol Pair on Round Pedestals |
| 66 | `HM-LG-2` | HM-LG-2 — Lakshmi Ganesha Silver Idol Pair on Lotus Bases |
| 67 | `HM-LG-3` | HM-LG-3 — Painted Lakshmi Ganesha Silver Idol Pair on Lotus Bases |
| 68 | `HM-LG-4` | HM-LG-4 — Lakshmi Ganesha Silver Idol Pair with Floral Arches |
| 69 | `HM-LG-5` | HM-LG-5 — Painted Lakshmi Ganesha Silver Idol Pair on Miniature Thrones |
| 70 | `HM-LG-6` | HM-LG-6 — Lakshmi Ganesha Silver Idol Pair on Compact Lotus Bases |
| 71 | `HM-LG-7` | HM-LG-7 — Painted Miniature Lakshmi Ganesha Silver Idol Pair |
| 72 | `HM-LG-8` | HM-LG-8 — Lakshmi Ganesha Silver Idol Pair with Beaded Halos |
| 73 | `HM-LG-9` | HM-LG-9 — Painted Lakshmi Ganesha Silver Idol Pair in Yellow |
| 74 | `HM-LG-10` | HM-LG-10 — Painted Lakshmi Ganesha Silver Idol Pair in Red |
| 75 | `HM-LG-11` | HM-LG-11 — Painted Lakshmi Ganesha Silver Idol Pair in Orange |
| 76 | `HM-LG-12` | HM-LG-12 — Painted Lakshmi Ganesha Silver Idol Pair in Golden Yellow |
| 77 | `HM-LG-13` | HM-LG-13 — Lakshmi Ganesha Silver Idol Pair with Painted Garlands |
| 78 | `HM-LG-14` | HM-LG-14 — Painted Lakshmi Ganesha Silver Idol Pair in Green and Yellow |
| 79 | `HM-LG-15` | HM-LG-15 — Large Lakshmi Ganesha Silver Idol Pair on Tiered Lotus Bases |
| 80 | `HM-LG-16` | HM-LG-16 — Painted Lakshmi Ganesha Silver Idol Pair in Mint Green |
| 81 | `HM-LG-17` | HM-LG-17 — Painted Lakshmi Ganesha Silver Idol Pair in Crimson Red |
| 82 | `HM-LG-18` | HM-LG-18 — Lakshmi Ganesha Silver Idol Pair on Ornate Thrones |
| 83 | `HM-LG-19` | HM-LG-19 — Lakshmi Ganesha Silver Idol Pair on Tall Lotus Pedestals |
| 84 | `HM-LG-20` | HM-LG-20 — Lakshmi Ganesha Silver Idol Pair with Owl and Mouse |
| 85 | `HM-LG-21` | HM-LG-21 — Lakshmi Ganesha Silver Idol Pair with Modak |
| 86 | `HM-LG-22` | HM-LG-22 — Lakshmi Ganesha Silver Idol Pair with Red and Green Garlands |
| 87 | `HM-LG-23` | HM-LG-23 — Painted Lakshmi Ganesha Silver Idol Pair with Owl and Mouse |
| 88 | `HM-LG-24` | HM-LG-24 — Painted Lakshmi Ganesha Silver Idol Pair on Round Pedestals |
| 89 | `HM-DG-2` | HM-DG-2 — Durga Silver Idol on Tiger beneath Decorative Arch |
| 90 | `HM-LG-25` | HM-LG-25 — Lakshmi Ganesha Silver Idol Pair Riding Elephants |
| 91 | `HM-LG-26` | HM-LG-26 — Lakshmi Ganesha Silver Idol Pair with Circular Halos |
| 92 | `HM-GN-16` | HM-GN-16 — Ganesha Silver Idol with Cobra Hood |
| 93 | `HM-RM-1` | HM-RM-1 — Lord Rama Silver Idol with Ram Mandir |
| 94 | `HM-SH-6` | HM-SH-6 — Shiva Family Silver Idol with Arch and Shivling |
| 95 | `HM-DG-3` | HM-DG-3 — Painted Durga Silver Idol on Lion |

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
