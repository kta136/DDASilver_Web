#!/usr/bin/env node

import { spawn } from "node:child_process";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const applyChanges = process.argv.includes("--apply");
const unknownArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== "--apply");

if (unknownArguments.length > 0) {
  throw new Error(`Unknown option: ${unknownArguments.join(", ")}`);
}

const sources = [
  undefined,
  "public/images/silver-idols/new-designs-2026-07-31-batch-2/sanity-idol-manifest.json",
  "public/images/silver-idols/new-designs-2026-07-31-batch-3/sanity-idol-manifest.json",
  "public/images/silver-idols/new-folder-3-2026-08-02/sanity-idol-manifest.json",
];

function runSource(manifestPath) {
  const argumentsList = [
    resolve(repoRoot, "scripts", "sanity", "run-idol-upload.mjs"),
    "--measurements-only",
    ...(manifestPath ? [`--manifest=${manifestPath}`] : []),
    ...(applyChanges ? ["--apply"] : []),
  ];

  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, argumentsList, {
      cwd: repoRoot,
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(
          new Error(`Measurement sync exited with code ${code}`),
        );
      }
    });
  });
}

for (const manifestPath of sources) {
  console.log(
    `\nSyncing ${manifestPath ?? "the built-in 33-product idol catalog"}...`,
  );
  await runSource(manifestPath);
}
