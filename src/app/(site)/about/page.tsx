import Image from "next/image";
import Link from "next/link";

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About Our Agra Silver Showroom",
  description:
    "Learn about DDA Silver, our Agra roots, dedicated silver showroom and relationship with the wider DDA family of jewellery and precious-metal brands.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="grid border-b border-line lg:min-h-[31rem] lg:grid-cols-[48%_52%]">
        <div className="flex items-center px-5 py-10 sm:px-10 sm:py-12 lg:px-[max(3rem,calc((100vw-90rem)/2))]">
          <div>
            <p className="eyebrow">The DDA Silver story</p>
            <h1 className="font-display text-balance mt-4 text-6xl font-semibold leading-[0.88] sm:text-7xl">
              Rooted in Agra,
              <br />
              made for today.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
              DDA Silver brings the DDA family&apos;s long relationship with
              jewellery and precious metals into a distinct, approachable
              silver showroom.
            </p>
          </div>
        </div>
        <div className="relative min-h-[27rem] bg-[#e4e1dd]">
          <Image
            src="/images/mockup/hero-silver-bowl.webp"
            alt="Concept image of an ornate engraved silver bowl"
            fill
            fetchPriority="high"
            sizes="(max-width: 1023px) 100vw, 52vw"
            className="object-cover"
            style={{ objectPosition: "center" }}
          />
        </div>
      </section>

      <section className="section-shell">
        <div className="site-container grid gap-8 lg:grid-cols-[18rem_1fr]">
          <p className="eyebrow">A sister brand</p>
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl font-semibold">
              A dedicated home for silver.
            </h2>
            <div className="mt-6 grid gap-5 text-base leading-8 text-ink-muted">
              <p>
                DDA Silver focuses on silver jewellery, coins, pooja pieces,
                gifts, and homeware. It is presented as a distinct sister brand
                to DDAJewels, with its own showroom experience and digital
                catalog.
              </p>
              <p>
                This site is designed for discovery and direct conversation.
                It does not display prices or inventory, and it does not offer
                online checkout. The showroom team confirms product details on
                WhatsApp or by phone.
              </p>
              <p>
                The DDA family heritage dates to 1977. DDA Silver carries that
                legacy forward through a focused silver showroom shaped for
                today&apos;s customers.
              </p>
            </div>
            <Link href="/contact" className="button-primary mt-8 no-underline">
              Plan a showroom visit
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
