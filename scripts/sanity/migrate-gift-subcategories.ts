import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-01" });
const applyChanges = process.argv.includes("--apply");
const expectedProjectId = "f6i0fy2f";
const expectedDataset = "production";
const sourceCategoryId = "category-gifts";

type TargetCategoryId =
  | "category-boxes"
  | "category-singhasan"
  | "category-hatri";

type ProductPlan = {
  id: string;
  oldReference: string;
  reference: string;
  categoryId: TargetCategoryId;
};

const categoryDefinitions = [
  {
    id: "category-boxes",
    title: "Boxes",
    slug: "boxes",
    description:
      "Decorative silver boxes, keepsakes, and gift sets for celebrations, rituals, and meaningful occasions.",
    displayOrder: 6,
    imageProductId: "product-dda-img-20260830-01",
    alt: "Pink rose enamel rectangular silver gift box with floral relief decoration",
  },
  {
    id: "category-singhasan",
    title: "Singhasan",
    slug: "singhasan",
    description:
      "Ornate 92.5% silver singhasans for devotional idols, home temples, and auspicious celebrations.",
    displayOrder: 7,
    imageProductId:
      "product-dda-gift-sg-12-scalloped-floral-round-silver-singhasan",
    alt: "Scalloped floral round silver singhasan with engraved seat and decorative back",
  },
  {
    id: "category-hatri",
    title: "Hatri",
    slug: "hatri",
    description:
      "Traditional 92.5% silver Hatris for Diwali puja, festive rituals, and devotional settings.",
    displayOrder: 8,
    imageProductId: "product-dda-pics-20260825-11",
    alt: "Two-tier arched silver Hatri with ritual cups and devotional detailing",
  },
] as const;

const boxes = [
  ["product-dda-img-20260830-01", "DDA-GF-IMG-0830-01"],
  ["product-dda-img-20260830-02", "DDA-GF-IMG-0830-02"],
  ["product-dda-img-20260830-03", "DDA-GF-IMG-0830-03"],
  ["product-dda-img-20260830-04", "DDA-GF-IMG-0830-04"],
  ["product-dda-img-20260830-05", "DDA-GF-IMG-0830-05"],
  ["product-dda-img-20260830-06", "DDA-GF-IMG-0830-06"],
  ["product-dda-img-20260830-07", "DDA-GF-IMG-0830-07"],
  ["product-dda-img-20260830-08", "DDA-GF-IMG-0830-08"],
  ["product-dda-img-20260830-09", "DDA-GF-IMG-0830-09"],
  ["product-dda-img-20260830-10", "DDA-GF-IMG-0830-10"],
  ["product-dda-img-20260830-14", "DDA-GF-IMG-0830-14"],
  ["product-dda-img-20260830-16", "DDA-GF-IMG-0830-16"],
  ["product-dda-img-20260830-17", "DDA-GF-IMG-0830-17"],
  ["product-dda-img-20260830-18", "DDA-GF-IMG-0830-18"],
  ["product-dda-img-20260830-19", "DDA-GF-IMG-0830-19"],
  [
    "product-dda-gift-jpb-01-plain-nine-piece-silver-jain-pooja-box-set",
    "JPB-01",
  ],
  ["product-dda-pics-20260825-41", "DDA-GF-PICS-41"],
  ["product-dda-pics-20260825-42", "DDA-GF-PICS-42"],
  ["product-dda-pics-20260825-43", "DDA-GF-PICS-43"],
  ["product-dda-pics-20260825-44", "DDA-GF-PICS-44"],
  ["product-dda-pics-20260825-45", "DDA-GF-PICS-45"],
  ["product-dda-pics-20260825-46", "DDA-GF-PICS-46"],
  ["product-dda-pics-20260825-47", "DDA-GF-PICS-47"],
  ["product-dda-pics-20260825-48", "DDA-GF-PICS-48"],
  ["product-dda-pics-20260825-49", "DDA-GF-PICS-49"],
  ["product-dda-pics-20260825-58", "DDA-GF-PICS-58"],
  ["product-dda-pics-20260825-59", "DDA-GF-PICS-59"],
  ["product-dda-pics-20260825-61", "DDA-GF-PICS-61"],
  ["product-dda-pics-20260825-63", "DDA-GF-PICS-63"],
  ["product-dda-pics-20260825-64", "DDA-GF-PICS-64"],
] as const;

