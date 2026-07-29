"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import {
  extractNumberLike,
  extractRateValue,
  feedStatusEventSchema,
  isRateSnapshotFresh,
  normalizeFeedStatus,
  normalizeRateIdentifier,
  rateEventSchema,
  rateSnapshotSchema,
  sourceEventSchema,
  sourceSnapshotEventSchema,
  type RateItem,
} from "@/lib/rates/contract";
import {
  customerRateDefinitions,
  marketRateDefinitions,
} from "@/lib/rates/definitions";
import { formatIndianNumber } from "@/lib/rates/format";
import { initialRateState, rateReducer } from "@/lib/rates/reducer";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

import styles from "./rate-experience.module.css";

const snapshotUrl = "/api/rates/snapshot";
const streamUrl = "/api/rates/stream";
const staleThresholdMs = 90_000;
const maximumEventBytes = 64_000;
const maximumSnapshotBytes = 1_000_000;

async function readBoundedJson(response: Response, maximumBytes: number) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    throw new Error("Rate response is too large");
  }

  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > maximumBytes) {
    throw new Error("Rate response is too large");
  }
  return JSON.parse(body) as unknown;
}

function findMatchingRate<T extends RateItem>(
  values: Record<string, T>,
  aliases: readonly string[],
) {
  const normalizedAliases = new Set(
    aliases.map((alias) => normalizeRateIdentifier(alias)),
  );
  return Object.values(values).find((item) => {
    return [item.id, item.name, item.label].some(
      (value) =>
        value && normalizedAliases.has(normalizeRateIdentifier(value)),
    );
  });
}

function formatRupee(value: number | null) {
  return value === null ? "—" : `₹${formatIndianNumber(value)}`;
}

function movementDirection(item?: RateItem) {
  return (
    item?.direction ??
    (item?.change && item.change > 0
      ? "up"
      : item?.change && item.change < 0
        ? "down"
        : "flat")
  );
}

function FlashValue({
  formatter,
  value,
  variant,
}: {
  formatter: (value: number | null) => string;
  value: number | null;
  variant: "customer" | "market";
}) {
  const [direction, setDirection] = useState<"none" | "up" | "down">(
    "none",
  );
  const previous = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const last = previous.current;
    previous.current = value;
    if (
      last === undefined ||
      last === null ||
      value === null ||
      last === value
    ) {
      return;
    }

    setDirection(value > last ? "up" : "down");
    const timer = setTimeout(() => setDirection("none"), 700);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span
      className={
        variant === "customer" ? styles.flashRate : styles.sourceFlashNumber
      }
      data-flash={direction}
    >
      {formatter(value)}
    </span>
  );
}

function Movement({ item }: { item?: RateItem }) {
  const direction = movementDirection(item);

  const change =
    typeof item?.change === "number" && Number.isFinite(item.change)
      ? Math.abs(item.change)
      : null;
  const amount = formatRupee(change);
  const label =
    direction === "up"
      ? `Up ${amount}`
      : direction === "down"
        ? `Down ${amount}`
        : `No change ${amount}`;

  return (
    <span role="img" aria-label={label}>
      {direction === "flat" ? (
        <span className={styles.flatMovement} aria-hidden="true">
          &mdash;
        </span>
      ) : (
        <>
          <span className={styles.movementArrow} aria-hidden="true">
            {direction === "up" ? "↑" : "↓"}
          </span>
          <span className={styles.movementAmount}>{amount}</span>
        </>
      )}
    </span>
  );
}

