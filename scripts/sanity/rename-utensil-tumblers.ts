import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-28" });
const applyChanges = process.argv.includes("--apply");
const utensilCategoryId = "category-utensils";

type GalleryImage = {
  _key: string;
  _type: "image";
  alt?: string;
  [key: string]: unknown;
};

type UtensilDocument = {
  _id: string;
  _rev: string;
  title?: string;
  shortDescription?: string;
  gallery?: GalleryImage[];
};

function renameCustomerFacingText(value: string) {
  return value.replace(/\bTumbler\b/g, "Glass").replace(/\btumbler\b/g, "glass");
}

function buildUpdates(document: UtensilDocument) {
  const updates: Partial<Pick<UtensilDocument, "title" | "shortDescription" | "gallery">> = {};

  if (document.title) {
    const title = renameCustomerFacingText(document.title);
    if (title !== document.title) updates.title = title;
  }
  if (document.shortDescription) {
    const shortDescription = renameCustomerFacingText(document.shortDescription);
    if (shortDescription !== document.shortDescription) {
      updates.shortDescription = shortDescription;
    }
  }
  if (document.gallery) {
    const gallery = document.gallery.map((image) =>
      image.alt
        ? { ...image, alt: renameCustomerFacingText(image.alt) }
        : image,
    );
    if (gallery.some((image, index) => image.alt !== document.gallery?.[index]?.alt)) {
      updates.gallery = gallery;
    }
  }

  return updates;
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

async function main() {
  const target = await assertConfiguredTarget();
  const documents = await client.fetch<UtensilDocument[]>(
    `*[_type == "product" && category._ref == $categoryId]{
      _id,
      _rev,
      title,
      shortDescription,
      gallery
    } | order(_id asc)`,
    { categoryId: utensilCategoryId },
  );
  const changes = documents
    .map((document) => ({ document, updates: buildUpdates(document) }))
    .filter(({ updates }) => Object.keys(updates).length > 0);

  console.log(`Target: ${target.projectId}/${target.dataset}`);
  console.log(`Matching utensil documents: ${changes.length}`);
  for (const { document, updates } of changes) {
    console.log(`${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${document._id}: ${document.title} -> ${updates.title ?? document.title}`);
  }

  if (!applyChanges) {
    console.log("Dry run only. Add --apply to write the changes.");
    return;
  }

  for (const { document, updates } of changes) {
    await client
      .patch(document._id)
      .ifRevisionId(document._rev)
      .set(updates)
      .commit();
  }
  console.log(`Updated ${changes.length} utensil documents.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
