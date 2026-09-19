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
import { getHomepageCategories } from "@/lib/homepage-categories";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { getHomepageCatalog } from "@/sanity/lib/catalog";

export const metadata = createPageMetadata({
  title: "DDA Silver | Silver Jewellery, Coins & Live Rates in Agra",
  description:
    "Discover silver jewellery, coins, idols, gifts and homeware at DDA Silver in Agra, view live silver rates and plan your showroom visit.",
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const catalog = await getHomepageCatalog();
  const { categories, products } = catalog;
  const homepageCategories = getHomepageCategories(categories);
  const featured = [...products]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 4);

  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Agra / Silver showroom</p>
          <h1>
            Silver, made
            <br />
            meaningful.
          </h1>
          <p className="hero-description">
            Timeless pieces for everyday rituals, memorable occasions and the
            generations that follow.
          </p>
          <Link href="/products" className="hero-cta">
            Explore products <ArrowRightIcon size={19} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-hero-photo">
          <Image
            src="/images/design/homepage-b-editorial.png"
            alt="An editorial arrangement of silver tableware on a sunlit stone table"
            fill
            fetchPriority="high"
            loading="eager"
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <CategoryIndex categories={homepageCategories} />

      <section className="section-shell border-b border-line bg-paper-strong">
        <div className="site-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Featured silver</p>
              <h2 className="font-display mt-3 text-[clamp(2.5rem,3.5vw,3.5rem)] font-normal leading-none">
                Objects to treasure.
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
          <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 ">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="rates-invitation">
        <div className="site-container">
          <div>
            <p className="eyebrow">A clearer view of silver</p>
            <h2>
              Know the rate.
              <br />
              Choose with confidence.
            </h2>
          </div>
          <div>
            <p>
              Follow the latest displayed silver rates, then speak with our team
              about the piece you have in mind.
            </p>
            <Link href="/rates" className="hero-cta">
              View live rates <ArrowRightIcon size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Visit DDA Silver</p>
            <h2 className="font-display text-balance mt-4 text-5xl font-normal leading-[1.1]">
              See the collection in Agra.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-muted">
              Browse in-stock designs online, then speak with the showroom team
              about final pricing and plan your visit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="button-primary no-underline"
                data-analytics="whatsapp_click"
                data-analytics-placement="home_visit"
              >
                <WhatsappLogoIcon size={20} aria-hidden="true" />
                Enquire on WhatsApp
              </a>
              <a
                href={siteConfig.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="button-secondary no-underline"
                data-analytics="map_click"
                data-analytics-placement="home_visit"
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
                  data-analytics="phone_click"
                  data-analytics-placement="home_visit"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section-shell border-t border-line">
        <div className="site-container guide-invitation">
          <div>
            <p className="eyebrow">The silver journal</p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">
              A little knowledge. A lasting choice.
            </h2>
          </div>
          <div>
            <p className="mb-6 leading-7 text-ink-muted">
              Understand silver purity, care for your pieces and find a gift
              with meaning.
            </p>
            <Link href="/guides" className="text-link">
              Read our buying guides{" "}
              <ArrowRightIcon size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <AppPromo />

      <a
        href={buildGeneralWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Enquire on WhatsApp"
        className="fixed right-4 bottom-4 z-30 inline-flex min-h-14 items-center gap-3 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink no-underline shadow-[0_12px_35px_rgba(37,35,33,0.18)] transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6 sm:px-5"
        data-analytics="whatsapp_click"
        data-analytics-placement="floating"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#35b85a] text-white">
          <WhatsappLogoIcon size={20} weight="fill" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">
          Enquire on WhatsApp
        </span>
      </a>
    </main>
  );
}
