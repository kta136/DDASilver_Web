import {
  ArrowRightIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { buildWhatsAppPayalBrandUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site";
import {
  createPageMetadata,
  serializeJsonLd,
  toAbsoluteUrl,
} from "@/lib/seo";

type SilverPayalBrand = {
  name: string;
  slug: string;
};

const silverPayalBrands = [
  { name: "Anand", slug: "anand" },
  { name: "MD", slug: "md" },
  { name: "AGB", slug: "agb" },
  { name: "DDA", slug: "dda" },
  { name: "AKS", slug: "aks" },
] satisfies readonly SilverPayalBrand[];

const pageTitle = "Silver Payal & Anklet Brands";
const pageDescription =
  "Explore Anand, MD, AGB, DDA and AKS silver payal brands at DDA Silver. Enquire on WhatsApp for available anklet designs and prices from our Agra showroom.";
const pageUrl = toAbsoluteUrl("/silver-payal-brands");

export const metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/silver-payal-brands",
});

const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${pageUrl}#collection-page`,
  name: pageTitle,
  description: pageDescription,
  url: pageUrl,
  isPartOf: { "@id": `${toAbsoluteUrl("/")}#website` },
  about: { "@id": `${toAbsoluteUrl("/")}#business` },
  publisher: { "@id": `${toAbsoluteUrl("/")}#business` },
  mainEntity: {
    "@type": "ItemList",
    "@id": `${pageUrl}#brand-list`,
    name: "Silver payal brands at DDA Silver",
    numberOfItems: silverPayalBrands.length,
    itemListElement: silverPayalBrands.map((brand, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${brand.name} silver payal`,
      url: `${pageUrl}#${brand.slug}`,
    })),
  },
};

const buyingChecks = [
  {
    number: "01",
    title: "Start with your size",
    description:
      "Measure around the ankle and share the measurement with the showroom team for a comfortable fit.",
  },
  {
    number: "02",
    title: "Compare the weight",
    description:
      "Ask about the weight of each design so you can compare styles that suit everyday wear or an occasion.",
  },
  {
    number: "03",
    title: "Ask about purity",
    description:
      "Request the purity or hallmark details that apply to the piece before you make a decision.",
  },
  {
    number: "04",
    title: "Confirm current pricing",
    description:
      "Silver rates and design details can change, so confirm the current price and inclusions by enquiry.",
  },
];

const faqs = [
  {
    question: "Which silver payal brands can I ask about?",
    answer:
      "You can enquire about Anand, MD, AGB, DDA and AKS silver payal brands through DDA Silver.",
  },
  {
    question: "How do I choose the right silver payal size?",
    answer:
      "Measure around your ankle with a soft measuring tape or string, note the measurement, and share it with the showroom team. They can help you discuss the fit for the design you prefer.",
  },
  {
    question: "What details should I compare before buying?",
    answer:
      "Ask about the design's size, weight, purity or hallmark information, and the current price. The relevant details can vary by piece and should be confirmed before purchase.",
  },
  {
    question: "How can I ask for current designs and pricing?",
    answer:
      "Choose a brand above and enquire on WhatsApp. Include your preferred size or style if you have one, and the DDA Silver team can respond with the latest details available to discuss.",
  },
  {
    question: "Can I visit the showroom to discuss silver payals?",
    answer: `Yes. Visit DDA Silver at ${siteConfig.address}. The showroom is open ${siteConfig.hours}; see the contact page for directions and current visit details.`,
  },
];

