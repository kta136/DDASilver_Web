import type {
  FeedStatus,
  RateItem,
  RateSnapshot,
  SourceItem,
} from "@/lib/rates/contract";

export type RateConnection =
  | "idle"
  | "connecting"
  | "live"
  | "reconnecting"
  | "unavailable";

export type RateState = {
  sequence: number;
  view: string | null;
  serverTime: string | null;
  items: Record<string, RateItem>;
  sources: Record<string, SourceItem>;
  itemUpdatedAt: Record<string, number>;
  sourceUpdatedAt: Record<string, number>;
  feedStatus: FeedStatus | null;
  connection: RateConnection;
  isStale: boolean;
  lastValidEventAt: number | null;
  announcement: string;
};

export const initialRateState: RateState = {
  sequence: -1,
  view: null,
  serverTime: null,
  items: {},
  sources: {},
  itemUpdatedAt: {},
  sourceUpdatedAt: {},
  feedStatus: null,
  connection: "idle",
  isStale: false,
  lastValidEventAt: null,
  announcement: "Live rate connection has not started.",
};

export type RateAction =
  | { type: "connecting" }
  | { type: "snapshot"; snapshot: RateSnapshot; receivedAt: number }
  | { type: "rate"; item: RateItem; sequence: number; receivedAt: number }
  | {
      type: "rate-batch";
      items: RateItem[];
      sequence: number;
      receivedAt: number;
    }
  | {
      type: "rate-snapshot";
      items: RateItem[];
      sequence: number;
      receivedAt: number;
    }
  | {
      type: "source-snapshot";
      sources: SourceItem[];
      sequence?: number;
      receivedAt: number;
    }
  | {
      type: "source";
      source: SourceItem;
      sequence?: number;
      receivedAt: number;
    }
  | {
      type: "source-batch";
      sources: SourceItem[];
      sequence?: number;
      receivedAt: number;
    }
  | {
      type: "feed-status";
      feedStatus: FeedStatus;
      sequence?: number;
      serverTime?: string;
      receivedAt: number;
    }
  | { type: "reconnecting" }
  | { type: "unavailable"; message?: string }
  | { type: "stale"; now: number; thresholdMs: number };

function mapById<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function mapUpdatedAt<T extends { id: string }>(items: T[], receivedAt: number) {
  return Object.fromEntries(items.map((item) => [item.id, receivedAt]));
}

function mergeById<T extends { id: string }>(
  existing: Record<string, T>,
  items: T[],
) {
  const next = { ...existing };
  for (const item of items) {
    next[item.id] = { ...next[item.id], ...item };
  }
  return next;
}

function mergeRateItems(
  existing: Record<string, RateItem>,
  items: RateItem[],
) {
  const next = { ...existing };
  for (const item of items) {
    const merged = { ...next[item.id], ...item };
    if (
      Object.prototype.hasOwnProperty.call(item, "premiumTotal") &&
      !Object.prototype.hasOwnProperty.call(item, "premiumBreakdown")
    ) {
      delete merged.premiumBreakdown;
    }
    next[item.id] = merged;
  }
  return next;
}

function oldestFinancialUpdate(
  itemUpdatedAt: Record<string, number>,
  sourceUpdatedAt: Record<string, number>,
) {
  const timestamps = [
    ...Object.values(itemUpdatedAt),
    ...Object.values(sourceUpdatedAt),
  ];
  return timestamps.length > 0 ? Math.min(...timestamps) : null;
}

function shouldIgnoreSequence(state: RateState, sequence: number) {
  return sequence <= state.sequence;
}

