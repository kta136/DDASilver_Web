import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { getCatalogNavigation } from "@/sanity/lib/catalog";
import { CatalogUnavailableError } from "@/sanity/lib/read";

const categoriesToExplore = [
  { slug: "coin", title: "Silver coins", description: "Explore devotional and occasion designs, with purity and product details for each piece." },
  { slug: "idols", title: "Silver idols", description: "Compare deities, poses and construction to find a piece for your home or a thoughtful gift." },
  { slug: "utensils", title: "Silver utensils", description: "Discover glasses, bowls, plates and pooja pieces for your table and daily rituals." },
] as const;

const rateQuestions = [
  { question: "Where do these silver rates come from?", answer: "Customer and market reference rates are supplied by DDAJewels. The displayed values update as the feed changes; the update time is shown in Indian Standard Time (IST)." },
  { question: "Why are Silver Bank and Agra Mohar different?", answer: "Silver Bank and Agra Mohar are separate entries in the DDAJewels rate feed. They can carry different quoted values. Mention the displayed rate name when asking our showroom about a quotation." },
  { question: "Is the silver rate the final price of a product?", answer: "The final price depends on the selected piece, its purity, making charges and applicable taxes. Published catalogue estimates include making charges and taxes; confirm the final quotation with our showroom." },
  { question: "How do I check the purity of a piece?", answer: "Open the individual product page to see its recorded purity and other details. The live silver reference rate does not establish the purity of every design in the catalogue." },
  { question: "How can I collect my chosen piece?", answer: "Browse the catalogue and send the product link or reference to our team on WhatsApp. Collection is from our Agra showroom only. Confirm the item and collection arrangements before visiting." },
] as const;

export function RatesGuide() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-14" aria-labelledby="rates-guide-heading">
      <div className="border-t border-line pt-8">
        <p className="eyebrow">Understanding the silver rate</p>
        <h2 id="rates-guide-heading" className="font-display mt-3 text-3xl sm:text-4xl">A clearer quote for your chosen piece.</h2>
        <div className="mt-6 grid gap-x-10 md:grid-cols-2">
          {rateQuestions.map(({ question, answer }) => (
            <details key={question} className="border-b border-line py-4">
              <summary className="cursor-pointer py-2 text-sm font-semibold leading-6">{question}</summary>
              <p className="pb-2 pt-3 text-sm leading-7 text-ink-muted">{answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-5 text-xs leading-6 text-ink-muted">
          Market closures or connection delays can affect the displayed rates. <Link href="/rates-disclaimer" className="underline underline-offset-4">Read the rates disclaimer</Link>.
        </p>
      </div>
    </section>
  );
}

export async function RatesDiscovery() {
  let navigation;
  try {
    navigation = await getCatalogNavigation();
  } catch (error) {
    // Optional catalogue content must not interrupt the independent rate feed.
    if (error instanceof CatalogUnavailableError) return null;
    throw error;
  }
  const categories = categoriesToExplore.flatMap((selection) => {
    const category = navigation.categories.find((item) => item.slug === selection.slug && (item.productCount ?? 0) > 0);
    return category ? [{ ...selection, image: category.firstProductImage ?? category.image }] : [];
  });
  const collections = navigation.collections.filter((item) => (item.productCount ?? item.productSlugs.length) > 0).slice(0, 4);

  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-12" aria-labelledby="rates-discovery-heading">
      <div className="border-t border-line pt-8">
        <p className="eyebrow">From today&apos;s rate to your next piece</p>
        <h2 id="rates-discovery-heading" className="font-display mt-3 text-3xl sm:text-4xl">Explore silver in our Agra showroom.</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {categories.map(({ slug, title, description, image }) => (
            <Link key={slug} href={`/category/${slug}`} className="group border border-line no-underline"
              data-analytics="catalog_browse" data-analytics-placement="rates_discovery" data-analytics-category-slug={slug}>
              <div className="relative aspect-[4/3] bg-[#f4f1eb]">
                <Image src={image.src} alt={image.alt} fill sizes="(max-width: 639px) 100vw, 33vw" className="object-contain" />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold group-hover:underline">{title} <span aria-hidden="true">→</span></h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
              </div>
            </Link>
          ))}
        </div>
        {collections.length ? (
          <nav aria-label="Silver collections" className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {collections.map((collection) => (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className="py-3 text-sm underline underline-offset-4"
                data-analytics="catalog_browse" data-analytics-placement="rates_collections" data-analytics-collection-slug={collection.slug}>
                {collection.title}
              </Link>
            ))}
          </nav>
        ) : null}
        <div className="mt-7 border border-line bg-[#f4f1eb] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="max-w-lg">
            <h3 className="text-base font-semibold">Ask for a quote. Plan your visit.</h3>
            <p className="mt-2 text-sm leading-7 text-ink-muted">Share the design you like with our team. Showroom collection only, at {siteConfig.address}.</p>
          </div>
          <div className="mt-5 flex shrink-0 flex-col items-stretch gap-3 sm:mt-0">
            <a href={buildGeneralWhatsAppUrl()} target="_blank" rel="noreferrer" className="button-primary no-underline"
              data-analytics="whatsapp_click" data-analytics-placement="rates_discovery">Enquire on WhatsApp</a>
            <a href={siteConfig.phoneHref} className="py-3 text-center text-sm underline underline-offset-4"
              data-analytics="phone_click" data-analytics-placement="rates_discovery">Call {siteConfig.phoneDisplay}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
