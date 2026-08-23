import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const sourceFolder = "C:\\Users\\kk\\Desktop\\Files";
const outputFolder = "public/images/gallery-ingestion/desktop-files-2026-08-22";
const approvalFolder = path.join(
  projectRoot,
  "docs/product-gallery-approvals/desktop-files-2026-08-22",
);

const items = [
  { n: 1, source: "IMG_2373.jpeg", file: "001-benjamin-franklin-rectangular-silver-bar-5g.png", title: "DDA 5 Gram Benjamin Franklin Rectangular Silver Bar", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 5, detail: "a Benjamin Franklin portrait and historic-building reverse" },
  { n: 2, source: "IMG_2374.jpeg", file: "002-george-v-two-tone-round-silver-coin-5g.png", title: "DDA 5 Gram George V Two-Tone Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 5, detail: "a gold-tone George V portrait and ornamental reverse" },
  { n: 3, source: "IMG_2375.jpeg", file: "003-george-v-all-silver-round-coin-5g.png", title: "DDA 5 Gram George V Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 5, detail: "an all-silver George V portrait and ornamental reverse" },
  { n: 4, source: "IMG_2376.jpeg", file: "004-george-v-two-tone-oval-coin-10g.png", title: "DDA 10 Gram George V Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "an oval gold-tone George V portrait and decorative reverse" },
  { n: 5, source: "IMG_2377.jpeg", file: "005-george-v-two-tone-oval-coin-20g.png", title: "DDA 20 Gram George V Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 20, detail: "an oval gold-tone George V portrait and decorative reverse" },
  { n: 6, source: "IMG_2378.jpeg", file: "006-george-v-two-tone-oval-coin-25g.png", title: "DDA 25 Gram George V Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 25, detail: "an oval gold-tone George V portrait and decorative reverse" },
  { n: 7, source: "IMG_2379.jpeg", file: "007-george-v-two-tone-oval-coin-50g.png", title: "DDA 50 Gram George V Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 50, detail: "an oval gold-tone George V portrait and decorative reverse" },
  { n: 8, source: "IMG_2380.jpeg", file: "008-george-v-two-tone-oval-coin-100g.png", title: "DDA 100 Gram George V Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 100, detail: "an oval gold-tone George V portrait and decorative reverse" },
  { n: 9, source: "IMG_2381.jpeg", file: "009-radha-krishna-two-tone-oval-coin-10g.png", title: "DDA 10 Gram Radha Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Radha and Krishna beside a cow, peacock, and tree" },
  { n: 10, source: "IMG_2382.jpeg", file: "010-radha-krishna-two-tone-oval-coin-20g.png", title: "DDA 20 Gram Radha Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 20, detail: "Radha and Krishna beside a cow, peacock, and tree" },
  { n: 11, source: "IMG_2383.jpeg", file: "011-floral-panel-silver-purse-405g.png", title: "DDA 405 Gram Floral Panel Silver Purse", kind: "purse", material: "silver", purity: null, mark: null, weight: 405, detail: "dense floral, scalloped, and striped panels with a circular handle" },
  { n: 12, source: "IMG_2384.jpeg", file: "012-woven-lattice-two-tone-silver-purse-400g.png", title: "DDA 400 Gram Woven Lattice Two-Tone Silver Purse", kind: "purse", material: "silver", purity: null, mark: null, weight: 400, detail: "a woven lattice body, gold-tone clasp, floral stones, and loop handle" },
  { n: 13, source: "IMG_2385.jpeg", file: "013-openwork-scroll-silver-purse-450g.png", title: "DDA 450 Gram Openwork Scroll Silver Purse", kind: "purse", material: "silver", purity: null, mark: null, weight: 450, detail: "openwork floral-scroll filigree and a round handle" },
  { n: 14, source: "IMG_2386.jpeg", file: "014-peacock-motif-silver-purse-400g.png", title: "DDA 400 Gram Peacock Motif Silver Purse", kind: "purse", material: "silver", purity: null, mark: null, weight: 400, detail: "a peacock motif, geometric field, and circular handle" },
  { n: 15, source: "IMG_2387.jpeg", file: "015-radha-krishna-two-tone-oval-coin-25g.png", title: "DDA 25 Gram Radha Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 25, detail: "Radha and Krishna beside a cow, peacock, and tree" },
  { n: 16, source: "IMG_2388.jpeg", file: "016-radha-krishna-two-tone-oval-coin-50g.png", title: "DDA 50 Gram Radha Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 50, detail: "Radha and Krishna beside a cow, peacock, and tree" },
  { n: 17, source: "IMG_2389.jpeg", file: "017-ram-darbar-two-tone-oval-coin-50g.png", title: "DDA 50 Gram Ram Darbar Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 50, detail: "a gold-tone Ram Darbar scene with an ornamental reverse" },
  { n: 18, source: "IMG_2390.jpeg", file: "018-bal-krishna-two-tone-oval-coin-50g.png", title: "DDA 50 Gram Bal Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 50, detail: "crawling Bal Krishna with a bowl and flute" },
  { n: 19, source: "IMG_2391.jpeg", file: "019-queen-elizabeth-tree-of-life-square-coin-50g.png", title: "DDA 50 Gram Queen Elizabeth Tree of Life Square Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 50, detail: "a Queen Elizabeth II portrait and Tree of Life reverse" },
  { n: 20, source: "IMG_2392.jpeg", file: "020-queen-elizabeth-tree-of-life-square-coin-100g.png", title: "DDA 100 Gram Queen Elizabeth Tree of Life Square Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 100, detail: "a Queen Elizabeth II portrait and Tree of Life reverse" },
  { n: 21, source: "IMG_2393.jpeg", file: "021-queen-elizabeth-tree-of-life-square-coin-10g.png", title: "DDA 10 Gram Queen Elizabeth Tree of Life Square Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "a Queen Elizabeth II portrait and Tree of Life reverse" },
  { n: 22, source: "IMG_2394.jpeg", file: "022-queen-elizabeth-tree-of-life-square-coin-20g.png", title: "DDA 20 Gram Queen Elizabeth Tree of Life Square Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 20, detail: "a Queen Elizabeth II portrait and Tree of Life reverse" },
  { n: 23, source: "IMG_2395.jpeg", file: "023-bal-krishna-two-tone-oval-coin-20g.png", title: "DDA 20 Gram Bal Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 20, detail: "crawling Bal Krishna with a bowl and flute" },
  { n: 24, source: "IMG_2396.jpeg", file: "024-bal-krishna-two-tone-oval-coin-10g.png", title: "DDA 10 Gram Bal Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "crawling Bal Krishna with a bowl and flute" },
  { n: 25, source: "IMG_2397.jpeg", file: "025-tree-of-life-scalloped-silver-coin-25g.png", title: "DDA 25 Gram Scalloped Tree of Life Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 25, detail: "a flower-shaped scalloped edge and Tree of Life design" },
  { n: 26, source: "IMG_2398.jpeg", file: "026-radha-krishna-all-silver-oval-coin-25g.png", title: "DDA 25 Gram Radha Krishna Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 25, detail: "an all-silver Radha Krishna scene and ornamental reverse" },
  { n: 27, source: "IMG_2399.jpeg", file: "027-ram-darbar-all-silver-oval-coin-25g.png", title: "DDA 25 Gram Ram Darbar Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 25, detail: "an all-silver Ram Darbar scene and ornamental reverse" },
  { n: 28, source: "IMG_2400.jpeg", file: "028-tree-of-life-scalloped-silver-coin-50g.png", title: "DDA 50 Gram Scalloped Tree of Life Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 50, detail: "a flower-shaped scalloped edge and Tree of Life design" },
  { n: 29, source: "IMG_2401.jpeg", file: "029-tree-of-life-round-silver-coin-50g.png", title: "DDA 50 Gram Round Tree of Life Silver Coin", kind: "coin", material: "silver", purity: "99.99", mark: "999.9", weight: 50, detail: "a round Tree of Life face and branded reverse" },
  { n: 30, source: "IMG_2402.jpeg", file: "030-tree-of-life-round-silver-coin-20g.png", title: "DDA 20 Gram Round Tree of Life Silver Coin", kind: "coin", material: "silver", purity: "99.99", mark: "999.9", weight: 20, detail: "a round Tree of Life face and branded reverse" },
  { n: 31, source: "IMG_2403.jpeg", file: "031-radha-krishna-all-silver-oval-coin-20g.png", title: "DDA 20 Gram Radha Krishna Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 20, detail: "an all-silver Radha Krishna scene and ornamental reverse" },
  { n: 32, source: "IMG_2404.jpeg", file: "032-radha-krishna-all-silver-oval-coin-50g.png", title: "DDA 50 Gram Radha Krishna Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 50, detail: "an all-silver Radha Krishna scene and ornamental reverse" },
  { n: 33, source: "IMG_2405.jpeg", file: "033-classical-profile-rectangular-silver-bar-100g.png", title: "DDA 100 Gram Classical Profile Rectangular Silver Bar", kind: "coin", material: "silver", purity: "99.99", mark: "999.9", weight: 100, detail: "a classical-profile portrait and ornate rectangular border" },
  { n: 34, source: "IMG_2406.jpeg", file: "034-classical-profile-rectangular-silver-bar-50g.png", title: "DDA 50 Gram Classical Profile Rectangular Silver Bar", kind: "coin", material: "silver", purity: "99.99", mark: "999.9", weight: 50, detail: "a classical-profile portrait and ornate rectangular border" },
  { n: 35, source: "IMG_2407.jpeg", file: "035-classical-profile-rectangular-silver-bar-20g.png", title: "DDA 20 Gram Classical Profile Rectangular Silver Bar", kind: "coin", material: "silver", purity: "99.99", mark: "999.9", weight: 20, detail: "a classical-profile portrait and ornate rectangular border" },
  { n: 36, source: "IMG_2408.jpeg", file: "036-classical-profile-rectangular-silver-bar-10g.png", title: "DDA 10 Gram Classical Profile Rectangular Silver Bar", kind: "coin", material: "silver", purity: "99.99", mark: "999.9", weight: 10, detail: "a classical-profile portrait and ornate rectangular border" },
  { n: 37, source: "IMG_2409.jpeg", file: "037-classical-profile-rectangular-silver-bar-5g.png", title: "DDA 5 Gram Classical Profile Rectangular Silver Bar", kind: "coin", material: "silver", purity: "99.99", mark: "999.9", weight: 5, detail: "a classical-profile portrait and ornate rectangular border" },
  { n: 38, source: "IMG_2410.jpeg", file: "038-mahavir-navkar-mantra-round-silver-coin.png", title: "DDA Mahavir Navkar Mantra Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "DDA 999", weight: 10, detail: "Mahavir imagery encircled by Navkar Mantra lettering" },
  { n: 39, source: "IMG_2411.jpeg", file: "039-ram-darbar-ram-mandir-round-silver-coin-10g.png", title: "DDA 10 Gram Ram Darbar Ram Mandir Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Ram Darbar on one face and the Ayodhya Ram Mandir on the other" },
  { n: 40, source: "IMG_2412.jpeg", file: "040-durga-on-lion-round-silver-coin-10g.png", title: "DDA 10 Gram Durga on Lion Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Durga riding a lion with a decorative reverse" },
  { n: 41, source: "IMG_2413.jpeg", file: "041-ganesha-under-arch-round-silver-coin-10g.png", title: "DDA 10 Gram Ganesha Under Arch Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Ganesha seated beneath an ornamental arch" },
  { n: 42, source: "IMG_2414.jpeg", file: "042-hanuman-carrying-mountain-round-silver-coin-10g.png", title: "DDA 10 Gram Hanuman Carrying Mountain Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Hanuman carrying the mountain in raised relief" },
  { n: 43, source: "IMG_2415.jpeg", file: "043-shiva-seated-round-silver-coin-10g.png", title: "DDA 10 Gram Seated Shiva Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Shiva seated in meditation with a decorative reverse" },
  { n: 44, source: "IMG_2416.jpeg", file: "044-srinathji-round-silver-coin-10g.png", title: "DDA 10 Gram Srinathji Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Srinathji in raised relief with an ornamental border" },
  { n: 45, source: "IMG_2417.jpeg", file: "045-shiv-parivar-round-silver-coin-10g.png", title: "DDA 10 Gram Shiv Parivar Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "the Shiv Parivar family scene in raised relief" },
  { n: 46, source: "IMG_2418.jpeg", file: "046-kaaba-allah-calligraphy-round-silver-coin-10g.png", title: "DDA 10 Gram Kaaba and Allah Calligraphy Round Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "the Kaaba on one face and Arabic Allah calligraphy on the other" },
  { n: 47, source: "IMG_2419.jpeg", file: "047-kaaba-786-round-silver-coin.png", title: "DDA Kaaba and 786 Round Silver Coin", kind: "coin", material: "silver", purity: null, mark: null, weight: 10, detail: "the Kaaba, crescent and star, and 786 motifs" },
  { n: 48, source: "IMG_2420.jpeg", file: "048-khatu-shyam-oval-silver-coin.png", title: "DDA Khatu Shyam Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "DDA 999", weight: 10, detail: "Khatu Shyam imagery with Hindi lettering and an ornamental border" },
  { n: 49, source: "IMG_2421.jpeg", file: "049-srinathji-oval-silver-coin-10g.png", title: "DDA 10 Gram Srinathji Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 10, detail: "Srinathji in an oval devotional composition" },
  { n: 50, source: "IMG_2422.jpeg", file: "050-george-v-two-tone-oval-coin-15g-single-face.png", title: "DDA 15 Gram George V Two-Tone Oval Silver Coin Front", kind: "coin", material: "silver", purity: null, mark: null, weight: 15, detail: "a single-face gold-tone George V portrait" },
  { n: 51, source: "IMG_2423.jpeg", file: "051-radha-krishna-two-tone-oval-coin-15g-single-face.png", title: "DDA 15 Gram Radha Krishna Two-Tone Oval Silver Coin Front", kind: "coin", material: "silver", purity: null, mark: null, weight: 15, detail: "a single-face gold-tone Radha Krishna composition" },
  { n: 52, source: "IMG_2424.jpeg", file: "052-george-v-all-silver-oval-coin-15g-single-face.png", title: "DDA 15 Gram George V Oval Silver Coin Front", kind: "coin", material: "silver", purity: null, mark: null, weight: 15, detail: "a single-face all-silver George V portrait" },
  { n: 53, source: "IMG_2425.jpeg", file: "053-radha-krishna-all-silver-oval-coin-single-face.png", title: "DDA Radha Krishna Oval Silver Coin Front", kind: "coin", material: "silver", purity: null, mark: null, weight: 10, detail: "a single-face all-silver Radha Krishna composition" },
  { n: 54, source: "IMG_2426.jpeg", file: "054-packaged-fine-gold-bar-1g-995.png", title: "DDA 1 Gram Packaged Fine Gold Bar", kind: "gold", material: "gold", purity: "99.50", mark: "99.50", weight: 1, detail: "a sealed assay-style pack and rectangular fine-gold bar" },
  { n: 55, source: "IMG_2443.jpeg", file: "055-multicolor-enamel-petal-thali-set-9in-765g.png", title: "DDA 9 Inch Multicolor Enamel Petal Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 765, diameter: 9, detail: "a multicolor enamel petal border and coordinated ritual vessels" },
  { n: 56, source: "IMG_2444.jpeg", file: "056-red-enamel-floral-thali-set-12in-930g.png", title: "DDA 12 Inch Red Enamel Floral Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 930, diameter: 12, detail: "a red enamel floral border with swastika, kalash, bowl, and lidded box" },
  { n: 57, source: "IMG_2445.jpeg", file: "057-blue-enamel-floral-thali-set-12in-1123g.png", title: "DDA 12 Inch Blue Enamel Floral Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 1123, diameter: 12, detail: "a blue enamel floral border, oval wells, and coordinated vessels" },
  { n: 58, source: "11f84376-bee9-41bf-8844-5ff825623303.jpeg", file: "058-radha-krishna-two-tone-oval-coin-5g-single-face.png", title: "DDA 5 Gram Radha Krishna Two-Tone Oval Silver Coin Front", kind: "coin", material: "silver", purity: null, mark: null, weight: 5, detail: "a single-face gold-tone Radha Krishna composition" },
  { n: 59, source: "14676abf-3495-4b70-8504-b40ae85b9eb1.jpeg", file: "059-floral-openwork-thali-set-8in-225g.png", title: "DDA 8 Inch Floral Openwork Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 225, diameter: 8, detail: "an openwork floral tray and gold-tone coordinated vessels" },
  { n: 60, source: "1cd890d5-e377-44da-a0b8-9c44647e5429.jpeg", file: "060-george-v-all-silver-oval-coin-5g.png", title: "DDA 5 Gram George V Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 5, detail: "an all-silver George V portrait and floral reverse" },
  { n: 61, source: "1cee2f85-3ddc-4e62-aff7-ddbb8ece58ea.jpeg", file: "061-gold-tone-vessel-floral-thali-set-9in-275g.png", title: "DDA 9 Inch Floral Thali Set with Gold-Tone Vessels", kind: "utensil", material: "silver", purity: null, mark: null, weight: 275, diameter: 9, detail: "a floral-scroll silver tray and contrasting gold-tone vessels" },
  { n: 62, source: "2e1bd7f4-bc2d-4662-b604-a88818416a95.jpeg", file: "062-ornate-embossed-thali-set-8in-400g.png", title: "DDA 8 Inch Ornate Embossed Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 400, diameter: 8, detail: "dense embossed ornament and three coordinated vessels" },
  { n: 63, source: "367ba6d7-c06c-4e12-a75c-05098b412cd8.jpeg", file: "063-packaged-classical-profile-fine-gold-bar-5g-995.png", title: "DDA 5 Gram Packaged Classical Profile Fine Gold Bar", kind: "gold", material: "gold", purity: "99.50", mark: "99.50", weight: 5, weightTolerance: 0.03, detail: "a classical-profile rectangular bar in a sealed assay-style pack" },
  { n: 64, source: "3fd2b7a6-01e7-4a9d-891a-d4361c0d20f8.jpeg", file: "064-floral-scroll-ghungroo-thali-set-10in-500g.png", title: "DDA 10 Inch Floral Scroll Ghungroo Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 500, diameter: 10, detail: "floral scrollwork, gold accents, hanging ghungroo, and three vessels" },
  { n: 65, source: "539af97c-9485-4480-911e-dc120c3667c4.jpeg", file: "065-radha-krishna-all-silver-oval-coin-5g.png", title: "DDA 5 Gram Radha Krishna Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 5, detail: "an all-silver Radha Krishna face and ornamental reverse" },
  { n: 66, source: "5b41612d-590c-4f13-8d2f-e92736b6aee5.jpeg", file: "066-leaf-petal-thali-set-10in-400g.png", title: "DDA 10 Inch Leaf Petal Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 400, diameter: 10, detail: "a leaf-and-petal tray design with three coordinated vessels" },
  { n: 67, source: "6ceb8430-1109-43a3-ac8a-b1ad9d245853.jpeg", file: "067-radha-krishna-two-tone-oval-coin-5g.png", title: "DDA 5 Gram Radha Krishna Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 5, detail: "a gold-tone Radha Krishna face and ornamental reverse" },
  { n: 68, source: "84a157ea-d482-4e03-a8b5-f75fb7b6de27.jpeg", file: "068-george-v-two-tone-oval-coin-5g-single-face.png", title: "DDA 5 Gram George V Two-Tone Oval Silver Coin Front", kind: "coin", material: "silver", purity: null, mark: null, weight: 5, detail: "a single-face gold-tone George V portrait" },
  { n: 69, source: "85bf56d5-1730-4232-9327-7c5500c3576c.jpeg", file: "069-george-v-all-silver-oval-coin-5g-single-face.png", title: "DDA 5 Gram George V Oval Silver Coin Front", kind: "coin", material: "silver", purity: null, mark: null, weight: 5, detail: "a single-face all-silver George V portrait" },
  { n: 70, source: "90a4809d-37a3-4f2e-adaa-84993bba3cde.jpeg", file: "070-george-v-two-tone-oval-coin-5g.png", title: "DDA 5 Gram George V Two-Tone Oval Silver Coin", kind: "coin", material: "silver", purity: "99.90", mark: "999", weight: 5, detail: "an oval gold-tone George V portrait paired with a patterned reverse" },
  { n: 71, source: "a4a08061-788e-4f7c-9b7f-5e3a5be288ea.jpeg", file: "071-packaged-classical-profile-fine-gold-bar-10g-995.png", title: "DDA 10 Gram Packaged Classical Profile Fine Gold Bar", kind: "gold", material: "gold", purity: "99.50", mark: "99.50", weight: 10, weightTolerance: 0.03, detail: "a classical-profile rectangular bar in a sealed assay-style pack" },
  { n: 72, source: "b5b74478-0f80-4f40-8e06-761e21a4d20b.jpeg", file: "072-packaged-queen-victoria-gold-coin-8g-916.png", title: "DDA 8 Gram Packaged Queen Victoria Gold Coin", kind: "gold", material: "gold", purity: "91.60", mark: "91.60", weight: 8, weightTolerance: 0.03, detail: "a round Queen Victoria portrait coin in a sealed assay-style pack" },
  { n: 73, source: "b68273dd-ae42-41b6-81d5-23a0e672e48f.jpeg", file: "073-lotus-ghungroo-thali-set-6in-150g.png", title: "DDA 6 Inch Lotus Ghungroo Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 150, diameter: 6, detail: "lotus engraving, hanging ghungroo, and three coordinated vessels" },
  { n: 74, source: "bc3b199c-4eb6-479e-b2c3-4cd02f5006fe.jpeg", file: "074-blue-teal-enamel-thali-set-10in-765g.png", title: "DDA 10 Inch Blue Teal Enamel Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 765, diameter: 10, detail: "a blue-teal enamel border, reflective tray, and two main vessels" },
  { n: 75, source: "cfd8b2c9-1786-469b-8c5f-1d390559ba1f.jpeg", file: "075-packaged-queen-victoria-gold-coin-4g-916.png", title: "DDA 4 Gram Packaged Queen Victoria Gold Coin", kind: "gold", material: "gold", purity: "91.60", mark: "91.60", weight: 4, weightTolerance: 0.03, detail: "a round Queen Victoria portrait coin in a sealed assay-style pack" },
  { n: 76, source: "d59775fc-a4df-4ec0-97a9-6693c1e687d7.jpeg", file: "076-packaged-classical-profile-fine-gold-bar-2g-995.png", title: "DDA 2 Gram Packaged Classical Profile Fine Gold Bar", kind: "gold", material: "gold", purity: "99.50", mark: "99.50", weight: 2, weightTolerance: 0.03, detail: "a classical-profile rectangular bar in a sealed assay-style pack" },
  { n: 77, source: "d654646f-268b-4c4a-9ef8-02f7c1cea9b0.jpeg", file: "077-radha-krishna-all-silver-oval-coin-5g-single-face-unclear-purity.png", title: "DDA 5 Gram Radha Krishna Oval Silver Coin Front with Unclear Mark", kind: "coin", material: "silver", purity: null, mark: "unclear DDA9999-style engraving", weight: 5, detail: "a single-face all-silver Radha Krishna composition" },
  { n: 78, source: "WhatsApp Image 2026-08-22 at 1.27.28 PM.jpeg", file: "078-floral-scroll-leaf-rim-thali-set-11in-950g.png", title: "DDA 11 Inch Floral Scroll Leaf Rim Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 950, diameter: 11, detail: "dense floral scrollwork, a layered leaf rim, two bowls, pot, and handled accessory" },
  { n: 79, source: "WhatsApp Image 2026-08-22 at 2.44.24 PM.jpeg", file: "079-peacock-flower-thali-set-10in-500g.png", title: "DDA 10 Inch Peacock Flower Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 500, diameter: 10, detail: "a layered central flower, peacock-feather rim, two bowls, and pot" },
  { n: 80, source: "WhatsApp Image 2026-08-22 at 2.45.41 PM.jpeg", file: "080-floral-butterfly-thali-set-8in-475g.png", title: "DDA 8 Inch Floral Butterfly Thali Set", kind: "utensil", material: "silver", purity: null, mark: null, weight: 475, diameter: 8, detail: "floral-and-butterfly engraving, ornate scallops, two bowls, raised bowl, and pot" },
];

const purseNumbers = new Map(items.filter(({ kind }) => kind === "purse").map((item, index) => [item.n, 2201 + index]));
const utensilNumbers = new Map(items.filter(({ kind }) => kind === "utensil").map((item, index) => [item.n, 2201 + index]));
const alternateParentNumber = new Map([
  [58, 67],
  [68, 70],
  [69, 60],
  [77, 65],
]);

function referenceFor(item) {
  if (item.kind === "purse") return `PR-${purseNumbers.get(item.n)}`;
  if (item.kind === "utensil") return `DDA-UT-PT-${utensilNumbers.get(item.n)}`;
  if (item.kind === "gold") return `DDA-GOLD-20260822-${String(item.n).padStart(3, "0")}`;
  return `DDA-COIN-20260822-${String(item.n).padStart(3, "0")}`;
}

function categoryFor(item) {
  if (item.kind === "purse") return "category-purse";
  if (item.kind === "utensil") return "category-utensils";
  if (item.kind === "gold") return "category-gold";
  return "category-coin";
}

function confirmedPurityFor(item) {
  if (item.kind === "gold") {
    if (!item.purity) {
      throw new Error(`Missing confirmed gold purity for source record ${item.n}.`);
    }
    return item.purity;
  }
  if (item.kind === "coin") return "99.80";
  return "92.5";
}

function coinShapeFor(item) {
  if (item.file.includes("scalloped")) return "scalloped";
  if (item.title.includes("Oval")) return "oval";
  if (item.title.includes("Square")) return "square";
  if (item.title.includes("Round")) return "round";
  if (item.title.includes("Bar")) return "rectangle";
  if (item.kind === "gold" && item.title.includes("Coin")) return "round";
  return undefined;
}

function titleFor(item) {
  return item.kind === "utensil"
    ? item.title.replace(" Thali Set", " Pooja Thali Set")
    : item.title;
}

function descriptionFor(item) {
  if (item.kind === "utensil") {
    return `A ${item.weight} gram, ${item.diameter}-inch Pooja Thali Set in confirmed 92.5% silver with ${item.detail}.`;
  }
  if (item.kind === "purse") {
    return `A ${item.weight} gram purse in confirmed 92.5% silver with ${item.detail}.`;
  }
  const weight = item.weight ? `${item.weight} gram ` : "";
  const finish = item.kind === "coin" && item.title.includes("Two-Tone")
    ? " The gold-polished details are a surface finish on the silver coin."
    : "";
  return `A ${weight}${item.material} piece featuring ${item.detail}. Owner-confirmed purity is ${confirmedPurityFor(item)}%.${finish}`;
}

function blockersFor(item) {
  const blockers = [];
  if (item.weight === null) {
    blockers.push("Weight is not supplied in the source; owner confirmation is required.");
  }
  if (item.ambiguousDiameter) {
    blockers.push("The source label appears to say 10 inches but is visually ambiguous; confirm the diameter before publication.");
  }
  return blockers;
}

const products = items.map((item) => {
  const slug = item.file.replace(/^\d{3}-/, "").replace(/\.png$/, "");
  const product = {
    number: item.n,
    id: `product-dda-desktop-files-20260822-${String(item.n).padStart(3, "0")}`,
    reference: referenceFor(item),
    title: titleFor(item),
    slug,
    shortDescription: descriptionFor(item),
    alt: `${titleFor(item)} showing ${item.detail}`,
    categoryId: categoryFor(item),
    material: item.material,
    purity: confirmedPurityFor(item),
    purityBasis: "owner-confirmed-2026-08-22",
    sourcePurityMarking: item.mark,
    sourcePath: path.join(sourceFolder, item.source),
    sourceSha256: createHash("sha256")
      .update(fs.readFileSync(path.join(sourceFolder, item.source)))
      .digest("hex"),
    imagePath: `${outputFolder}/${item.file}`,
    publishBlockers: blockersFor(item),
  };
  if (item.kind === "coin" && item.title.includes("Two-Tone")) {
    product.finish = "gold-polished";
  }
  if (item.weight !== null) product.weightGrams = item.weight;
  if (item.weightTolerance) product.sourceWeightToleranceGrams = item.weightTolerance;
  if (item.kind === "utensil") {
    product.utensilType = "pooja-thali-set";
  }
  if (item.kind === "coin" || item.kind === "gold") {
    product.coinShape = coinShapeFor(item);
  }
  if (item.diameter) {
    product.diameterInches = item.diameter;
    product.suppliedSizeLabel = item.ambiguousDiameter
      ? "Diameter label appears to read 10 inches but is ambiguous in the source"
      : `Diameter ${item.diameter} inch`;
  }
  const parentNumber = alternateParentNumber.get(item.n);
  if (parentNumber) {
    const parentItem = items.find(({ n }) => n === parentNumber);
    product.recordType = "alternateGalleryImage";
    product.createProduct = false;
    product.parentProductId = `product-dda-desktop-files-20260822-${String(parentNumber).padStart(3, "0")}`;
    product.parentReference = referenceFor(parentItem);
    product.updateParentMetadata = false;
  }
  return product;
});

const manifest = {
  schemaVersion: 1,
  batchId: "desktop-files-2026-08-22",
  sourceFolder,
  originalSourceCount: 80,
  sourceCount: products.length,
  approvedBackgroundPath: "public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png",
  approvedTreatmentReferencePath: "public/images/silver-coins/files-2026-08-22-approval/001-benjamin-franklin-rectangular-silver-bar-5g-ai-enhanced-v2.png",
  readyForSanityAssetUpload: true,
  readyForProductPublish: true,
  publishBlockers: [],
  coinAndBarDimensionsRequired: false,
  coinAndBarDimensionsPolicy: "Ignored by owner instruction on 2026-08-22.",
  ownerConfirmedPurityPolicy: {
    silverCoinsIncludingGoldPolish: "99.80",
    cardPackedQueenVictoriaGoldCoins: "91.60",
    cardPackedFineGoldBars: "99.50",
    otherSilverProducts: "92.5",
    confirmedAt: "2026-08-22",
  },
  ownerConfirmedMeasurements: {
    record066DiameterInches: 10,
    confirmedAt: "2026-08-22",
  },
  products,
};

function csvCell(value) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

const headers = [
  "number", "sourcePath", "sourceSha256", "imagePath", "reference", "title", "categoryId", "utensilType", "material", "finish", "sourcePurityMarking", "purity", "purityBasis", "coinShape", "weightGrams", "sourceWeightToleranceGrams", "diameterInches", "suppliedSizeLabel", "recordType", "createProduct", "parentReference", "shortDescription", "alt", "publishBlockers", "readyForSanityAssetUpload", "readyForProductPublish",
];
const csvRows = products.map((product) => headers.map((header) => {
  if (header === "readyForSanityAssetUpload") return csvCell(manifest.readyForSanityAssetUpload);
  if (header === "readyForProductPublish") return csvCell(manifest.readyForProductPublish && product.publishBlockers.length === 0);
  return csvCell(product[header]);
}).join(","));

fs.mkdirSync(approvalFolder, { recursive: true });
fs.writeFileSync(path.join(approvalFolder, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(approvalFolder, "review.csv"), `${headers.map(csvCell).join(",")}\n${csvRows.join("\n")}\n`);

console.log(`Wrote ${products.length} product records to ${approvalFolder}`);
