import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RateItem } from "@/lib/rates/contract";

import { RateHistory } from "./rate-history";

const fetchMock = vi.fn<typeof fetch>();

describe("RateHistory", () => {
  beforeEach(() => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/rates/source-history/catalog")) {
        return Response.json({ items: [] });
      }
      if (url.includes("/api/rates/history?")) {
        return Response.json({
          itemId: "silver-bank",
          unit: "PER_KG",
          points: [
            {
              snapshotAt: "2026-07-30T10:00:00.000Z",
              finalRate: 220_000,
            },
            {
              snapshotAt: "2026-07-30T11:00:00.000Z",
              finalRate: 222_000,
            },
            {
              snapshotAt: "2026-07-30T12:00:00.000Z",
              finalRate: 221_000,
            },
          ],
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("does not refetch history when only the live rate value changes", async () => {
    const initialItems: Record<string, RateItem> = {
      "silver-bank": {
        id: "silver-bank",
        name: "Silver Bank",
        value: 222_000,
      },
    };
    const { rerender } = render(
      <RateHistory authorized items={initialItems} open />,
    );

    expect(
      await screen.findByRole("group", {
        name: "Silver Bank history for 7D",
      }),
    ).toBeVisible();
    expect(historyRequestCount()).toBe(1);

    rerender(
      <RateHistory
        authorized
        items={{
          "silver-bank": {
            ...initialItems["silver-bank"],
            value: 223_000,
          },
        }}
        open
      />,
    );

    expect(historyRequestCount()).toBe(1);
  });

  it("shows the rate and IST time when a chart point is clicked or focused", async () => {
    render(
      <RateHistory
        authorized
        items={{
          "silver-bank": {
            id: "silver-bank",
            name: "Silver Bank",
            value: 222_000,
          },
        }}
        open
      />,
    );

    const middlePoint = await screen.findByRole("button", {
      name: /Rate 2,22,000 at 30 Jul, 04:30 pm IST/i,
    });
    fireEvent.click(middlePoint);

    expect(screen.getByRole("status")).toHaveTextContent("2,22,000");
    expect(screen.getByRole("status")).toHaveTextContent(
      /30 Jul, 04:30 pm IST/i,
    );
    expect(middlePoint).toHaveAttribute("aria-pressed", "true");

    const latestPoint = screen.getByRole("button", {
      name: /Rate 2,21,000 at 30 Jul, 05:30 pm IST/i,
    });
    fireEvent.keyDown(latestPoint, { key: "Enter" });

    expect(screen.getByRole("status")).toHaveTextContent("2,21,000");
    expect(latestPoint).toHaveAttribute("aria-pressed", "true");

    const firstPoint = screen.getByRole("button", {
      name: /Rate 2,20,000 at 30 Jul, 03:30 pm IST/i,
    });
    fireEvent.focus(firstPoint);

    expect(screen.getByRole("status")).toHaveTextContent("2,20,000");
    expect(firstPoint).toHaveAttribute("aria-pressed", "true");
  });

  it("recovers automatically after the history endpoint rate-limits a request", async () => {
    vi.useFakeTimers();
    let historyAttempts = 0;
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/rates/source-history/catalog")) {
        return Response.json({ items: [] });
      }
      if (url.includes("/api/rates/history?")) {
        historyAttempts += 1;
        if (historyAttempts <= 3) {
          return Response.json(
            { error: "Too many requests." },
            { status: 429, headers: { "Retry-After": "2" } },
          );
        }
        return Response.json({
          itemId: "silver-bank",
          unit: "PER_KG",
          points: [
            {
              snapshotAt: "2026-07-30T11:00:00.000Z",
              finalRate: 222_000,
            },
          ],
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    render(
      <RateHistory
        authorized
        items={{
          "silver-bank": {
            id: "silver-bank",
            name: "Silver Bank",
            value: 222_000,
          },
        }}
        open
      />,
    );
    await flushMicrotasks();

    expect(screen.getByRole("status")).toHaveTextContent(
      "History requests were temporarily limited. Retrying automatically…",
    );
    expect(historyRequestCount()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9_999);
    });
    expect(historyRequestCount()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    await flushMicrotasks();

    expect(historyRequestCount()).toBe(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(19_999);
    });
    expect(historyRequestCount()).toBe(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    await flushMicrotasks();

    expect(historyRequestCount()).toBe(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(39_999);
    });
    expect(historyRequestCount()).toBe(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    await flushMicrotasks();

    expect(historyRequestCount()).toBe(4);
    expect(
      screen.getByRole("group", { name: "Silver Bank history for 7D" }),
    ).toBeVisible();
  });
});

function historyRequestCount() {
  return fetchMock.mock.calls.filter(([input]) =>
    String(input).includes("/api/rates/history?"),
  ).length;
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}
