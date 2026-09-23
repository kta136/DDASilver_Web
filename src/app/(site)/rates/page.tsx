import { connection } from "next/server";

import { RateExperience } from "@/components/rates/rate-experience";
import { getPublicRateSnapshot } from "@/lib/rates/public-snapshot";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Live Silver Rates in Agra",
  description:
    "Check live silver customer and market reference rates inside the DDA Silver website, updated automatically from the authoritative rate feed.",
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
        <h1>Today&apos;s silver rates in Agra</h1>
        <p>
          Current reference rates. Confirm the final price of your chosen piece
          with our showroom.
        </p>
      </div>
      <RateExperience publicSnapshot={publicSnapshot} />
    </main>
  );
}
