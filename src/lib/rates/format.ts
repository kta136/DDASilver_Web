export function formatIndianNumber(value: number | null, unit?: string) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatRateTime(value: string | null) {
  if (!value) {
    return "Not updated";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not updated";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}
