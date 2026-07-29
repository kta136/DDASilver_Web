import { AppPromo } from "@/components/home/app-promo";
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
      <section className="section-shell">
        <div className="site-container">
          <p className="eyebrow">DDA Silver live rates</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_30rem] lg:items-end">
            <h1 className="font-display text-balance text-6xl font-semibold leading-[0.88] sm:text-8xl">
              Live rates,
              <br />
              clearly presented.
            </h1>
            <p className="text-base leading-8 text-ink-muted">
              Stay inside DDA Silver while viewing rates supplied by the
              authoritative DDAJewels feed. DDA Silver never calculates or
              fabricates values, and unavailable data is shown as
              unavailable—not zero.
            </p>
          </div>
          <div className="mt-9">
            <RateExperience />
          </div>
        </div>
      </section>
      <AppPromo />
    </main>
  );
}
