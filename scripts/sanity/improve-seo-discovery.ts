import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";
import {
  categoryEditorial,
  curatedCollections,
} from "../../src/data/catalog-editorial";
import { getProductIdentity } from "../../src/lib/seo";

const client = getCliClient({ apiVersion: "2026-08-26" }).withConfig({
  useCdn: false,
  perspective: "published",
});
const apply = process.argv.includes("--apply");
type Image = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  alt: string;
};
type Doc = {
  _id: string;
  _rev: string;
  _type: string;
  title: string;
  slug: { current: string };
  shortDescription?: string;
  reference?: string;
  weightGrams?: number;
  seoTitle?: string;
  featured?: boolean;
  category?: { _ref: string };
  deities?: { _ref: string }[];
  utensilType?: string;
  gallery?: Image[];
  collections?: { _key: string; _type: "reference"; _ref: string }[];
  editorialSections?: unknown[];
};

async function main() {
  const docs = await client.fetch<Doc[]>(
    '*[_type in ["product", "category", "collection"]]',
  );
  const products = docs.filter((doc) => doc._type === "product");
  const patches = new Map<string, Record<string, unknown>>();
  const creates: Record<string, unknown>[] = [];
  const set = (id: string, values: Record<string, unknown>) =>
    patches.set(id, { ...patches.get(id), ...values });
  const manifest = JSON.parse(
    await readFile(
      "public/images/silver-utensils/ai-gallery-2026-08-02/sanity-utensil-manifest.json",
      "utf8",
    ),
  ) as { products: { id: string; reference: string }[] };
  let weights = 0,
    references = 0;
  const usedReferences = new Set(
    products.map((doc) => doc.reference).filter(Boolean),
  );
  for (const product of products) {
    if (product.category?._ref === "category-coin" && !product.weightGrams) {
      const titleWeight = product.title.match(
        /\b(\d+(?:\.\d+)?)\s*(?:grams?|g)\b/i,
      )?.[1];
      const descriptionWeight = product.shortDescription?.match(
        /\b(\d+(?:\.\d+)?)\s*(?:grams?|g)\b/i,
      )?.[1];
      const referenceWeight = product.reference?.match(
        /(?:^|-)(\d+(?:\.\d+)?)G(?:-|$)/i,
      )?.[1];
      if (
        !titleWeight ||
        Number(titleWeight) !== Number(descriptionWeight) ||
        Number(titleWeight) !== Number(referenceWeight)
      )
        throw new Error(`Unverified coin weight: ${product._id}`);
      set(product._id, { weightGrams: Number(titleWeight) });
      weights++;
    }
    const source = manifest.products.find((item) => item.id === product._id);
    if (source && !product.reference) {
      if (!source.reference || usedReferences.has(source.reference))
        throw new Error(`Reference collision: ${product._id}`);
      set(product._id, { reference: source.reference });
      usedReferences.add(source.reference);
      references++;
    }
  }
  const featuredIds = [
    "product-dda-idol-03-ganesha-arch",
    "product-dda-10g-oval-anniversary-silver-coin",
    "product-dda-desktop-files-20260822-011",
    "product-dda-desktop-files-20260822-055",
  ];
  if (!products.some((product) => product.featured)) {
    for (const id of featuredIds) {
      if (!products.find((product) => product._id === id)?.gallery?.[0]?.asset)
        throw new Error(`Featured image missing: ${id}`);
      set(id, { featured: true });
    }
  }
  for (const category of docs.filter((doc) => doc._type === "category")) {
    const sections = categoryEditorial[category.slug.current];
    if (sections && !category.editorialSections?.length)
      set(category._id, {
        editorialSections: sections.map((section, i) => ({
          _key: `guidance-${i}`,
          _type: "catalogEditorialSection",
          ...section,
        })),
      });
  }
  const weddingSlugs = [
    "engraved-wedding-scroll-holder",
    "floral-panel-silver-purse-405g",
    "ganesha-silver-idol-with-arch",
    "multicolor-enamel-petal-thali-set-9in-765g",
  ];
  const collectionCounts: Record<string, number> = {};
  for (const collection of curatedCollections) {
    const id = `collection-${collection.slug}`;
    const members = products
      .filter((product) => {
        const deities = product.deities?.map((deity) => deity._ref) ?? [];
        if (collection.slug === "silver-ganesha-idols")
          return (
            product.category?._ref === "category-idols" &&
            deities.length === 1 &&
            deities.includes("deity-ganesha")
          );
        if (collection.slug === "lakshmi-ganesha-silver-idol-pairs")
          return (
            product.category?._ref === "category-idols" &&
            deities.length === 2 &&
            deities.includes("deity-ganesha") &&
            deities.includes("deity-lakshmi")
          );
        if (collection.slug === "silver-pooja-thali-sets")
          return product.utensilType === "pooja-thali-set";
        return weddingSlugs.includes(product.slug.current);
      })
      .filter((product) => product.gallery?.[0]?.asset);
    if (!members.length) throw new Error(`Empty collection: ${id}`);
    const existing = docs.find((doc) => doc._id === id);
    if (
      docs.some(
        (doc) =>
          doc._type === "collection" &&
          doc.slug.current === collection.slug &&
          doc._id !== id,
      )
    )
      throw new Error(`Collection slug already owned: ${collection.slug}`);
    if (!existing)
      creates.push({
        _id: id,
        _type: "collection",
        title: collection.title,
        slug: { _type: "slug", current: collection.slug },
        description: collection.description,
        heroImage: members[0].gallery![0],
        displayOrder: 10 + creates.length,
        editorialSections: collection.editorialSections.map((section, i) => ({
          _key: `guidance-${i}`,
          _type: "catalogEditorialSection",
          ...section,
        })),
      });
    // Membership additions only happen on creation. A re-run must not undo a
    // curator's later decision to remove an item from the collection.
    if (!existing)
      for (const member of members) {
        const current = (patches.get(member._id)?.collections ??
          member.collections ??
          []) as NonNullable<Doc["collections"]>;
        if (!current.some((ref) => ref._ref === id))
          set(member._id, {
            collections: [
              ...current,
              { _key: collection.slug, _type: "reference", _ref: id },
            ],
          });
      }
    collectionCounts[collection.slug] = existing
      ? products.filter((product) =>
          product.collections?.some((ref) => ref._ref === id),
        ).length
      : members.length;
  }
  const names = new Map<string, string>();
  for (const product of products) {
    const updated = { ...product, ...patches.get(product._id) };
    const name = updated.seoTitle || getProductIdentity(updated);
    if (names.has(name))
      throw new Error(
        `Duplicate title: ${name} (${names.get(name)}, ${product._id})`,
      );
    names.set(name, product._id);
  }
  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        products: products.length,
        uniqueTitles: names.size,
        weights,
        references,
        featured: products
          .filter((p) => p.featured || patches.get(p._id)?.featured)
          .map((p) => p._id),
        collections: collectionCounts,
        creates: creates.length,
        patches: patches.size,
      },
      null,
      2,
    ),
  );
  if (!apply || (!patches.size && !creates.length)) return;
  const backupPath = join(tmpdir(), `dda-seo-before-${Date.now()}.json`);
  await writeFile(
    backupPath,
    JSON.stringify(
      {
        before: docs.filter((doc) => patches.has(doc._id)),
        createdIds: creates.map((doc) => doc._id),
      },
      null,
      2,
    ),
  );
  let transaction = client.transaction();
  for (const doc of creates)
    transaction = transaction.create(doc as { _id: string; _type: string });
  for (const [id, values] of patches)
    transaction = transaction.patch(id, (patch) =>
      patch.ifRevisionId(docs.find((doc) => doc._id === id)!._rev).set(values),
    );
  await transaction.commit({ visibility: "sync" });
  console.log(`Published atomically. Revision-guarded backup: ${backupPath}`);
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "SEO migration failed",
  );
  process.exitCode = 1;
});
