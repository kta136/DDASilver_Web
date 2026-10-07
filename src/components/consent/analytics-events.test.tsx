import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AnalyticsEvents } from "@/components/consent/analytics-events";
import { consentStorageKey } from "@/components/consent/consent";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  delete window.gtag;
});

function renderJourneyLinks() {
  return render(<>
    <AnalyticsEvents />
    <button data-analytics="catalog_browse" data-analytics-placement="rates_discovery" data-analytics-category-slug="coin">
      <span>Silver coins</span>
    </button>
    <button data-analytics="catalog_browse" data-analytics-placement="rates_collections" data-analytics-collection-slug="gifts">Gifts</button>
    <button data-analytics="whatsapp_click" data-analytics-placement="rates_discovery">Enquire</button>
    <button data-analytics="phone_click" data-analytics-placement="rates_discovery">Call</button>
  </>);
}

describe("rates discovery and enquiry analytics", () => {
  it("records the clicked destination and placement after analytics consent", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.localStorage.setItem(consentStorageKey, JSON.stringify({ analytics: true, advertising: false, updatedAt: new Date().toISOString() }));
    renderJourneyLinks();
    for (const label of ["Silver coins", "Gifts", "Enquire", "Call"]) fireEvent.click(screen.getByText(label));
    expect(gtag.mock.calls).toEqual([
      ["event", "catalog_browse", { placement: "rates_discovery", category_slug: "coin" }],
      ["event", "catalog_browse", { placement: "rates_collections", collection_slug: "gifts" }],
      ["event", "whatsapp_click", { placement: "rates_discovery" }],
      ["event", "phone_click", { placement: "rates_discovery" }],
    ]);
  });

  it("does not record discovery or enquiries without analytics consent", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    renderJourneyLinks();
    for (const label of ["Silver coins", "Gifts", "Enquire", "Call"]) fireEvent.click(screen.getByText(label));
    expect(gtag).not.toHaveBeenCalled();
  });
});
