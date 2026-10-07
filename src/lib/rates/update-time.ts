const rateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
});

export function getRateUpdateTime(itemUpdatedAt: Record<string, number>) {
  const times = Object.values(itemUpdatedAt).filter(Number.isFinite);
  if (!times.length) return null;
  // A single frequently updated item must not make older displayed rates look fresh.
  const date = new Date(Math.min(...times));
  if (!Number.isFinite(date.getTime())) return null;
  return { dateTime: date.toISOString(), label: `${rateTimeFormatter.format(date)} IST` };
}
