import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-08-09" });
const projectRoot = resolve(import.meta.dirname, "../..");
const defaultManifestPath = resolve(
  projectRoot,
  "scripts/images/mixed-gallery-new-folder-2-2026-08-09.json",
);
const defaultMappingPath = resolve(
  projectRoot,
  "scripts/images/mixed-gallery-new-folder-2-2026-08-09-sanity-assets.json",
);
const applyChanges =
  process.argv.includes("--apply") ||
  process.env.SANITY_MIXED_GALLERY_ASSETS_APPLY === "1";
const uploadConcurrency = 3;
const verificationAttempts = 5;
const verificationDelayMs = 1_500;

type ManifestProduct = {
  number: number;
  id: string;
  reference: string;
  title: string;
  imagePath: string;
};

type GalleryManifest = {
  schemaVersion: number;
  batchId: string;
  sourceCount: number;
  readyForSanityAssetUpload: boolean;
  products: ManifestProduct[];
};

type ImageRecord = {
  product: ManifestProduct;
  absolutePath: string;
  sha1hash: string;
};

type SanityImageAsset = {
  _id: string;
  sha1hash: string;
  url: string;
  originalFilename?: string;
};

function getArgumentValue(name: string) {
  const inline = process.argv.find((argument) =>
    argument.startsWith(`${name}=`),
  );
  if (inline) {
    return inline.slice(name.length + 1);
  }
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function resolveInputPath(value: string | undefined, fallback: string) {
  return value
    ? resolve(projectRoot, value)
    : fallback;
}

async function getFileSha1(filePath: string) {
  const contents = await readFile(filePath);
  return createHash("sha1").update(contents).digest("hex");
}

async function loadManifest(manifestPath: string) {
  const payload = JSON.parse(
    await readFile(manifestPath, "utf8"),
  ) as GalleryManifest;

  if (payload.schemaVersion !== 1) {
    throw new Error("Mixed gallery manifest schemaVersion must be 1.");
  }
  if (!payload.readyForSanityAssetUpload) {
    throw new Error("Manifest is not ready for Sanity asset upload.");
  }
  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    throw new Error("Mixed gallery manifest must contain at least one product.");
  }
  if (payload.sourceCount !== payload.products.length) {
    throw new Error("Manifest sourceCount does not match its product count.");
  }

  return payload;
}

async function prepareImageRecords(products: ManifestProduct[]) {
  const imagePaths = new Set<string>();
  const records: ImageRecord[] = [];

  for (const product of products) {
    const absolutePath = resolve(projectRoot, product.imagePath);
    if (!absolutePath.startsWith(`${projectRoot}\\`)) {
      throw new Error(`${product.reference}: imagePath escapes the project root.`);
    }
    if (imagePaths.has(absolutePath.toLowerCase())) {
      throw new Error(`${product.reference}: imagePath is duplicated.`);
    }
    const fileStats = await stat(absolutePath);
    if (!fileStats.isFile() || !absolutePath.toLowerCase().endsWith(".png")) {
      throw new Error(`${product.reference}: imagePath must be a PNG file.`);
    }
    imagePaths.add(absolutePath.toLowerCase());
    records.push({
      product,
      absolutePath,
      sha1hash: await getFileSha1(absolutePath),
    });
  }

  return records;
}

async function findAssetsByHash(hashes: string[]) {
  return client.fetch<SanityImageAsset[]>(
    `*[_type == "sanity.imageAsset" && sha1hash in $hashes]{
      _id,
      sha1hash,
      url,
      originalFilename
    }`,
    { hashes },
  );
}

