"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useState, useSyncExternalStore } from "react";

import {
  applyGoogleConsent,
  consentStorageKey,
  consentServerSnapshot,
  type ConsentChoice,
  getConsentServerSnapshot,
  getConsentSnapshot,
  parseConsentSnapshot,
  readConsent,
  subscribeToConsent,
} from "@/components/consent/consent";

const deniedChoice = {
  analytics: false,
  advertising: false,
};

export function ConsentManager() {
  const snapshot = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );
  const storedChoice = parseConsentSnapshot(snapshot);
  const [forceOpen, setForceOpen] = useState(false);
  const [isDetailed, setIsDetailed] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const isOpen =
    snapshot !== consentServerSnapshot && (forceOpen || !storedChoice);
  const hasStoredChoice = Boolean(storedChoice);

  useEffect(() => {
    if (storedChoice) {
      applyGoogleConsent(storedChoice);
    }
  }, [storedChoice]);

  useEffect(() => {
    const openPreferences = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setAdvertising(current?.advertising ?? false);
      setIsDetailed(true);
      setForceOpen(true);
    };

    window.addEventListener("dda-open-consent", openPreferences);
    return () =>
      window.removeEventListener("dda-open-consent", openPreferences);
  }, []);

  function save(choice: Omit<ConsentChoice, "updatedAt">) {
    const storedChoice: ConsentChoice = {
      ...choice,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(
      consentStorageKey,
      JSON.stringify(storedChoice),
    );
    applyGoogleConsent(storedChoice);
    window.dispatchEvent(
      new CustomEvent("dda-consent-changed", { detail: storedChoice }),
    );
    setForceOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-3xl border border-line bg-paper-strong p-5 shadow-[var(--shadow-soft)] sm:bottom-6 sm:p-7"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Your privacy</p>
          <h2
            id="consent-title"
            className="font-display mt-2 text-3xl font-semibold"
          >
            Choose how this site uses cookies
          </h2>
        </div>
        {hasStoredChoice ? (
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line"
            aria-label="Close cookie preferences"
            onClick={() => setForceOpen(false)}
          >
            <XIcon size={19} />
          </button>
        ) : null}
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
        Essential storage keeps the site working. Analytics and advertising
        storage remain denied unless you allow them. We do not send names,
        phone numbers, or email addresses to analytics.
      </p>

      {isDetailed ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-line p-4">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-1 size-4 accent-copper"
            />
            <span>
              <span className="block text-sm font-bold">Analytics</span>
              <span className="mt-1 block text-xs leading-5 text-ink-muted">
                Helps us understand searches, filters, and outbound actions.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-line p-4">
            <input
              type="checkbox"
              checked={advertising}
              onChange={(event) => setAdvertising(event.target.checked)}
              className="mt-1 size-4 accent-copper"
            />
            <span>
              <span className="block text-sm font-bold">Advertising</span>
              <span className="mt-1 block text-xs leading-5 text-ink-muted">
                Reserved for future measured campaigns; off by default.
              </span>
            </span>
          </label>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="button-primary"
          onClick={() => save({ analytics: true, advertising: true })}
        >
          Accept all
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={() =>
            isDetailed
              ? save({ analytics, advertising })
              : save(deniedChoice)
          }
        >
          {isDetailed ? "Save choices" : "Essential only"}
        </button>
        {!isDetailed ? (
          <button
            type="button"
            className="min-h-11 px-3 text-sm font-semibold text-ink-muted underline"
            onClick={() => setIsDetailed(true)}
          >
            Manage preferences
          </button>
        ) : null}
      </div>
    </section>
  );
}
