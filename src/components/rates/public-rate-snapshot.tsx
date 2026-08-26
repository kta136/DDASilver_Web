"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicRateSnapshot } from "@/lib/rates/public-snapshot";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const timestamp = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
  timeStyle: "medium",
});

export function PublicRateReference({
  snapshot,
}: {
  snapshot: PublicRateSnapshot | null;
}) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (!snapshot) return;
    const timer = setTimeout(
      () => setExpired(true),
      Math.max(0, Date.parse(snapshot.serverTime) + 90_000 - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [snapshot]);
  return (
    <section
      className="site-container py-10"
      aria-labelledby="public-rate-heading"
      data-public-rate-snapshot
    >
      <h2
        id="public-rate-heading"
        className="font-display text-3xl font-semibold"
      >
        Public reference snapshot
      </h2>
      {snapshot && !expired ? (
        <>
          <p className="mt-3 text-sm text-ink-muted">
            Recorded{" "}
            <time dateTime={snapshot.serverTime}>
              {timestamp.format(new Date(snapshot.serverTime))} IST (UTC+05:30)
            </time>
            . This snapshot expires after 90 seconds; use the live table above
            for updates.
          </p>
          <table className="mt-5 w-full max-w-3xl text-left text-sm">
            <caption className="sr-only">
              Public reference metal rates in Indian rupees at the recorded time
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-3">
                  Reference
                </th>
                <th scope="col">Rate (INR)</th>
                <th scope="col">Unit</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.items.map((item) => (
                <tr key={item.id} className="border-b border-line">
                  <th scope="row" className="py-3 font-medium">
                    {item.name}
                  </th>
                  <td>{currency.format(item.value)}</td>
                  <td>{item.unit === "PER_KG" ? "per kg" : "per 10 g"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">
          A fresh public snapshot is unavailable. Use the live table above or
          contact the showroom for current information.
        </p>
      )}
      <p className="mt-5 max-w-3xl text-sm leading-7 text-ink-muted">
        These are public reference metal rates, not prices for finished catalog
        products or a confirmed quotation. Ask the showroom for the final quote
        and applicable charges for your selected item.{" "}
        <Link href="/rates-disclaimer">Read the rates disclaimer</Link>.
      </p>
    </section>
  );
}
