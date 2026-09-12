import { EditorialPage } from "@/components/editorial-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Website Terms",
  description:
    "Read the terms for browsing the DDA Silver website, viewing reference rates and sending product availability enquiries.",
  path: "/terms",
  canonical: false,
  noIndex: true,
});

export default function TermsPage() {
  return (
    <EditorialPage
      eyebrow="Website information"
      title="Website terms"
      intro="These terms describe the browse-and-enquire nature of the DDA Silver website."
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
            "Customers should confirm current product details and availability directly with the showroom before relying on a listing.",
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
