import { connection } from "next/server";
import { Suspense } from "react";

import { RateExperience } from "@/components/rates/rate-experience";
import { RatesDiscovery, RatesGuide } from "@/components/rates/rates-guide";
import { getPublicRateSnapshot } from "@/lib/rates/public-snapshot";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Silver Price Today in Agra | Live Rates",
  description:
    "Check today's silver price in Agra with live DDA Silver rates. Explore coins, idols and utensils, then confirm your quote and showroom collection with our team.",
  path: "/rates",
});

export default async function RatesPage() {
  // Check freshness for each request rather than freezing a rate at build time.
  await connection();
  const publicSnapshot = await getPublicRateSnapshot();

  return (
    <main id="main-content">
      <div className="rate-page-heading">
        <p className="eyebrow">The silver market</p>
        <h1>Silver price today in Agra</h1>
        <p>
          Current reference rates. Confirm the final price of your chosen piece
          with our showroom.
        </p>
      </div>
      <RateExperience publicSnapshot={publicSnapshot} />
      <Suspense fallback={null}>
        <RatesDiscovery />
      </Suspense>
      <RatesGuide />
    </main>
  );
}
