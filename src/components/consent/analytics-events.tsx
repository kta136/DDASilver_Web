"use client";

import { useEffect } from "react";

import { readConsent } from "@/components/consent/consent";

export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!readConsent()?.analytics) {
        return;
      }

      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-analytics]",
      );
      const eventName = target?.dataset.analytics;
      if (!eventName || !window.gtag) {
        return;
      }

      window.gtag("event", eventName, {
        page_path: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
