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
      type: "source-snapshot";
      sources: SourceItem[];
      sequence: number;
      receivedAt: number;
    }
  | {
      type: "source";
      source: SourceItem;
      sequence: number;
      receivedAt: number;
    }
  | {
      type: "feed-status";
      feedStatus: FeedStatus;
      sequence: number;
      serverTime?: string;
      receivedAt: number;
    }
  | { type: "reconnecting" }
  | { type: "unavailable"; message?: string }
  | { type: "stale"; now: number; thresholdMs: number };

function mapById<T extends { id: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
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
      return {
        ...state,
        sequence: action.sequence,
        items: { ...state.items, [action.item.id]: action.item },
        connection: "live",
        isStale: false,
        lastValidEventAt: action.receivedAt,
        announcement: `${action.item.label ?? action.item.name ?? "A customer rate"} updated.`,
      };
    case "source-snapshot":
      if (shouldIgnoreSequence(state, action.sequence)) {
        return state;
      }
      return {
        ...state,
        sequence: action.sequence,
        sources: mapById(action.sources),
        connection: "live",
        isStale: false,
        lastValidEventAt: action.receivedAt,
        announcement: "Market rates updated.",
      };
    case "source":
      if (shouldIgnoreSequence(state, action.sequence)) {
        return state;
      }
      return {
        ...state,
        sequence: action.sequence,
        sources: { ...state.sources, [action.source.id]: action.source },
        connection: "live",
        isStale: false,
        lastValidEventAt: action.receivedAt,
        announcement: `${action.source.label ?? action.source.name ?? "A market rate"} updated.`,
      };
    case "feed-status":
      if (shouldIgnoreSequence(state, action.sequence)) {
        return state;
      }
      return {
        ...state,
        sequence: action.sequence,
        serverTime: action.serverTime ?? state.serverTime,
        feedStatus: action.feedStatus,
        connection: "live",
        isStale: false,
        lastValidEventAt: action.receivedAt,
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
