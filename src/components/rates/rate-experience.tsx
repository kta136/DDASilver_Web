"use client";

import {
  ArrowDownIcon,
  ArrowSquareOutIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CaretUpIcon,
  MinusIcon,
} from "@phosphor-icons/react";
import {
  Fragment,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  extractRateValue,
  extractNumberLike,
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
import { formatIndianNumber, formatRateTime } from "@/lib/rates/format";
import { initialRateState, rateReducer } from "@/lib/rates/reducer";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { siteConfig } from "@/lib/site";

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

function Movement({ item }: { item?: RateItem }) {
  const direction =
    item?.direction ??
    (item?.change && item.change > 0
      ? "up"
      : item?.change && item.change < 0
        ? "down"
        : "flat");

  const change =
    typeof item?.change === "number" && Number.isFinite(item.change)
      ? Math.abs(item.change)
      : null;
  const amount = formatRupee(change);

  if (direction === "up") {
    return (
      <span
        className="inline-flex items-center justify-end gap-2 text-sage"
        role="img"
        aria-label={`Up ${amount}`}
      >
        <ArrowUpIcon size={15} aria-hidden="true" />
        <span className="tabular-nums">{amount}</span>
      </span>
    );
  }

  if (direction === "down") {
    return (
      <span
        className="inline-flex items-center justify-end gap-2 text-copper-dark"
        role="img"
        aria-label={`Down ${amount}`}
      >
        <ArrowDownIcon size={15} aria-hidden="true" />
        <span className="tabular-nums">{amount}</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-end gap-2 text-ink-muted"
      role="img"
      aria-label={`No movement ${amount}`}
    >
      <MinusIcon size={15} aria-hidden="true" />
      <span className="tabular-nums">{amount}</span>
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
    <div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {state.announcement}
      </p>

      <div className="flex flex-col gap-4 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`size-2.5 rounded-full ${
              statusLabel === "Live" ? "bg-sage" : "bg-copper"
            }`}
            aria-hidden="true"
          />
          <p className="text-sm font-bold">{statusLabel}</p>
        </div>
        <p className="text-sm text-ink-muted">
          Last updated: {formatRateTime(state.serverTime)}
        </p>
      </div>

      {state.connection === "unavailable" ? (
        <div
          className="mt-6 border border-copper/35 bg-[#fff7f4] p-5 text-sm leading-6 text-ink-muted"
          role="status"
        >
          {state.announcement}
        </div>
      ) : null}

      <section className="mt-10" aria-labelledby="customer-rates-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Customer rates</p>
            <h2
              id="customer-rates-heading"
              className="font-display mt-3 text-5xl font-semibold"
            >
              Today&apos;s rates
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-ink-muted">
            Current showroom reference rates from the authoritative DDAJewels
            feed.
          </p>
        </div>

        <div className="mt-7 overflow-hidden border border-line bg-white">
          <table className="w-full table-fixed border-collapse text-left sm:table-auto">
            <colgroup>
              <col className="w-[38%] sm:w-auto" />
              <col className="w-[39%] sm:w-auto" />
              <col className="w-[23%] sm:w-32" />
            </colgroup>
            <thead className="sr-only">
              <tr>
                <th>Rate</th>
                <th>Current value</th>
                <th>Movement</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map((row) => (
                <tr key={row.key} className="border-b border-line last:border-b-0">
                  <th
                    scope="row"
                    className="px-3 py-4 text-base font-bold sm:px-5 sm:py-5 sm:text-lg"
                  >
                    {row.label}
                  </th>
                  <td className="px-2 py-4 text-right font-display text-xl font-semibold tabular-nums sm:px-5 sm:py-5 sm:text-3xl">
                    {formatRupee(extractRateValue(row.item))}
                  </td>
                  <td className="w-auto px-3 py-4 text-right text-xs font-semibold sm:w-32 sm:px-5 sm:py-5 sm:text-sm">
                    <Movement item={row.item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="market-data-heading">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Market reference</p>
            <h2
              id="market-data-heading"
              className="font-display mt-3 text-5xl font-semibold"
            >
              Market data
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${
              statusLabel === "Live" ? "text-sage" : "text-copper-dark"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                statusLabel === "Live" ? "bg-sage" : "bg-copper"
              }`}
              aria-hidden="true"
            />
            {statusLabel}
          </span>
        </div>
        <div className="mt-7 overflow-hidden border border-line bg-white">
          <table className="w-full table-fixed border-collapse text-left sm:table-auto">
            <colgroup>
              <col className="w-[40%] sm:w-auto" />
              <col className="w-[30%] sm:w-auto" />
              <col className="w-[30%] sm:w-auto" />
              <col className="sm:w-auto" />
              <col className="sm:w-auto" />
            </colgroup>
            <thead className="bg-[#f6f3ef] text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              <tr className="border-b border-line">
                <th scope="col" className="px-3 py-4 sm:px-4">
                  Commodity
                </th>
                <th scope="col" className="px-2 py-4 text-right sm:px-4">
                  Bid
                </th>
                <th scope="col" className="px-2 py-4 text-right sm:px-4">
                  Ask
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-4 text-right sm:table-cell"
                >
                  High
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-4 text-right sm:table-cell"
                >
                  Low
                </th>
              </tr>
            </thead>
            <tbody>
              {marketRows.map((row) => {
                const expanded = expandedRows.has(row.key);
                return (
                  <Fragment key={row.key}>
                    <tr className="border-b border-line">
                      <th
                        scope="row"
                        className="px-3 py-4 text-sm font-bold sm:px-4 sm:py-5 sm:text-base"
                      >
                        <span>{row.label}</span>
                        <button
                          type="button"
                          className="ml-1 inline-flex size-7 items-center justify-center rounded-full border border-line align-middle sm:hidden"
                          aria-expanded={expanded}
                          aria-controls={`market-detail-${row.key}`}
                          aria-label={`${expanded ? "Hide" : "Show"} ${row.label} high and low`}
                          onClick={() => toggleRow(row.key)}
                        >
                          {expanded ? (
                            <CaretUpIcon size={16} aria-hidden="true" />
                          ) : (
                            <CaretDownIcon size={16} aria-hidden="true" />
                          )}
                        </button>
                      </th>
                      <td className="px-2 py-4 text-right font-display text-base font-semibold tabular-nums sm:px-4 sm:py-5 sm:text-2xl">
                        {formatIndianNumber(
                          extractNumberLike(row.item?.bid) ??
                            extractRateValue(row.item),
                        )}
                      </td>
                      <td className="px-2 py-4 text-right font-display text-base font-semibold tabular-nums sm:px-4 sm:py-5 sm:text-2xl">
                        {formatIndianNumber(
                          extractNumberLike(row.item?.ask) ??
                            extractRateValue(row.item),
                        )}
                      </td>
                      <td className="hidden px-4 py-5 text-right font-display text-2xl text-ink-muted tabular-nums sm:table-cell">
                        {formatIndianNumber(
                          extractNumberLike(row.item?.high),
                        )}
                      </td>
                      <td className="hidden px-4 py-5 text-right font-display text-2xl text-ink-muted tabular-nums sm:table-cell">
                        {formatIndianNumber(
                          extractNumberLike(row.item?.low),
                        )}
                      </td>
                    </tr>
                    {expanded ? (
                      <tr
                        id={`market-detail-${row.key}`}
                        className="border-b border-line bg-[#f6f3ef] sm:hidden"
                      >
                        <td colSpan={3} className="px-5 py-5">
                          <dl className="grid grid-cols-2 gap-5">
                            <div>
                              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                                High
                              </dt>
                              <dd className="mt-2 font-display text-2xl">
                                {formatIndianNumber(
                                  extractNumberLike(row.item?.high),
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                                Low
                              </dt>
                              <dd className="mt-2 font-display text-2xl">
                                {formatIndianNumber(
                                  extractNumberLike(row.item?.low),
                                )}
                              </dd>
                            </div>
                          </dl>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a
          href={siteConfig.tvUrl}
          target="_blank"
          rel="noreferrer"
          className="button-secondary no-underline"
        >
          Open DDAJewels TV display
          <ArrowSquareOutIcon size={18} aria-hidden="true" />
        </a>
        <a
          href="/rates-disclaimer"
          className="button-quiet no-underline"
        >
          Read the rates disclaimer
        </a>
      </div>
    </div>
  );
}
