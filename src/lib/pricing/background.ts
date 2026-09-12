import { existsSync } from "node:fs";
import { getGalleryPricingSettings, getGalleryRateStore } from "./configuration";
import { pricingHealth } from "./health";
import { REFRESH_INTERVAL_MS, type GalleryRateStore } from "./store";
import { fetchGalleryReference } from "./upstream";

const CHECK_INTERVAL_MS = 15_000;
type Health = ReturnType<typeof pricingHealth>;
type Options = {
  store?: Pick<GalleryRateStore, "read" | "refresh"> | null;
  settings?: typeof getGalleryPricingSettings;
  fetchReference?: typeof fetchGalleryReference;
  report?: (event: "pricing-warning" | "pricing-recovered", health: Health) => void;
  isDraining?: () => boolean;
};

/** Runs independently of traffic in the persistent Node server, using the same durable attempt gate as requests. */
export function startGalleryPricingWorker({
  store = getGalleryRateStore(),
  settings = getGalleryPricingSettings,
  fetchReference = fetchGalleryReference,
  report = (event, health) => {
    const message = `[gallery-pricing] ${JSON.stringify({ event, ...health })}`;
    if (event === "pricing-warning") console.warn(message);
    else console.info(message);
  },
  isDraining = () => process.env.DDA_CONTAINER_DRAINING === "1" || existsSync("/tmp/ddasilver-draining"),
}: Options = {}) {
  let stopped = false;
  let enabled = false;
  let settingsDue = 0;
  let previousWarnings = "";
  let checkFailed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = async () => {
    if (stopped || !store || isDraining()) return;
    let delay = CHECK_INTERVAL_MS;
    try {
      if (Date.now() >= settingsDue) {
        enabled = (await settings()).enabled;
        settingsDue = Date.now() + REFRESH_INTERVAL_MS;
      }
      if (stopped || isDraining()) return;
      if (!enabled) return;

      let state = await store.read();
      if (stopped || isDraining()) return;
      if (!state.record || state.record.refresh.nextAttemptAt <= Date.now()) {
        // refresh() persists the five-minute gate even on failure and arbitrates
        // concurrent requests/workers. Never bypass that gate for a retry.
        await store.refresh(fetchReference);
        state = await store.read();
      }
      if (stopped || isDraining()) return;
      const health = pricingHealth(state);
      const warnings = health.warnings.join(",");
      if (warnings !== previousWarnings) {
        report(warnings ? "pricing-warning" : "pricing-recovered", health);
        previousWarnings = warnings;
      }
      checkFailed = false;
      const untilAttempt = (state.record?.refresh.nextAttemptAt ?? 0) - Date.now();
      // Wake at the persisted deadline, avoiding a full polling interval of drift.
      if (untilAttempt > 0) delay = Math.min(delay, untilAttempt);
    } catch {
      if (!checkFailed)
        console.warn("[gallery-pricing] Background check failed; retrying automatically.");
      checkFailed = true;
    } finally {
      if (!stopped && !isDraining()) {
        timer = setTimeout(() => { void run(); }, delay);
        timer.unref();
      }
    }
  };

  // Do not hold up Next.js readiness on Sanity or the rates service.
  if (store) {
    timer = setTimeout(() => { void run(); }, 0);
    timer.unref();
  }
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
