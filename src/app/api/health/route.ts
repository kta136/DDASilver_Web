import { existsSync } from "node:fs";

import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

type CheckState = "ok" | "not_configured";

const DRAIN_MARKER = "/tmp/ddasilver-draining";

function isSanityConfigured() {
  return (
    /^[a-z0-9-]+$/.test(
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
    ) &&
    /^[a-z0-9_-]+$/.test(
      process.env.NEXT_PUBLIC_SANITY_DATASET ?? "",
    )
  );
}

function isDraining() {
  return (
    process.env.DDA_CONTAINER_DRAINING === "1" ||
    existsSync(DRAIN_MARKER)
  );
}

function buildVersion() {
  const versions = [
    process.env.APP_VERSION,
    process.env.SOURCE_COMMIT,
    process.env.VERCEL_GIT_COMMIT_SHA,
  ];

  for (const candidate of versions) {
    const version = candidate?.trim();
    if (!version) continue;
    if (/^[a-f0-9]{7,40}$/i.test(version)) {
      return version.slice(0, 12);
    }
    return version.slice(0, 64);
  }

  return process.env.npm_package_version ?? "development";
}

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, "health", 120, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { status: "rate_limited" },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(rateLimit.retryAfter),
        },
      },
    );
  }

  const sanity: CheckState = isSanityConfigured()
    ? "ok"
    : "not_configured";
  const draining = isDraining();
  const status = sanity === "ok" && !draining ? "ok" : "degraded";

  return Response.json(
    {
      status,
      version: buildVersion(),
      checks: {
        application: draining ? "draining" : "ok",
        sanity,
      },
    },
    {
      status: status === "ok" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
