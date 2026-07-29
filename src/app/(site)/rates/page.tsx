import { AppPromo } from "@/components/home/app-promo";
import { RateExperience } from "@/components/rates/rate-experience";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Live Silver Rates in Agra",
  description:
    "Check live silver customer and market reference rates for DDA Silver in Agra, supplied by DDAJewels and updated automatically when available.",
  path: "/rates",
});

export default function RatesPage() {
  return (
    <main id="main-content">
      <section className="section-shell">
        <div className="site-container">
          <p className="eyebrow">DDAJewels is the source of truth</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_30rem] lg:items-end">
            <h1 className="font-display text-balance text-6xl font-semibold leading-[0.88] sm:text-8xl">
              Live rates,
              <br />
              clearly presented.
            </h1>
            <p className="text-base leading-8 text-ink-muted">
              Rates update automatically from DDAJewels. DDA Silver does not
              calculate or fabricate values, and unavailable data is shown as
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
