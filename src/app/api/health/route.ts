import { rateSnapshotSchema } from "@/lib/rates/contract";
import {
  isAllowedDdaJewelsUrl,
  readBoundedJson,
} from "@/lib/security/external-service";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

type CheckState = "ok" | "not_configured" | "unavailable" | "invalid";

async function checkRates(): Promise<CheckState> {
  const snapshotUrl =
    process.env.NEXT_PUBLIC_DDAJEWELS_RATES_SNAPSHOT_URL;
  if (!isAllowedDdaJewelsUrl(snapshotUrl)) {
    return "not_configured";
  }

  try {
    const response = await fetch(snapshotUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) {
      return "unavailable";
    }

    const payload = await readBoundedJson(response, 1_000_000);
    return rateSnapshotSchema.safeParse(payload).success ? "ok" : "invalid";
  } catch {
    return "unavailable";
  }
}

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

function buildVersion() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA;
  if (commit && /^[a-f0-9]{7,40}$/i.test(commit)) {
    return commit.slice(0, 12);
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
  const rates = await checkRates();
  const status = sanity === "ok" && rates === "ok" ? "ok" : "degraded";

  return Response.json(
    {
      status,
      version: buildVersion(),
      checks: {
        application: "ok",
        sanity,
        rates,
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
