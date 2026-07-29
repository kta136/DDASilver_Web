import { EditorialPage } from "@/components/editorial-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Website Terms",
  description:
    "Read the draft terms for browsing the DDA Silver website, viewing reference rates and sending product availability enquiries.",
  path: "/terms",
  canonical: false,
  noIndex: true,
});

export default function TermsPage() {
  return (
    <EditorialPage
      eyebrow="Legal draft"
      title="Website terms"
      intro="These draft terms describe the browse-and-enquire nature of the DDA Silver website."
      notice="Owner and legal review is required before launch. This page is not final legal advice."
      sections={[
        {
          title: "Catalog information",
          paragraphs: [
            "The website is a digital showroom. Images and descriptions help customers discover designs, but they are not an offer to sell online.",
            "Product appearance can vary with photography, lighting, display settings, and handcrafted details.",
          ],
        },
        {
          title: "Availability and pricing",
          paragraphs: [
            "Prices and inventory are intentionally not displayed. Customers should confirm current details directly with the showroom before relying on a product listing.",
          ],
        },
        {
          title: "External links",
          paragraphs: [
            "Links to WhatsApp, maps, app stores, DDAJewels, and other services open external platforms. Their availability and terms are controlled by those platforms.",
          ],
        },
      ]}
    />
  );
}
