// Operational freshness threshold for the automatic pricing reference. The
// gallery refreshes every five minutes and accepts source data up to 90s old.
// Crossing this threshold degrades health but no longer hides a price or Offer
// that the server still renders from the last validated reference.
export const MAX_AUTOMATIC_REFERENCE_AGE_MS = 390_000;
const EXPIRY_WARNING_MS = 60_000;

export function automaticReferenceFreshness(
  asOf: string | undefined,
  now = Date.now(),
) {
  const timestamp = Date.parse(asOf ?? "");
  if (!asOf || !Number.isFinite(timestamp) || timestamp > now) {
    return {
      status: asOf ? "invalid" as const : "unavailable" as const,
      expiresAt: null,
      secondsRemaining: null,
    };
  }
  const remaining = timestamp + MAX_AUTOMATIC_REFERENCE_AGE_MS - now;
  return {
    status: remaining < 0
      ? "expired" as const
      : remaining <= EXPIRY_WARNING_MS
        ? "expiring" as const
        : "fresh" as const,
    expiresAt: new Date(
      timestamp + MAX_AUTOMATIC_REFERENCE_AGE_MS,
    ).toISOString(),
    secondsRemaining: Math.max(0, Math.ceil(remaining / 1_000)),
  };
}
