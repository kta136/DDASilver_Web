export const analyticsEventNames = [
  "catalog_search",
  "catalog_filter",
  "product_view",
  "whatsapp_click",
  "phone_click",
  "map_click",
  "app_store_click",
  "login_start",
  "login_success",
  "rate_expand",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsParameterValue = string | number;
export type AnalyticsParameters = Record<string, AnalyticsParameterValue>;

const allowedParameters: Record<AnalyticsEventName, readonly string[]> = {
  catalog_search: ["query_length", "result_count"],
  catalog_filter: ["filter_type", "public_slug"],
  product_view: ["product_slug", "category_slug"],
  whatsapp_click: ["placement", "product_slug"],
  phone_click: ["placement"],
  map_click: ["placement"],
  app_store_click: ["platform", "placement"],
  login_start: ["placement"],
  login_success: [],
  rate_expand: ["source_name"],
};

export function isAnalyticsEventName(
  value: string,
): value is AnalyticsEventName {
  return (analyticsEventNames as readonly string[]).includes(value);
}

export function sanitizeAnalyticsParameters(
  eventName: AnalyticsEventName,
  parameters: AnalyticsParameters = {},
) {
  const sanitized: AnalyticsParameters = {};
  for (const key of allowedParameters[eventName]) {
    const value = parameters[key];
    if (typeof value === "number") {
      if (Number.isFinite(value) && value >= 0) {
        sanitized[key] = value;
      }
      continue;
    }
    if (typeof value === "string") {
      const normalized = value.trim().slice(0, 80);
      if (normalized) {
        sanitized[key] = normalized;
      }
    }
  }
  return sanitized;
}

export function normalizeGoogleAnalyticsId(value?: string) {
  const normalized = value?.trim().toUpperCase();
  return normalized && /^G-[A-Z0-9]{4,20}$/.test(normalized)
    ? normalized
    : null;
}
