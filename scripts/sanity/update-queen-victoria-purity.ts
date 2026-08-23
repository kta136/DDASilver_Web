import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-08-23" });
const applyChanges = process.argv.includes("--apply");
const targetPurity = "91.60";
const targetCategoryDescription =
  "Card-packed gold coins and bars in product-specific purities for gifting and milestones.";
const products = [
  {
    id: "product-dda-desktop-files-20260822-072",
    reference: "DDA-GOLD-20260822-072",
    slug: "packaged-queen-victoria-gold-coin-8g-916",
    shortDescription:
      "A 8 gram gold piece featuring a round Queen Victoria portrait coin in a sealed assay-style pack. Owner-confirmed purity is 91.60%.",
  },
  {
    id: "product-dda-desktop-files-20260822-075",
    reference: "DDA-GOLD-20260822-075",
    slug: "packaged-queen-victoria-gold-coin-4g-916",
    shortDescription:
      "A 4 gram gold piece featuring a round Queen Victoria portrait coin in a sealed assay-style pack. Owner-confirmed purity is 91.60%.",
  },
] as const;

type ProductDocument = {
  _id: string;
  _rev: string;
  reference?: string;
  slug?: string;
  purity?: string;
  shortDescription?: string;
};

type CategoryDocument = {
  _id: string;
  _rev: string;
  description?: string;
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

async function fetchProducts() {
  return client.fetch<ProductDocument[]>(
    `*[_type == "product" && _id in $productIds]{
      _id,
      _rev,
      reference,
      "slug": slug.current,
      purity,
      shortDescription
    } | order(_id asc)`,
    { productIds: products.map(({ id }) => id) },
  );
}

async function fetchGoldCategory() {
  return client.fetch<CategoryDocument | null>(
    `*[_type == "category" && _id == "category-gold"][0]{
      _id,
      _rev,
      description
    }`,
  );
}

function assertCompleteProducts(documents: ProductDocument[]) {
  const byId = new Map(documents.map((document) => [document._id, document]));
  for (const target of products) {
    const document = byId.get(target.id);
    if (!document) {
      throw new Error(`Queen Victoria product not found: ${target.id}`);
    }
    if (
      document.reference !== target.reference ||
      document.slug !== target.slug
    ) {
      throw new Error(`Identity mismatch for Queen Victoria product: ${target.id}`);
    }
  }
}

async function main() {
  const target = await assertConfiguredTarget();
  const [documents, category] = await Promise.all([
    fetchProducts(),
    fetchGoldCategory(),
  ]);
  assertCompleteProducts(documents);
  if (!category) {
    throw new Error("Gold category not found: category-gold");
  }

  const targetById = new Map<string, (typeof products)[number]>(
    products.map((product) => [product.id, product]),
  );
  const productChanges = documents.filter((document) => {
    const product = targetById.get(document._id);
    return (
      product !== undefined &&
      (document.purity !== targetPurity ||
        document.shortDescription !== product.shortDescription)
    );
  });
  const categoryNeedsUpdate = category.description !== targetCategoryDescription;

  console.log(`Target: ${target.projectId}/${target.dataset}`);
  for (const document of productChanges) {
    console.log(
      `${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${document.reference ?? document._id}: ${document.purity ?? "unset"} -> ${targetPurity}`,
    );
  }
  if (categoryNeedsUpdate) {
    console.log(
      `${applyChanges ? "UPDATE" : "WOULD UPDATE"} category-gold description`,
    );
  }

  if (!applyChanges) {
    console.log("Dry run only. Add --apply to write the changes.");
    return;
  }

  let transaction = client.transaction();
  for (const document of productChanges) {
    const product = targetById.get(document._id);
    if (!product) continue;
    transaction = transaction.patch(document._id, (patch) =>
      patch.ifRevisionId(document._rev).set({
        purity: targetPurity,
        shortDescription: product.shortDescription,
      }),
    );
  }
  if (categoryNeedsUpdate) {
    transaction = transaction.patch(category._id, (patch) =>
      patch.ifRevisionId(category._rev).set({
        description: targetCategoryDescription,
      }),
    );
  }
  await transaction.commit();

  const [verifiedDocuments, verifiedCategory] = await Promise.all([
    fetchProducts(),
    fetchGoldCategory(),
  ]);
  assertCompleteProducts(verifiedDocuments);
  const invalidDocuments = verifiedDocuments.filter((document) => {
    const product = targetById.get(document._id);
    return (
      product === undefined ||
      document.purity !== targetPurity ||
      document.shortDescription !== product.shortDescription
    );
  });
  if (invalidDocuments.length > 0) {
    throw new Error(
      `Verification failed for: ${invalidDocuments.map(({ _id }) => _id).join(", ")}`,
    );
  }
  if (verifiedCategory?.description !== targetCategoryDescription) {
    throw new Error("Verification failed for category-gold description.");
  }
  console.log(
    `Verified ${verifiedDocuments.length} Queen Victoria products at ${targetPurity}% purity.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