async function verifyAssetsByHash(hashes: string[]) {
  let assets: SanityImageAsset[] = [];

  for (let attempt = 1; attempt <= verificationAttempts; attempt += 1) {
    assets = await findAssetsByHash(hashes);
    if (new Set(assets.map((asset) => asset.sha1hash)).size === hashes.length) {
      return assets;
    }
    if (attempt < verificationAttempts) {
      await new Promise((resolvePromise) =>
        setTimeout(resolvePromise, verificationDelayMs),
      );
    }
  }

  return assets;
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  operation: (item: T) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await operation(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

async function main() {
  const manifestPath = resolveInputPath(
    getArgumentValue("--manifest") ??
      process.env.SANITY_MIXED_GALLERY_MANIFEST,
    defaultManifestPath,
  );
  const mappingPath = resolveInputPath(
    getArgumentValue("--mapping") ??
      process.env.SANITY_MIXED_GALLERY_MAPPING,
    defaultMappingPath,
  );
  const manifest = await loadManifest(manifestPath);
  const records = await prepareImageRecords(manifest.products);
  const uniqueByHash = new Map(
    records.map((record) => [record.sha1hash, record]),
  );
  const hashes = [...uniqueByHash.keys()];
  const existingAssets = await findAssetsByHash(hashes);
  const existingByHash = new Map(
    existingAssets.map((asset) => [asset.sha1hash, asset]),
  );
  const missingRecords = [...uniqueByHash.values()].filter(
    (record) => !existingByHash.has(record.sha1hash),
  );
  const { projectId, dataset } = client.config();

  if (!projectId || projectId === "replace-me" || !dataset) {
    throw new Error("Sanity project and dataset are not configured.");
  }

  console.log(`Target: ${projectId}/${dataset}`);
  console.log(`Manifest: ${relative(projectRoot, manifestPath)}`);
  console.log(
    `Images: ${records.length}; unique files: ${hashes.length}; existing assets: ${existingAssets.length}; missing assets: ${missingRecords.length}`,
  );

  if (!applyChanges) {
    console.log("Dry run only. No Sanity assets were written.");
    console.log(
      "Run `npm run sanity:upload-mixed-gallery-assets:apply` to upload the missing image assets.",
    );
    return;
  }

  const uploadedAssets = await mapWithConcurrency(
    missingRecords,
    uploadConcurrency,
    async (record) => {
      const asset = await client.assets.upload(
        "image",
        createReadStream(record.absolutePath),
        {
          filename: basename(record.absolutePath),
          title: `${record.product.reference} — ${record.product.title} catalog image`,
        },
      );
      console.log(`Uploaded ${record.product.reference}: ${asset._id}`);
      return asset as SanityImageAsset;
    },
  );

  const verifiedAssets = await verifyAssetsByHash(hashes);
  const verifiedByHash = new Map(
    verifiedAssets.map((asset) => [asset.sha1hash, asset]),
  );
  const missingHashes = hashes.filter((hash) => !verifiedByHash.has(hash));
  if (missingHashes.length > 0) {
    throw new Error(
      `Sanity verification is missing ${missingHashes.length} uploaded image asset(s).`,
    );
  }

  const mapping = {
    schemaVersion: 1,
    batchId: manifest.batchId,
    projectId,
    dataset,
    uploadedAt: new Date().toISOString(),
    productCount: records.length,
    uniqueAssetCount: verifiedByHash.size,
    uploadedAssetCount: uploadedAssets.length,
    reusedAssetCount: verifiedByHash.size - uploadedAssets.length,
    assets: records.map((record) => {
      const asset = verifiedByHash.get(record.sha1hash)!;
      return {
        number: record.product.number,
        productId: record.product.id,
        reference: record.product.reference,
        title: record.product.title,
        imagePath: record.product.imagePath,
        sha1hash: record.sha1hash,
        sanityAssetId: asset._id,
        sanityAssetUrl: asset.url,
      };
    }),
  };

  await writeFile(mappingPath, `${JSON.stringify(mapping, null, 2)}\n`, "utf8");
  console.log(
    `Upload verified: ${records.length} product images map to ${verifiedByHash.size} Sanity assets.`,
  );
  console.log(`Asset mapping: ${relative(projectRoot, mappingPath)}`);
  console.log("No product documents were created, changed, or published.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
