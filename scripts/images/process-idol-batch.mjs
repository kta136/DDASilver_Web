#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { createInterface } from "node:readline";

import sharp from "sharp";
import { createWorker, PSM } from "tesseract.js";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const defaultBackground = join(
  repoRoot,
  "public",
  "images",
  "product-backgrounds",
  "dda-silver-warm-ivory-watermark-1254.png",
);
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function printHelp() {
  console.log(`
DDA Silver idol batch processor

Usage:
  npm run idols:process -- -- "C:\\path\\to\\photos" [options]
  npm run idols:setup -- -- [--device=gpu|cpu] [--model=u2net]

The command is a dry run unless --apply is supplied.

Options:
  --catalog=FILE          Product identities/deities and optional measurement overrides
  --output-dir=DIR        Defaults to public/images/silver-idols/batch-<folder>
  --background=FILE       Reusable 1254px DDA Silver background template
  --apply                 Write processed images, CSV, and the Sanity manifest
  --upload                Upload the generated manifest after processing (requires --apply)
  --overwrite-images      Rebuild existing output images
  --device=auto|gpu|cpu   Background-removal execution provider (default: auto)
  --model=NAME            rembg model name (default: u2net)
  --concurrency=N         Sharp/composite concurrency, 1-8 (default: 4)
  --start-number=N        First product number when the catalog omits numbers
  --limit=N               Process only the first N inputs (useful for testing)
  --skip-ocr              Require measurements in the catalog
  --alpha-matting         Slower, more detailed edge matting in rembg
  --keep-temp             Preserve temporary transparent cutouts for inspection
  --prepare               Install/cache rembg and warm the selected model
  --help                  Show this help

Catalog shape:
  {
    "batchId": "new-designs-2026-08-01",
    "startingNumber": 34,
    "products": [{
      "sourceFilename": "photo 1.jpeg",
      "codeFamily": "GN",
      "title": "Ganesha Silver Idol",
      "slug": "ganesha-silver-idol",
      "description": "A hollow 99.80% pure silver Ganesha idol.",
      "alt": "Ganesha silver idol on a warm ivory DDA Silver background",
      "deityIds": ["deity-ganesha"],
      "weightGrams": 20,
      "heightInches": 2.5
    }]
  }
`);
}

