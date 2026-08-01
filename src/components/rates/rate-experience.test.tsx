import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RateExperience } from "./rate-experience";

class MockEventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;
  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSED = 2;
  readyState = 1;
  url: string;
  withCredentials = false;
  onopen = null;
  onmessage = null;
  onerror = null;

  constructor(url: string | URL) {
    this.url = String(url);
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
  close() {}
}

describe("RateExperience authorized feature parity", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("EventSource", MockEventSource);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/auth/me")) {
          return Response.json({
            user: {
              id: "approved-user",
              isApproved: true,
              emailVerified: true,
              canViewCharts: true,
              canViewBuyingPrice: true,
            },
          });
        }
        if (url.includes("/api/rates/source-history/catalog")) {
          return Response.json({ items: [] });
        }
        if (url.includes("/api/rates/history?")) {
          return Response.json({
            itemId: "gold-cash",
            unit: "PER_10_GRAM",
            points: [
              { snapshotAt: "2026-07-30T10:00:00.000Z", finalRate: 145000 },
              { snapshotAt: "2026-07-30T11:00:00.000Z", finalRate: 146000 },
            ],
          });
        }
        if (url.includes("/api/rates/snapshot")) {
          return Response.json({
            schemaVersion: 1,
            view: "default",
            serverTime: new Date().toISOString(),
            sequence: 100,
            items: [
              {
                itemId: "gold-cash",
                name: "Gold Cash",
                unit: "PER_10_GRAM",
                finalRate: 146000,
                movementValue: 250,
                movementDirection: "UP",
                buyingRate: 144000,
                premiumTotal: 500,
              },
              {
                itemId: "silver-bank",
                name: "Silver Bank",
                unit: "PER_KG",
                finalRate: 222000,
                movementValue: 100,
                movementDirection: "DOWN",
                buyingRate: 220000,
              },
            ],
            feedStatus: { status: "live" },
          });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows approved-only rows and exposes Jewels display and chart controls", async () => {
    render(
      <>
        <div data-rates-header-actions="test" />
        <RateExperience />
      </>,
    );

    expect(await screen.findByText("Gold Cash")).toBeVisible();
    expect(screen.getByText("₹1,44,000")).toBeVisible();
    expect(screen.getByText("+₹500")).toBeVisible();
    expect(screen.queryByText("Premium +₹500")).toBeNull();

    const goldRow = screen.getByText("Gold Cash").closest("tr");
    expect(goldRow?.children[1]).toHaveTextContent("BUY₹1,44,000");
    expect(goldRow?.children[2]).toHaveTextContent("₹1,46,000");

    const editButton = await screen.findByRole("button", {
      name: "Edit rates table",
    });
    const headerActions = editButton.parentElement;
    expect(headerActions).not.toBeNull();
    expect(editButton.querySelector("svg")).not.toBeNull();
    const chartButton = within(headerActions as HTMLElement).getByRole(
      "button",
      { name: "Show rate history chart" },
    );
    expect(chartButton).toBeVisible();
    expect(chartButton.querySelector("svg")).not.toBeNull();

    fireEvent.click(
      await screen.findByRole("button", { name: "Open display settings" }),
    );
    const settingsDialog = screen.getByRole("dialog", {
      name: "Rates display",
    });
    expect(settingsDialog).toBeVisible();
    expect(screen.getByRole("button", { name: "Hide BUY" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Hide BUY" }));
    await waitFor(() => expect(screen.queryByText("₹1,44,000")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Cards" }));
    fireEvent.click(
      within(settingsDialog).getByRole("button", {
        name: "Finish editing rates table",
      }),
    );
    expect(screen.getByLabelText("Market data cards")).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "Show rate history chart" }),
    );
    expect(await screen.findByRole("heading", { name: "Rate history" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Custom" })).toBeVisible();
    await screen.findByText("Latest");
  });
});
