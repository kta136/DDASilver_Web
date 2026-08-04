#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { createInterface } from "node:readline";

import sharp from "sharp";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const defaultBackground = join(
  repoRoot,
  "public",
  "images",
  "product-backgrounds",
  "dda-silver-warm-ivory-watermark-1254.png",
);

function parseArgs(argv) {
  const options = {
    apply: false,
    overwriteImages: false,
    device: "auto",
    model: "u2net",
    concurrency: 4,
    alphaMatting: false,
    keepTemp: false,
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      positional.push(argument);
      continue;
    }

    const [rawKey, inlineValue] = argument.split(/=(.*)/s, 2);
    const key = rawKey.slice(2).toLowerCase();
    const readValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        throw new Error(`--${key} requires a value`);
      }
      index += 1;
      return next;
    };

    if (key === "apply") options.apply = true;
    else if (key === "overwrite-images") options.overwriteImages = true;
    else if (key === "alpha-matting") options.alphaMatting = true;
    else if (key === "keep-temp") options.keepTemp = true;
    else if (key === "catalog") options.catalog = readValue();
    else if (key === "output-dir") options.outputDir = readValue();
    else if (key === "background") options.background = readValue();
    else if (key === "device") options.device = readValue().toLowerCase();
    else if (key === "model") options.model = readValue();
    else if (key === "concurrency") options.concurrency = Number(readValue());
    else if (key === "help" || key === "h") options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }

  if (!["auto", "gpu", "cpu"].includes(options.device)) {
    throw new Error("--device must be auto, gpu, or cpu");
  }
  if (
    !Number.isInteger(options.concurrency) ||
    options.concurrency < 1 ||
    options.concurrency > 8
  ) {
    throw new Error("--concurrency must be an integer from 1 to 8");
  }

  return { options, sourceArgument: positional[0] };
}

function printHelp() {
  console.log(`
DDA Silver utensil gallery processor

Usage:
  npm run utensils:process -- -- "C:\\path\\to\\AI Enhanced Gallery" \\
    --catalog=scripts/images/utensil-batch-2026-08-02.json [options]

The command is a dry run unless --apply is supplied.

Options:
  --catalog=FILE          Required product identity and measurements
  --output-dir=DIR        Destination for gallery PNGs and manifests
  --background=FILE       Fixed 1254px DDA Silver gallery background
  --apply                 Write cutouts, gallery images, CSV, and manifest
  --overwrite-images      Rebuild existing gallery images
  --device=auto|gpu|cpu   rembg execution provider (default: auto)
  --model=NAME            rembg model (default: u2net)
  --concurrency=N         Sharp composite concurrency, 1-8 (default: 4)
  --alpha-matting         Enable slower rembg edge matting
  --keep-temp             Keep transparent intermediate cutouts
`);
}

function toAbsolute(value) {
  return isAbsolute(value) ? resolve(value) : resolve(repoRoot, value);
}

