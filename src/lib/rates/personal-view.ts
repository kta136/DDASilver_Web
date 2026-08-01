export const personalViewSchemaVersion = 1 as const;

export type PersonalRateFontFamily = "sans" | "serif" | "mono";
export type MarketDataView = "cards" | "table";
export type FlashStyle = "soft" | "bold";

export type PersonalRateView = {
  schemaVersion: typeof personalViewSchemaVersion;
  order: string[];
  hidden: string[];
  hideBuyingColumn?: boolean;
  rateFontSizeStep?: number;
  rateFontFamily?: PersonalRateFontFamily;
  marketDataView?: MarketDataView;
  marketDataFontSizeStep?: number;
  flashStyle?: FlashStyle;
  updatedAt: string;
};

export const emptyPersonalRateView: PersonalRateView = createPersonalRateView();

export function createPersonalRateView(
  overrides: Partial<PersonalRateView> = {},
): PersonalRateView {
  const view: PersonalRateView = {
    schemaVersion: personalViewSchemaVersion,
    order: uniqueStrings(overrides.order),
    hidden: uniqueStrings(overrides.hidden),
    updatedAt:
      typeof overrides.updatedAt === "string"
        ? overrides.updatedAt
        : new Date().toISOString(),
  };

  if (typeof overrides.hideBuyingColumn === "boolean") {
    view.hideBuyingColumn = overrides.hideBuyingColumn;
  }
  const rateFontSizeStep = integerOrUndefined(overrides.rateFontSizeStep);
  if (rateFontSizeStep !== undefined) view.rateFontSizeStep = rateFontSizeStep;
  if (isFontFamily(overrides.rateFontFamily)) {
    view.rateFontFamily = overrides.rateFontFamily;
  }
  if (isMarketDataView(overrides.marketDataView)) {
    view.marketDataView = overrides.marketDataView;
  }
  const marketDataFontSizeStep = integerOrUndefined(
    overrides.marketDataFontSizeStep,
  );
  if (marketDataFontSizeStep !== undefined) {
    view.marketDataFontSizeStep = marketDataFontSizeStep;
  }
  if (isFlashStyle(overrides.flashStyle)) view.flashStyle = overrides.flashStyle;
  return view;
}

export function parsePersonalRateView(value: string | null) {
  if (!value) return createPersonalRateView();
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object") return createPersonalRateView();
    const record = parsed as Partial<PersonalRateView>;
    if (
      record.schemaVersion !== undefined &&
      record.schemaVersion !== personalViewSchemaVersion
    ) {
      return createPersonalRateView();
    }
    return createPersonalRateView(record);
  } catch {
    return createPersonalRateView();
  }
}

export function updatePersonalRateView(
  current: PersonalRateView,
  patch: Partial<PersonalRateView>,
) {
  return createPersonalRateView({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export function reconcilePersonalRateView(
  view: PersonalRateView,
  availableIds: readonly string[],
) {
  const available = new Set(availableIds);
  const hidden = view.hidden.filter((id) => available.has(id));
  const hiddenSet = new Set(hidden);
  const orderedVisible = view.order.filter(
    (id) => available.has(id) && !hiddenSet.has(id),
  );
  const orderedSet = new Set(orderedVisible);
  const appended = availableIds.filter(
    (id) => !hiddenSet.has(id) && !orderedSet.has(id),
  );
  return { order: [...orderedVisible, ...appended], hidden };
}

export function movePersonalRate(
  order: readonly string[],
  activeId: string,
  overId: string,
) {
  const from = order.indexOf(activeId);
  const to = order.indexOf(overId);
  if (from < 0 || to < 0 || from === to) return [...order];
  const next = [...order];
  const [active] = next.splice(from, 1);
  if (!active) return [...order];
  next.splice(to, 0, active);
  return next;
}

export function clampRateFontSizeStep(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(-3, Math.min(8, Math.trunc(value)));
}

export function rateFontScale(value: unknown) {
  const step = clampRateFontSizeStep(value);
  return 1 + Math.max(0, step) * 0.09 + Math.min(0, step) * 0.06;
}

export function rateFontSizePercent(value: unknown) {
  return Math.round(rateFontScale(value) * 100);
}

export function personalRateFontFamilyOrDefault(
  value: unknown,
): PersonalRateFontFamily {
  return isFontFamily(value) ? value : "sans";
}

export function marketDataViewOrDefault(value: unknown): MarketDataView {
  return isMarketDataView(value) ? value : "table";
}

export function flashStyleOrDefault(value: unknown): FlashStyle {
  return isFlashStyle(value) ? value : "soft";
}

function uniqueStrings(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const normalized = item.trim().slice(0, 200);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function integerOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.trunc(value)
    : undefined;
}

function isFontFamily(value: unknown): value is PersonalRateFontFamily {
  return value === "sans" || value === "serif" || value === "mono";
}

function isMarketDataView(value: unknown): value is MarketDataView {
  return value === "cards" || value === "table";
}

function isFlashStyle(value: unknown): value is FlashStyle {
  return value === "soft" || value === "bold";
}
