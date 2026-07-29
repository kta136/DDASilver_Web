import { RateExperience } from "@/components/rates/rate-experience";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Live Silver Rates in Agra",
  description:
    "Check live silver customer and market reference rates inside the DDA Silver website, updated automatically from the authoritative rate feed.",
  path: "/rates",
});

export default function RatesPage() {
  return (
    <main id="main-content">
      <h1 className="sr-only">Today&apos;s silver rates in Agra</h1>
      <RateExperience />
    </main>
  );
}