export function RateExperience() {
  const [state, dispatch] = useReducer(rateReducer, initialRateState);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const receivedAt = () => Date.now();

    function parseEvent(
      event: MessageEvent<string>,
      handler: (payload: unknown) => void,
    ) {
      if (event.data.length > maximumEventBytes) {
        return;
      }
      try {
        handler(JSON.parse(event.data));
      } catch {
        // Malformed events are rejected without replacing the last valid state.
      }
    }

    async function connect() {
      if (cancelled) {
        return;
      }

      dispatch({ type: "connecting" });
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener("open", () => {
        reconnectAttempt.current = 0;
      });

      eventSource.addEventListener("snapshot", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = rateEventSchema.safeParse(payload);
          if (parsed.success) {
            dispatch({
              type: "rate-batch",
              items: parsed.data.items,
              sequence: parsed.data.sequence,
              receivedAt: receivedAt(),
            });
          }
        }),
      );

      eventSource.addEventListener("rate", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = rateEventSchema.safeParse(payload);
          if (!parsed.success) {
            return;
          }
          dispatch({
            type: "rate-batch",
            items: parsed.data.items,
            sequence: parsed.data.sequence,
            receivedAt: receivedAt(),
          });
        }),
      );

      eventSource.addEventListener("source-snapshot", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = sourceSnapshotEventSchema.safeParse(payload);
          if (parsed.success) {
            dispatch({
              type: "source-snapshot",
              sources: parsed.data.sources,
              ...(parsed.data.sequence !== undefined
                ? { sequence: parsed.data.sequence }
                : {}),
              receivedAt: receivedAt(),
            });
          }
        }),
      );

      eventSource.addEventListener("source", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = sourceEventSchema.safeParse(payload);
          if (!parsed.success) {
            return;
          }
          dispatch({
            type: "source-batch",
            sources: parsed.data.sources,
            ...(parsed.data.sequence !== undefined
              ? { sequence: parsed.data.sequence }
              : {}),
            receivedAt: receivedAt(),
          });
        }),
      );

      eventSource.addEventListener("feed-status", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = feedStatusEventSchema.safeParse(payload);
          if (parsed.success) {
            dispatch({
              type: "feed-status",
              feedStatus: parsed.data.feedStatus,
              ...(parsed.data.sequence !== undefined
                ? { sequence: parsed.data.sequence }
                : {}),
              ...(parsed.data.serverTime
                ? { serverTime: parsed.data.serverTime }
                : {}),
              receivedAt: receivedAt(),
            });
          }
        }),
      );

      eventSource.onerror = () => {
        eventSource?.close();
        scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      if (cancelled) {
        return;
      }
      dispatch({ type: "reconnecting" });
      const attempt = Math.min(reconnectAttempt.current + 1, 6);
      reconnectAttempt.current = attempt;
      const delay = Math.min(1_000 * 2 ** attempt, 30_000);
      reconnectTimer = setTimeout(
        () => void loadSnapshot(true),
        delay,
      );
    }

    async function loadSnapshot(isReconnect = false) {
      dispatch({ type: "connecting" });
      try {
        const response = await fetch(snapshotUrl, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) {
          throw new Error("Snapshot unavailable");
        }
        const now = receivedAt();
        const parsed = rateSnapshotSchema.safeParse(
          await readBoundedJson(response, maximumSnapshotBytes),
        );
        if (
          !parsed.success ||
          !isRateSnapshotFresh(
            parsed.data.serverTime,
            now,
            staleThresholdMs,
          )
        ) {
          throw new Error("Snapshot contract rejected");
        }
        dispatch({
          type: "snapshot",
          snapshot: parsed.data,
          receivedAt: now,
        });
        void connect();
      } catch {
        dispatch({
          type: "unavailable",
          message:
            "No valid rate snapshot is available. Values are intentionally not shown.",
        });
        if (isReconnect) {
          scheduleReconnect();
        }
      }
    }

    void loadSnapshot();

    const staleInterval = setInterval(() => {
      dispatch({
        type: "stale",
        now: Date.now(),
        thresholdMs: staleThresholdMs,
      });
    }, 10_000);

    return () => {
      cancelled = true;
      eventSource?.close();
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      clearInterval(staleInterval);
    };
  }, []);

  const status = state.feedStatus
    ? normalizeFeedStatus(state.feedStatus)
    : null;
  const statusLabel = state.isStale
    ? "Stale"
    : state.connection === "live"
      ? status === "closed"
        ? "Market closed"
        : "Live"
      : state.connection === "reconnecting"
        ? "Reconnecting"
        : state.connection === "connecting"
          ? "Connecting"
          : "Unavailable";
  const marketStatusState =
    statusLabel === "Live"
      ? "live"
      : statusLabel === "Market closed"
        ? "closed"
        : statusLabel === "Unavailable"
          ? "paused"
          : "delayed";
  const marketStatusLabel =
    statusLabel === "Live"
      ? "Live data"
      : statusLabel === "Market closed"
        ? "Closed"
        : statusLabel === "Unavailable"
          ? "Paused"
          : "Delayed";

  const customerRows = useMemo(
    () =>
      customerRateDefinitions.map((definition) => ({
        ...definition,
        item: findMatchingRate(state.items, definition.aliases),
      })),
    [state.items],
  );
  const marketRows = useMemo(
    () =>
      marketRateDefinitions.map((definition) => ({
        ...definition,
        item: findMatchingRate(state.sources, definition.aliases),
      })),
    [state.sources],
  );

  function toggleRow(key: string) {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        trackAnalyticsEvent("rate_expand", { source_name: key });
      }
      return next;
    });
  }

  return (
    <div className={styles.pageShell}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {state.announcement}
      </p>

      {state.connection === "unavailable" ? (
        <p className={styles.unavailable} role="status">
          {state.announcement}
        </p>
      ) : null}

      <section className={styles.rateSection} aria-label="Live rates">
        <div className={styles.rateTableFrame}>
          <table
            className={styles.rateTable}
            aria-label="Live rates"
            aria-live="off"
          >
            <caption className="sr-only">Live silver rates</caption>
            <colgroup>
              <col className={styles.rateNameColumn} />
              <col className={styles.rateValueColumn} />
              <col className={styles.rateMovementColumn} />
            </colgroup>
            <thead className="sr-only">
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Rate</th>
                <th scope="col">Movement</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map((row) => (
                <tr key={row.key} className={styles.rateRow}>
                  <th
                    scope="row"
                    title={row.label}
                    className={`${styles.rateCell} ${styles.rateName}`}
                  >
                    <span className={styles.rateNameText}>{row.label}</span>
                  </th>
                  <td className={`${styles.rateCell} ${styles.rateValue}`}>
                    <FlashValue
                      value={extractRateValue(row.item)}
                      formatter={formatRupee}
                      variant="customer"
                    />
                  </td>
                  <td
                    className={`${styles.rateCell} ${styles.rateMovement}`}
                    data-direction={movementDirection(row.item)}
                  >
                    <Movement item={row.item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className={styles.marketSection}
        aria-labelledby="market-data-heading"
      >
        <div className={styles.marketHeadingRow}>
          <h2 id="market-data-heading" className={styles.marketHeading}>
            Market data
          </h2>
          <span
            className={styles.marketStatus}
            data-state={marketStatusState}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className={styles.marketStatusDot} aria-hidden="true" />
            <span>{marketStatusLabel}</span>
          </span>
        </div>

        <table className={styles.marketTable} aria-label="Market data table">
          <caption className="sr-only">Live MCX market data</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.marketNameColumn}>
                Commodity
              </th>
              <th scope="col" className={styles.marketNumberColumn}>
                Bid
              </th>
              <th scope="col" className={styles.marketNumberColumn}>
                Ask
              </th>
              <th scope="col" className={styles.marketNumberColumn}>
                High
              </th>
              <th scope="col" className={styles.marketNumberColumn}>
                Low
              </th>
            </tr>
          </thead>
          <tbody>
            {marketRows.map((row) => {
              const expanded = expandedRows.has(row.key);
              const bid =
                extractNumberLike(row.item?.bid) ??
                extractRateValue(row.item);
              const ask =
                extractNumberLike(row.item?.ask) ??
                extractRateValue(row.item);

              return (
                <tr key={row.key} className={styles.marketRow}>
                  <th scope="row" className={styles.marketName}>
                    <button
                      type="button"
                      className={styles.marketNameButton}
                      aria-expanded={expanded}
                      aria-label={`${expanded ? "Hide" : "Show"} ${row.label} high and low`}
                      title={row.label}
                      onClick={() => toggleRow(row.key)}
                    >
                      {row.label}
                    </button>
                  </th>
                  <td className={styles.marketNumber}>
                    <FlashValue
                      value={bid}
                      formatter={formatIndianNumber}
                      variant="market"
                    />
                    {expanded ? (
                      <span className={styles.marketInlineRange}>
                        <span className={styles.marketInlineLabel}>H</span>
                        {formatIndianNumber(
                          extractNumberLike(row.item?.high),
                        )}
                      </span>
                    ) : null}
                  </td>
                  <td className={styles.marketNumber}>
                    <FlashValue
                      value={ask}
                      formatter={formatIndianNumber}
                      variant="market"
                    />
                    {expanded ? (
                      <span className={styles.marketInlineRange}>
                        <span className={styles.marketInlineLabel}>L</span>
                        {formatIndianNumber(
                          extractNumberLike(row.item?.low),
                        )}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={`${styles.marketNumber} ${styles.marketRange}`}
                  >
                    {formatIndianNumber(
                      extractNumberLike(row.item?.high),
                    )}
                  </td>
                  <td
                    className={`${styles.marketNumber} ${styles.marketRange}`}
                  >
                    {formatIndianNumber(
                      extractNumberLike(row.item?.low),
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
