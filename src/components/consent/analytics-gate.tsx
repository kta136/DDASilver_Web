"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  parseConsentSnapshot,
  subscribeToConsent,
} from "@/components/consent/consent";
import { normalizeGoogleAnalyticsId } from "@/lib/analytics";

type AnalyticsGateProps = {
  gaId?: string;
};

export function AnalyticsGate({ gaId }: AnalyticsGateProps) {
  const snapshot = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );
  const enabled = parseConsentSnapshot(snapshot)?.analytics ?? false;
  const measurementId = normalizeGoogleAnalyticsId(gaId);

  if (!measurementId || !enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="dda-ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(measurementId)}, { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
