import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-08-09" });
const applyChanges = process.argv.includes("--apply");

const ramMandirReference = "DDA-GF-RM-03";
const jhulaReferences = Array.from(
  { length: 10 },
  (_, index) => `JH-${String(index + 1).padStart(2, "0")}`,
);

const jhulaCategory = {
  _id: "category-jhula",
  _type: "category",
  title: "Jhula",
  slug: {
    _type: "slug",
    current: "jhula",
  },
  description:
    "Ornate 92.5% silver jhulas for devotional settings, celebrations, and meaningful gifting.",
  displayOrder: 6,
} as const;

type ProductDocument = {
  _id: string;
  _rev: string;
  title: string;
  reference: string;
  categoryId?: string;
  idolConstruction?: string;
  deityIds?: string[];
  primaryAssetId?: string;
};

type RequiredDocument = {
  _id: string;
  _rev: string;
  displayOrder?: number;
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

async function fetchProduct(reference: string) {
  return client.fetch<ProductDocument | null>(
    `*[
      _type == "product" &&
      reference == $reference &&
      !(_id in path("drafts.**"))
    ][0]{
      _id,
      _rev,
      title,
      reference,
      "categoryId": category._ref,
      idolConstruction,
      "deityIds": deities[]._ref,
      "primaryAssetId": gallery[0].asset._ref
    }`,
    { reference },
  );
}

async function fetchJhulas() {
  return client.fetch<ProductDocument[]>(
    `*[
      _type == "product" &&
      reference in $references &&
      !(_id in path("drafts.**"))
    ]{
      _id,
      _rev,
      title,
      reference,
      "categoryId": category._ref,
      "primaryAssetId": gallery[0].asset._ref
    } | order(reference asc)`,
    { references: jhulaReferences },
  );
}

function assertCompleteJhulaSet(products: ProductDocument[]) {
  const foundReferences = new Set(products.map(({ reference }) => reference));
  const missingReferences = jhulaReferences.filter(
    (reference) => !foundReferences.has(reference),
  );
  if (products.length !== jhulaReferences.length || missingReferences.length > 0) {
    throw new Error(
      `Expected JH-01 through JH-10; missing: ${missingReferences.join(", ") || "none"}.`,
    );
  }
}

async function main() {
  const target = await assertConfiguredTarget();
  const [ramMandir, jhulas, requiredDocuments] = await Promise.all([
    fetchProduct(ramMandirReference),
    fetchJhulas(),
    client.fetch<RequiredDocument[]>(
      `*[_id in $ids]{_id, _rev, displayOrder}`,
      { ids: ["category-idols", "category-utensils", "deity-rama"] },
    ),
  ]);

  if (!ramMandir) {
    throw new Error(`${ramMandirReference} was not found.`);
  }
  assertCompleteJhulaSet(jhulas);

  const requiredById = new Map(
    requiredDocuments.map((document) => [document._id, document]),
  );
  for (const id of ["category-idols", "category-utensils", "deity-rama"]) {
    if (!requiredById.has(id)) throw new Error(`Required Sanity document is missing: ${id}`);
  }

  const categoryImageAssetId = jhulas.find(
    ({ reference }) => reference === "JH-01",
  )?.primaryAssetId;
  if (!categoryImageAssetId) {
    throw new Error("JH-01 does not have a primary gallery image asset.");
  }

  console.log(`Target: ${target.projectId}/${target.dataset}`);
  console.log(
    `${applyChanges ? "CREATE OR REPLACE" : "WOULD CREATE OR REPLACE"} category-jhula using the JH-01 image.`,
  );
  console.log(
    `${applyChanges ? "UPDATE" : "WOULD UPDATE"} category-utensils display order to 7.`,
  );
  console.log(
    `${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${ramMandirReference}: ${ramMandir.categoryId ?? "none"} -> category-idols / hollow / deity-rama.`,
  );
  for (const product of jhulas) {
    console.log(
      `${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${product.reference}: ${product.categoryId ?? "none"} -> category-jhula.`,
    );
  }

  if (!applyChanges) {
    console.log("Dry run complete. Add --apply to write this migration.");
    return;
  }

  const utensilCategory = requiredById.get("category-utensils")!;
  let transaction = client.transaction().createOrReplace({
    ...jhulaCategory,
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: categoryImageAssetId,
      },
      alt: "Ornate 92.5% silver peacock and floral jhula with suspended seat",
    },
  });

  transaction = transaction.patch(utensilCategory._id, (patch) =>
    patch.ifRevisionId(utensilCategory._rev).set({ displayOrder: 7 }),
  );
  transaction = transaction.patch(ramMandir._id, (patch) =>
    patch.ifRevisionId(ramMandir._rev).set({
      category: { _type: "reference", _ref: "category-idols" },
      idolConstruction: "hollow",
      deities: [
        { _key: "rama", _type: "reference", _ref: "deity-rama" },
      ],
    }),
  );
  for (const product of jhulas) {
    transaction = transaction.patch(product._id, (patch) =>
      patch.ifRevisionId(product._rev).set({
        category: { _type: "reference", _ref: "category-jhula" },
      }),
    );
  }

  await transaction.commit({ visibility: "sync" });

  const [verifiedRamMandir, verifiedJhulas, verifiedCategory, giftsJhulaCount] =
    await Promise.all([
      fetchProduct(ramMandirReference),
      fetchJhulas(),
      client.fetch<{
        _id: string;
        slug?: string;
        imageAssetId?: string;
      } | null>(
        `*[_id == "category-jhula"][0]{
          _id,
          "slug": slug.current,
          "imageAssetId": image.asset._ref
        }`,
      ),
      client.fetch<number>(
        `count(*[
          _type == "product" &&
          reference in $references &&
          category._ref == "category-gifts" &&
          !(_id in path("drafts.**"))
        ])`,
        { references: jhulaReferences },
      ),
    ]);

  const ramDeities = new Set(verifiedRamMandir?.deityIds ?? []);
  if (
    verifiedRamMandir?.categoryId !== "category-idols" ||
    verifiedRamMandir.idolConstruction !== "hollow" ||
    !ramDeities.has("deity-rama")
  ) {
    throw new Error("Ram Mandir verification failed.");
  }
  if (
    verifiedJhulas.some(({ categoryId }) => categoryId !== "category-jhula") ||
    giftsJhulaCount !== 0
  ) {
    throw new Error("Jhula product verification failed.");
  }
  if (
    verifiedCategory?.slug !== "jhula" ||
    verifiedCategory.imageAssetId !== categoryImageAssetId
  ) {
    throw new Error("Jhula category verification failed.");
  }

  console.log(
    `Verified ${ramMandirReference} as a Hollow Rama idol and ${verifiedJhulas.length} products in the Jhula category.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
