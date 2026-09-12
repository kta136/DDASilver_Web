import { RateExperience } from "@/components/rates/rate-experience";
import { createPageMetadata } from "@/lib/seo";
import { connection } from "next/server";
import { getPublicRateSnapshot } from "@/lib/rates/public-snapshot";
import { PublicRateReference } from "@/components/rates/public-rate-snapshot";

export const metadata = createPageMetadata({
  title: "Live Silver Rates in Agra",
  description:
    "Check live silver customer and market reference rates inside the DDA Silver website, updated automatically from the authoritative rate feed.",
  path: "/rates",
});

export default async function RatesPage() {
  await connection();
  const snapshot = await getPublicRateSnapshot();
  return (
    <main id="main-content">
      <div className="rate-page-heading">
        <p className="eyebrow">The silver market</p>
        <h1>Today&apos;s silver rates in Agra</h1>
        <p>
          Current reference rates. Confirm the final price of your chosen piece
          with our showroom.
        </p>
      </div>
      <RateExperience />
      <PublicRateReference
        key={snapshot?.serverTime ?? "unavailable"}
        snapshot={snapshot}
      />
    </main>
  );
}
