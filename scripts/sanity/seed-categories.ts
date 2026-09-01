import { createReadStream } from "node:fs";
import { basename, resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-28" });
const applyChanges = process.argv.includes("--apply");

const categories = [
  {
    _id: "category-jewellery",
    title: "Jewellery",
    slug: "jewellery",
    description:
      "Silver adornments for everyday wear and meaningful occasions.",
    displayOrder: 1,
    productKind: "general",
    imagePath: "public/images/mockup/category-jewellery.png",
    alt: "Concept image of a floral silver jewellery ornament",
  },
  {
    _id: "category-coin",
    title: "Coin",
    slug: "coin",
    description:
      "Silver coins in classic and contemporary shapes for gifting and milestones.",
    displayOrder: 2,
    productKind: "coin",
    imagePath: "public/images/mockup/category-coins.png",
    alt: "Concept image of a classic round silver coin",
  },
  {
    _id: "category-idols",
    title: "Idols",
    slug: "idols",
    description:
      "Hollow, solid, and semi-solid silver devotional pieces for prayer and tradition.",
    displayOrder: 3,
    productKind: "idol",
    imagePath: "public/images/mockup/category-pooja.png",
    alt: "Concept image of a small devotional silver diya lamp",
  },
  {
    _id: "category-purse",
    title: "Purse",
    slug: "purse",
    description:
      "Ornate 92.5% silver purses and clutches for celebrations and gifting.",
    displayOrder: 4,
    productKind: "purse",
    imagePath:
      "public/images/silver-purses/ai-cleaned-2026-08-01/purse-01-ornate-elephant-floral-400g.png",
    alt: "Ornate 92.5% silver purse with raised elephant and floral motifs",
  },
  {
    _id: "category-gifts",
    title: "Gifts",
    slug: "gifts",
    description:
      "Memorable silver gifts for families, celebrations, and milestones.",
    displayOrder: 5,
    productKind: "general",
    imagePath: "public/images/mockup/category-gifts.png",
    alt: "Concept image of an elegant silver gift box",
  },
  {
    _id: "category-boxes",
    title: "Boxes",
    slug: "boxes",
    description:
      "Decorative silver boxes, keepsakes, and gift sets for celebrations, rituals, and meaningful occasions.",
    displayOrder: 6,
    productKind: "general",
    imagePath:
      "public/images/gallery-ingestion/img-2026-08-30-approval/images/01-pink-rose-enamel-rectangular-silver-gift-box-7x5.png",
    alt: "Pink rose enamel rectangular silver gift box with floral relief decoration",
  },
  {
    _id: "category-singhasan",
    title: "Singhasan",
    slug: "singhasan",
    description:
      "Ornate 92.5% silver singhasans for devotional idols, home temples, and auspicious celebrations.",
    displayOrder: 7,
    productKind: "general",
    imagePath:
      "public/images/gallery-ingestion/images-2026-08-20-approval/images/sg-12-scalloped-floral-round-silver-singhasan-6x4.png",
    alt: "Scalloped floral round silver singhasan with engraved seat and decorative back",
  },
  {
    _id: "category-hatri",
    title: "Hatri",
    slug: "hatri",
    description:
      "Traditional 92.5% silver Hatris for Diwali puja, festive rituals, and devotional settings.",
    displayOrder: 8,
    productKind: "general",
    imagePath:
      "public/images/gallery-ingestion/pics-2026-08-25/images/11-two-tier-arched-silver-hatri.png",
    alt: "Two-tier arched silver Hatri with ritual cups and devotional detailing",
  },
  {
    _id: "category-jhula",
    title: "Jhula",
    slug: "jhula",
    description:
      "Ornate 92.5% silver jhulas for devotional settings, celebrations, and meaningful gifting.",
    displayOrder: 9,
    productKind: "jhula",
    imagePath:
      "public/images/gallery-ingestion/new-folder-2-2026-08-09/proof/jh-01-ornate-peacock-floral-silver-jhula.png",
    alt: "Ornate 92.5% silver peacock and floral jhula with suspended seat",
  },
  {
    _id: "category-utensils",
    title: "Utensils",
    slug: "utensils",
    description:
      "Silver dining, serving, and home utensils for meaningful everyday use.",
    displayOrder: 10,
    productKind: "utensil",
    imagePath: "public/images/mockup/category-tableware.png",
    alt: "Concept image of an engraved silver serving bowl",
  },
  {
    _id: "category-gold",
    title: "Gold Coins & Bars",
    slug: "gold",
    description:
      "Card-packed gold coins and bars in product-specific purities for gifting and milestones.",
    displayOrder: 11,
    productKind: "gold",
    imagePath:
      "public/images/gallery-ingestion/desktop-files-2026-08-22/054-packaged-fine-gold-bar-1g-995.png",
    alt: "Card-packed 99.50% fine gold bar from DDA Silver",
  },
  {
    _id: "category-phone-covers",
    title: "Phone Covers",
    slug: "phone-covers",
    description:
      "Custom-fit 92.5% silver phone-cover designs made to suit any phone size.",
    displayOrder: 12,
    productKind: "general",
    imagePath:
      "public/images/gallery-ingestion/img-2026-09-01-approved/images/12-peacock-floral-custom-fit-silver-phone-cover.png",
    alt: "Custom-fit silver phone cover with antique peacock and floral relief",
  },
] as const;

async function getOrUploadImage(imagePath: string, title: string) {
  const absolutePath = resolve(process.cwd(), imagePath);
  const filename = basename(absolutePath);
  const existingAssetId = await client.fetch<string | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename },
  );

  if (existingAssetId) {
    return existingAssetId;
  }

  const asset = await client.assets.upload(
    "image",
    createReadStream(absolutePath),
    {
      filename,
      title: `${title} category image`,
    },
  );

  return asset._id;
}

async function main() {
  const { projectId, dataset } = client.config();
  if (!applyChanges) {
    console.log(
      `Dry run only: would seed ${categories.length} categories into ${projectId}/${dataset}.`,
    );
    console.log("Re-run with --apply after confirming the target.");
    return;
  }

  if (
    process.env.SANITY_EXPECTED_PROJECT_ID &&
    process.env.SANITY_EXPECTED_PROJECT_ID !== projectId
  ) {
    throw new Error("Sanity project does not match SANITY_EXPECTED_PROJECT_ID");
  }
  if (
    process.env.SANITY_EXPECTED_DATASET &&
    process.env.SANITY_EXPECTED_DATASET !== dataset
  ) {
    throw new Error("Sanity dataset does not match SANITY_EXPECTED_DATASET");
  }

  for (const category of categories) {
    const assetId = await getOrUploadImage(category.imagePath, category.title);

    await client.createOrReplace({
      _id: category._id,
      _type: "category",
      title: category.title,
      slug: {
        _type: "slug",
        current: category.slug,
      },
      description: category.description,
      displayOrder: category.displayOrder,
      productKind: category.productKind,
      showOnHomepage: true,
      homepageOrder: category.displayOrder,
      homepageImageSource: "product",
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: assetId,
        },
        alt: category.alt,
      },
    });

    console.log(`Seeded ${category.title} (${category._id})`);
  }

  console.log(
    "Category seed complete. Replace all temporary mockup images before launch.",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
