import { readConsent } from "@/components/consent/consent";
import {
  sanitizeAnalyticsParameters,
  type AnalyticsEventName,
  type AnalyticsParameters,
} from "@/lib/analytics";

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  parameters: AnalyticsParameters = {},
) {
  if (
    typeof window === "undefined" ||
    !readConsent()?.analytics ||
    !window.gtag
  ) {
    return;
  }

  window.gtag(
    "event",
    eventName,
    sanitizeAnalyticsParameters(eventName, parameters),
  );
}
