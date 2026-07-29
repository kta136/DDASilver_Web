"use client";

import { useEffect } from "react";

import type {
  AnalyticsEventName,
  AnalyticsParameters,
} from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

type AnalyticsBeaconProps = {
  eventName: AnalyticsEventName;
  parameters?: AnalyticsParameters;
};

export function AnalyticsBeacon({
  eventName,
  parameters,
}: AnalyticsBeaconProps) {
  useEffect(() => {
    trackAnalyticsEvent(eventName, parameters);
  }, [eventName, parameters]);

  return null;
}