function parseArgs(argv) {
  const options = {
    apply: false,
    upload: false,
    overwriteImages: false,
    device: "auto",
    model: "u2net",
    concurrency: 4,
    startNumber: 1,
    skipOcr: false,
    alphaMatting: false,
    keepTemp: false,
    prepare: false,
    help: false,
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      positional.push(argument);
      continue;
    }

    const equalsIndex = argument.indexOf("=");
    const key = (equalsIndex === -1 ? argument : argument.slice(0, equalsIndex))
      .slice(2)
      .toLowerCase();
    let value = equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1);

    const takeValue = () => {
      if (value !== undefined) {
        return value;
      }
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        throw new Error(`--${key} requires a value`);
      }
      index += 1;
      return next;
    };

    switch (key) {
      case "apply":
        options.apply = true;
        break;
      case "upload":
        options.upload = true;
        break;
      case "overwrite-images":
        options.overwriteImages = true;
        break;
      case "catalog":
        options.catalog = takeValue();
        break;
      case "output-dir":
        options.outputDir = takeValue();
        break;
      case "background":
        options.background = takeValue();
        break;
      case "device":
        options.device = takeValue().toLowerCase();
        break;
      case "model":
        options.model = takeValue();
        break;
      case "concurrency":
        options.concurrency = Number(takeValue());
        break;
      case "start-number":
        options.startNumber = Number(takeValue());
        break;
      case "limit":
        options.limit = Number(takeValue());
        break;
      case "skip-ocr":
        options.skipOcr = true;
        break;
      case "alpha-matting":
        options.alphaMatting = true;
        break;
      case "keep-temp":
        options.keepTemp = true;
        break;
      case "prepare":
        options.prepare = true;
        break;
      case "help":
      case "h":
        options.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${argument}`);
    }
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
  if (!Number.isInteger(options.startNumber) || options.startNumber < 1) {
    throw new Error("--start-number must be a positive integer");
  }
  if (
    options.limit !== undefined &&
    (!Number.isInteger(options.limit) || options.limit < 1)
  ) {
    throw new Error("--limit must be a positive integer");
  }
  if (options.upload && !options.apply) {
    throw new Error("--upload requires --apply");
  }

  return { options, sourceArgument: positional[0] };
}

function toAbsolute(pathValue) {
  return isAbsolute(pathValue) ? resolve(pathValue) : resolve(repoRoot, pathValue);
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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
  const stringValue = value === undefined || value === null ? "" : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

async function pathExists(pathValue) {
  try {
    await access(pathValue);
    return true;
  } catch {
    return false;
  }
}

function getWhatsAppTimestamp(filename) {
  const match = filename.match(
    /WhatsApp Image (\d{4})-(\d{2})-(\d{2}) at (\d{1,2})\.(\d{2})\.(\d{2}) (AM|PM)/i,
  );
  if (!match) {
    return undefined;
  }

  const [, year, month, day, hourText, minute, second, meridiem] = match;
  let hour = Number(hourText) % 12;
  if (meridiem.toUpperCase() === "PM") {
    hour += 12;
  }

  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    hour,
    Number(minute),
    Number(second),
  );
}

async function listSourceImages(sourceDirectory, limit) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  const images = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        supportedExtensions.has(extname(entry.name).toLowerCase()),
    )
    .map((entry) => ({
      filename: entry.name,
      path: join(sourceDirectory, entry.name),
    }))
    .toSorted((first, second) => {
      const firstTimestamp = getWhatsAppTimestamp(first.filename);
      const secondTimestamp = getWhatsAppTimestamp(second.filename);
      if (
        firstTimestamp !== undefined &&
        secondTimestamp !== undefined &&
        firstTimestamp !== secondTimestamp
      ) {
        return firstTimestamp - secondTimestamp;
      }

      return first.filename.localeCompare(second.filename, "en-IN", {
        numeric: true,
        sensitivity: "base",
      });
    });

  return limit ? images.slice(0, limit) : images;
}

async function loadCatalog(catalogPath) {
  if (!catalogPath) {
    return { products: [], startingNumber: undefined };
  }

  const absolutePath = toAbsolute(catalogPath);
  const payload = JSON.parse(await readFile(absolutePath, "utf8"));
  if (!payload || !Array.isArray(payload.products)) {
    throw new Error(`Catalog must contain a products array: ${absolutePath}`);
  }

  const productsBySource = new Map();
  for (const product of payload.products) {
    if (!product || typeof product.sourceFilename !== "string") {
      throw new Error("Every catalog product requires sourceFilename");
    }
    const key = product.sourceFilename.toLocaleLowerCase("en-IN");
    if (productsBySource.has(key)) {
      throw new Error(`Duplicate catalog sourceFilename: ${product.sourceFilename}`);
    }
    productsBySource.set(key, product);
  }

  return {
    ...payload,
    absolutePath,
    productsBySource,
  };
}

function parseDecimal(value) {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const result = Number(normalized);
  return Number.isFinite(result) && result > 0 ? result : undefined;
}

function parseMeasurements(text) {
  const normalized = text
    .replace(/[|]/g, "I")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  const weightPatterns = [
    /(?:weight|wt|wgt)\s*[:=-]?\s*(\d+(?:[.,]\d+)?)\s*(?:g(?:m|ms)?|grams?)\b/i,
    /\b(\d+(?:[.,]\d+)?)\s*(?:g(?:m|ms)?|grams?)\b/i,
  ];
  const heightPatterns = [
    /(?:height|ht|hgt)\s*[:=-]?\s*(\d+(?:[.,]\d+)?)\s*(?:in(?:ch(?:es)?)?|["”])/i,
    /\b(\d+(?:[.,]\d+)?)\s*(?:in(?:ch(?:es)?)?|["”])/i,
  ];

  const findValue = (patterns) => {
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      const value = match ? parseDecimal(match[1]) : undefined;
      if (value !== undefined) {
        return value;
      }
    }
    return undefined;
  };

  return {
    weightGrams: findValue(weightPatterns),
    heightInches: findValue(heightPatterns),
    normalizedText: normalized,
  };
}

async function buildOcrInputs(imagePath) {
  const { data: oriented, info } = await sharp(imagePath)
    .autoOrient()
    .png()
    .toBuffer({ resolveWithObject: true });
  const makeCrop = ({ left, top, width, height, threshold, resizeWidth }) =>
    sharp(oriented)
      .extract({ left, top, width, height })
      .resize({
        width: resizeWidth,
        fit: "inside",
        withoutEnlargement: false,
      })
      .greyscale()
      .normalize()
      .sharpen({ sigma: 0.8 })
      .threshold(threshold)
      .extend({
        top: 24,
        bottom: 24,
        left: 24,
        right: 24,
        background: "white",
      })
      .png()
      .toBuffer();
  const fullTop = Math.max(0, Math.floor(info.height * 0.44));
  const sideTop = Math.max(0, Math.floor(info.height * 0.62));
  const sideWidth = Math.ceil(info.width * 0.62);

  return Promise.all([
    makeCrop({
      left: 0,
      top: fullTop,
      width: info.width,
      height: info.height - fullTop,
      threshold: 155,
      resizeWidth: 1500,
    }),
    makeCrop({
      left: info.width - sideWidth,
      top: sideTop,
      width: sideWidth,
      height: info.height - sideTop,
      threshold: 175,
      resizeWidth: 1200,
    }),
    makeCrop({
      left: 0,
      top: sideTop,
      width: sideWidth,
      height: info.height - sideTop,
      threshold: 175,
      resizeWidth: 1200,
    }),
  ]);
}

async function recognizeMeasurements(images, catalog, skipOcr) {
  if (skipOcr) {
    return images.map((image) => {
      const product = catalog.productsBySource?.get(
        image.filename.toLocaleLowerCase("en-IN"),
      );
      return {
        ...image,
        catalogProduct: product,
        weightGrams: product?.weightGrams,
        heightInches: product?.heightInches,
        measurementSource:
          product?.weightGrams && product?.heightInches ? "catalog" : "missing",
        ocrText: "",
        ocrConfidence: undefined,
      };
    });
  }

  console.log(`\nOCR: loading one reusable English worker for ${images.length} images...`);
  const ocrCachePath = join(repoRoot, "tmp", "tesseract-cache");
  await mkdir(ocrCachePath, { recursive: true });
  const worker = await createWorker("eng", 1, {
    cachePath: ocrCachePath,
  });
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
    preserve_interword_spaces: "1",
  });

  const results = [];
  try {
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const product = catalog.productsBySource?.get(
        image.filename.toLocaleLowerCase("en-IN"),
      );
      const ocrInputs = await buildOcrInputs(image.path);
      const recognitions = [await worker.recognize(ocrInputs[0])];
      let parsed = parseMeasurements(recognitions[0].data.text);

      for (
        let cropIndex = 1;
        cropIndex < ocrInputs.length &&
        (!parsed.weightGrams || !parsed.heightInches);
        cropIndex += 1
      ) {
        const fallback = await worker.recognize(ocrInputs[cropIndex]);
        recognitions.push(fallback);
        const fallbackParsed = parseMeasurements(fallback.data.text);
        parsed = {
          weightGrams: parsed.weightGrams ?? fallbackParsed.weightGrams,
          heightInches: parsed.heightInches ?? fallbackParsed.heightInches,
          normalizedText: [parsed.normalizedText, fallbackParsed.normalizedText]
            .filter(Boolean)
            .join(" | "),
        };
      }
      const catalogHasMeasurements =
        Number.isFinite(product?.weightGrams) &&
        Number.isFinite(product?.heightInches);
      const ocrConfidence = Math.max(
        ...recognitions.map((recognition) => recognition.data.confidence ?? 0),
      );

      results.push({
        ...image,
        catalogProduct: product,
        weightGrams: product?.weightGrams ?? parsed.weightGrams,
        heightInches: product?.heightInches ?? parsed.heightInches,
        measurementSource: catalogHasMeasurements
          ? "catalog"
          : parsed.weightGrams && parsed.heightInches
            ? "ocr"
            : "review",
        ocrWeightGrams: parsed.weightGrams,
        ocrHeightInches: parsed.heightInches,
        ocrText: parsed.normalizedText,
        ocrConfidence,
      });

      const weight = product?.weightGrams ?? parsed.weightGrams ?? "?";
      const height = product?.heightInches ?? parsed.heightInches ?? "?";
      console.log(
        `  [${index + 1}/${images.length}] ${image.filename}: ${weight} g, ${height} in`,
      );
    }
  } finally {
    await worker.terminate();
  }

  return results;
}

function buildProductRecord(item, index, startingNumber, outputDirectory) {
  const sourceStem = basename(item.filename, extname(item.filename));
  const catalogProduct = item.catalogProduct ?? {};
  const number = catalogProduct.number ?? startingNumber + index;
  const fallbackSlug = slugify(sourceStem) || `idol-${number}`;
  const slug = catalogProduct.slug || fallbackSlug;
  const title = catalogProduct.title || `REVIEW REQUIRED — ${sourceStem}`;
  const outputFilename =
    catalogProduct.outputFilename ||
    `idol-${String(number).padStart(2, "0")}-${slug}.png`;
  const description =
    catalogProduct.description ||
    `REVIEW REQUIRED: identify the idol in ${item.filename}.`;
  const alt =
    catalogProduct.alt ||
    `${title.replace(/^REVIEW REQUIRED — /, "")} on a warm ivory DDA Silver background`;
  const deityIds = Array.isArray(catalogProduct.deityIds)
    ? catalogProduct.deityIds
    : [];
  const reviewReasons = [];

  if (!item.weightGrams) {
    reviewReasons.push("weight missing");
  }
  if (!item.heightInches) {
    reviewReasons.push("height missing");
  }
  if (!catalogProduct.title) {
    reviewReasons.push("product identity missing");
  }
  if (!/^[A-Z]{2}$/.test(catalogProduct.codeFamily ?? "")) {
    reviewReasons.push("two-letter code family missing");
  }
  if (catalogProduct.codeStatus === "provisional") {
    reviewReasons.push("item code family pending approval");
  }
  if (deityIds.length === 0) {
    reviewReasons.push("deity IDs missing");
  }

  const outputPath = join(outputDirectory, outputFilename);
  return {
    number,
    id:
      catalogProduct.id ??
      `product-dda-idol-${String(number).padStart(2, "0")}-${slug}`,
    codeFamily: catalogProduct.codeFamily || "XX",
    ...(catalogProduct.assignedItemCode
      ? { assignedItemCode: catalogProduct.assignedItemCode }
      : {}),
    title,
    slug,
    description,
    alt,
    weightGrams: item.weightGrams,
    heightInches: item.heightInches,
    deityIds,
    imagePath: pathForManifest(outputPath),
    sourceFilename: item.filename,
    outputFilename,
    outputPath,
    backgroundModel:
      typeof catalogProduct.backgroundModel === "string" &&
      catalogProduct.backgroundModel.trim()
        ? catalogProduct.backgroundModel.trim()
        : undefined,
    measurementSource: item.measurementSource,
    ocr: {
      confidence: item.ocrConfidence,
      text: item.ocrText,
      weightGrams: item.ocrWeightGrams,
      heightInches: item.ocrHeightInches,
    },
    readyForUpload: reviewReasons.length === 0,
    reviewReasons,
  };
}

function findComponents(alpha, width, height) {
  const labels = new Int32Array(width * height);
  const queue = new Int32Array(width * height);
  const components = [];
  let nextLabel = 0;

  for (let position = 0; position < alpha.length; position += 1) {
    if (alpha[position] < 32 || labels[position] !== 0) {
      continue;
    }

    nextLabel += 1;
    let head = 0;
    let tail = 0;
    queue[tail++] = position;
    labels[position] = nextLabel;
    let area = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let sumX = 0;
    let sumY = 0;

    while (head < tail) {
      const current = queue[head++];
      const y = Math.floor(current / width);
      const x = current - y * width;
      area += 1;
      sumX += x;
      sumY += y;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
        const neighborY = y + yOffset;
        if (neighborY < 0 || neighborY >= height) {
          continue;
        }
        for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
          if (xOffset === 0 && yOffset === 0) {
            continue;
          }
          const neighborX = x + xOffset;
          if (neighborX < 0 || neighborX >= width) {
            continue;
          }
          const neighbor = neighborY * width + neighborX;
          if (alpha[neighbor] >= 32 && labels[neighbor] === 0) {
            labels[neighbor] = nextLabel;
            queue[tail++] = neighbor;
          }
        }
      }
    }

    components.push({
      label: nextLabel,
      area,
      minX,
      minY,
      maxX,
      maxY,
      centerX: sumX / area,
      centerY: sumY / area,
    });
  }

  return { labels, components };
}

function componentDistance(first, second) {
  const horizontal = Math.max(
    0,
    Math.max(first.minX, second.minX) - Math.min(first.maxX, second.maxX),
  );
  const vertical = Math.max(
    0,
    Math.max(first.minY, second.minY) - Math.min(first.maxY, second.maxY),
  );
  return Math.hypot(horizontal, vertical);
}

function isLikelyMeasurementLabel(component, width, height) {
  const boxWidth = component.maxX - component.minX + 1;
  const boxHeight = component.maxY - component.minY + 1;
  const fillRatio = component.area / (boxWidth * boxHeight);
  const side = component.centerX < width * 0.4 || component.centerX > width * 0.6;
  const nearVerticalEdge =
    component.minY < height * 0.28 ||
    component.minY > height * 0.54 ||
    component.centerY > height * 0.72;

  return (
    side &&
    nearVerticalEdge &&
    boxWidth / boxHeight > 1.2 &&
    fillRatio > 0.28 &&
    component.area > width * height * 0.003
  );
}

function erodeAlphaEdge(data, width, height, channels, passes = 3) {
  let source = Buffer.alloc(width * height);
  let target = Buffer.alloc(width * height);

  for (let pixel = 0; pixel < source.length; pixel += 1) {
    source[pixel] = data[pixel * channels + 3];
  }

  for (let pass = 0; pass < passes; pass += 1) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let minimum = 255;

        for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
          const neighborY = y + yOffset;
          if (neighborY < 0 || neighborY >= height) {
            minimum = 0;
            break;
          }
          for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
            const neighborX = x + xOffset;
            if (neighborX < 0 || neighborX >= width) {
              minimum = 0;
              break;
            }
            minimum = Math.min(
              minimum,
              source[neighborY * width + neighborX],
            );
          }
        }

        target[y * width + x] = minimum;
      }
    }
    [source, target] = [target, source];
  }

  for (let pixel = 0; pixel < source.length; pixel += 1) {
    data[pixel * channels + 3] = source[pixel];
  }
}

function fadeCutoutBelowRatio(data, width, height, channels, cutoffRatio) {
  if (cutoffRatio === undefined) {
    return;
  }
  if (
    !Number.isFinite(cutoffRatio) ||
    cutoffRatio < 0.5 ||
    cutoffRatio > 1
  ) {
    throw new Error(
      `cutoutBottomRatio must be between 0.5 and 1; received ${cutoffRatio}`,
    );
  }

  const fadeStart = Math.min(height - 1, Math.round(height * cutoffRatio));
  const fadeHeight = Math.min(8, height - fadeStart);
  for (let y = fadeStart; y < height; y += 1) {
    const opacity = Math.max(0, 1 - (y - fadeStart) / fadeHeight);
    for (let x = 0; x < width; x += 1) {
      const alphaIndex = (y * width + x) * channels + 3;
      data[alphaIndex] = Math.round(data[alphaIndex] * opacity);
    }
  }
}

async function cleanTransparentCutout(inputPath, cutoutBottomRatio) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  fadeCutoutBelowRatio(
    data,
    info.width,
    info.height,
    info.channels,
    cutoutBottomRatio,
  );
  const fullAlpha = Buffer.alloc(info.width * info.height);

  for (let pixel = 0; pixel < fullAlpha.length; pixel += 1) {
    fullAlpha[pixel] = data[pixel * info.channels + 3];
  }

  const sampleScale = Math.min(1, 720 / Math.max(info.width, info.height));
  const sampleWidth = Math.max(1, Math.round(info.width * sampleScale));
  const sampleHeight = Math.max(1, Math.round(info.height * sampleScale));
  const sampleAlpha = await sharp(fullAlpha, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .resize({
      width: sampleWidth,
      height: sampleHeight,
      fit: "fill",
      kernel: sharp.kernel.nearest,
    })
    .greyscale()
    .raw()
    .toBuffer();
  const { labels, components } = findComponents(
    sampleAlpha,
    sampleWidth,
    sampleHeight,
  );
  const subjectCandidates = components
    .filter(
      (component) =>
        !isLikelyMeasurementLabel(component, sampleWidth, sampleHeight),
    )
    .toSorted((first, second) => second.area - first.area);

  if (subjectCandidates.length === 0) {
    throw new Error(`No foreground subject was found in ${inputPath}`);
  }

  const main = subjectCandidates[0];
  const proximity = Math.max(sampleWidth, sampleHeight) * 0.13;
  const keepLabels = new Set(
    subjectCandidates
      .filter((component) => {
        const significant = component.area >= main.area * 0.025;
        const verticalOverlap = Math.max(
          0,
          Math.min(main.maxY, component.maxY) -
            Math.max(main.minY, component.minY) +
            1,
        );
        const verticallyAligned =
          verticalOverlap >=
            Math.min(
              main.maxY - main.minY + 1,
              component.maxY - component.minY + 1,
            ) *
              0.15 ||
          Math.abs(component.centerY - main.centerY) <= sampleHeight * 0.15;
        return (
          component.label === main.label ||
          (significant &&
            (verticallyAligned ||
              componentDistance(main, component) <= proximity))
        );
      })
      .map((component) => component.label),
  );
  const keepMask = new Uint8Array(sampleWidth * sampleHeight);

  for (let position = 0; position < labels.length; position += 1) {
    if (!keepLabels.has(labels[position])) {
      continue;
    }
    const y = Math.floor(position / sampleWidth);
    const x = position - y * sampleWidth;
    for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
      const neighborY = y + yOffset;
      if (neighborY < 0 || neighborY >= sampleHeight) {
        continue;
      }
      for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
        const neighborX = x + xOffset;
        if (neighborX >= 0 && neighborX < sampleWidth) {
          keepMask[neighborY * sampleWidth + neighborX] = 1;
        }
      }
    }
  }

  for (let y = 0; y < info.height; y += 1) {
    const sampleY = Math.min(
      sampleHeight - 1,
      Math.floor((y * sampleHeight) / info.height),
    );
    for (let x = 0; x < info.width; x += 1) {
      const sampleX = Math.min(
        sampleWidth - 1,
        Math.floor((x * sampleWidth) / info.width),
      );
      if (!keepMask[sampleY * sampleWidth + sampleX]) {
        data[(y * info.width + x) * info.channels + 3] = 0;
      }
    }
  }

  // Source photos use a black backdrop. Pulling the matte inward by three
  // source pixels removes contaminated boundary pixels while retaining the
  // original soft alpha transition and fine silver detail.
  erodeAlphaEdge(data, info.width, info.height, info.channels, 3);

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .trim({
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      threshold: 2,
      margin: 3,
    })
    .toBuffer();
}

async function composeProduct({
  transparentPath,
  backgroundPath,
  outputPath,
  subjectScale = 1,
  cutoutBottomRatio,
}) {
  const backgroundMetadata = await sharp(backgroundPath).metadata();
  const canvasWidth = backgroundMetadata.width;
  const canvasHeight = backgroundMetadata.height;
  if (!canvasWidth || !canvasHeight) {
    throw new Error(`Could not read background dimensions: ${backgroundPath}`);
  }

  const cleaned = await cleanTransparentCutout(
    transparentPath,
    cutoutBottomRatio,
  );
  const maxWidth = Math.round(canvasWidth * 0.68 * subjectScale);
  const maxHeight = Math.round(canvasHeight * 0.61 * subjectScale);
  const { data: subject, info } = await sharp(cleaned)
    .modulate({ brightness: 1.025, saturation: 1.01 })
    .sharpen({ sigma: 0.45 })
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer({ resolveWithObject: true });
  const left = Math.round((canvasWidth - info.width) / 2 - canvasWidth * 0.015);
  const subjectBottom = Math.round(canvasHeight * 0.89);
  const top = Math.max(
    Math.round(canvasHeight * 0.12),
    subjectBottom - info.height,
  );
  const shadowWidth = Math.max(80, Math.round(info.width * 0.62));
  const shadowHeight = Math.max(22, Math.round(canvasHeight * 0.024));
  const shadow = Buffer.from(`
    <svg width="${shadowWidth}" height="${shadowHeight + 24}" xmlns="http://www.w3.org/2000/svg">
      <filter id="blur"><feGaussianBlur stdDeviation="9"/></filter>
      <ellipse cx="${shadowWidth / 2}" cy="${shadowHeight / 2 + 8}"
        rx="${shadowWidth / 2 - 12}" ry="${shadowHeight / 2}"
        fill="#6b5b47" fill-opacity="0.18" filter="url(#blur)"/>
    </svg>
  `);

  await mkdir(dirname(outputPath), { recursive: true });
  await sharp(backgroundPath)
    .composite([
      {
        input: shadow,
        left: Math.round((canvasWidth - shadowWidth) / 2 - canvasWidth * 0.015),
        top: Math.min(canvasHeight - shadowHeight - 24, subjectBottom - 8),
      },
      { input: subject, left, top },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);

  const outputMetadata = await sharp(outputPath).metadata();
  if (
    outputMetadata.width !== canvasWidth ||
    outputMetadata.height !== canvasHeight
  ) {
    throw new Error(`Output dimensions are invalid: ${outputPath}`);
  }
}

async function mapWithConcurrency(items, concurrency, operation) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await operation(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

function hasNvidiaGpu() {
  const result = spawnSync("nvidia-smi", ["--query-gpu=name", "--format=csv,noheader"], {
    encoding: "utf8",
    windowsHide: true,
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}

function runProcess(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    const lines = createInterface({ input: child.stdout });
    lines.on("line", (line) => {
      try {
        const event = JSON.parse(line);
        if (event.event === "loading-model") {
          console.log(
            `Background removal: loading ${event.model} on ${event.device.toUpperCase()}...`,
          );
        } else if (event.event === "model-ready") {
          console.log(
            `Background removal: reusable model session is ready (${(event.providers ?? []).join(", ")}).`,
          );
        } else if (event.event === "processed") {
          console.log(
            `  [${event.index}/${event.total}] cutout ${basename(event.input)}`,
          );
        } else if (event.event === "error") {
          console.error(`Background removal error: ${event.message}`);
        } else {
          console.log(line);
        }
      } catch {
        console.log(line);
      }
    });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(
          new Error(
            `${command} exited with code ${code}${stderr ? `: ${stderr.trim()}` : ""}`,
          ),
        );
      }
    });
  });
}

async function runRembg({ tasksPath, model, device, alphaMatting, warmup }) {
  const workerPath = join(import.meta.dirname, "remove-idol-backgrounds.py");
  const devices =
    device === "auto" ? (hasNvidiaGpu() ? ["gpu", "cpu"] : ["cpu"]) : [device];
  let lastError;

  for (const selectedDevice of devices) {
    const requirements = join(
      import.meta.dirname,
      `requirements-idol-${selectedDevice}.txt`,
    );
    const workerArgs = [
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
    ];
    if (warmup) {
      workerArgs.push("--warmup");
    } else {
      workerArgs.push("--tasks", tasksPath);
    }
    if (alphaMatting) {
      workerArgs.push("--alpha-matting");
    }

    try {
      await runProcess("uv", workerArgs);
      return selectedDevice;
    } catch (error) {
      lastError = error;
      if (selectedDevice === "gpu" && devices.includes("cpu")) {
        console.warn(
          "\nGPU background removal failed; retrying this batch on CPU.",
        );
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

async function writeBatchFiles({
  outputDirectory,
  sourceDirectory,
  backgroundPath,
  catalog,
  productRecords,
  options,
  selectedDevice,
}) {
  const manifestPath = join(outputDirectory, "sanity-idol-manifest.json");
  const csvPath = join(outputDirectory, "product-measurements.csv");
  const draftCatalogPath = join(
    outputDirectory,
    "idol-batch-catalog.draft.json",
  );
  const generatedAt = new Date().toISOString();
  const uploadProducts = productRecords.map((product) => ({
    number: product.number,
    id: product.id,
    codeFamily: product.codeFamily,
    ...(product.assignedItemCode
      ? { assignedItemCode: product.assignedItemCode }
      : {}),
    title: product.title,
    slug: product.slug,
    description: product.description,
    alt: product.alt,
    weightGrams: product.weightGrams,
    heightInches: product.heightInches,
    deityIds: product.deityIds,
    imagePath: product.imagePath,
  }));
  const manifest = {
    schemaVersion: 1,
    batchId:
      catalog.batchId ??
      `batch-${slugify(basename(sourceDirectory)) || "idol-photos"}`,
    generatedAt,
    sourceDirectory,
    categoryId: "category-idols",
    purity: "99.80",
    idolConstruction: "hollow",
    processing: {
      backgroundPath: pathForManifest(backgroundPath),
      model: options.model,
      modelOverrides: productRecords
        .filter((product) => product.backgroundModel)
        .map((product) => ({
          sourceFilename: product.sourceFilename,
          model: product.backgroundModel,
        })),
      device: selectedDevice,
      concurrency: options.concurrency,
      alphaMatting: options.alphaMatting,
    },
    readyForUpload: productRecords.every((product) => product.readyForUpload),
    review: productRecords.map((product) => ({
      sourceFilename: product.sourceFilename,
      outputFilename: product.outputFilename,
      measurementSource: product.measurementSource,
      ocr: product.ocr,
      readyForUpload: product.readyForUpload,
      reviewReasons: product.reviewReasons,
    })),
    products: uploadProducts,
  };
  const csvRows = [
    [
      "source_filename",
      "output_filename",
      "item_title",
      "weight_grams",
      "height_inches",
      "measurement_source",
      "ocr_confidence",
      "ready_for_upload",
      "review_reasons",
    ],
    ...productRecords.map((product) => [
      product.sourceFilename,
      product.outputFilename,
      product.title,
      product.weightGrams,
      product.heightInches,
      product.measurementSource,
      product.ocr.confidence,
      product.readyForUpload,
      product.reviewReasons.join("; "),
    ]),
  ];

  await Promise.all([
    writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
    writeFile(
      csvPath,
      `${csvRows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`,
      "utf8",
    ),
  ]);

  let wroteDraftCatalog = false;
  if (!catalog.absolutePath && !(await pathExists(draftCatalogPath))) {
    const draftCatalog = {
      batchId: manifest.batchId,
      startingNumber: productRecords[0]?.number ?? 1,
      products: productRecords.map((product) => ({
        sourceFilename: product.sourceFilename,
        number: product.number,
        outputFilename: product.outputFilename,
        codeFamily: product.codeFamily === "XX" ? "" : product.codeFamily,
        title: product.title.startsWith("REVIEW REQUIRED") ? "" : product.title,
        slug: product.title.startsWith("REVIEW REQUIRED") ? "" : product.slug,
        description: product.description.startsWith("REVIEW REQUIRED")
          ? ""
          : product.description,
        alt: product.title.startsWith("REVIEW REQUIRED") ? "" : product.alt,
        deityIds: product.deityIds,
        weightGrams: product.weightGrams,
        heightInches: product.heightInches,
        ...(product.backgroundModel
          ? { backgroundModel: product.backgroundModel }
          : {}),
      })),
    };
    await writeFile(
      draftCatalogPath,
      `${JSON.stringify(draftCatalog, null, 2)}\n`,
      "utf8",
    );
    wroteDraftCatalog = true;
  }

  return {
    manifestPath,
    csvPath,
    draftCatalogPath,
    wroteDraftCatalog,
    manifest,
  };
}

async function uploadManifest(manifestPath) {
  console.log("\nUploading the validated manifest to Sanity...");
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(
      process.execPath,
      [
        join(repoRoot, "scripts", "sanity", "run-idol-upload.mjs"),
        `--manifest=${manifestPath}`,
        "--apply",
      ],
      {
        cwd: repoRoot,
        stdio: "inherit",
        windowsHide: true,
      },
    );
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Sanity uploader exited with code ${code}`));
      }
    });
  });
}

