import { mkdir, readFile } from "node:fs/promises";
import {
  basename,
  isAbsolute,
  relative,
  resolve,
} from "node:path";

import sharp from "sharp";

const DEFAULT_CANVAS_SIZE = 1254;
const DEFAULT_COIN_DIAMETER = 520;

function printUsage() {
  console.log(`Build paired front-and-back coin catalog images.

Usage:
  npm run -- images:build-coin-pairs -- \\
    --front="<front source image>" \\
    --back="<back source image>" \\
    --watermark="<transparent logo PNG>" \\
    --manifest="<crop manifest JSON>" \\
    --output-dir="<output directory>"
`);
}

function parseArguments(argv) {
  return Object.fromEntries(
    argv
      .filter((argument) => argument.startsWith("--"))
      .map((argument) => {
        const separator = argument.indexOf("=");
        if (separator === -1) {
          return [argument.slice(2), "true"];
        }

        return [
          argument.slice(2, separator),
          argument.slice(separator + 1),
        ];
      }),
  );
}

function requireArgument(argumentsByName, name) {
  const value = argumentsByName[name];
  if (!value) {
    throw new Error(`Missing required argument --${name}=<path>`);
  }

  return resolve(value);
}

function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
}

function validateRegion(region, label, imageMetadata) {
  if (!region || typeof region !== "object") {
    throw new Error(`${label} must define cx, cy, and radius.`);
  }

  for (const property of ["cx", "cy", "radius"]) {
    if (
      typeof region[property] !== "number" ||
      !Number.isFinite(region[property])
    ) {
      throw new Error(`${label}.${property} must be a finite number.`);
    }
  }

  if (region.radius <= 0) {
    throw new Error(`${label}.radius must be greater than zero.`);
  }

  const left = Math.round(region.cx - region.radius);
  const top = Math.round(region.cy - region.radius);
  const size = Math.round(region.radius * 2);
  const width = imageMetadata.width ?? 0;
  const height = imageMetadata.height ?? 0;

  if (
    left < 0 ||
    top < 0 ||
    left + size > width ||
    top + size > height
  ) {
    throw new Error(
      `${label} crop (${left}, ${top}, ${size}×${size}) exceeds the ${width}×${height} source image.`,
    );
  }
}

function resolveSafeOutputPath(outputDirectory, filename) {
  if (
    typeof filename !== "string" ||
    filename.length === 0 ||
    basename(filename) !== filename
  ) {
    throw new Error(
      `Manifest output "${String(filename)}" must be a filename without directories.`,
    );
  }

  const outputPath = resolve(outputDirectory, filename);
  const relativePath = relative(outputDirectory, outputPath);

  if (
    relativePath.startsWith("..") ||
    isAbsolute(relativePath)
  ) {
    throw new Error(
      `Refusing to write outside the output directory: ${outputPath}`,
    );
  }

  return outputPath;
}

async function validateManifest({
  manifest,
  frontPath,
  backPath,
  outputDirectory,
  canvasSize,
  coinDiameter,
  watermark,
}) {
  assertPositiveInteger(canvasSize, "canvasSize");
  assertPositiveInteger(coinDiameter, "coinDiameter");
  assertPositiveInteger(watermark.width, "watermark.width");

  if (
    typeof watermark.opacity !== "number" ||
    watermark.opacity <= 0 ||
    watermark.opacity > 1
  ) {
    throw new Error("watermark.opacity must be greater than 0 and at most 1.");
  }

  const sideMargin = Math.round(canvasSize * 0.055);
  if (coinDiameter * 2 + sideMargin * 2 > canvasSize) {
    throw new Error(
      `Two ${coinDiameter}px coins do not fit on the ${canvasSize}px canvas.`,
    );
  }

  if (!Array.isArray(manifest.items) || manifest.items.length === 0) {
    throw new Error("Manifest items must be a non-empty array.");
  }

  const [frontMetadata, backMetadata] = await Promise.all([
    sharp(frontPath).metadata(),
    sharp(backPath).metadata(),
  ]);
  const outputNames = new Set();

  for (const [index, item] of manifest.items.entries()) {
    assertPositiveInteger(item.weight, `items[${index}].weight`);
    const outputPath = resolveSafeOutputPath(
      outputDirectory,
      item.output,
    );

    if (outputNames.has(outputPath)) {
      throw new Error(`Duplicate manifest output: ${item.output}`);
    }
    outputNames.add(outputPath);

    validateRegion(
      item.front,
      `items[${index}].front`,
      frontMetadata,
    );
    validateRegion(
      item.back,
      `items[${index}].back`,
      backMetadata,
    );
  }
}

