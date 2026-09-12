// Existing automatic-offer cutoff. Refresh failures do not shorten this window.
// The gallery refreshes every five minutes and accepts source data up to 90s old.
export const MAX_OFFER_REFERENCE_AGE_MS = 390_000;
const EXPIRY_WARNING_MS = 60_000;

export function automaticOfferValidity(asOf: string | undefined, now = Date.now()) {
  const timestamp = Date.parse(asOf ?? "");
  if (!asOf || !Number.isFinite(timestamp) || timestamp > now) {
    return {
      status: asOf ? "invalid" as const : "unavailable" as const,
      expiresAt: null,
      secondsRemaining: null,
    };
  }
  const remaining = timestamp + MAX_OFFER_REFERENCE_AGE_MS - now;
  return {
    status: remaining < 0
      ? "expired" as const
      : remaining <= EXPIRY_WARNING_MS
        ? "expiring" as const
        : "fresh" as const,
    expiresAt: new Date(timestamp + MAX_OFFER_REFERENCE_AGE_MS).toISOString(),
    secondsRemaining: Math.max(0, Math.ceil(remaining / 1_000)),
  };
}
