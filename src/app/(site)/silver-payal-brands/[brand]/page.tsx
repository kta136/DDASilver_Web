import {
  ArrowLeftIcon,
  ArrowRightIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  getSilverPayalBrand,
  getSilverPayalBrandPath,
  silverPayalBrands,
} from "@/data/silver-payal-brands";
import {
  createPageMetadata,
  serializeJsonLd,
  toAbsoluteUrl,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppPayalBrandUrl } from "@/lib/whatsapp";

type SilverPayalBrandPageProps = {
  params: Promise<{ brand: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return silverPayalBrands.map((brand) => ({ brand: brand.slug }));
}

export async function generateMetadata({
  params,
}: SilverPayalBrandPageProps) {
  const { brand: slug } = await params;
  const brand = getSilverPayalBrand(slug);

  if (!brand) {
    return createPageMetadata({
      title: "Payal Brand Not Found",
      description: "The requested silver payal brand could not be found.",
      path: `/silver-payal-brands/${slug}`,
      canonical: false,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${brand.name} Silver Payal in Agra`,
    description: brand.metaDescription,
    path: getSilverPayalBrandPath(brand.slug),
    image: brand.logo,
  });
}

const enquiryDetails = [
  {
    number: "01",
    title: "Current designs",
    description:
      "Ask which designs are currently available to view or discuss. Availability can change.",
  },
  {
    number: "02",
    title: "Size and fit",
    description:
      "Share your ankle measurement or preferred size so the showroom team can discuss a suitable fit.",
  },
  {
    number: "03",
    title: "Weight and purity",
    description:
      "Confirm the weight and the purity or hallmark details for the specific piece you are considering.",
  },
  {
    number: "04",
    title: "Current price",
    description:
      "Request the latest price and inclusions because silver rates and design details can change.",
  },
];

export default async function SilverPayalBrandPage({
  params,
}: SilverPayalBrandPageProps) {
  const { brand: slug } = await params;
  const brand = getSilverPayalBrand(slug);

  if (!brand) {
    notFound();
  }

  const pagePath = getSilverPayalBrandPath(brand.slug);
  const pageUrl = toAbsoluteUrl(pagePath);
  const otherBrands = silverPayalBrands.filter(
    (candidate) => candidate.slug !== brand.slug,
  );
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection-page`,
    name: `${brand.name} Silver Payal in Agra`,
    description: brand.metaDescription,
    url: pageUrl,
    image: {
      "@type": "ImageObject",
      url: toAbsoluteUrl(brand.logo.src),
      width: brand.logo.width,
      height: brand.logo.height,
      caption: brand.logo.alt,
    },
    isPartOf: { "@id": `${toAbsoluteUrl("/")}#website` },
    publisher: { "@id": `${toAbsoluteUrl("/")}#business` },
    about: {
      "@type": "Brand",
      name: brand.name,
      logo: toAbsoluteUrl(brand.logo.src),
    },
    mainEntity: {
      "@type": "Thing",
      name: `${brand.name} silver payal`,
      description: brand.introduction,
      image: toAbsoluteUrl(brand.logo.src),
    },
  };
  const faqs = [
    {
      question: `Where can I enquire about ${brand.name} payal in Agra?`,
      answer: `Contact DDA Silver at ${siteConfig.address} or use the WhatsApp enquiry on this page to ask about current ${brand.name} payal designs.`,
    },
    {
      question: `What should I confirm before choosing ${brand.name} payal?`,
      answer:
        "Confirm the size, weight, purity or hallmark details, current price and what is included for the specific piece under discussion.",
    },
    {
      question: `Are ${brand.name} payal designs and prices shown online?`,
      answer:
        "This page introduces the brand and enquiry route. Current designs, availability and prices should be confirmed directly with the DDA Silver showroom team.",
    },
  ];

  return (
    <main id="main-content">
      <script
        id={`${brand.slug}-payal-collection-schema`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageSchema) }}
      />

      <section className="border-b border-line bg-paper-strong">
        <div className="site-container py-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Payal brands", href: "/silver-payal-brands" },
              { label: `${brand.name} payal` },
            ]}
          />
        </div>
        <div className="site-container grid gap-10 py-12 lg:min-h-[32rem] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20 lg:py-16">
          <div>
            <p className="eyebrow">{brand.name} payal / Agra</p>
            <h1 className="font-display mt-6 max-w-3xl text-balance text-5xl font-normal leading-[0.98] tracking-[-0.025em] text-ink sm:text-6xl lg:text-7xl">
              {brand.name} Silver Payal
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-ink-muted sm:text-lg">
              {brand.introduction}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={buildWhatsAppPayalBrandUrl(brand.name)}
                target="_blank"
                rel="noreferrer"
                className="button-primary no-underline"
                data-analytics="whatsapp_click"
                data-analytics-placement={`payal_brand_page_${brand.slug}`}
              >
                <WhatsappLogoIcon size={20} aria-hidden="true" />
                Enquire about {brand.name}
              </a>
              <Link
                href="/silver-payal-brands"
                className="button-secondary no-underline"
              >
                <ArrowLeftIcon size={18} aria-hidden="true" />
                All payal brands
              </Link>
            </div>
          </div>
          <div className="flex min-h-72 items-center justify-center border border-line bg-white p-10 sm:min-h-96 sm:p-14">
            <Image
              src={brand.logo.src}
              alt={brand.logo.alt}
              width={brand.logo.width}
              height={brand.logo.height}
              className="max-h-72 w-auto object-contain"
              unoptimized
              priority
            />
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow">About the name</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              {brand.identity}
            </h2>
            <p className="mt-6 leading-7 text-ink-muted">
              DDA Silver does not publish a fixed stock list or price for this
              brand on this page. Enquire with the showroom team for the latest
              information about the exact piece you are considering.
            </p>
          </div>
          <div>
            <p className="eyebrow">Make the enquiry useful</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              Four details to ask about.
            </h2>
            <ol className="mt-8 grid border-y border-line sm:grid-cols-2">
              {enquiryDetails.map((detail) => (
                <li
                  key={detail.number}
                  className="border-b border-line py-7 last:border-b-0 sm:px-7 sm:[&:nth-child(odd)]:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <p className="font-display text-2xl text-copper-dark">
                    {detail.number}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-normal">
                    {detail.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    {detail.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper-strong py-16 sm:py-20">
        <div className="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="eyebrow">Questions, answered</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              Before you enquire about {brand.name} payal.
            </h2>
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

      <section className="section-shell">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="eyebrow">Compare other names</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              Explore more silver payal brands.
            </h2>
          </div>
          <ul className="mt-10 grid border-y border-line sm:grid-cols-2 lg:grid-cols-5">
            {otherBrands.map((candidate) => (
              <li
                key={candidate.slug}
                className="border-b border-line sm:border-r lg:border-b-0 lg:last:border-r-0"
              >
                <Link
                  href={getSilverPayalBrandPath(candidate.slug)}
                  className="group flex min-h-28 items-center justify-between gap-4 px-5 py-6 font-display text-2xl no-underline hover:bg-paper-strong hover:text-copper-dark"
                >
                  {candidate.name} payal
                  <ArrowRightIcon
                    size={18}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#123b35] py-16 text-white sm:py-20">
        <div className="site-container flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4ceca]">
              Current availability
            </p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
              Ask about {brand.name} payal today.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#dce5df]">
              Share the size or style you have in mind and ask the showroom team
              for current designs, details and pricing.
            </p>
          </div>
          <a
            href={buildWhatsAppPayalBrandUrl(brand.name)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#dce5df] px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-white hover:text-ink"
            data-analytics="whatsapp_click"
            data-analytics-placement={`payal_brand_page_${brand.slug}_bottom`}
          >
            <WhatsappLogoIcon size={20} aria-hidden="true" />
            Enquire on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
