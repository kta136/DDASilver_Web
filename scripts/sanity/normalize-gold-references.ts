import { isDeepStrictEqual } from "node:util";

import { getCliClient } from "sanity/cli";

import mapping from "./gold-reference-mapping.json";

// Raw perspective includes published documents and drafts as separate records.
const client = getCliClient({ apiVersion: "2026-08-23" }).withConfig({
  useCdn: false,
  perspective: "raw",
});
const applyChanges = process.argv.includes("--apply");
const field = process.argv.includes("--display-order") ? "displayOrder" : "reference";
const fieldLabel = field === "displayOrder" ? "Display order" : "Reference";
const targets = mapping.products;
const targetById = new Map(
  targets.flatMap((target) => [
    [target.id, target] as const,
    [`drafts.${target.id}`, target] as const,
  ]),
);

type ProductDocument = {
  _id: string;
  _rev: string;
  reference?: string;
  slug?: { current?: string };
  category?: { _ref?: string };
  material?: string;
  weightGrams?: number;
  coinShape?: string;
  purity?: string;
  [key: string]: unknown;
};

async function fetchProducts() {
  // Include both old and new codes to catch collisions anywhere in the dataset.
  return client.fetch<ProductDocument[]>(
    `*[_type == "product" && (_id in $ids || reference in $references)] | order(_id asc)`,
    {
      ids: [...targetById.keys()],
      references: targets.flatMap(({ reference, legacyReference }) => [
        reference,
        legacyReference,
      ]),
    },
  );
}

function validateDocuments(documents: ProductDocument[]) {
  const byId = new Map(documents.map((document) => [document._id, document]));
  for (const target of targets) {
    if (!byId.has(target.id)) {
      throw new Error(`Published gold product not found: ${target.id}`);
    }
  }
  for (const document of documents) {
    const target = targetById.get(document._id);
    if (!target) {
      throw new Error(
        `Reference collision: ${document._id} already uses ${document.reference}.`,
      );
    }
    if (
      ![target.reference, target.legacyReference].includes(document.reference ?? "") ||
      document.slug?.current !== target.slug ||
      document.category?._ref !== "category-gold" ||
      document.material !== "gold" ||
      document.weightGrams !== target.weightGrams ||
      document.coinShape !== target.coinShape ||
      document.purity !== target.purity
    ) {
      throw new Error(`Gold product identity mismatch: ${document._id}`);
    }
  }
  return byId;
}

function unchangedFields(document: ProductDocument) {
  const fields = { ...document };
  delete fields[field];
  delete fields._updatedAt;
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => key !== "_rev"),
  );
}

async function main() {
  const { projectId, dataset } = client.config();
  if (projectId !== mapping.projectId || dataset !== mapping.dataset) {
    throw new Error(
      `Sanity target ${projectId}/${dataset} does not match ${mapping.projectId}/${mapping.dataset}.`,
    );
  }
  if (
    new Set(targets.map(({ id }) => id)).size !== targets.length ||
    new Set(targets.map(({ reference }) => reference)).size !== targets.length ||
    targets.some(({ reference }) => !/^(GC|GB)-[1-9]\d*$/.test(reference)) ||
    new Set(targets.map(({ displayOrder }) => displayOrder)).size !== targets.length ||
    targets.some(({ displayOrder }) => !Number.isSafeInteger(displayOrder) || displayOrder < 0)
  ) {
    throw new Error("Gold mapping contains duplicate or invalid reference/order assignments.");
  }

  const documents = await fetchProducts();
  validateDocuments(documents);
  const changes = documents.filter(
    (document) => document[field] !== targetById.get(document._id)![field],
  );
  const drafts = changes.filter(({ _id }) => _id.startsWith("drafts.")).length;
  console.log(`Target: ${projectId}/${dataset}`);
  console.log(`${fieldLabel} changes: ${changes.length - drafts} published, ${drafts} drafts.`);
  for (const document of changes) {
    console.log(
      `${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${document.reference} (${document._id}): ${document[field]} -> ${targetById.get(document._id)![field]}`,
    );
  }
  if (!applyChanges) {
    console.log("Dry run complete. No Sanity documents were written.");
    return;
  }
  if (changes.length === 0) {
    console.log(`Gold ${fieldLabel.toLowerCase()} already matches; no changes required.`);
    return;
  }

  let transaction = client.transaction();
  for (const document of changes) {
    transaction = transaction.patch(document._id, (patch) =>
      patch.ifRevisionId(document._rev).set({
        [field]: targetById.get(document._id)![field],
      }),
    );
  }
  await transaction.commit({ visibility: "sync" });

  const verified = validateDocuments(await fetchProducts());
  if (verified.size !== documents.length) {
    throw new Error("Gold product or draft set changed during migration; inspect before retrying.");
  }
  for (const before of documents) {
    const after = verified.get(before._id);
    if (
      !after ||
      after[field] !== targetById.get(before._id)![field] ||
      !isDeepStrictEqual(unchangedFields(before), unchangedFields(after))
    ) {
      throw new Error(`${fieldLabel}-only verification failed for ${before._id}.`);
    }
  }
  console.log(
    `Verified ${documents.length} documents: expected ${fieldLabel.toLowerCase()}, all other content unchanged.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
