import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

type CheckState = "ok" | "not_configured";

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
  const status = sanity === "ok" ? "ok" : "degraded";

  return Response.json(
    {
      status,
      version: buildVersion(),
      checks: {
        application: "ok",
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
