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
  type SourceItem,
} from "@/lib/rates/contract";
import {
  customerRateDefinitions,
  marketRateDefinitions,
} from "@/lib/rates/definitions";
import { formatIndianNumber, formatRateTime } from "@/lib/rates/format";
import { initialRateState, rateReducer } from "@/lib/rates/reducer";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { siteConfig } from "@/lib/site";

const snapshotUrl =
  process.env.NEXT_PUBLIC_DDAJEWELS_RATES_SNAPSHOT_URL ?? "";
const streamUrl = process.env.NEXT_PUBLIC_DDAJEWELS_RATES_STREAM_URL ?? "";
const staleThresholdMs = 90_000;
const maximumEventBytes = 64_000;
const maximumSnapshotBytes = 1_000_000;

function resolveRateEndpoint(value: string) {
  try {
    const url = new URL(value);
    const isDdaJewels =
      url.protocol === "https:" &&
      (url.hostname === "ddajewels.com" ||
        url.hostname.endsWith(".ddajewels.com"));
    const isLocalDevelopment =
      process.env.NODE_ENV === "development" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      (url.protocol === "http:" || url.protocol === "https:");
    return isDdaJewels || isLocalDevelopment ? url.toString() : null;
  } catch {
    return null;
  }
}

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

async function addPersonalizedTicket(url: string) {
  const allowedUrl = resolveRateEndpoint(url);
  if (!allowedUrl) {
    return null;
  }

  try {
    const response = await fetch("/api/rates/ticket", {
      method: "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return allowedUrl;
    }

    const payload = (await readBoundedJson(response, 16_000)) as {
      ticket?: unknown;
    };
    if (typeof payload.ticket !== "string" || payload.ticket.length < 20) {
      return allowedUrl;
    }

    const ticketedUrl = new URL(allowedUrl);
    ticketedUrl.searchParams.set("ticket", payload.ticket);
    return ticketedUrl.toString();
  } catch {
    return allowedUrl;
  }
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

function Movement({ item }: { item?: RateItem }) {
  const direction =
    item?.direction ??
    (item?.change && item.change > 0
      ? "up"
      : item?.change && item.change < 0
        ? "down"
        : "flat");

  if (direction === "up") {
    return (
      <span
        className="inline-flex items-center gap-1 text-sage"
        role="img"
        aria-label="Up"
      >
        <ArrowUpIcon size={15} aria-hidden="true" />
      </span>
    );
  }

  if (direction === "down") {
    return (
      <span
        className="inline-flex items-center gap-1 text-copper-dark"
        role="img"
        aria-label="Down"
      >
        <ArrowDownIcon size={15} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-ink-muted"
      role="img"
      aria-label="No movement"
    >
      <MinusIcon size={15} aria-hidden="true" />
    </span>
  );
}

export function RateExperience() {
  const [state, dispatch] = useReducer(rateReducer, initialRateState);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    if (!snapshotUrl || !streamUrl) {
      dispatch({
        type: "unavailable",
        message:
          "The DDAJewels rate endpoints have not been connected in this preview.",
      });
      return;
    }

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
      const resolvedStreamUrl = await addPersonalizedTicket(streamUrl);
      if (cancelled || !resolvedStreamUrl) {
        if (!cancelled) {
          dispatch({
            type: "unavailable",
            message: "The configured rate stream endpoint is not allowed.",
          });
        }
        return;
      }
      eventSource = new EventSource(resolvedStreamUrl);

      eventSource.addEventListener("open", () => {
        reconnectAttempt.current = 0;
      });

      eventSource.addEventListener("snapshot", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = rateSnapshotSchema.safeParse(payload);
          if (
            parsed.success &&
            isRateSnapshotFresh(
              parsed.data.serverTime,
              receivedAt(),
              staleThresholdMs,
            )
          ) {
            dispatch({
              type: "snapshot",
              snapshot: parsed.data,
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
          const item = parsed.data.item ?? parsed.data;
          if ("id" in item) {
            dispatch({
              type: "rate",
              item: item as RateItem,
              sequence: parsed.data.sequence,
              receivedAt: receivedAt(),
            });
          }
        }),
      );

      eventSource.addEventListener("source-snapshot", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = sourceSnapshotEventSchema.safeParse(payload);
          if (parsed.success) {
            dispatch({
              type: "source-snapshot",
              sources: parsed.data.sources,
              sequence: parsed.data.sequence,
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
          const source = parsed.data.source ?? parsed.data;
          if ("id" in source) {
            dispatch({
              type: "source",
              source: source as SourceItem,
              sequence: parsed.data.sequence,
              receivedAt: receivedAt(),
            });
          }
        }),
      );

      eventSource.addEventListener("feed-status", (event) =>
        parseEvent(event as MessageEvent<string>, (payload) => {
          const parsed = feedStatusEventSchema.safeParse(payload);
          if (parsed.success) {
            dispatch({
              type: "feed-status",
              feedStatus: parsed.data.feedStatus,
              sequence: parsed.data.sequence,
              serverTime: parsed.data.serverTime,
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
        const resolvedSnapshotUrl = await addPersonalizedTicket(snapshotUrl);
        if (!resolvedSnapshotUrl) {
          throw new Error("Snapshot endpoint is not allowed");
        }
        const response = await fetch(resolvedSnapshotUrl, {
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

      <section className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Customer rates</p>
            <h2 className="font-display mt-3 text-5xl font-semibold">
              Your rate view
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-ink-muted">
            Sign in through DDAJewels when personalized rate visibility is
            enabled for your account.
          </p>
        </div>

        <div className="mt-7 overflow-x-auto border-y border-line">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead className="sr-only">
              <tr>
                <th>Rate</th>
                <th>Movement</th>
                <th>Current value</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map((row) => (
                <tr key={row.key} className="border-b border-line last:border-b-0">
                  <th
                    scope="row"
                    className="py-5 pr-5 text-base font-bold"
                  >
                    {row.label}
                  </th>
                  <td className="w-20 py-5 text-center">
                    <Movement item={row.item} />
                  </td>
                  <td className="py-5 text-right font-display text-3xl font-semibold tabular-nums">
                    {formatIndianNumber(
                      extractRateValue(row.item),
                      row.item?.unit,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <p className="eyebrow">Market reference</p>
        <h2 className="font-display mt-3 text-5xl font-semibold">
          Source markets
        </h2>
        <div className="mt-7 overflow-x-auto border-y border-line">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <thead className="sr-only">
              <tr>
                <th>Market</th>
                <th>Movement</th>
                <th>Value</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {marketRows.map((row) => {
                const expanded = expandedRows.has(row.key);
                return (
                  <Fragment key={row.key}>
                    <tr className="border-b border-line">
                      <th scope="row" className="py-5 pr-5 font-bold">
                        {row.label}
                      </th>
                      <td className="w-20 py-5 text-center">
                        <Movement item={row.item} />
                      </td>
                      <td className="py-5 text-right font-display text-3xl font-semibold tabular-nums">
                        {formatIndianNumber(
                          extractRateValue(row.item),
                          row.item?.unit,
                        )}
                      </td>
                      <td className="w-20 py-5 text-right">
                        <button
                          type="button"
                          className="inline-flex size-11 items-center justify-center rounded-full border border-line"
                          aria-expanded={expanded}
                          aria-controls={`market-detail-${row.key}`}
                          aria-label={`${expanded ? "Hide" : "Show"} ${row.label} high and low`}
                          onClick={() => toggleRow(row.key)}
                        >
                          {expanded ? (
                            <CaretUpIcon size={18} aria-hidden="true" />
                          ) : (
                            <CaretDownIcon size={18} aria-hidden="true" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr
                        id={`market-detail-${row.key}`}
                        className="border-b border-line bg-white"
                      >
                        <td colSpan={4} className="px-5 py-5">
                          <dl className="grid grid-cols-2 gap-5 sm:max-w-md">
                            <div>
                              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                                High
                              </dt>
                              <dd className="mt-2 font-display text-2xl">
                                {formatIndianNumber(
                                  extractNumberLike(row.item?.high),
                                  row.item?.unit,
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
                                  row.item?.unit,
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
