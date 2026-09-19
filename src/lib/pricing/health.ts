import { automaticReferenceFreshness } from "./freshness";
import type { StoreRead } from "./store";

export function pricingHealth(state: StoreRead, now = Date.now()) {
  const reference = state.record?.reference;
  const observedFreshness = automaticReferenceFreshness(
    reference?.snapshotAsOf,
    now,
  );
  const validUntilTime = Date.parse(reference?.validUntil ?? "");
  const closedMarketPriceValid =
    reference?.marketStatus === "closed" &&
    Number.isFinite(validUntilTime) &&
    validUntilTime > now;
  const automaticReference = closedMarketPriceValid
    ? {
        status: "market-closed" as const,
        expiresAt: reference.validUntil!,
        secondsRemaining: Math.ceil((validUntilTime - now) / 1_000),
      }
    : observedFreshness;
  const warnings: string[] = [];
  if (!closedMarketPriceValid && observedFreshness.status !== "fresh")
    warnings.push(`reference-${observedFreshness.status}`);
  if (!closedMarketPriceValid && state.record?.refresh.outcome === "failed")
    warnings.push("refresh-failed");
  if (state.recovery === "backup") warnings.push("storage-recovery");

  return {
    status: !reference
      ? "unavailable"
      : warnings.length ||
          (state.record?.refresh.outcome !== "accepted" &&
            !closedMarketPriceValid)
        ? "degraded"
        : "ok",
    snapshotAsOf: reference?.snapshotAsOf ?? null,
    marketStatus: reference?.marketStatus ?? null,
    priceValidUntil: reference?.validUntil ?? null,
    referenceAgeSeconds: reference
      ? Math.max(0, Math.floor((now - Date.parse(reference.snapshotAsOf)) / 1_000))
      : null,
    nextAttemptAt: state.record?.refresh.nextAttemptAt ?? null,
    refreshOutcome: state.record?.refresh.outcome ?? null,
    recovery: state.recovery,
    // Preserve the public health response key for existing monitors. During a
    // verified closure it reports the authoritative next-open boundary.
    automaticOffers: automaticReference,
    warnings,
  };
}
