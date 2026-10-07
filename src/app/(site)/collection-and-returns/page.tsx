import { EditorialPage } from "@/components/editorial-page";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Showroom Collection, Returns & Exchanges",
  description: "DDA Silver offers showroom collection in Agra. Returns or exchanges are accepted subject to conditions. Confirm the terms for your item with our team.",
  path: "/collection-and-returns",
});

export default function CollectionAndReturnsPage() {
  return (
    <EditorialPage eyebrow="Shop with confidence" title="Collection, returns & exchanges"
      intro="Collect your chosen piece from our Agra showroom. Returns or exchanges are accepted, subject to conditions."
      sections={[
        { title: "Showroom collection only", paragraphs: [
          "DDA Silver offers showroom collection only. We do not offer shipping or home delivery.",
          `Visit us at ${siteConfig.address}. Our showroom hours are ${siteConfig.hours}. Confirm your selected item, final price and collection arrangements with our team before visiting.`,
        ], links: [{ label: "Contact the showroom", href: "/contact" }] },
        { title: "Returns and exchanges", paragraphs: [
          "Returns or exchanges are accepted, subject to conditions. Please confirm the applicable terms for your selected item with the showroom team before purchase.",
          "For help with a return or exchange, contact our team to discuss your purchase and the applicable conditions.",
        ], links: [{ label: `Call ${siteConfig.phoneDisplay}`, href: siteConfig.phoneHref }] },
      ]} />
  );
}
