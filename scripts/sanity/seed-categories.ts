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
    imagePath: "public/images/mockup/category-gifts.png",
    alt: "Concept image of an elegant silver gift box",
  },
  {
    _id: "category-utensils",
    title: "Utensils",
    slug: "utensils",
    description:
      "Silver dining, serving, and home utensils for meaningful everyday use.",
    displayOrder: 6,
    imagePath: "public/images/mockup/category-tableware.png",
    alt: "Concept image of an engraved silver serving bowl",
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
