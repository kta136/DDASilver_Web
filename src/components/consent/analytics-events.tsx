"use client";

import { useEffect } from "react";

import {
  isAnalyticsEventName,
  type AnalyticsParameters,
} from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-analytics]",
      );
      const eventName = target?.dataset.analytics;
      if (!eventName || !isAnalyticsEventName(eventName) || !target) {
        return;
      }

      const parameters: AnalyticsParameters = {};
      const parameterKeys = [
        "placement",
        "productSlug",
        "categorySlug",
        "platform",
        "sourceName",
      ] as const;

      for (const key of parameterKeys) {
        const value = target.dataset[`analytics${key[0].toUpperCase()}${key.slice(1)}`];
        if (value) {
          const analyticsKey = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`,
          );
          parameters[analyticsKey] = value;
        }
      }

      trackAnalyticsEvent(eventName, parameters);
    };

    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
