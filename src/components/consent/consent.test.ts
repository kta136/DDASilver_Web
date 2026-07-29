import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyGoogleConsent,
  consentStorageKey,
  readConsent,
} from "@/components/consent/consent";

describe("consent helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.dataLayer = [];
    window.gtag = undefined;
  });

  it("rejects malformed stored consent", () => {
    window.localStorage.setItem(consentStorageKey, '{"analytics":"yes"}');
    expect(readConsent()).toBeNull();
  });

  it("applies denied consent without personal data", () => {
    const spy = vi.fn();
    window.gtag = spy;

    applyGoogleConsent({
      analytics: false,
      advertising: false,
      updatedAt: "2026-07-28T10:00:00Z",
    });

    expect(spy).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
});
