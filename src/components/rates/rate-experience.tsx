"use client";

import {
  ChartLineIcon,
  CheckIcon,
  PencilSimpleIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
} from "react";

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
  type SourceItem,
} from "@/lib/rates/client-contract";
import {
  customerRateDefinitions,
  marketRateDefinitions,
} from "@/lib/rates/definitions";
import { formatIndianNumber } from "@/lib/rates/format";
import {
  clampRateFontSizeStep,
  createPersonalRateView,
  emptyPersonalRateView,
  flashStyleOrDefault,
  marketDataViewOrDefault,
  movePersonalRate,
  parsePersonalRateView,
  personalRateFontFamilyOrDefault,
  rateFontScale,
  reconcilePersonalRateView,
  type PersonalRateView,
  updatePersonalRateView,
} from "@/lib/rates/personal-view";
import { initialRateState, rateReducer } from "@/lib/rates/reducer";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

import { RateHistory } from "./rate-history";
import { PersonalSettingsDrawer } from "./personal-settings-drawer";
import styles from "./rate-experience.module.css";

const snapshotUrl = "/api/rates/snapshot";
const streamUrl = "/api/rates/stream";
const staleThresholdMs = 90_000;
const maximumEventBytes = 64_000;
const maximumSnapshotBytes = 1_000_000;
const personalViewStoragePrefix = "dda-silver:rates-view:";

type RateViewer = {
  id: string;
  isApproved: boolean;
  emailVerified: boolean;
  canViewCharts: boolean;
  canViewBuyingPrice: boolean;
};

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

function customerRateLabel(item: RateItem) {
  if (item.label ?? item.name) return item.label ?? item.name ?? item.id;
  const normalized = normalizeRateIdentifier(item.id);
  const definition = customerRateDefinitions.find((candidate) =>
    candidate.aliases.some(
      (alias) => normalizeRateIdentifier(alias) === normalized,
    ),
  );
  return definition?.label ?? item.id;
}

function buildCustomerRows(items: Record<string, RateItem>) {
  const liveItems = Object.values(items);
  if (liveItems.length > 0) {
    return liveItems.map((item) => ({
      key: item.id,
      label: customerRateLabel(item),
      item,
    }));
  }
  return customerRateDefinitions.map((definition) => ({
    key: definition.key,
    label: definition.label,
    item: findMatchingRate(items, definition.aliases),
  }));
}

function buildMarketRows(items: Record<string, SourceItem>) {
  const liveItems = Object.values(items);
  if (liveItems.length > 0) {
    return liveItems.map((item) => ({
      key: item.id,
      label: item.label ?? item.name ?? item.id,
      item,
    }));
  }
  return marketRateDefinitions.map((definition) => ({
    ...definition,
    item: findMatchingRate(items, definition.aliases),
  }));
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
  flashStyle,
  value,
  variant,
}: {
  formatter: (value: number | null) => string;
  flashStyle: "soft" | "bold";
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
    const timer = setTimeout(
      () => setDirection("none"),
      flashStyle === "bold" ? 1_500 : 700,
    );
    return () => clearTimeout(timer);
  }, [flashStyle, value]);

  return (
    <span
      className={
        variant === "customer" ? styles.flashRate : styles.sourceFlashNumber
      }
      data-flash={direction}
      data-flash-style={flashStyle}
    >
      {formatter(value)}
    </span>
  );
}

function Premium({ item }: { item?: RateItem }) {
  const premium = item?.premiumBreakdown?.total ?? item?.premiumTotal;
  if (premium === null || premium === undefined) return null;
  const sign = premium >= 0 ? "+" : "−";
  const text = `${sign}₹${formatIndianNumber(Math.abs(premium))}`;
  const title = item?.premiumBreakdown
    ? `L1 + L2 adjustment in ${formatUnit(item.premiumBreakdown.unit)}`
    : "L1 + L2 adjustment applied to the raw feed rate";
  return (
    <details className={styles.premiumDisclosure}>
      <summary aria-label="Show price adjustment breakdown">{text}</summary>
      <span>{title}</span>
    </details>
  );
}

