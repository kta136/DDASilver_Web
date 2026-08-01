import { z } from "zod";

const historyPointSchema = z.object({
  snapshotAt: z.string().datetime({ offset: true }),
  finalRate: z.number().finite().nonnegative().optional(),
  ask: z.number().finite().nonnegative().optional(),
  quality: z.enum(["ASK", "LTP_FALLBACK"]).optional(),
  gapBefore: z.literal(true).optional(),
  rollover: z.literal(true).optional(),
});

export const rateHistoryResponseSchema = z.object({
  itemId: z.string().min(1),
  unit: z.string().min(1).max(40),
  points: z.array(historyPointSchema).max(2_000),
});

export const sourceHistoryResponseSchema = z.object({
  sourceId: z.string().min(1),
  unit: z.string().min(1).max(40),
  valueField: z.literal("ask"),
  availableFrom: z.string().datetime({ offset: true }).nullable(),
  points: z.array(historyPointSchema).max(2_000),
});

export const sourceHistoryCatalogSchema = z.object({
  items: z
    .array(
      z.object({
        sourceId: z.string().min(1),
        name: z.string().min(1).max(160),
        unit: z.string().min(1).max(40),
        enabledFrom: z.string().datetime({ offset: true }),
        availableFrom: z.string().datetime({ offset: true }).nullable(),
      }),
    )
    .max(100),
});

export type ChartPoint = {
  snapshotAt: string;
  value: number;
  gapBefore?: true;
  quality?: "ASK" | "LTP_FALLBACK";
};

export function historyIntervalForIstDates(fromDate: string, toDate: string) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(fromDate) || !datePattern.test(toDate)) return null;
  const from = new Date(`${fromDate}T00:00:00.000+05:30`);
  const to = new Date(`${toDate}T23:59:59.999+05:30`);
  if (
    !Number.isFinite(from.getTime()) ||
    !Number.isFinite(to.getTime()) ||
    from.getTime() >= to.getTime()
  ) {
    return null;
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

export function istCalendarDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function chartPointStats(points: readonly ChartPoint[]) {
  if (points.length === 0) {
    return { latest: null, high: null, low: null, updatedAt: null };
  }
  const values = points.map((point) => point.value);
  const latest = points.at(-1) ?? null;
  return {
    latest: latest?.value ?? null,
    high: Math.max(...values),
    low: Math.min(...values),
    updatedAt: latest?.snapshotAt ?? null,
  };
}

export function normalizeChartPoints(
  points: ReadonlyArray<z.infer<typeof historyPointSchema>>,
) {
  const byTimestamp = new Map<number, ChartPoint>();
  for (const point of points) {
    const timestamp = Date.parse(point.snapshotAt);
    const value = point.finalRate ?? point.ask;
    if (!Number.isFinite(timestamp) || !Number.isFinite(value)) continue;
    byTimestamp.set(timestamp, {
      snapshotAt: new Date(timestamp).toISOString(),
      value: value as number,
      ...(point.gapBefore ? { gapBefore: true as const } : {}),
      ...(point.quality ? { quality: point.quality } : {}),
    });
  }

  const sorted = [...byTimestamp.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, point]) => point);
  if (sorted.length <= 360) return sorted;

  const sampled: ChartPoint[] = [];
  const lastIndex = sorted.length - 1;
  for (let index = 0; index < 360; index += 1) {
    const sourceIndex = Math.round((index * lastIndex) / 359);
    const point = sorted[sourceIndex];
    if (point && sampled.at(-1)?.snapshotAt !== point.snapshotAt) {
      sampled.push(point);
    }
  }
  return sampled;
}

export function buildChartPaths(
  points: readonly ChartPoint[],
  width: number,
  height: number,
  padding = 24,
) {
  if (points.length === 0) {
    return { paths: [], minimum: 0, maximum: 0 };
  }
  const times = points.map((point) => Date.parse(point.snapshotAt));
  const values = points.map((point) => point.value);
  const start = Math.min(...times);
  const end = Math.max(...times);
  const rawMinimum = Math.min(...values);
  const rawMaximum = Math.max(...values);
  const valuePadding = Math.max((rawMaximum - rawMinimum) * 0.08, 1);
  const minimum = rawMinimum - valuePadding;
  const maximum = rawMaximum + valuePadding;
  const timeSpan = Math.max(end - start, 1);
  const valueSpan = Math.max(maximum - minimum, 1);
  const x = (time: number) =>
    padding + ((time - start) / timeSpan) * (width - padding * 2);
  const y = (value: number) =>
    height - padding - ((value - minimum) / valueSpan) * (height - padding * 2);

  const paths: string[] = [];
  let path = "";
  points.forEach((point, index) => {
    const command = index === 0 || point.gapBefore ? "M" : "L";
    if (point.gapBefore && path) {
      paths.push(path);
      path = "";
    }
    path += `${command}${x(Date.parse(point.snapshotAt)).toFixed(2)},${y(point.value).toFixed(2)} `;
  });
  if (path) paths.push(path);
  return { paths, minimum: rawMinimum, maximum: rawMaximum };
}
