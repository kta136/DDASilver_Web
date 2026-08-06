import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-28" });
const applyChanges = process.env.SANITY_UTENSIL_TYPES_APPLY === "1";

type UtensilType =
  | "glass"
  | "bowl"
  | "plate"
  | "jug"
  | "kalash"
  | "spoon";

type ProductDocument = {
  _id: string;
  _rev: string;
  title: string;
  displayOrder: number;
  utensilType?: UtensilType;
};

const expectedCounts: Record<UtensilType, number> = {
  glass: 14,
  bowl: 17,
  plate: 28,
  jug: 6,
  kalash: 13,
  spoon: 9,
};

function typeForDisplayOrder(displayOrder: number): UtensilType {
  if (displayOrder >= 4010 && displayOrder <= 4140) return "glass";
  if (displayOrder >= 4150 && displayOrder <= 4310) return "bowl";
  if (displayOrder >= 4330 && displayOrder <= 4410) return "spoon";
  if (displayOrder >= 4420 && displayOrder <= 4690) return "plate";
  if (displayOrder >= 4700 && displayOrder <= 4750) return "jug";
  if (displayOrder >= 4760 && displayOrder <= 4880) return "kalash";

  throw new Error(
    `No approved utensil type mapping for display order ${displayOrder}.`,
  );
}

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

async function fetchUtensils() {
  return client.fetch<ProductDocument[]>(
    `*[_type == "product" && category._ref == "category-utensils"]{
      _id,
      _rev,
      title,
      displayOrder,
      utensilType
    } | order(displayOrder asc)`,
  );
}

function validateBatch(documents: ProductDocument[]) {
  const actualCounts: Record<UtensilType, number> = {
    glass: 0,
    bowl: 0,
    plate: 0,
    jug: 0,
    kalash: 0,
    spoon: 0,
  };

  for (const document of documents) {
    actualCounts[typeForDisplayOrder(document.displayOrder)] += 1;
  }

  const errors = Object.entries(expectedCounts)
    .filter(([type, count]) => actualCounts[type as UtensilType] !== count)
    .map(
      ([type, count]) =>
        `${type}: expected ${count}, found ${actualCounts[type as UtensilType]}`,
    );
  if (errors.length > 0) {
    throw new Error(`Unexpected utensil batch composition: ${errors.join("; ")}`);
  }

  return actualCounts;
}

async function main() {
  const target = await assertConfiguredTarget();
  const documents = await fetchUtensils();
  const counts = validateBatch(documents);
  const changes = documents.filter(
    (document) =>
      document.utensilType !== typeForDisplayOrder(document.displayOrder),
  );

  console.log(`Target: ${target.projectId}/${target.dataset}`);
  console.log(`Validated ${documents.length} utensils: ${JSON.stringify(counts)}`);
  for (const document of changes) {
    console.log(
      `${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${document.title}: ${document.utensilType ?? "unset"} -> ${typeForDisplayOrder(document.displayOrder)}`,
    );
  }

  if (!applyChanges) {
    console.log(`Dry run only. ${changes.length} documents require a type update.`);
    return;
  }

  for (const document of changes) {
    await client
      .patch(document._id)
      .ifRevisionId(document._rev)
      .set({ utensilType: typeForDisplayOrder(document.displayOrder) })
      .commit();
  }

  const verified = await fetchUtensils();
  validateBatch(verified);
  const invalid = verified.filter(
    (document) =>
      document.utensilType !== typeForDisplayOrder(document.displayOrder),
  );
  if (invalid.length > 0) {
    throw new Error(
      `Utensil type verification failed for: ${invalid.map((document) => document._id).join(", ")}`,
    );
  }

  console.log(`Verified utensil types on all ${verified.length} documents.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