export default function SilverPayalBrandsPage() {
  return (
    <main id="main-content">
      <script
        id="silver-payal-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(collectionPageSchema),
        }}
      />

      <section className="border-b border-line bg-paper-strong">
        <div className="site-container py-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: pageTitle }]}
          />
        </div>
        <div className="grid lg:min-h-[28rem] lg:grid-cols-2">
          <div className="site-container flex max-w-3xl flex-col justify-center py-12 lg:py-16">
            <p className="eyebrow">Silver payal / India</p>
            <h1 className="font-display mt-6 max-w-3xl text-balance text-5xl font-normal leading-[0.98] tracking-[-0.025em] text-ink sm:text-6xl lg:text-7xl">
              Silver Payal &amp; Anklet Brands
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
              Explore silver payal, also known as silver anklets, from Anand,
              MD, AGB, DDA and AKS at DDA Silver. Share the size, style or weight
              you have in mind and our Agra showroom team can help you compare
              current designs and pricing.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={buildWhatsAppPayalBrandUrl()}
                target="_blank"
                rel="noreferrer"
                className="button-primary no-underline"
                data-analytics="whatsapp_click"
                data-analytics-placement="payal_brands_hero"
              >
                <WhatsappLogoIcon size={20} aria-hidden="true" />
                Enquire on WhatsApp
              </a>
              <a href="#brands" className="button-secondary no-underline">
                View the brands <ArrowRightIcon size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div
            className="flex items-center bg-[#0b3029] bg-cover bg-center px-8 py-12 text-white sm:px-16 lg:px-20"
            style={{ backgroundImage: "url('/images/design/payal-clean-1-1388c9d1f471.webp')" }}
          >
            <div className="w-full border-y border-white/25 py-10">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#dce5df]">
                Five names to explore
              </p>
              <p className="mt-7 font-display text-4xl leading-tight sm:text-5xl">
                Silver payal, considered with care.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/20 pt-6 font-display text-3xl text-[#dce5df] sm:grid-cols-3">
                {silverPayalBrands.map((brand) => (
                  <a
                    key={brand.slug}
                    href={`#${brand.slug}`}
                    className="no-underline transition-colors hover:text-white"
                  >
                    {brand.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="brands" className="section-shell scroll-mt-8">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="eyebrow">The brands</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              Five starting points for your next payal.
            </h2>
            <p className="mt-5 leading-7 text-ink-muted">
              Choose a name to start an enquiry. We can discuss the designs,
              sizes, weights, purity details and current pricing that apply to
              your request.
            </p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {silverPayalBrands.map((brand, index) => (
              <li
                key={brand.slug}
                id={brand.slug}
                className="flex min-h-64 flex-col border border-line bg-paper-strong p-7 transition-colors hover:border-copper sm:p-8"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                  Brand {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-10 text-5xl font-normal text-ink">
                  {brand.name}
                </h3>
                <div className="mt-auto pt-10">
                  <p className="text-sm leading-6 text-ink-muted">
                    Enquire about {brand.name} silver payal designs, sizes,
                    weights and current pricing.
                  </p>
                  <a
                    href={buildWhatsAppPayalBrandUrl(brand.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-copper pb-2 text-sm font-bold text-ink no-underline hover:text-copper-dark"
                    data-analytics="whatsapp_click"
                    data-analytics-placement={`payal_brand_${brand.slug}`}
                  >
                    Enquire about {brand.name}
                    <ArrowRightIcon size={17} aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-paper-strong py-16 sm:py-20">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="eyebrow">A simple buying guide</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              A few useful details before you enquire.
            </h2>
            <p className="mt-5 leading-7 text-ink-muted">
              Your size, preferred weight and the details you want confirmed
              can make a WhatsApp enquiry more useful.
            </p>
          </div>
          <ol className="mt-12 grid gap-0 border-y border-line md:grid-cols-2 lg:grid-cols-4">
            {buyingChecks.map((check) => (
              <li
                key={check.number}
                className="border-b border-line py-7 last:border-b-0 md:border-r md:px-7 md:py-8 md:last:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:first:pl-0"
              >
                <p className="font-display text-2xl text-copper-dark">
                  {check.number}
                </p>
                <h3 className="mt-5 font-display text-2xl font-normal">
                  {check.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  {check.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow">Questions, answered</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              Silver payal, made easier to compare.
            </h2>
            <p className="mt-5 leading-7 text-ink-muted">
              If you are still deciding, start with your size and the details
              you would like the showroom team to confirm.
            </p>
          </div>
          <div className="border-t border-line">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-display text-2xl font-normal marker:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-2xl text-copper transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-ink-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#123b35] py-16 text-white sm:py-20">
        <div className="site-container flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4ceca]">
              Ready to explore?
            </p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              Tell us which silver payal you have in mind.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#dce5df]">
              Enquire about a brand, share your preferred size, or ask for
              current designs and pricing on WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={buildWhatsAppPayalBrandUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#dce5df] px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-white hover:text-ink"
              data-analytics="whatsapp_click"
              data-analytics-placement="payal_brands_bottom"
            >
              <WhatsappLogoIcon size={20} aria-hidden="true" />
              Enquire on WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#41635a] px-5 text-sm font-bold text-white no-underline transition-colors hover:border-white"
            >
              Visit our showroom <ArrowRightIcon size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
