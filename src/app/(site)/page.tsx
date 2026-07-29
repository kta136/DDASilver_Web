import {
  ArrowRightIcon,
  MapPinIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

import { CategoryIndex } from "@/components/catalog/category-index";
import { ProductCard } from "@/components/catalog/product-card";
import { AppPromo } from "@/components/home/app-promo";
import { RateTeaser } from "@/components/home/rate-teaser";
import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { getCatalog } from "@/sanity/lib/catalog";

export default async function HomePage() {
  const { categories, products } = await getCatalog();
  const featured = products
    .filter((product) => product.featured)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 4);

  return (
    <main id="main-content">
      <section className="border-b border-line">
        <div className="grid lg:min-h-[23.5rem] lg:grid-cols-2 min-[90rem]:min-h-[28.25rem]">
          <div className="flex items-center px-5 py-10 sm:px-10 sm:py-14 lg:px-[clamp(5rem,8vw,7.5rem)] lg:py-6">
            <div className="max-w-xl">
              <p className="eyebrow">Heritage. Silver. Trust.</p>
              <h1 className="font-display text-balance mt-3 text-[clamp(2.85rem,13vw,3.25rem)] font-semibold leading-[0.9] tracking-[-0.035em] lg:text-[clamp(2.9rem,3.65vw,4.5rem)]">
                DDA Silver,
                <br />
                Agra&apos;s trusted family destination for purity,
                craftsmanship &amp; trust.
              </h1>
              <p className="mt-5 max-w-[23rem] text-sm leading-6 text-ink-muted">
                Discover silver jewellery, coins, pooja pieces, thoughtful
                gifts, and homeware—selected with care for modern Indian
                families.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="button-primary home-hero-button no-underline"
                  data-analytics="hero_products"
                >
                  Explore products
                  <ArrowRightIcon size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/rates"
                  className="button-secondary home-hero-button no-underline"
                  data-analytics="hero_rates"
                >
                  View live rates
                  <ArrowRightIcon size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden bg-[#d8d4d0] sm:min-h-[27rem] lg:min-h-full">
            <Image
              src="/images/mockup/hero-silver-bowl.png"
              alt="Concept image of an ornate engraved silver bowl"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>
        </div>
      </section>

      <CategoryIndex categories={categories} />

      <section className="border-b border-line bg-paper-strong">
        <div className="grid lg:grid-cols-[1fr_31rem]">
          <div className="px-5 py-12 sm:px-10 lg:px-[max(3rem,calc((100vw-90rem)/2))] min-[90rem]:py-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Featured silver</p>
                <h2 className="font-display mt-3 text-[clamp(2.5rem,2.6vw,2.75rem)] font-semibold leading-none">
                  Timeless pieces, thoughtful details.
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 border-b border-copper pb-2 text-sm font-bold no-underline"
              >
                Explore all products
                <ArrowRightIcon size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 min-[90rem]:mt-4">
              {featured.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          </div>
          <RateTeaser />
        </div>
      </section>

      <section className="section-shell">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Visit DDA Silver</p>
            <h2 className="font-display text-balance mt-4 text-6xl font-semibold leading-[0.95]">
              See the collection in Agra.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-muted">
              Browse online, then speak with the showroom team to confirm
              availability and plan your visit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="button-primary no-underline"
                data-analytics="whatsapp_home"
              >
                <WhatsappLogoIcon size={20} aria-hidden="true" />
                Enquire on WhatsApp
              </a>
              <a
                href={siteConfig.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="button-secondary no-underline"
                data-analytics="map_home"
              >
                <MapPinIcon size={20} aria-hidden="true" />
                Get directions
              </a>
            </div>
          </div>
          <dl className="grid divide-y divide-line border-y border-line">
            <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Address
              </dt>
              <dd className="font-display text-2xl">{siteConfig.address}</dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Hours
              </dt>
              <dd className="font-display text-2xl">{siteConfig.hours}</dd>
            </div>
            <div className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Phone
              </dt>
              <dd className="font-display text-2xl">
                <a
                  href={siteConfig.phoneHref}
                  className="no-underline"
                  data-analytics="phone_home"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <AppPromo />

      <a
        href={buildGeneralWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Confirm availability on WhatsApp"
        className="fixed right-4 bottom-4 z-30 inline-flex min-h-14 items-center gap-3 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink no-underline shadow-[0_12px_35px_rgba(37,35,33,0.18)] transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6 sm:px-5"
        data-analytics="whatsapp_floating"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#35b85a] text-white">
          <WhatsappLogoIcon size={20} weight="fill" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Confirm availability on WhatsApp</span>
      </a>
    </main>
  );
}