const singhasans = [
  "product-dda-gift-sg-12-scalloped-floral-round-silver-singhasan",
  "product-dda-gift-sg-13-twin-peacock-floral-elephant-foot-silver-singhasan",
  "product-dda-gift-sg-14-petite-pointed-floral-silver-singhasan",
  "product-dda-gift-sg-15-compact-floral-fan-silver-singhasan",
  "product-dda-gift-sg-16-openwork-arch-floral-silver-singhasan",
  "product-dda-gift-sg-17-twin-peacock-bolster-silver-singhasan",
  "product-dda-gift-sg-18-tiered-floral-crown-silver-singhasan",
  "product-dda-gift-sg-19-gold-accent-peacock-canopy-silver-singhasan",
  "product-dda-gift-sg-20-chrysanthemum-tree-round-silver-singhasan",
  "product-dda-gift-sg-21-tiered-leaf-floral-silver-singhasan",
  "product-dda-gift-sg-22-peacock-fan-two-tier-silver-singhasan",
  "product-dda-gift-sg-23-pink-accent-floral-round-silver-singhasan",
  "product-dda-gift-sg-24-twin-peacock-round-silver-singhasan",
  "product-dda-gift-sg-25-floral-back-silver-singhasan",
] as const;

const hatris = [
  ["product-dda-pics-20260825-11", "DDA-GF-PICS-11"],
  ["product-dda-pics-20260825-12", "DDA-GF-PICS-12"],
  ["product-dda-pics-20260825-13", "DDA-GF-PICS-13"],
  ["product-dda-pics-20260825-14", "DDA-GF-PICS-14"],
  ["product-dda-pics-20260825-15", "DDA-GF-PICS-15"],
  ["product-dda-pics-20260825-16", "DDA-GF-PICS-16"],
  ["product-dda-pics-20260825-17", "DDA-GF-PICS-17"],
  ["product-dda-pics-20260825-20", "DDA-GF-PICS-20"],
  ["product-dda-pics-20260825-21", "DDA-GF-PICS-21"],
  ["product-dda-pics-20260825-22", "DDA-GF-PICS-22"],
  ["product-dda-pics-20260825-23", "DDA-GF-PICS-23"],
] as const;

const productPlans: ProductPlan[] = [
  ...boxes.map(([id, oldReference], index) => ({
    id,
    oldReference,
    reference: `BX-${String(index + 1).padStart(2, "0")}`,
    categoryId: "category-boxes" as const,
  })),
  ...singhasans.map((id, index) => ({
    id,
    oldReference: `SG-${String(index + 12).padStart(2, "0")}`,
    reference: `SG-${String(index + 12).padStart(2, "0")}`,
    categoryId: "category-singhasan" as const,
  })),
  ...hatris.map(([id, oldReference], index) => ({
    id,
    oldReference,
    reference: `HT-${String(index + 1).padStart(2, "0")}`,
    categoryId: "category-hatri" as const,
  })),
];

const shiftedCategories = [
  { id: "category-jhula", displayOrder: 9 },
  { id: "category-utensils", displayOrder: 10 },
  { id: "category-gold", displayOrder: 11 },
  { id: "category-phone-covers", displayOrder: 12 },
] as const;

type ExistingProduct = {
  _id: string;
  _rev: string;
  title: string;
  slug?: string;
  reference?: string;
  categoryId?: string;
  displayOrder?: number;
  imageAssetId?: string;
};

type ExistingCategory = {
  _id: string;
  _rev: string;
  title?: string;
  slug?: string;
  displayOrder?: number;
};