async function main() {
  const { options, sourceArgument } = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  if (options.prepare) {
    const selectedDevice = await runRembg({
      model: options.model,
      device: options.device,
      alphaMatting: false,
      warmup: true,
    });
    console.log(
      `\nIdol pipeline is ready (${options.model}, ${selectedDevice.toUpperCase()}).`,
    );
    return;
  }
  if (!sourceArgument) {
    printHelp();
    throw new Error("A source photo directory is required");
  }

  const sourceDirectory = toAbsolute(sourceArgument);
  const sourceStats = await stat(sourceDirectory);
  if (!sourceStats.isDirectory()) {
    throw new Error(`Source is not a directory: ${sourceDirectory}`);
  }
  const catalog = await loadCatalog(options.catalog);
  const batchSlug =
    catalog.batchId ?? `batch-${slugify(basename(sourceDirectory)) || "idol-photos"}`;
  const outputDirectory = toAbsolute(
    options.outputDir ??
      join("public", "images", "silver-idols", batchSlug),
  );
  const backgroundPath = toAbsolute(options.background ?? defaultBackground);
  const backgroundStats = await stat(backgroundPath);
  if (!backgroundStats.isFile()) {
    throw new Error(`Background is not a file: ${backgroundPath}`);
  }

  const images = await listSourceImages(sourceDirectory, options.limit);
  if (images.length === 0) {
    throw new Error(`No supported images found in ${sourceDirectory}`);
  }
  const unknownCatalogFiles = catalog.productsBySource
    ? [...catalog.productsBySource.keys()].filter(
        (filename) =>
          !images.some(
            (image) =>
              image.filename.toLocaleLowerCase("en-IN") === filename,
          ),
      )
    : [];
  if (unknownCatalogFiles.length > 0 && options.limit === undefined) {
    throw new Error(
      `Catalog source files were not found: ${unknownCatalogFiles.join(", ")}`,
    );
  }

  console.log(`Source: ${sourceDirectory}`);
  console.log(`Images: ${images.length}`);
  console.log(`Background: ${backgroundPath}`);
  console.log(`Output: ${outputDirectory}`);
  console.log(
    `Mode: ${options.apply ? "APPLY (local image writes enabled)" : "DRY RUN"}`,
  );

  const measured = await recognizeMeasurements(images, catalog, options.skipOcr);
  const startingNumber =
    catalog.startingNumber ?? options.startNumber;
  const products = measured.map((item, index) =>
    buildProductRecord(item, index, startingNumber, outputDirectory),
  );
  const readyCount = products.filter((product) => product.readyForUpload).length;
  const missingMeasurements = products.filter(
    (product) => !product.weightGrams || !product.heightInches,
  );

  console.log(
    `\nReview status: ${readyCount}/${products.length} products have complete upload metadata.`,
  );
  for (const product of products.filter((item) => !item.readyForUpload)) {
    console.log(
      `  REVIEW ${product.sourceFilename}: ${product.reviewReasons.join(", ")}`,
    );
  }

  if (!options.apply) {
    console.log("\nDry run complete. No files or Sanity documents were written.");
    console.log(
      "Add/fix the catalog metadata, then rerun with --apply to build the images.",
    );
    if (missingMeasurements.length > 0) {
      process.exitCode = 2;
    }
    return;
  }

  await mkdir(outputDirectory, { recursive: true });
  const pendingProducts = [];
  for (const product of products) {
    if (!options.overwriteImages && (await pathExists(product.outputPath))) {
      const metadata = await sharp(product.outputPath).metadata();
      const backgroundMetadata = await sharp(backgroundPath).metadata();
      if (
        metadata.width !== backgroundMetadata.width ||
        metadata.height !== backgroundMetadata.height
      ) {
        throw new Error(
          `Existing output has the wrong dimensions; use --overwrite-images: ${product.outputPath}`,
        );
      }
      console.log(`  Reusing existing output ${product.outputFilename}`);
    } else {
      pendingProducts.push(product);
    }
  }

  let temporaryDirectory;
  let selectedDevice = "reused";
  try {
    if (pendingProducts.length > 0) {
      const tempParent = join(
        repoRoot,
        "tmp",
        `idol-pipeline-${createHash("sha1")
          .update(`${sourceDirectory}-${Date.now()}`)
          .digest("hex")
          .slice(0, 10)}`,
      );
      await mkdir(dirname(tempParent), { recursive: true });
      temporaryDirectory = await mkdtemp(`${tempParent}-`);
      const transparentPathByProductId = new Map();
      const taskGroups = new Map();
      pendingProducts.forEach((product, index) => {
        const transparentPath = join(
          temporaryDirectory,
          `${String(index + 1).padStart(3, "0")}-transparent.png`,
        );
        const model = product.backgroundModel ?? options.model;
        const tasks = taskGroups.get(model) ?? [];
        tasks.push({
          input: join(sourceDirectory, product.sourceFilename),
          output: transparentPath,
        });
        taskGroups.set(model, tasks);
        transparentPathByProductId.set(product.id, transparentPath);
      });

      const selectedDevices = new Set();
      let taskGroupIndex = 0;
      for (const [model, tasks] of taskGroups) {
        taskGroupIndex += 1;
        const tasksPath = join(
          temporaryDirectory,
          `tasks-${String(taskGroupIndex).padStart(2, "0")}-${slugify(model)}.json`,
        );
        await writeFile(tasksPath, JSON.stringify(tasks, null, 2), "utf8");
        selectedDevices.add(
          await runRembg({
            tasksPath,
            model,
            device: options.device,
            alphaMatting: options.alphaMatting,
            warmup: false,
          }),
        );
      }
      selectedDevice = [...selectedDevices].join("+");

      console.log(
        `\nCompositing ${pendingProducts.length} images with ${options.concurrency} workers...`,
      );
      await mapWithConcurrency(
        pendingProducts,
        options.concurrency,
        async (product, index) => {
          const catalogProduct = measured.find(
            (item) => item.filename === product.sourceFilename,
          )?.catalogProduct;
          await composeProduct({
            transparentPath: transparentPathByProductId.get(product.id),
            backgroundPath,
            outputPath: product.outputPath,
            subjectScale: catalogProduct?.subjectScale ?? 1,
            cutoutBottomRatio: catalogProduct?.cutoutBottomRatio,
          });
          console.log(
            `  [${index + 1}/${pendingProducts.length}] wrote ${product.outputFilename}`,
          );
        },
      );
    }

    const {
      manifestPath,
      csvPath,
      draftCatalogPath,
      wroteDraftCatalog,
      manifest,
    } = await writeBatchFiles({
      outputDirectory,
      sourceDirectory,
      backgroundPath,
      catalog,
      productRecords: products,
      options,
      selectedDevice,
    });
    console.log(`\nManifest: ${manifestPath}`);
    console.log(`Measurements: ${csvPath}`);
    if (wroteDraftCatalog) {
      console.log(`Catalog draft: ${draftCatalogPath}`);
      console.log(
        "Fill the blank identity/code/deity fields, then rerun with --catalog pointing to this draft.",
      );
    }

    if (options.upload) {
      if (!manifest.readyForUpload) {
        throw new Error(
          "Upload blocked: complete every product identity, code family, deity, weight, and height in the catalog.",
        );
      }
      await uploadManifest(manifestPath);
    } else {
      console.log(
        "Sanity was not changed. Use --upload with --apply after reviewing the manifest.",
      );
    }
  } finally {
    if (temporaryDirectory && !options.keepTemp) {
      const expectedParent = join(repoRoot, "tmp", "idol-pipeline-");
      if (!temporaryDirectory.startsWith(expectedParent)) {
        throw new Error(
          `Refusing to remove unexpected temporary path: ${temporaryDirectory}`,
        );
      }
      await rm(temporaryDirectory, { recursive: true, force: true });
    } else if (temporaryDirectory) {
      console.log(`Temporary cutouts kept at ${temporaryDirectory}`);
    }
  }
}

main().catch((error) => {
  console.error(`\nIdol batch failed: ${error.message}`);
  process.exitCode = 1;
});
