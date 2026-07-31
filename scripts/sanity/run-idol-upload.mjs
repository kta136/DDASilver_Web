#!/usr/bin/env node

import { spawn } from "node:child_process";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");

function parseArgs(argv) {
  const options = {
    apply: false,
    overwrite: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") {
      options.apply = true;
    } else if (argument === "--overwrite") {
      options.overwrite = true;
      options.apply = true;
    } else if (argument.startsWith("--manifest=")) {
      options.manifest = argument.slice("--manifest=".length);
    } else if (argument === "--manifest") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--manifest requires a path");
      }
      options.manifest = value;
      index += 1;
    } else if (argument === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
DDA Silver Sanity idol uploader

Usage:
  npm run sanity:upload-idols
  npm run sanity:upload-idols:apply
  npm run sanity:upload-idols:overwrite
  npm run sanity:upload-idol-manifest -- -- --manifest=FILE [--apply] [--overwrite]

The uploader is a dry run unless --apply is enabled.
`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const child = spawn(
    process.execPath,
    [
      resolve(repoRoot, "node_modules", "sanity", "bin", "sanity"),
      "exec",
      "scripts/sanity/upload-idol-products.ts",
      "--with-user-token",
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        SANITY_IDOL_APPLY: options.apply ? "1" : "0",
        SANITY_IDOL_OVERWRITE: options.overwrite ? "1" : "0",
        ...(options.manifest
          ? { SANITY_IDOL_MANIFEST: resolve(repoRoot, options.manifest) }
          : {}),
      },
      stdio: "inherit",
      windowsHide: true,
    },
  );

  await new Promise((resolvePromise, rejectPromise) => {
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

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