function pathForManifest(absolutePath) {
  const repoRelative = relative(repoRoot, absolutePath);
  if (
    repoRelative &&
    repoRelative !== ".." &&
    !repoRelative.startsWith(`..${sep}`) &&
    !isAbsolute(repoRelative)
  ) {
    return repoRelative.replaceAll("\\", "/");
  }
  return absolutePath.replaceAll("\\", "/");
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function dimensionText(product) {
  if (product.utensilType === "tumbler") {
    return `height of ${product.heightInches} in`;
  }
  return `diameter of ${product.diameterInches} in`;
}

function publicUtensilName(product) {
  return product.utensilType === "tumbler" ? "glass" : product.utensilType;
}

function validateCatalog(catalog) {
  if (!catalog || typeof catalog !== "object" || !Array.isArray(catalog.products)) {
    throw new Error("Catalog must contain a products array.");
  }
  if (catalog.products.length === 0) {
    throw new Error("Catalog products array is empty.");
  }

  const filenames = new Set();
  const titles = new Set();
  for (const [index, product] of catalog.products.entries()) {
    const label = `Product ${index + 1}`;
    if (!product.sourceFilename || !product.title || !product.design) {
      throw new Error(`${label} is missing sourceFilename, title, or design.`);
    }
    if (!["tumbler", "bowl"].includes(product.utensilType)) {
      throw new Error(`${label} has an invalid utensilType.`);
    }
    if (!Number.isFinite(product.weightGrams) || product.weightGrams <= 0) {
      throw new Error(`${label} has an invalid weightGrams.`);
    }
    const dimension =
      product.utensilType === "tumbler"
        ? product.heightInches
        : product.diameterInches;
    if (!Number.isFinite(dimension) || dimension <= 0) {
      throw new Error(`${label} is missing its applicable physical dimension.`);
    }
    if (filenames.has(product.sourceFilename) || titles.has(product.title)) {
      throw new Error(`${label} duplicates a source filename or title.`);
    }
    filenames.add(product.sourceFilename);
    titles.add(product.title);
  }
}

function hasNvidiaGpu() {
  const result = spawnSync(
    "nvidia-smi",
    ["--query-gpu=name", "--format=csv,noheader"],
    { encoding: "utf8", windowsHide: true },
  );
  return result.status === 0 && result.stdout.trim().length > 0;
}

function runProcess(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      process.stderr.write(chunk);
    });
    const lines = createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      try {
        const event = JSON.parse(line);
        if (event.event === "loading-model") {
          console.log(`Loading ${event.model} on ${event.device.toUpperCase()}...`);
        } else if (event.event === "model-ready") {
          console.log(`Reusable rembg session ready (${event.providers.join(", ")}).`);
        } else if (event.event === "processed") {
          console.log(`  [${event.index}/${event.total}] extracted ${basename(event.input)}`);
        } else if (event.event === "error") {
          console.error(`Background removal error: ${event.message}`);
        }
      } catch {
        console.log(line);
      }
    });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${command} exited with code ${code}: ${stderr.trim()}`));
    });
  });
}

async function runRembg({ tasksPath, model, device, alphaMatting }) {
  const workerPath = join(import.meta.dirname, "remove-idol-backgrounds.py");
  const devices =
    device === "auto" ? (hasNvidiaGpu() ? ["gpu", "cpu"] : ["cpu"]) : [device];
  let lastError;

  for (const selectedDevice of devices) {
    const requirements = join(
      import.meta.dirname,
      `requirements-idol-${selectedDevice}.txt`,
    );
    const args = [
      "run",
      "--python",
      "3.12",
      "--with-requirements",
      requirements,
      "python",
      workerPath,
      "--model",
      model,
      "--device",
      selectedDevice,
      "--tasks",
      tasksPath,
    ];
    if (alphaMatting) args.push("--alpha-matting");

    try {
      await runProcess("uv", args);
      return selectedDevice;
    } catch (error) {
      lastError = error;
      if (selectedDevice === "gpu" && devices.includes("cpu")) {
        console.warn("GPU removal failed; retrying the batch on CPU.");
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

async function mapWithConcurrency(items, concurrency, operation) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await operation(items[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

async function composeProduct({ transparentPath, backgroundPath, outputPath, type }) {
  const background = await sharp(backgroundPath).metadata();
  if (!background.width || !background.height) {
    throw new Error(`Unable to read background dimensions: ${backgroundPath}`);
  }

  const trimmed = await sharp(transparentPath)
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 3, margin: 3 })
    .png()
    .toBuffer();
  const maxWidth = Math.round(background.width * (type === "bowl" ? 0.68 : 0.58));
  const maxHeight = Math.round(background.height * (type === "bowl" ? 0.48 : 0.64));
  const { data: subject, info } = await sharp(trimmed)
    .modulate({ brightness: 1.015, saturation: 1 })
    .sharpen({ sigma: 0.4 })
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  const subjectBottom = Math.round(background.height * 0.86);
  const left = Math.round((background.width - info.width) / 2 - background.width * 0.015);
  const top = Math.max(Math.round(background.height * 0.12), subjectBottom - info.height);
  const shadowWidth = Math.max(90, Math.round(info.width * 0.62));
  const shadowHeight = Math.max(22, Math.round(background.height * 0.024));
  const shadow = Buffer.from(`
    <svg width="${shadowWidth}" height="${shadowHeight + 24}" xmlns="http://www.w3.org/2000/svg">
      <filter id="blur"><feGaussianBlur stdDeviation="9"/></filter>
      <ellipse cx="${shadowWidth / 2}" cy="${shadowHeight / 2 + 8}"
        rx="${shadowWidth / 2 - 12}" ry="${shadowHeight / 2}"
        fill="#6b5b47" fill-opacity="0.16" filter="url(#blur)"/>
    </svg>
  `);

  await mkdir(dirname(outputPath), { recursive: true });
  await sharp(backgroundPath)
    .composite([
      {
        input: shadow,
        left: Math.round((background.width - shadowWidth) / 2 - background.width * 0.015),
        top: Math.min(background.height - shadowHeight - 24, subjectBottom - 8),
      },
      { input: subject, left, top },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
}

function productRecord(product, index, outputDirectory) {
  const number = index + 1;
  const slug = product.slug ?? slugify(product.title);
  const outputFilename = `${String(number).padStart(2, "0")}-${slug}.png`;
  const measurement = dimensionText(product);
  return {
    number,
    id: `product-dda-utensil-${String(number).padStart(2, "0")}`,
    title: product.title,
    slug,
    shortDescription: `${product.design} ${publicUtensilName(product)} in confirmed 99.80% pure silver, with a supplied weight of ${product.weightGrams} g and ${measurement}.`,
    alt: `${product.title} centered on the warm ivory DDA Silver gallery background`,
    utensilType: product.utensilType,
    purity: "99.80",
    weightGrams: product.weightGrams,
    ...(product.heightInches ? { heightInches: product.heightInches } : {}),
    ...(product.widthInches ? { widthInches: product.widthInches } : {}),
    ...(product.diameterInches ? { diameterInches: product.diameterInches } : {}),
    sourceFilename: product.sourceFilename,
    outputFilename,
    imagePath: pathForManifest(join(outputDirectory, outputFilename)),
  };
}

async function main() {
  const { options, sourceArgument } = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  if (!sourceArgument || !options.catalog || !options.outputDir) {
    printHelp();
    throw new Error("Source folder, --catalog, and --output-dir are required.");
  }

  const sourceDirectory = toAbsolute(sourceArgument);
  const catalogPath = toAbsolute(options.catalog);
  const outputDirectory = toAbsolute(options.outputDir);
  const backgroundPath = toAbsolute(options.background ?? defaultBackground);
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  validateCatalog(catalog);
  const products = catalog.products.map((product, index) =>
    productRecord(product, index, outputDirectory),
  );

  console.log(`Source: ${sourceDirectory}`);
  console.log(`Products: ${products.length}`);
  console.log(`Background: ${backgroundPath}`);
  console.log(`Output: ${outputDirectory}`);
  if (!options.apply) {
    console.log("Dry run complete. Add --apply to extract and composite the batch.");
    return;
  }

  await mkdir(outputDirectory, { recursive: true });
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "dda-utensils-"));
  const tasks = products.map((product) => ({
    input: join(sourceDirectory, product.sourceFilename),
    output: join(temporaryDirectory, `${product.number}.png`),
  }));
  const tasksPath = join(temporaryDirectory, "tasks.json");
  await writeFile(tasksPath, JSON.stringify(tasks, null, 2));

  try {
    const selectedDevice = await runRembg({
      tasksPath,
      model: options.model,
      device: options.device,
      alphaMatting: options.alphaMatting,
    });
    await mapWithConcurrency(products, options.concurrency, async (product) => {
      const outputPath = join(outputDirectory, product.outputFilename);
      await composeProduct({
        transparentPath: join(temporaryDirectory, `${product.number}.png`),
        backgroundPath,
        outputPath,
        type: product.utensilType,
      });
      console.log(`  composed ${product.outputFilename}`);
    });

    const manifest = {
      schemaVersion: 1,
      batchId: catalog.batchId,
      categoryId: "category-utensils",
      generatedAt: new Date().toISOString(),
      backgroundPath: pathForManifest(backgroundPath),
      processing: {
        source: "AI-enhanced product image",
        backgroundRemoval: "rembg",
        model: options.model,
        device: selectedDevice,
        compositor: "sharp",
      },
      readyForSanityAssetUpload: true,
      readyForProductPublish: true,
      publishBlockers: [],
      products: products.map(({ sourceFilename, outputFilename, ...product }) => {
        void sourceFilename;
        void outputFilename;
        return product;
      }),
    };
    await writeFile(
      join(outputDirectory, "sanity-utensil-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    const headers = [
      "number",
      "id",
      "title",
      "slug",
      "utensilType",
      "purity",
      "weightGrams",
      "heightInches",
      "widthInches",
      "diameterInches",
      "shortDescription",
      "alt",
      "imagePath",
    ];
    const csv = [
      headers.map(csvCell).join(","),
      ...products.map((product) =>
        headers.map((header) => csvCell(product[header])).join(","),
      ),
    ].join("\r\n");
    await writeFile(join(outputDirectory, "sanity-utensil-review.csv"), `${csv}\r\n`);
    console.log(`Completed ${products.length} gallery images and Sanity records.`);
  } finally {
    if (!options.keepTemp) await rm(temporaryDirectory, { recursive: true, force: true });
    else console.log(`Transparent cutouts kept at ${temporaryDirectory}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
