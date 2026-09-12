import { automaticOfferValidity } from "./freshness";
import type { StoreRead } from "./store";

export function pricingHealth(state: StoreRead, now = Date.now()) {
  const reference = state.record?.reference;
  const automaticOffers = automaticOfferValidity(reference?.snapshotAsOf, now);
  const warnings: string[] = [];
  if (automaticOffers.status !== "fresh")
    warnings.push(`reference-${automaticOffers.status}`);
  if (state.record?.refresh.outcome === "failed") warnings.push("refresh-failed");
  if (state.recovery === "backup") warnings.push("storage-recovery");

  return {
    status: !reference
      ? "unavailable"
      : warnings.length || state.record?.refresh.outcome !== "accepted"
        ? "degraded"
        : "ok",
    snapshotAsOf: reference?.snapshotAsOf ?? null,
    referenceAgeSeconds: reference
      ? Math.max(0, Math.floor((now - Date.parse(reference.snapshotAsOf)) / 1_000))
      : null,
    nextAttemptAt: state.record?.refresh.nextAttemptAt ?? null,
    refreshOutcome: state.record?.refresh.outcome ?? null,
    recovery: state.recovery,
    automaticOffers,
    warnings,
  };
}
