import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-01" });
const applyChanges = process.argv.includes("--apply");
const expectedProjectId = "f6i0fy2f";
const expectedDataset = "production";
const categoryId = "category-phone-covers";

const phoneCovers = [
  {
    id: "product-dda-img-20260901-12-peacock-phone-cover",
    reference: "PH-01",
  },
  {
    id: "product-dda-img-20260901-13-cow-calf-phone-cover",
    reference: "PH-02",
  },
  {
    id: "product-dda-img-20260901-14-tiger-phone-cover",
    reference: "PH-03",
  },
  {
    id: "product-dda-img-20260901-15-floral-vine-phone-cover",
    reference: "PH-04",
  },
  {
    id: "product-dda-img-20260901-16-elephant-phone-cover",
    reference: "PH-05",
  },
  {
    id: "product-dda-img-20260901-17-birds-phone-cover",
    reference: "PH-06",
  },
  {
    id: "product-dda-img-20260901-18-deity-phone-cover",
    reference: "PH-07",
  },
] as const;

type ExistingProduct = {
  _id: string;
  title: string;
  reference?: string;
  categoryId?: string;
  imageAssetId?: string;
};

type ExistingCategory = {
  _id: string;
  title: string;
  slug?: string;
};

async function main() {
  const { projectId, dataset } = client.config();
  if (projectId !== expectedProjectId || dataset !== expectedDataset) {
    throw new Error(
      `Expected Sanity target ${expectedProjectId}/${expectedDataset}, received ${projectId}/${dataset}.`,
    );
  }

  const productIds = phoneCovers.map(({ id }) => id);
  const references = phoneCovers.map(({ reference }) => reference);
  const [products, categories, referenceConflicts] = await Promise.all([
    client.fetch<ExistingProduct[]>(
      `*[_type == "product" && _id in $productIds]{
        _id,
        title,
        reference,
        "categoryId": category._ref,
        "imageAssetId": gallery[0].asset._ref
      }`,
      { productIds },
    ),
    client.fetch<ExistingCategory[]>(
      `*[_type == "category" && (_id == $categoryId || slug.current == "phone-covers")]{
        _id,
        title,
        "slug": slug.current
      }`,
      { categoryId },
    ),
    client.fetch<ExistingProduct[]>(
      `*[_type == "product" && reference in $references && !(_id in $productIds)]{
        _id,
        title,
        reference
      }`,
      { references, productIds },
    ),
  ]);

  if (products.length !== phoneCovers.length) {
    const found = new Set(products.map(({ _id }) => _id));
    const missing = productIds.filter((id) => !found.has(id));
    throw new Error(`Missing phone-cover products: ${missing.join(", ")}`);
  }
  if (referenceConflicts.length > 0) {
    throw new Error(
      `PH reference conflict: ${referenceConflicts
        .map(({ _id, reference }) => `${reference} (${_id})`)
        .join(", ")}`,
    );
  }
  const categorySlugConflict = categories.find(({ _id }) => _id !== categoryId);
  if (categorySlugConflict) {
    throw new Error(
      `Category slug phone-covers is already used by ${categorySlugConflict._id}.`,
    );
  }

  const productById = new Map(products.map((product) => [product._id, product]));
  const firstProduct = productById.get(phoneCovers[0].id)!;
  if (!firstProduct.imageAssetId) {
    throw new Error("The first phone-cover product is missing its gallery image asset.");
  }
  for (const product of products) {
    if (!product.imageAssetId) {
      throw new Error(`${product._id} is missing its gallery image asset.`);
    }
  }

  const categoryDocument = {
    _id: categoryId,
    _type: "category" as const,
    title: "Phone Covers",
    slug: { _type: "slug" as const, current: "phone-covers" },
    description:
      "Custom-fit 92.5% silver phone-cover designs made to suit any phone size.",
    displayOrder: 9,
    productKind: "general",
    showOnHomepage: true,
    homepageOrder: 9,
    homepageImageSource: "product",
    image: {
      _type: "image" as const,
      asset: { _type: "reference" as const, _ref: firstProduct.imageAssetId },
      alt: "Custom-fit silver phone cover with antique peacock and floral relief",
    },
  };

  console.log(`Target: ${projectId}/${dataset}`);
  console.log(
    `${categories.some(({ _id }) => _id === categoryId) ? "UPDATE" : "CREATE"} ${categoryId}: Phone Covers`,
  );
  console.table(
    phoneCovers.map(({ id, reference }) => {
      const product = productById.get(id)!;
      return {
        action:
          product.categoryId === categoryId && product.reference === reference
            ? "UNCHANGED"
            : "UPDATE",
        reference,
        previousReference: product.reference,
        title: product.title,
      };
    }),
  );

  if (!applyChanges) {
    console.log("Dry run complete. No Sanity documents were changed.");
    return;
  }

  let transaction = client.transaction().createOrReplace(categoryDocument);
  for (const { id, reference } of phoneCovers) {
    const product = productById.get(id)!;
    transaction = transaction
      .patch(id, (patch) =>
        patch.set({
          category: { _type: "reference", _ref: categoryId },
          reference,
        }),
      )
      .patch(product.imageAssetId!, (patch) =>
        patch.set({ title: `${reference} — ${product.title} catalog image` }),
      );
  }
  await transaction.commit();

  const verification = await client.fetch<{
    categoryCount: number;
    productCount: number;
    uniqueReferenceCount: number;
  }>(
    `{
      "categoryCount": count(*[_type == "category" && _id == $categoryId && slug.current == "phone-covers" && productKind == "general"]),
      "productCount": count(*[_type == "product" && _id in $productIds && category._ref == $categoryId && reference in $references]),
      "uniqueReferenceCount": count(array::unique(*[_type == "product" && _id in $productIds].reference))
    }`,
    { categoryId, productIds, references },
  );
  if (
    verification.categoryCount !== 1 ||
    verification.productCount !== phoneCovers.length ||
    verification.uniqueReferenceCount !== phoneCovers.length
  ) {
    throw new Error(`Verification failed: ${JSON.stringify(verification)}`);
  }
  console.log(
    `Migration verified: one Phone Covers category and ${verification.productCount} products with ${verification.uniqueReferenceCount} unique PH references.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
