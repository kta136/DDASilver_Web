type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

type ClientSchema<T> = {
  safeParse(value: unknown): SafeParseResult<T>;
};

type HistoryPoint = {
  snapshotAt: string;
  finalRate?: number;
  ask?: number;
  quality?: "ASK" | "LTP_FALLBACK";
  gapBefore?: true;
  rollover?: true;
};

function schema<T>(parser: (value: unknown) => T): ClientSchema<T> {
  return {
    safeParse(value) {
      try {
        return { success: true, data: parser(value) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Invalid history data"),
        };
      }
    },
  };
}

function invalid(message: string): never {
  throw new Error(message);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, maximum?: number) {
  if (typeof value !== "string" || value.length < 1 || (maximum && value.length > maximum)) {
    invalid(`${label} is invalid`);
  }
  return value;
}

function dateTime(value: unknown, label: string) {
  const parsed = text(value, label, 64);
  if (
    !/(?:Z|[+-]\d{2}:\d{2})$/i.test(parsed) ||
    !Number.isFinite(Date.parse(parsed))
  ) {
    invalid(`${label} must be an ISO date-time with an offset`);
  }
  return parsed;
}

function optionalNumber(object: Record<string, unknown>, key: string) {
  const value = object[key];
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    invalid(`${key} must be a non-negative number`);
  }
  return value;
}

function historyPoint(value: unknown): HistoryPoint {
  const object = record(value, "history point");
  const point: HistoryPoint = {
    snapshotAt: dateTime(object.snapshotAt, "snapshotAt"),
  };
  const finalRate = optionalNumber(object, "finalRate");
  const ask = optionalNumber(object, "ask");
  if (finalRate !== undefined) point.finalRate = finalRate;
  if (ask !== undefined) point.ask = ask;
  if (object.quality !== undefined) {
    if (object.quality !== "ASK" && object.quality !== "LTP_FALLBACK") {
      invalid("quality is invalid");
    }
    point.quality = object.quality;
  }
  for (const key of ["gapBefore", "rollover"] as const) {
    if (object[key] !== undefined) {
      if (object[key] !== true) invalid(`${key} is invalid`);
      point[key] = true;
    }
  }
  return point;
}

function points(value: unknown) {
  if (!Array.isArray(value) || value.length > 2_000) {
    invalid("points must be a bounded array");
  }
  return value.map(historyPoint);
}

export const rateHistoryResponseSchema = schema((value) => {
  const object = record(value, "rate history response");
  return {
    itemId: text(object.itemId, "itemId"),
    unit: text(object.unit, "unit", 40),
    points: points(object.points),
  };
});

export const sourceHistoryResponseSchema = schema((value) => {
  const object = record(value, "source history response");
  if (object.valueField !== "ask") invalid("valueField is invalid");
  return {
    sourceId: text(object.sourceId, "sourceId"),
    unit: text(object.unit, "unit", 40),
    valueField: "ask" as const,
    availableFrom:
      object.availableFrom === null
        ? null
        : dateTime(object.availableFrom, "availableFrom"),
    points: points(object.points),
  };
});

export const sourceHistoryCatalogSchema = schema((value) => {
  const object = record(value, "source history catalog");
  if (!Array.isArray(object.items) || object.items.length > 100) {
    invalid("items must be a bounded array");
  }
  return {
    items: object.items.map((value) => {
      const item = record(value, "source history item");
      return {
        sourceId: text(item.sourceId, "sourceId"),
        name: text(item.name, "name", 160),
        unit: text(item.unit, "unit", 40),
        enabledFrom: dateTime(item.enabledFrom, "enabledFrom"),
        availableFrom:
          item.availableFrom === null
            ? null
            : dateTime(item.availableFrom, "availableFrom"),
      };
    }),
  };
});

export type ChartPoint = {
  snapshotAt: string;
  value: number;
  gapBefore?: true;
  quality?: "ASK" | "LTP_FALLBACK";
};

export type PositionedChartPoint = ChartPoint & {
  x: number;
  y: number;
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
  points: ReadonlyArray<HistoryPoint>,
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
    return { paths: [], points: [], minimum: 0, maximum: 0 };
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

  const positionedPoints: PositionedChartPoint[] = points.map((point) => ({
    ...point,
    x: Number(x(Date.parse(point.snapshotAt)).toFixed(2)),
    y: Number(y(point.value).toFixed(2)),
  }));

  const paths: string[] = [];
  let path = "";
  positionedPoints.forEach((point, index) => {
    const command = index === 0 || point.gapBefore ? "M" : "L";
    if (point.gapBefore && path) {
      paths.push(path);
      path = "";
    }
    path += `${command}${point.x.toFixed(2)},${point.y.toFixed(2)} `;
  });
  if (path) paths.push(path);
  return {
    paths,
    points: positionedPoints,
    minimum: rawMinimum,
    maximum: rawMaximum,
  };
}
