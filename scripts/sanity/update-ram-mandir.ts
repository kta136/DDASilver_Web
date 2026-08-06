import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-08-06" });
const applyChanges =
  process.argv.includes("--apply") || process.env.SANITY_APPLY === "true";
const productId = "product-dda-gift-03-silver-jain-temple-miniature-red-flag";
const desiredTitle = "Silver Ram Mandir Miniature with Red Flag";
const desiredReference = "DDA-GF-RM-03";
const desiredDescription =
  "A 99.80% pure silver Ram Mandir miniature with a stepped approach, clustered temple structures, tall central spire, and red flag. Weight: 100 g. Height: 4.5 in.";
const desiredAlt =
  "Silver Ram Mandir miniature with a stepped approach, central spire, and red flag on the DDA Silver background";

type GalleryImage = {
  _key: string;
  _type: "image";
  alt?: string;
  asset?: { _ref?: string };
  [key: string]: unknown;
};

type ProductDocument = {
  _id: string;
  _rev: string;
  title?: string;
  reference?: string;
  shortDescription?: string;
  gallery?: GalleryImage[];
};

async function assertConfiguredTarget() {
  const { projectId, dataset } = client.config();
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
  return { projectId, dataset };
}

async function main() {
  const target = await assertConfiguredTarget();
  const product = await client.fetch<ProductDocument | null>(
    `*[_id == $productId && _type == "product"][0]{
      _id,
      _rev,
      title,
      reference,
      shortDescription,
      gallery
    }`,
    { productId },
  );
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const gallery = (product.gallery ?? []).map((image) => ({
    ...image,
    alt: desiredAlt,
  }));
  if (gallery.length === 0) {
    throw new Error(`Product has no gallery image: ${productId}`);
  }

  console.log(`Target: ${target.projectId}/${target.dataset}`);
  console.log(`${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${product._id}`);
  console.log(`  Title: ${product.title ?? "(missing)"} -> ${desiredTitle}`);
  console.log(
    `  Reference: ${product.reference ?? "(missing)"} -> ${desiredReference}`,
  );
  console.log(`  Description: ${desiredDescription}`);
  console.log(`  Alt: ${desiredAlt}`);

  if (!applyChanges) {
    console.log("Dry run only. Add --apply to write the changes.");
    return;
  }

  await client
    .patch(product._id)
    .ifRevisionId(product._rev)
    .set({
      title: desiredTitle,
      reference: desiredReference,
      shortDescription: desiredDescription,
      gallery,
    })
    .commit();

  const assetId = gallery[0]?.asset?._ref;
  if (assetId) {
    await client
      .patch(assetId)
      .set({ title: `${desiredReference} — ${desiredTitle} catalog image` })
      .commit();
  }

  console.log(`Updated ${product._id}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
