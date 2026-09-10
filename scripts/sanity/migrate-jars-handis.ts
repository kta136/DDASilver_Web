import { mkdir, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";
import { assertProductDocument } from "../../src/lib/catalog-domain";
import { validatePricingPatch } from "../../src/lib/pricing/sanity-validation";

const client = getCliClient({ apiVersion: "2026-09-01" }).withConfig({ useCdn: false, perspective: "raw" });
const apply = process.argv.includes("--apply");
const handis = [
  "product-dda-gift-sd-11-scrollwork-glass-lid-silver-sindoor-dani",
  "product-dda-gift-sd-12-plain-glass-lid-silver-sindoor-dani",
  "product-dda-gift-sd-13-fluted-floral-lidded-silver-sindoor-dani",
  "product-dda-gift-sd-14-plain-glass-lid-silver-sindoor-dani-3in",
  "product-dda-gift-sd-15-scrollwork-glass-lid-silver-sindoor-dani-3in",
  "product-dda-gift-sd-16-floral-crystal-knob-silver-sindoor-dani",
];
const jars = [11, 12, 13, 15].map((number) => `product-dda-img-20260830-${number}`);
const ids = [...jars, ...handis];
type Document = {
  _id: string;
  _rev: string;
  title: string;
  shortDescription: string;
  seoTitle?: string;
  category: { _ref: string; _type: "reference" };
  gallery: { _key: string; alt: string; [key: string]: unknown }[];
  utensilType?: string;
  [key: string]: unknown;
};
const rename = (text: string) => text.replace(/Sindoor\s+Dani/gi, "Handi");

async function main() {
  const { projectId, dataset } = client.config();
  if (projectId !== "f6i0fy2f" || dataset !== "production") {
    throw new Error(`Unexpected target: ${projectId}/${dataset}`);
  }
  const documents = await client.fetch<Document[]>("*[_id in $ids]", {
    ids: [...ids, ...ids.map((id) => `drafts.${id}`)],
  });
  for (const id of ids) {
    if (!documents.some((document) => document._id === id)) throw new Error(`Missing ${id}`);
  }
  if (!await client.fetch('defined(*[_id == "category-utensils"][0])')) throw new Error("Missing Utensils category");
  const plans = [];
  for (const document of documents) {
    const id = document._id.replace(/^drafts\./, "");
    const handi = handis.includes(id);
    if (!["category-gifts", "category-utensils"].includes(document.category._ref)) {
      throw new Error(`Unexpected category for ${document._id}`);
    }
    if (!(handi ? /\b(Sindoor Dani|Handi)\b/i : /\bJar\b/i).test(document.title)) {
      throw new Error(`Unexpected title for ${document._id}`);
    }
    // Stable document IDs, references, slugs, images and measurements are retained.
    const set: Record<string, unknown> = {
      category: { _type: "reference", _ref: "category-utensils" },
      utensilType: handi ? "handi" : "jar",
    };
    if (handi) {
      set.title = rename(document.title);
      set.shortDescription = rename(document.shortDescription);
      set.gallery = document.gallery.map((image) => ({ ...image, alt: rename(image.alt) }));
      if (document.seoTitle) set.seoTitle = rename(document.seoTitle);
    }
    assertProductDocument({ ...document, ...set }, "utensil");
    await validatePricingPatch(client, document._id, set);
    if (Object.entries(set).some(([key, value]) => !isDeepStrictEqual(document[key], value))) {
      plans.push({ document, set });
    }
  }
  console.table(plans.map(({ document, set }) => ({ id: document._id, title: set.title ?? document.title, type: set.utensilType })));
  console.log(`${apply ? "Apply" : "Dry run"}: ${plans.length} changes; ${documents.length} documents validated.`);
  if (!apply || !plans.length) return;
  await mkdir("tmp/jars-handis", { recursive: true });
  const backup = `tmp/jars-handis/before-${Date.now()}.json`;
  await writeFile(backup, JSON.stringify(documents, null, 2) + "\n");
  let transaction = client.transaction();
  for (const { document, set } of plans) {
    transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set(set));
  }
  const result = await transaction.commit();
  const updated = await client.fetch<Document[]>("*[_id in $ids]", { ids: documents.map((document) => document._id) });
  for (const { document, set } of plans) {
    const actual = updated.find((row) => row._id === document._id);
    for (const [key, value] of Object.entries(set)) {
      if (!isDeepStrictEqual(actual?.[key], value)) throw new Error(`Verification failed: ${document._id}.${key}`);
    }
  }
  console.log(`Verified ${plans.length} changes. Transaction: ${result.transactionId}. Backup: ${backup}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
