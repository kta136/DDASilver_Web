export const consentStorageKey = "dda-consent-v1";
export const consentServerSnapshot = "__server_pending__";

export type ConsentChoice = {
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
};

export function readConsent(): ConsentChoice | null {
  try {
    return parseConsentSnapshot(
      window.localStorage.getItem(consentStorageKey),
    );
  } catch {
    return null;
  }
}

export function parseConsentSnapshot(stored: string | null) {
  if (!stored || stored === consentServerSnapshot) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ConsentChoice>;
    if (
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.advertising !== "boolean" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }
    return parsed as ConsentChoice;
  } catch {
    return null;
  }
}

export function getConsentSnapshot() {
  return window.localStorage.getItem(consentStorageKey);
}

export function getConsentServerSnapshot() {
  return consentServerSnapshot;
}

export function subscribeToConsent(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === consentStorageKey) {
      callback();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("dda-consent-changed", callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("dda-consent-changed", callback);
  };
}

export function applyGoogleConsent(choice: ConsentChoice) {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("consent", "update", {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: choice.advertising ? "granted" : "denied",
    ad_user_data: choice.advertising ? "granted" : "denied",
    ad_personalization: choice.advertising ? "granted" : "denied",
  });
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
