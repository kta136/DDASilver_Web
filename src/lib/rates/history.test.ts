import { describe, expect, it } from "vitest";

import {
  buildChartPaths,
  chartPointStats,
  historyIntervalForIstDates,
  istCalendarDate,
  normalizeChartPoints,
  rateHistoryResponseSchema,
  sourceHistoryCatalogSchema,
} from "@/lib/rates/history";

describe("rate history chart", () => {
  it("sorts, deduplicates, and normalizes history points", () => {
    expect(
      normalizeChartPoints([
        { snapshotAt: "2026-07-30T10:01:00.000Z", finalRate: 101 },
        { snapshotAt: "2026-07-30T10:00:00.000Z", finalRate: 100 },
        { snapshotAt: "2026-07-30T10:01:00.000Z", finalRate: 102 },
      ]),
    ).toEqual([
      { snapshotAt: "2026-07-30T10:00:00.000Z", value: 100 },
      { snapshotAt: "2026-07-30T10:01:00.000Z", value: 102 },
    ]);
  });

  it("starts a new SVG path at a retained history gap", () => {
    const chart = buildChartPaths(
      [
        { snapshotAt: "2026-07-30T10:00:00.000Z", value: 100 },
        {
          snapshotAt: "2026-07-30T10:01:00.000Z",
          value: 102,
          gapBefore: true,
        },
      ],
      720,
      240,
    );
    expect(chart.paths).toHaveLength(2);
    expect(chart.points).toEqual([
      expect.objectContaining({ x: 24, snapshotAt: "2026-07-30T10:00:00.000Z" }),
      expect.objectContaining({ x: 696, snapshotAt: "2026-07-30T10:01:00.000Z" }),
    ]);
    expect(chart.minimum).toBe(100);
    expect(chart.maximum).toBe(102);
  });

  it("builds custom IST day boundaries for the history API", () => {
    expect(historyIntervalForIstDates("2026-07-01", "2026-07-02")).toEqual({
      from: "2026-06-30T18:30:00.000Z",
      to: "2026-07-02T18:29:59.999Z",
    });
    expect(historyIntervalForIstDates("2026-07-03", "2026-07-02")).toBeNull();
    expect(istCalendarDate(new Date("2026-07-31T20:00:00.000Z"))).toBe(
      "2026-08-01",
    );
  });

  it("summarizes latest, high, low, and update time", () => {
    expect(
      chartPointStats([
        { snapshotAt: "2026-07-30T10:00:00.000Z", value: 102 },
        { snapshotAt: "2026-07-30T10:01:00.000Z", value: 99 },
        { snapshotAt: "2026-07-30T10:02:00.000Z", value: 101 },
      ]),
    ).toEqual({
      latest: 101,
      high: 102,
      low: 99,
      updatedAt: "2026-07-30T10:02:00.000Z",
    });
  });

  it("accepts bounded history responses without loading Zod in the client", () => {
    expect(
      rateHistoryResponseSchema.safeParse({
        itemId: "silver-999",
        unit: "10g",
        points: [
          {
            snapshotAt: "2026-07-30T10:00:00.000Z",
            finalRate: 101,
            quality: "ASK",
          },
        ],
      }),
    ).toEqual({
      success: true,
      data: {
        itemId: "silver-999",
        unit: "10g",
        points: [
          {
            snapshotAt: "2026-07-30T10:00:00.000Z",
            finalRate: 101,
            quality: "ASK",
          },
        ],
      },
    });
  });

  it("rejects malformed or unbounded history responses", () => {
    expect(
      rateHistoryResponseSchema.safeParse({
        itemId: "silver-999",
        unit: "10g",
        points: [{ snapshotAt: "not-a-date", finalRate: 101 }],
      }).success,
    ).toBe(false);

    expect(
      sourceHistoryCatalogSchema.safeParse({
        items: Array.from({ length: 101 }, () => ({
          sourceId: "source",
          name: "Source",
          unit: "10g",
          enabledFrom: "2026-07-30T10:00:00.000Z",
          availableFrom: null,
        })),
      }).success,
    ).toBe(false);
  });
});