export function rateReducer(
  state: RateState,
  action: RateAction,
): RateState {
  switch (action.type) {
    case "connecting":
      return {
        ...state,
        connection: "connecting",
        announcement: "Connecting to the live rate feed.",
      };
    case "snapshot":
      if (shouldIgnoreSequence(state, action.snapshot.sequence)) {
        return state;
      }
      return {
        sequence: action.snapshot.sequence,
        view: action.snapshot.view,
        serverTime: action.snapshot.serverTime,
        items: mapById(action.snapshot.items),
        sources: mapById(action.snapshot.sources),
        itemUpdatedAt: mapUpdatedAt(
          action.snapshot.items,
          action.receivedAt,
        ),
        sourceUpdatedAt: mapUpdatedAt(
          action.snapshot.sources,
          action.receivedAt,
        ),
        feedStatus: action.snapshot.feedStatus,
        connection: "live",
        isStale: false,
        lastValidEventAt: action.receivedAt,
        announcement: "Live rates connected and updated.",
      };
    case "rate":
      if (shouldIgnoreSequence(state, action.sequence)) {
        return state;
      }
      const nextItemUpdatedAt = {
        ...state.itemUpdatedAt,
        [action.item.id]: action.receivedAt,
      };
      return {
        ...state,
        sequence: action.sequence,
        items: mergeRateItems(state.items, [action.item]),
        itemUpdatedAt: nextItemUpdatedAt,
        connection: "live",
        lastValidEventAt: oldestFinancialUpdate(
          nextItemUpdatedAt,
          state.sourceUpdatedAt,
        ),
        announcement: `${action.item.label ?? action.item.name ?? "A customer rate"} updated.`,
      };
    case "rate-batch": {
      if (shouldIgnoreSequence(state, action.sequence)) {
        return state;
      }
      const batchUpdatedAt = {
        ...state.itemUpdatedAt,
        ...mapUpdatedAt(action.items, action.receivedAt),
      };
      return {
        ...state,
        sequence: action.sequence,
        items: mergeRateItems(state.items, action.items),
        itemUpdatedAt: batchUpdatedAt,
        connection: "live",
        lastValidEventAt: oldestFinancialUpdate(
          batchUpdatedAt,
          state.sourceUpdatedAt,
        ),
        announcement: "Customer rates updated.",
      };
    }
    case "rate-snapshot": {
      if (action.sequence < state.sequence) {
        return state;
      }
      const snapshotUpdatedAt = mapUpdatedAt(
        action.items,
        action.receivedAt,
      );
      return {
        ...state,
        sequence: action.sequence,
        items: mapById(action.items),
        itemUpdatedAt: snapshotUpdatedAt,
        connection: "live",
        lastValidEventAt: oldestFinancialUpdate(
          snapshotUpdatedAt,
          state.sourceUpdatedAt,
        ),
        announcement: "Customer rates refreshed.",
      };
    }
    case "source-snapshot":
      if (
        action.sequence !== undefined &&
        shouldIgnoreSequence(state, action.sequence)
      ) {
        return state;
      }
      const nextSourceSnapshotUpdatedAt = mapUpdatedAt(
        action.sources,
        action.receivedAt,
      );
      return {
        ...state,
        sequence: action.sequence ?? state.sequence,
        sources: mapById(action.sources),
        sourceUpdatedAt: nextSourceSnapshotUpdatedAt,
        connection: "live",
        lastValidEventAt: oldestFinancialUpdate(
          state.itemUpdatedAt,
          nextSourceSnapshotUpdatedAt,
        ),
        announcement: "Market rates updated.",
      };
    case "source":
      if (
        action.sequence !== undefined &&
        shouldIgnoreSequence(state, action.sequence)
      ) {
        return state;
      }
      const nextSourceUpdatedAt = {
        ...state.sourceUpdatedAt,
        [action.source.id]: action.receivedAt,
      };
      return {
        ...state,
        sequence: action.sequence ?? state.sequence,
        sources: mergeById(state.sources, [action.source]),
        sourceUpdatedAt: nextSourceUpdatedAt,
        connection: "live",
        lastValidEventAt: oldestFinancialUpdate(
          state.itemUpdatedAt,
          nextSourceUpdatedAt,
        ),
        announcement: `${action.source.label ?? action.source.name ?? "A market rate"} updated.`,
      };
    case "source-batch": {
      if (
        action.sequence !== undefined &&
        shouldIgnoreSequence(state, action.sequence)
      ) {
        return state;
      }
      const sourceBatchUpdatedAt = {
        ...state.sourceUpdatedAt,
        ...mapUpdatedAt(action.sources, action.receivedAt),
      };
      return {
        ...state,
        sequence: action.sequence ?? state.sequence,
        sources: mergeById(state.sources, action.sources),
        sourceUpdatedAt: sourceBatchUpdatedAt,
        connection: "live",
        lastValidEventAt: oldestFinancialUpdate(
          state.itemUpdatedAt,
          sourceBatchUpdatedAt,
        ),
        announcement: "Market rates updated.",
      };
    }
    case "feed-status":
      if (
        action.sequence !== undefined &&
        shouldIgnoreSequence(state, action.sequence)
      ) {
        return state;
      }
      return {
        ...state,
        sequence: action.sequence ?? state.sequence,
        serverTime: action.serverTime ?? state.serverTime,
        feedStatus: action.feedStatus,
        connection: "live",
        announcement: "Rate feed status updated.",
      };
    case "reconnecting":
      return {
        ...state,
        connection: "reconnecting",
        announcement: "Live rate connection lost. Reconnecting.",
      };
    case "unavailable":
      return {
        ...state,
        connection: "unavailable",
        announcement:
          action.message ?? "Live rates are temporarily unavailable.",
      };
    case "stale": {
      const isStale =
        state.lastValidEventAt !== null &&
        action.now - state.lastValidEventAt >= action.thresholdMs;
      if (isStale === state.isStale) {
        return state;
      }
      return {
        ...state,
        isStale,
        announcement: isStale
          ? "Live rate data may be stale."
          : "Live rate data is current.",
      };
    }
  }
}