function formatUnit(unit: string) {
  if (unit === "PER_GRAM") return "per gram";
  if (unit === "PER_10_GRAM") return "per 10 gram";
  if (unit === "PER_KG") return "per kg";
  return unit;
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
  const [viewer, setViewer] = useState<RateViewer | null>(null);
  const [personalView, setPersonalView] = useState<PersonalRateView>(
    emptyPersonalRateView,
  );
  const [personalViewOwner, setPersonalViewOwner] = useState<string | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [headerActionTargets, setHeaderActionTargets] = useState<HTMLElement[]>(
    [],
  );
  const [draggedRateId, setDraggedRateId] = useState<string | null>(null);
  const reconnectAttempt = useRef(0);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHeaderActionTargets(
        Array.from(
          document.querySelectorAll<HTMLElement>("[data-rates-header-actions]"),
        ),
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const authorized = Boolean(
    viewer?.isApproved && viewer.emailVerified,
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as {
          user?: Partial<RateViewer> | null;
        };
        const user = payload.user;
        if (
          !user ||
          typeof user.id !== "string" ||
          user.isApproved !== true ||
          user.emailVerified !== true
        ) {
          return null;
        }
        return {
          id: user.id,
          isApproved: true,
          emailVerified: true,
          canViewCharts: user.canViewCharts === true,
          canViewBuyingPrice: user.canViewBuyingPrice === true,
        } satisfies RateViewer;
      })
      .then((nextViewer) => {
        if (controller.signal.aborted) return;
        setViewer(nextViewer);
        if (!nextViewer) {
          setPersonalView(emptyPersonalRateView);
          setPersonalViewOwner(null);
          setIsEditing(false);
          setSettingsOpen(false);
          return;
        }
        let stored = emptyPersonalRateView;
        try {
          stored = parsePersonalRateView(
            window.localStorage.getItem(
              `${personalViewStoragePrefix}${nextViewer.id}`,
            ),
          );
        } catch {
          // Storage may be disabled; the in-memory view still works.
        }
        setPersonalView(stored);
        setPersonalViewOwner(nextViewer.id);
      })
      .catch(() => {
        if (!controller.signal.aborted) setViewer(null);
      });
    return () => controller.abort();
  }, []);

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
              type: "rate-snapshot",
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

  const defaultCustomerRows = buildCustomerRows(state.items);
  const availableRateIds = defaultCustomerRows.map((row) => row.key);
  const effectivePersonalView = reconcilePersonalRateView(
    personalView,
    availableRateIds,
  );
  const customerRowById = new Map(
    defaultCustomerRows.map((row) => [row.key, row]),
  );
  const customerRows = authorized
    ? effectivePersonalView.order.flatMap((id) => {
        const row = customerRowById.get(id);
        return row ? [row] : [];
      })
    : defaultCustomerRows;
  const hiddenCustomerRows = effectivePersonalView.hidden.flatMap((id) => {
    const row = customerRowById.get(id);
    return row ? [row] : [];
  });
  const hasBuyingRates = Boolean(
    viewer?.canViewBuyingPrice &&
      Object.values(state.items).some(
        (item) => item.buyingRate !== undefined && item.buyingRate !== null,
      ),
  );
  const showBuyingRates = hasBuyingRates && personalView.hideBuyingColumn !== true;
  const marketRows = buildMarketRows(state.sources);
  const fontSizeStep = clampRateFontSizeStep(personalView.rateFontSizeStep);
  const marketFontSizeStep = clampRateFontSizeStep(
    personalView.marketDataFontSizeStep,
  );
  const fontScale = rateFontScale(fontSizeStep);
  const fontFamily = personalRateFontFamilyOrDefault(
    personalView.rateFontFamily,
  );
  const marketDataView = marketDataViewOrDefault(personalView.marketDataView);
  const flashStyle = flashStyleOrDefault(personalView.flashStyle);
  const valueFontFamily =
    fontFamily === "serif"
      ? 'ui-serif, Georgia, Cambria, "Times New Roman", serif'
      : fontFamily === "mono"
        ? 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace'
        : "var(--font-manrope), system-ui, sans-serif";
  const rateSectionStyle = {
    "--rate-font-scale": fontScale,
    "--rate-value-font": valueFontFamily,
    "--rate-table-max-width": `${920 + Math.max(0, fontSizeStep) * 72}px`,
  } as CSSProperties;
  const marketSectionStyle = {
    "--source-table-font-scale": 0.82 * rateFontScale(marketFontSizeStep),
    "--source-value-font": valueFontFamily,
  } as CSSProperties;
  const visibleHistoryItems = Object.fromEntries(
    customerRows.flatMap((row) => (row.item ? [[row.key, row.item]] : [])),
  );

  useEffect(() => {
    if (!personalViewOwner) return;
    try {
      window.localStorage.setItem(
        `${personalViewStoragePrefix}${personalViewOwner}`,
        JSON.stringify(personalView),
      );
    } catch {
      // Storage may be disabled; keep the current session's arrangement.
    }
  }, [personalView, personalViewOwner]);

  function moveRate(activeId: string, overId: string) {
    setPersonalView((current) =>
      updatePersonalRateView(current, {
        order: movePersonalRate(
          reconcilePersonalRateView(current, availableRateIds).order,
          activeId,
          overId,
        ),
      }),
    );
  }

  function hideRate(id: string) {
    setPersonalView((current) => {
      const reconciled = reconcilePersonalRateView(current, availableRateIds);
      return updatePersonalRateView(current, {
        order: reconciled.order.filter((value) => value !== id),
        hidden: [...reconciled.hidden.filter((value) => value !== id), id],
      });
    });
  }

  function restoreRate(id: string) {
    setPersonalView((current) => {
      const reconciled = reconcilePersonalRateView(current, availableRateIds);
      return updatePersonalRateView(current, {
        order: [...reconciled.order, id],
        hidden: reconciled.hidden.filter((value) => value !== id),
      });
    });
  }

  function resetPersonalView() {
    setPersonalView(
      createPersonalRateView({ order: [...availableRateIds], hidden: [] }),
    );
  }

  function updatePreference(patch: Partial<PersonalRateView>) {
    setPersonalView((current) => updatePersonalRateView(current, patch));
  }

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
      {authorized
        ? headerActionTargets.map((target) =>
            createPortal(
              <RatesHeaderControls
                chartsOpen={chartsOpen}
                canViewCharts={viewer?.canViewCharts === true}
                isEditing={isEditing}
                settingsOpen={settingsOpen}
                onToggleCharts={() =>
                  setChartsOpen((current) => !current)
                }
                onToggleEditing={() => {
                  setIsEditing((current) => !current);
                  trackAnalyticsEvent("rate_expand", {
                    source_name: "personalize",
                  });
                }}
                onOpenSettings={() => {
                  setIsEditing(true);
                  setSettingsOpen(true);
                }}
              />,
              target,
              target.dataset.ratesHeaderActions,
            ),
          )
        : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {state.announcement}
      </p>

      {state.connection === "unavailable" ? (
        <p className={styles.unavailable} role="status">
          {state.announcement}
        </p>
      ) : null}

      <section
        className={styles.rateSection}
        aria-label="Live rates"
        style={rateSectionStyle}
      >
        <div className={styles.rateTableFrame}>
          <table
            className={styles.rateTable}
            aria-label="Live rates"
            aria-live="off"
            data-buying={showBuyingRates}
            data-editing={isEditing}
          >
            <caption className="sr-only">Live silver rates</caption>
            <colgroup>
              <col className={styles.rateNameColumn} />
              {showBuyingRates ? (
                <col className={styles.rateValueColumn} />
              ) : null}
              <col className={styles.rateValueColumn} />
              <col className={styles.rateMovementColumn} />
              {isEditing ? <col className={styles.rateEditColumn} /> : null}
            </colgroup>
            <thead className="sr-only">
              <tr>
                <th scope="col">Item</th>
                {showBuyingRates ? <th scope="col">Buy</th> : null}
                <th scope="col">Rate</th>
                <th scope="col">Movement</th>
                {isEditing ? <th scope="col">Arrange</th> : null}
              </tr>
            </thead>
            <tbody>
              {customerRows.map((row, index) => (
                <tr
                  key={row.key}
                  className={styles.rateRow}
                  draggable={isEditing}
                  data-dragging={draggedRateId === row.key}
                  onDragStart={() => setDraggedRateId(row.key)}
                  onDragEnd={() => setDraggedRateId(null)}
                  onDragOver={(event) => {
                    if (isEditing) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedRateId) moveRate(draggedRateId, row.key);
                    setDraggedRateId(null);
                  }}
                >
                  <th
                    scope="row"
                    title={row.label}
                    className={`${styles.rateCell} ${styles.rateName}`}
                  >
                    <span className={styles.rateNameText}>{row.label}</span>
                    {authorized ? <Premium item={row.item} /> : null}
                  </th>
                  {showBuyingRates ? (
                    <td className={`${styles.rateCell} ${styles.buyingValue}`}>
                      <span className={styles.buyingLabel}>BUY</span>
                      <FlashValue
                        value={extractNumberLike(row.item?.buyingRate)}
                        formatter={formatRupee}
                        flashStyle={flashStyle}
                        variant="customer"
                      />
                    </td>
                  ) : null}
                  <td className={`${styles.rateCell} ${styles.rateValue}`}>
                    <FlashValue
                      value={extractRateValue(row.item)}
                      formatter={formatRupee}
                      flashStyle={flashStyle}
                      variant="customer"
                    />
                  </td>
                  <td
                    className={`${styles.rateCell} ${styles.rateMovement}`}
                    data-direction={movementDirection(row.item)}
                  >
                    <Movement item={row.item} />
                  </td>
                  {isEditing ? (
                    <td className={`${styles.rateCell} ${styles.rateEdit}`}>
                      <div className={styles.rateEditActions}>
                        <button
                          type="button"
                          className={styles.rateEditButton}
                          aria-label={`Move ${row.label} up`}
                          disabled={index === 0}
                          onClick={() => {
                            const previous = customerRows[index - 1];
                            if (previous) moveRate(row.key, previous.key);
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={styles.rateEditButton}
                          aria-label={`Move ${row.label} down`}
                          disabled={index === customerRows.length - 1}
                          onClick={() => {
                            const next = customerRows[index + 1];
                            if (next) moveRate(row.key, next.key);
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={styles.rateEditButton}
                          aria-label={`Hide ${row.label}`}
                          onClick={() => hideRate(row.key)}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isEditing && hiddenCustomerRows.length > 0 ? (
          <div className={styles.hiddenRates}>
            <h2 className={styles.hiddenRatesHeading}>
              Hidden items ({hiddenCustomerRows.length})
            </h2>
            <div className={styles.hiddenRateList}>
              {hiddenCustomerRows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  className={styles.hiddenRateButton}
                  onClick={() => restoreRate(row.key)}
                >
                  + {row.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <RateHistory
        authorized={authorized && viewer?.canViewCharts === true}
        items={visibleHistoryItems}
        open={chartsOpen}
      />

      <section
        className={styles.marketSection}
        aria-labelledby="market-data-heading"
        style={marketSectionStyle}
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

        {marketDataView === "cards" ? (
          <div className={styles.marketCards} aria-label="Market data cards">
            {marketRows.map((row) => {
              const bid =
                extractNumberLike(row.item?.bid) ?? extractRateValue(row.item);
              const ask =
                extractNumberLike(row.item?.ask) ?? extractRateValue(row.item);
              return (
                <article key={row.key} className={styles.marketCard}>
                  <h3>{row.label}</h3>
                  <dl>
                    <div>
                      <dt>Bid</dt>
                      <dd>
                        <FlashValue
                          value={bid}
                          formatter={formatIndianNumber}
                          flashStyle={flashStyle}
                          variant="market"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt>Ask</dt>
                      <dd>
                        <FlashValue
                          value={ask}
                          formatter={formatIndianNumber}
                          flashStyle={flashStyle}
                          variant="market"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt>High</dt>
                      <dd>{formatIndianNumber(extractNumberLike(row.item?.high))}</dd>
                    </div>
                    <div>
                      <dt>Low</dt>
                      <dd>{formatIndianNumber(extractNumberLike(row.item?.low))}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        ) : (
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
                      flashStyle={flashStyle}
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
                      flashStyle={flashStyle}
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
        )}
      </section>

      <PersonalSettingsDrawer
        open={settingsOpen}
        onClose={closeSettings}
        fontFamily={fontFamily}
        fontSizeStep={fontSizeStep}
        onFontFamilyChange={(value) =>
          updatePreference({ rateFontFamily: value })
        }
        onFontSizeStepChange={(value) =>
          updatePreference({ rateFontSizeStep: value })
        }
        hasBuyingRates={hasBuyingRates}
        hideBuyingColumn={personalView.hideBuyingColumn === true}
        onToggleBuyingColumn={() =>
          updatePreference({
            hideBuyingColumn: personalView.hideBuyingColumn !== true,
          })
        }
        marketDataView={marketDataView}
        onMarketDataViewChange={(value) =>
          updatePreference({ marketDataView: value })
        }
        marketDataFontSizeStep={marketFontSizeStep}
        onMarketDataFontSizeStepChange={(value) =>
          updatePreference({ marketDataFontSizeStep: value })
        }
        flashStyle={flashStyle}
        onFlashStyleChange={(value) => updatePreference({ flashStyle: value })}
        onReset={resetPersonalView}
        onDone={() => {
          setSettingsOpen(false);
          setIsEditing(false);
        }}
      />
    </div>
  );
}

function RatesHeaderControls({
  canViewCharts,
  chartsOpen,
  isEditing,
  settingsOpen,
  onOpenSettings,
  onToggleCharts,
  onToggleEditing,
}: {
  canViewCharts: boolean;
  chartsOpen: boolean;
  isEditing: boolean;
  settingsOpen: boolean;
  onOpenSettings: () => void;
  onToggleCharts: () => void;
  onToggleEditing: () => void;
}) {
  const editLabel = isEditing ? "Finish editing rates table" : "Edit rates table";
  const chartLabel = chartsOpen
    ? "Hide rate history chart"
    : "Show rate history chart";
  const buttonClass =
    "inline-flex size-10 items-center justify-center rounded-full border border-line bg-paper-strong text-ink transition-colors hover:border-copper hover:text-copper-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

  return (
    <div className="flex items-center gap-1" aria-label="Rate controls">
      <button
        type="button"
        className={`${buttonClass} ${isEditing ? "border-copper bg-copper/10 text-copper-dark" : ""}`}
        aria-label={editLabel}
        aria-pressed={isEditing}
        title={editLabel}
        onClick={onToggleEditing}
      >
        {isEditing ? (
          <CheckIcon size={19} weight="bold" aria-hidden="true" />
        ) : (
          <PencilSimpleIcon size={19} aria-hidden="true" />
        )}
      </button>
      {canViewCharts ? (
        <button
          type="button"
          className={`${buttonClass} ${chartsOpen ? "border-copper bg-copper/10 text-copper-dark" : ""}`}
          aria-label={chartLabel}
          aria-pressed={chartsOpen}
          title={chartLabel}
          onClick={onToggleCharts}
        >
          <ChartLineIcon size={19} aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        className={`${buttonClass} ${settingsOpen ? "border-copper bg-copper/10 text-copper-dark" : ""}`}
        aria-label="Open display settings"
        aria-expanded={settingsOpen}
        title="Display settings"
        onClick={onOpenSettings}
      >
        <SlidersHorizontalIcon size={19} aria-hidden="true" />
      </button>
    </div>
  );
}
