"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { RateItem } from "@/lib/rates/contract";
import { formatIndianNumber } from "@/lib/rates/format";
import {
  buildChartPaths,
  chartPointStats,
  historyIntervalForIstDates,
  istCalendarDate,
  normalizeChartPoints,
  rateHistoryResponseSchema,
  sourceHistoryCatalogSchema,
  sourceHistoryResponseSchema,
  type ChartPoint,
} from "@/lib/rates/history";

import styles from "./rate-experience.module.css";

const ranges = ["1H", "24H", "7D", "30D", "6M", "1Y"] as const;
const maximumAutomaticRetries = 5;
const maximumBackoffDelayMs = 60_000;
const maximumServerRetryDelayMs = 5 * 60_000;
type HistoryRange = (typeof ranges)[number];

class RetryableHistoryError extends Error {
  constructor(
    message: string,
    readonly retryDelayMs: number,
  ) {
    super(message);
  }
}

type HistoryTarget = {
  key: string;
  id: string;
  kind: "rate" | "source";
  label: string;
  availableFrom?: string | null;
};

export function RateHistory({
  authorized,
  items,
  open,
}: {
  authorized: boolean;
  items: Readonly<Record<string, RateItem>>;
  open: boolean;
}) {
  const titleId = useId();
  const [range, setRange] = useState<HistoryRange>("7D");
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [selectedKey, setSelectedKey] = useState("");
  const [sourceTargets, setSourceTargets] = useState<HistoryTarget[]>([]);
  const [{ today, weekAgo }] = useState(() => {
    const now = new Date();
    return {
      today: istCalendarDate(now),
      weekAgo: istCalendarDate(new Date(now.getTime() - 7 * 86_400_000)),
    };
  });
  const [customFrom, setCustomFrom] = useState(weekAgo);
  const [customTo, setCustomTo] = useState(today);
  const [customInterval, setCustomInterval] = useState(() =>
    historyIntervalForIstDates(weekAgo, today),
  );
  const [customError, setCustomError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const automaticRetry = useRef({ scopeKey: "", attempts: 0 });
  const [historyResult, setHistoryResult] = useState<{
    requestKey: string;
    points: ChartPoint[];
    error: string | null;
  }>({ requestKey: "", points: [], error: null });

  const rateTargets = useMemo<HistoryTarget[]>(
    () =>
      Object.values(items).map((item) => ({
        key: `rate:${item.id}`,
        id: item.id,
        kind: "rate",
        label: item.label ?? item.name ?? item.id,
      })),
    [items],
  );
  const targets = useMemo(
    () => [...rateTargets, ...sourceTargets],
    [rateTargets, sourceTargets],
  );
  const effectiveSelectedKey = targets.some(
    (target) => target.key === selectedKey,
  )
    ? selectedKey
    : (targets[0]?.key ?? "");
  const selected = targets.find(
    (target) => target.key === effectiveSelectedKey,
  );
  const selectedId = selected?.id;
  const selectedKind = selected?.kind;
  const intervalKey =
    mode === "preset"
      ? `preset:${range}`
      : customInterval
        ? `custom:${customInterval.from}:${customInterval.to}`
        : "";
  const requestScopeKey =
    open && authorized && selected && intervalKey
      ? `${selected.key}:${intervalKey}`
      : "";
  const requestKey = requestScopeKey
    ? `${requestScopeKey}:${retryCount}`
    : "";
  const loading = Boolean(
    requestKey && historyResult.requestKey !== requestKey,
  );
  const resultForRequest = historyResult.requestKey === requestKey;
  const points = resultForRequest ? historyResult.points : [];
  const error = resultForRequest ? historyResult.error : null;
  const stats = chartPointStats(points);

  useEffect(() => {
    if (!open || !authorized) return;
    const controller = new AbortController();
    void fetch("/api/rates/source-history/catalog", {
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return sourceHistoryCatalogSchema.safeParse(await response.json());
      })
      .then((parsed) => {
        if (!parsed?.success) return;
        setSourceTargets(
          parsed.data.items.map((item) => ({
            key: `source:${item.sourceId}`,
            id: item.sourceId,
            kind: "source" as const,
            label: `${item.name} Ask`,
            availableFrom: item.availableFrom,
          })),
        );
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [authorized, open]);

  useEffect(() => {
    if (!requestKey || !selectedId || !selectedKind) return;
    const controller = new AbortController();
    let automaticRetryTimer: ReturnType<typeof setTimeout> | undefined;
    if (automaticRetry.current.scopeKey !== requestScopeKey) {
      automaticRetry.current = { scopeKey: requestScopeKey, attempts: 0 };
    }
    const retryAttempt = automaticRetry.current.attempts;
    const query = new URLSearchParams();
    query.set(selectedKind === "rate" ? "itemId" : "sourceId", selectedId);
    if (mode === "custom" && customInterval) {
      query.set("mode", "custom");
      query.set("from", customInterval.from);
      query.set("to", customInterval.to);
    } else {
      query.set("mode", "preset");
      query.set("range", range);
    }
    const endpoint =
      selectedKind === "rate"
        ? "/api/rates/history"
        : "/api/rates/source-history";

    void fetch(`${endpoint}?${query}`, {
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 404) {
          throw new Error("Chart not available for this item.");
        }
        if (response.status === 429) {
          const fallbackDelayMs = retryBackoff(10_000, retryAttempt);
          throw new RetryableHistoryError(
            "History requests were temporarily limited.",
            retryDelayFrom(response, fallbackDelayMs, fallbackDelayMs),
          );
        }
        if ([502, 503, 504].includes(response.status)) {
          const fallbackDelayMs = retryBackoff(5_000, retryAttempt);
          throw new RetryableHistoryError(
            "Rate history is temporarily unavailable.",
            retryDelayFrom(response, fallbackDelayMs),
          );
        }
        if (!response.ok) throw new Error("Rate history is unavailable.");
        const payload = await response.json();
        const parsed =
          selectedKind === "rate"
            ? rateHistoryResponseSchema.safeParse(payload)
            : sourceHistoryResponseSchema.safeParse(payload);
        if (!parsed.success) throw new Error("Rate history is unavailable.");
        return normalizeChartPoints(parsed.data.points);
      })
      .then((nextPoints) => {
        if (automaticRetry.current.scopeKey === requestScopeKey) {
          automaticRetry.current.attempts = 0;
        }
        setHistoryResult({
          requestKey,
          points: nextPoints,
          error: nextPoints.length === 0 ? "No history points yet." : null,
        });
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        const canRetryAutomatically =
          reason instanceof RetryableHistoryError &&
          automaticRetry.current.scopeKey === requestScopeKey &&
          automaticRetry.current.attempts < maximumAutomaticRetries;
        if (canRetryAutomatically) {
          automaticRetry.current.attempts += 1;
          automaticRetryTimer = setTimeout(() => {
            setRetryCount((current) => current + 1);
          }, reason.retryDelayMs);
        }
        setHistoryResult({
          requestKey,
          points: [],
          error:
            reason instanceof Error
              ? `${reason.message}${canRetryAutomatically ? " Retrying automatically…" : ""}`
              : "Rate history is unavailable.",
        });
      });
    return () => {
      controller.abort();
      if (automaticRetryTimer) clearTimeout(automaticRetryTimer);
    };
  }, [
    customInterval,
    mode,
    range,
    requestKey,
    requestScopeKey,
    selectedId,
    selectedKind,
  ]);

  if (!authorized || !open) return null;

  function applyCustomRange() {
    const interval = historyIntervalForIstDates(customFrom, customTo);
    if (!interval) {
      setCustomError("Choose a valid start date before the end date.");
      return;
    }
    setCustomError(null);
    setCustomInterval(interval);
    setMode("custom");
  }

  function retryHistory() {
    automaticRetry.current = { scopeKey: requestScopeKey, attempts: 0 };
    setRetryCount((current) => current + 1);
  }

  const rangeLabel =
    mode === "custom" ? `${customFrom} to ${customTo}` : range;

  return (
    <section className={styles.historySection} aria-labelledby={titleId}>
      <div id={`${titleId}-panel`} className={styles.historyPanel}>
          <div className={styles.historyHeadingRow}>
            <div>
              <p className={styles.historyEyebrow}>Authorized view</p>
              <h2 id={titleId} className={styles.historyHeading}>
                Rate history
              </h2>
            </div>
            <select
              className={styles.historySelect}
              aria-label="Select rate item"
              value={effectiveSelectedKey}
              onChange={(event) => setSelectedKey(event.target.value)}
            >
              <optgroup label="Rate items">
                {rateTargets.map((target) => (
                  <option key={target.key} value={target.key}>
                    {target.label}
                  </option>
                ))}
              </optgroup>
              {sourceTargets.length > 0 ? (
                <optgroup label="Market references">
                  {sourceTargets.map((target) => (
                    <option key={target.key} value={target.key}>
                      {target.label}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </div>

          <div className={styles.historyRanges} aria-label="Chart range">
            {ranges.map((value) => (
              <button
                key={value}
                type="button"
                className={styles.historyRangeButton}
                aria-pressed={mode === "preset" && range === value}
                onClick={() => {
                  setMode("preset");
                  setRange(value);
                }}
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              className={styles.historyRangeButton}
              aria-pressed={mode === "custom"}
              onClick={() => setMode("custom")}
            >
              Custom
            </button>
          </div>

          {mode === "custom" ? (
            <div className={styles.customRangePanel}>
              <label>
                From (IST)
                <input
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(event) => setCustomFrom(event.target.value)}
                />
              </label>
              <label>
                To (IST)
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={today}
                  onChange={(event) => setCustomTo(event.target.value)}
                />
              </label>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={applyCustomRange}
              >
                Apply dates
              </button>
              {customError ? (
                <p className={styles.customRangeError} role="alert">
                  {customError}
                </p>
              ) : null}
            </div>
          ) : null}

          {selected?.kind === "source" && selected.availableFrom ? (
            <p className={styles.historyAvailableFrom}>
              Source history available from {formatTimestamp(selected.availableFrom)}.
            </p>
          ) : null}

          {loading ? (
            <p className={styles.historyState} role="status">
              Loading history…
            </p>
          ) : error ? (
            <div className={styles.historyState} role="status">
              <span>{error}</span>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={retryHistory}
              >
                Retry
              </button>
            </div>
          ) : selected ? (
            <>
              <div className={styles.historyStats} aria-label="Rate history summary">
                <HistoryStat label="Latest" value={stats.latest} />
                <HistoryStat label="High" value={stats.high} />
                <HistoryStat label="Low" value={stats.low} />
                <HistoryStat
                  label="Updated"
                  text={stats.updatedAt ? formatTimestamp(stats.updatedAt) : "—"}
                />
              </div>
              <HistorySvg
                key={`${selected.key}:${rangeLabel}`}
                label={`${selected.label} history for ${rangeLabel}`}
                points={points}
              />
            </>
          ) : (
            <p className={styles.historyState}>No chart-enabled rates available.</p>
          )}
      </div>
    </section>
  );
}

function HistoryStat({
  label,
  value,
  text,
}: {
  label: string;
  value?: number | null;
  text?: string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{text ?? (value == null ? "—" : formatIndianNumber(value))}</strong>
    </div>
  );
}

function HistorySvg({
  label,
  points,
}: {
  label: string;
  points: readonly ChartPoint[];
}) {
  const width = 720;
  const height = 240;
  const chart = buildChartPaths(points, width, height);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(
    null,
  );
  const selectedPoint = chart.points.find(
    (point) => point.snapshotAt === selectedTimestamp,
  );
  const markerStep = Math.max(Math.ceil(chart.points.length / 48), 1);
  const markerPoints = chart.points.filter(
    (_, index) =>
      index === 0 ||
      index === chart.points.length - 1 ||
      index % markerStep === 0,
  );
  const first = points[0];
  const latest = points.at(-1);

  return (
    <div className={styles.historyChartFrame}>
      <div className={styles.historyPlot}>
        <svg
          className={styles.historyChart}
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-roledescription="interactive rate chart"
          aria-label={label}
        >
          <line
            x1="24"
            y1="24"
            x2="24"
            y2="216"
            className={styles.chartGrid}
          />
          <line
            x1="24"
            y1="216"
            x2="696"
            y2="216"
            className={styles.chartGrid}
          />
          <line
            x1="24"
            y1="120"
            x2="696"
            y2="120"
            className={styles.chartGrid}
          />
          {chart.paths.map((path, index) => (
            <path key={index} d={path} className={styles.chartLine} />
          ))}
          {markerPoints.map((point) => {
            const active = point.snapshotAt === selectedPoint?.snapshotAt;
            const accessibleLabel = `Rate ${formatIndianNumber(point.value)} at ${formatTimestamp(point.snapshotAt)} IST`;
            return (
              <g
                key={point.snapshotAt}
                className={styles.chartPoint}
                role="button"
                tabIndex={0}
                aria-label={accessibleLabel}
                aria-pressed={active}
                data-active={active || undefined}
                onClick={() => setSelectedTimestamp(point.snapshotAt)}
                onFocus={() => setSelectedTimestamp(point.snapshotAt)}
                onMouseEnter={() => setSelectedTimestamp(point.snapshotAt)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  setSelectedTimestamp(point.snapshotAt);
                }}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  className={styles.chartPointHitArea}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={active ? 4.75 : 3.25}
                  className={styles.chartPointDot}
                />
              </g>
            );
          })}
        </svg>
        {selectedPoint ? (
          <div
            className={styles.historyTooltip}
            role="status"
            aria-live="polite"
            data-align={tooltipAlignment(selectedPoint.x, width)}
            data-placement={selectedPoint.y < 82 ? "bottom" : "top"}
            style={{
              left: `${(selectedPoint.x / width) * 100}%`,
              top: `${(selectedPoint.y / height) * 100}%`,
            }}
          >
            <strong>{formatIndianNumber(selectedPoint.value)}</strong>
            <time dateTime={selectedPoint.snapshotAt}>
              {formatTimestamp(selectedPoint.snapshotAt)} IST
            </time>
          </div>
        ) : null}
      </div>
      <div className={styles.historyAxis} aria-hidden="true">
        <span>{first ? formatTimestamp(first.snapshotAt) : "—"}</span>
        <span>
          {formatIndianNumber(chart.minimum)} – {formatIndianNumber(chart.maximum)}
        </span>
        <span>{latest ? formatTimestamp(latest.snapshotAt) : "—"}</span>
      </div>
      {chart.points.length > 0 ? (
        <p className={styles.historyChartHint}>
          Click or focus a point to see its rate and time.
        </p>
      ) : null}
    </div>
  );
}

function tooltipAlignment(x: number, width: number) {
  if (x < width * 0.2) return "start";
  if (x > width * 0.8) return "end";
  return "center";
}

function retryBackoff(baseDelayMs: number, retryAttempt: number) {
  return Math.min(baseDelayMs * 2 ** retryAttempt, maximumBackoffDelayMs);
}

function retryDelayFrom(
  response: Response,
  fallbackMs: number,
  minimumMs = 1_000,
) {
  const retryAfter = response.headers.get("retry-after");
  if (!retryAfter) return fallbackMs;

  const seconds = Number(retryAfter);
  const parsedMs = Number.isFinite(seconds)
    ? seconds * 1_000
    : Date.parse(retryAfter) - Date.now();
  if (!Number.isFinite(parsedMs)) return fallbackMs;
  return Math.min(
    Math.max(parsedMs, minimumMs),
    maximumServerRetryDelayMs,
  );
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