type ExistingAsset = {
  _id: string;
  _rev: string;
  title?: string;
};

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} values must be unique.`);
  }
}

function assertOrderedIds(
  products: ExistingProduct[],
  plans: ProductPlan[],
  label: string,
) {
  const actual = [...products]
    .sort(
      (a, b) =>
        (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
        a._id.localeCompare(b._id),
    )
    .map(({ _id }) => _id);
  const expected = plans.map(({ id }) => id);
  if (actual.join("\n") !== expected.join("\n")) {
    throw new Error(`${label} display order changed; review item-code allocation.`);
  }
}

async function main() {
  const { projectId, dataset } = client.config();
  if (projectId !== expectedProjectId || dataset !== expectedDataset) {
    throw new Error(
      `Expected Sanity target ${expectedProjectId}/${expectedDataset}, received ${projectId}/${dataset}.`,
    );
  }

  assertUnique(productPlans.map(({ id }) => id), "Product ID");
  assertUnique(productPlans.map(({ reference }) => reference), "Target reference");

  const productIds = productPlans.map(({ id }) => id);
  const targetReferences = productPlans.map(({ reference }) => reference);
  const categoryIds = categoryDefinitions.map(({ id }) => id);
  const categorySlugs = categoryDefinitions.map(({ slug }) => slug);
  const shiftedCategoryIds = shiftedCategories.map(({ id }) => id);

  const [products, categories, shifted, referenceConflicts, giftCount] =
    await Promise.all([
      client.fetch<ExistingProduct[]>(
        `*[_type == "product" && _id in $productIds]{
          _id, _rev, title, "slug": slug.current, reference,
          "categoryId": category._ref, displayOrder,
          "imageAssetId": gallery[0].asset._ref
        }`,
        { productIds },
      ),
      client.fetch<ExistingCategory[]>(
        `*[_type == "category" && (_id in $categoryIds || slug.current in $categorySlugs)]{
          _id, _rev, title, "slug": slug.current, displayOrder
        }`,
        { categoryIds, categorySlugs },
      ),
      client.fetch<ExistingCategory[]>(
        `*[_type == "category" && _id in $shiftedCategoryIds]{
          _id, _rev, title, "slug": slug.current, displayOrder
        }`,
        { shiftedCategoryIds },
      ),
      client.fetch<ExistingProduct[]>(
        `*[_type == "product" && reference in $targetReferences && !(_id in $productIds)]{
          _id, title, reference
        }`,
        { targetReferences, productIds },
      ),
      client.fetch<number>(
        `count(*[_type == "product" && !(_id in path("drafts.**")) && category._ref == $sourceCategoryId])`,
        { sourceCategoryId },
      ),
    ]);

  if (products.length !== productPlans.length) {
    const found = new Set(products.map(({ _id }) => _id));
    const missing = productIds.filter((id) => !found.has(id));
    throw new Error(`Missing migration products: ${missing.join(", ")}`);
  }
  if (referenceConflicts.length > 0) {
    throw new Error(
      `Target reference conflict: ${referenceConflicts
        .map(({ _id, reference }) => `${reference} (${_id})`)
        .join(", ")}`,
    );
  }

  const categoryById = new Map(categories.map((category) => [category._id, category]));
  for (const category of categories) {
    if (!categoryIds.includes(category._id as (typeof categoryIds)[number])) {
      throw new Error(
        `Category slug ${category.slug} is already used by ${category._id}.`,
      );
    }
  }
  const shiftedById = new Map(shifted.map((category) => [category._id, category]));
  for (const { id } of shiftedCategories) {
    if (!shiftedById.has(id)) throw new Error(`Missing category: ${id}`);
  }

  const productById = new Map(products.map((product) => [product._id, product]));
  for (const plan of productPlans) {
    const product = productById.get(plan.id)!;
    if (
      product.categoryId !== sourceCategoryId &&
      product.categoryId !== plan.categoryId
    ) {
      throw new Error(
        `${product._id} has unexpected category ${product.categoryId ?? "(missing)"}.`,
      );
    }
    if (
      product.reference !== plan.oldReference &&
      product.reference !== plan.reference
    ) {
      throw new Error(
        `${product._id} has unexpected reference ${product.reference ?? "(missing)"}.`,
      );
    }
    if (!product.slug) throw new Error(`${product._id} is missing its slug.`);
    if (!product.imageAssetId) {
      throw new Error(`${product._id} is missing its primary gallery image.`);
    }
    const expectedWord =
      plan.categoryId === "category-boxes"
        ? "Box"
        : plan.categoryId === "category-singhasan"
          ? "Singhasan"
          : "Hatri";
    if (!new RegExp(`\\b${expectedWord}\\b`, "i").test(product.title)) {
      throw new Error(`${product._id} title no longer identifies a ${expectedWord}.`);
    }
  }

  assertOrderedIds(
    products.filter(({ _id }) => boxes.some(([id]) => id === _id)),
    productPlans.filter(({ categoryId }) => categoryId === "category-boxes"),
    "Box",
  );
  assertOrderedIds(
    products.filter(({ _id }) => hatris.some(([id]) => id === _id)),
    productPlans.filter(({ categoryId }) => categoryId === "category-hatri"),
    "Hatri",
  );

  const remainingInGifts = products.filter(
    ({ categoryId }) => categoryId === sourceCategoryId,
  ).length;
  if (![0, productPlans.length].includes(remainingInGifts)) {
    throw new Error(
      `Partial migration detected: ${remainingInGifts}/${productPlans.length} products remain in Gifts.`,
    );
  }
  if (
    (remainingInGifts === productPlans.length && giftCount !== 98) ||
    (remainingInGifts === 0 && giftCount !== 43)
  ) {
    throw new Error(
      `Unexpected Gifts count ${giftCount}; expected ${remainingInGifts ? 98 : 43}.`,
    );
  }

  const imageAssetIds = products.map(({ imageAssetId }) => imageAssetId!);
  assertUnique(imageAssetIds, "Primary image asset");
  const assets = await client.fetch<ExistingAsset[]>(
    `*[_type == "sanity.imageAsset" && _id in $imageAssetIds]{_id, _rev, title}`,
    { imageAssetIds },
  );
  if (assets.length !== imageAssetIds.length) {
    const found = new Set(assets.map(({ _id }) => _id));
    const missing = imageAssetIds.filter((id) => !found.has(id));
    throw new Error(`Missing primary image assets: ${missing.join(", ")}`);
  }
  const assetById = new Map(assets.map((asset) => [asset._id, asset]));

  console.log(`Target: ${projectId}/${dataset}`);
  console.table(
    categoryDefinitions.map((category) => ({
      action: categoryById.has(category.id) ? "UPDATE" : "CREATE",
      category: category.title,
      slug: category.slug,
      order: category.displayOrder,
    })),
  );
  console.table(
    productPlans.map((plan) => {
      const product = productById.get(plan.id)!;
      return {
        action:
          product.categoryId === plan.categoryId &&
          product.reference === plan.reference
            ? "UNCHANGED"
            : "UPDATE",
        from: product.reference,
        to: plan.reference,
        category: plan.categoryId,
        title: product.title,
      };
    }),
  );
  console.log(
    `Counts: Gifts ${giftCount}; Boxes 30; Singhasan 14; Hatri 11 planned.`,
  );

  if (!applyChanges) {
    console.log("Dry run complete. No Sanity documents were changed.");
    return;
  }

  let transaction = client.transaction();
  for (const definition of categoryDefinitions) {
    const imageProduct = productById.get(definition.imageProductId)!;
    const categoryFields = {
      title: definition.title,
      slug: { _type: "slug" as const, current: definition.slug },
      description: definition.description,
      displayOrder: definition.displayOrder,
      productKind: "general",
      showOnHomepage: true,
      homepageOrder: definition.displayOrder,
      homepageImageSource: "product",
      image: {
        _type: "image" as const,
        asset: {
          _type: "reference" as const,
          _ref: imageProduct.imageAssetId!,
        },
        alt: definition.alt,
      },
    };
    const categoryDocument = {
      _id: definition.id,
      _type: "category" as const,
      ...categoryFields,
    };
    const existing = categoryById.get(definition.id);
    transaction = existing
      ? transaction.patch(existing._id, (patch) =>
          patch.ifRevisionId(existing._rev).set(categoryFields),
        )
      : transaction.create(categoryDocument);
  }

  for (const shiftedCategory of shiftedCategories) {
    const existing = shiftedById.get(shiftedCategory.id)!;
    transaction = transaction.patch(existing._id, (patch) =>
      patch.ifRevisionId(existing._rev).set({
        displayOrder: shiftedCategory.displayOrder,
        showOnHomepage: true,
        homepageOrder: shiftedCategory.displayOrder,
        homepageImageSource: "product",
      }),
    );
  }

  for (const plan of productPlans) {
    const product = productById.get(plan.id)!;
    const asset = assetById.get(product.imageAssetId!)!;
    transaction = transaction
      .patch(product._id, (patch) =>
        patch.ifRevisionId(product._rev).set({
          category: { _type: "reference", _ref: plan.categoryId },
          reference: plan.reference,
        }),
      )
      .patch(asset._id, (patch) =>
        patch
          .ifRevisionId(asset._rev)
          .set({ title: `${plan.reference} — ${product.title} catalog image` }),
      );
  }

  await transaction.commit({ visibility: "sync" });

  const verification = await client.fetch<{
    gifts: number;
    boxes: number;
    singhasans: number;
    hatris: number;
    categories: Array<{
      _id: string;
      slug?: string;
      displayOrder?: number;
      homepageOrder?: number;
      productKind?: string;
      showOnHomepage?: boolean;
      imageAssetId?: string;
    }>;
    products: ExistingProduct[];
    conflicts: ExistingProduct[];
  }>(
    `{
      "gifts": count(*[_type == "product" && !(_id in path("drafts.**")) && category._ref == "category-gifts"]),
      "boxes": count(*[_type == "product" && !(_id in path("drafts.**")) && category._ref == "category-boxes"]),
      "singhasans": count(*[_type == "product" && !(_id in path("drafts.**")) && category._ref == "category-singhasan"]),
      "hatris": count(*[_type == "product" && !(_id in path("drafts.**")) && category._ref == "category-hatri"]),
      "categories": *[_type == "category" && _id in $allCategoryIds]{
        _id, "slug": slug.current, displayOrder, homepageOrder, productKind,
        showOnHomepage, "imageAssetId": image.asset._ref
      },
      "products": *[_type == "product" && _id in $productIds]{
        _id, title, "slug": slug.current, reference,
        "categoryId": category._ref, "imageAssetId": gallery[0].asset._ref
      },
      "conflicts": *[_type == "product" && reference in $targetReferences && !(_id in $productIds)]{
        _id, title, reference
      }
    }`,
    {
      allCategoryIds: [...categoryIds, ...shiftedCategoryIds],
      productIds,
      targetReferences,
    },
  );

  if (
    verification.gifts !== 43 ||
    verification.boxes !== 30 ||
    verification.singhasans !== 14 ||
    verification.hatris !== 11
  ) {
    throw new Error(`Count verification failed: ${JSON.stringify(verification)}`);
  }
  if (verification.conflicts.length > 0) {
    throw new Error("Reference uniqueness verification failed.");
  }
  const verifiedProductById = new Map(
    verification.products.map((product) => [product._id, product]),
  );
  for (const plan of productPlans) {
    const product = verifiedProductById.get(plan.id);
    if (
      product?.categoryId !== plan.categoryId ||
      product.reference !== plan.reference
    ) {
      throw new Error(`Product verification failed for ${plan.id}.`);
    }
  }
  const verifiedCategoryById = new Map(
    verification.categories.map((category) => [category._id, category]),
  );
  for (const definition of categoryDefinitions) {
    const category = verifiedCategoryById.get(definition.id);
    const imageProduct = productById.get(definition.imageProductId)!;
    if (
      category?.slug !== definition.slug ||
      category.displayOrder !== definition.displayOrder ||
      category.homepageOrder !== definition.displayOrder ||
      category.productKind !== "general" ||
      category.showOnHomepage !== true ||
      category.imageAssetId !== imageProduct.imageAssetId
    ) {
      throw new Error(`Category verification failed for ${definition.id}.`);
    }
  }
  for (const shiftedCategory of shiftedCategories) {
    const category = verifiedCategoryById.get(shiftedCategory.id);
    if (
      category?.displayOrder !== shiftedCategory.displayOrder ||
      category.homepageOrder !== shiftedCategory.displayOrder ||
      category.showOnHomepage !== true
    ) {
      throw new Error(`Ordering verification failed for ${shiftedCategory.id}.`);
    }
  }

  console.log(
    "Migration verified: Gifts 43, Boxes 30, Singhasan 14, Hatri 11; all category orders and item references are correct.",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