async function createNeutralWatermark(logoPath, targetWidth, opacity) {
  const { data, info } = await sharp(logoPath)
    .resize({ width: targetWidth, withoutEnlargement: true })
    .tint("#8f8b87")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let index = 3; index < data.length; index += info.channels) {
    data[index] = Math.round(data[index] * opacity);
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

async function createCoinCutout(imagePath, region, diameter) {
  const left = Math.round(region.cx - region.radius);
  const top = Math.round(region.cy - region.radius);
  const size = Math.round(region.radius * 2);
  const { data, info } = await sharp(imagePath)
    .extract({ left, top, width: size, height: size })
    .resize(diameter, diameter, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({ brightness: 1.025, saturation: 0.52 })
    .linear(1.025, -2)
    .sharpen(0.6)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const center = (diameter - 1) / 2;
  const radius = diameter / 2 - 2;
  const feather = 2.5;

  for (let y = 0; y < diameter; y += 1) {
    for (let x = 0; x < diameter; x += 1) {
      const distance = Math.hypot(x - center, y - center);
      const alphaIndex = (y * diameter + x) * info.channels + 3;
      const edgeDistance = radius - distance;

      if (edgeDistance <= 0) {
        data[alphaIndex] = 0;
      } else if (edgeDistance < feather) {
        data[alphaIndex] = Math.round(
          data[alphaIndex] * (edgeDistance / feather),
        );
      }
    }
  }

  return sharp(data, { raw: info })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function createBackground(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="background" cx="50%" cy="42%" r="72%">
          <stop offset="0%" stop-color="#fffefd"/>
          <stop offset="100%" stop-color="#f4f0eb"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#background)"/>
    </svg>`,
  );
}

function createShadows(size, placements, diameter) {
  const circles = placements
    .map(
      ({ left, top }) =>
        `<circle cx="${left + diameter / 2}" cy="${top + diameter / 2 + 10}" r="${diameter / 2 - 8}" fill="#4b4642" fill-opacity="0.18"/>`,
    )
    .join("");

  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feGaussianBlur stdDeviation="11"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">${circles}</g>
    </svg>`,
  );
}

async function buildPair({
  frontPath,
  backPath,
  neutralWatermark,
  outputPath,
  item,
  canvasSize,
  coinDiameter,
}) {
  const [front, back] = await Promise.all([
    createCoinCutout(frontPath, item.front, coinDiameter),
    createCoinCutout(backPath, item.back, coinDiameter),
  ]);

  const watermarkMetadata = await sharp(neutralWatermark).metadata();
  const placements = [
    {
      left: Math.round(canvasSize * 0.055),
      top: Math.round((canvasSize - coinDiameter) / 2),
    },
    {
      left: Math.round(canvasSize - canvasSize * 0.055 - coinDiameter),
      top: Math.round((canvasSize - coinDiameter) / 2),
    },
  ];
  const watermarkLeft = Math.round(
    (canvasSize - (watermarkMetadata.width ?? watermark.width)) / 2,
  );
  const watermarkTop = Math.round(
    (canvasSize - (watermarkMetadata.height ?? watermark.width)) / 2,
  );

  await sharp(createBackground(canvasSize))
    .composite([
      {
        input: neutralWatermark,
        left: watermarkLeft,
        top: watermarkTop,
      },
      {
        input: createShadows(canvasSize, placements, coinDiameter),
        left: 0,
        top: 0,
      },
      { input: front, ...placements[0] },
      { input: back, ...placements[1] },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function main() {
  const argumentsByName = parseArguments(process.argv.slice(2));

  if (argumentsByName.help === "true") {
    printUsage();
    return;
  }

  const frontPath = requireArgument(argumentsByName, "front");
  const backPath = requireArgument(argumentsByName, "back");
  const logoPath = requireArgument(argumentsByName, "watermark");
  const manifestPath = requireArgument(argumentsByName, "manifest");
  const outputDirectory = requireArgument(argumentsByName, "output-dir");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const canvasSize = manifest.canvasSize ?? DEFAULT_CANVAS_SIZE;
  const coinDiameter = manifest.coinDiameter ?? DEFAULT_COIN_DIAMETER;
  const watermark = {
    width: manifest.watermark?.width ?? 800,
    opacity: manifest.watermark?.opacity ?? 0.105,
  };

  await validateManifest({
    manifest,
    frontPath,
    backPath,
    outputDirectory,
    canvasSize,
    coinDiameter,
    watermark,
  });
  await mkdir(outputDirectory, { recursive: true });
  const neutralWatermark = await createNeutralWatermark(
    logoPath,
    watermark.width,
    watermark.opacity,
  );

  for (const item of manifest.items) {
    const outputPath = resolveSafeOutputPath(
      outputDirectory,
      item.output,
    );
    await buildPair({
      frontPath,
      backPath,
      neutralWatermark,
      outputPath,
      item,
      canvasSize,
      coinDiameter,
    });
    console.log(
      `Created ${item.weight}g pair: ${basename(outputPath)}`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
