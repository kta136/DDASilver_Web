import { EditorialPage } from "@/components/editorial-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Read the draft DDA Silver privacy policy covering website analytics, consent, customer-account boundaries and contact interactions.",
  path: "/privacy",
  canonical: false,
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <EditorialPage
      eyebrow="Legal draft"
      title="Privacy"
      intro="This draft explains the privacy boundaries built into the replacement website."
      notice="Owner and legal review is required before launch. This page is not final legal advice."
      sections={[
        {
          title: "Information this website does not collect",
          paragraphs: [
            "DDA Silver does not provide a website enquiry form, cart, checkout, saved-product area, or member profile.",
            "The website does not ask visitors to submit names, phone numbers, email addresses, passwords, payment information, or shipping addresses.",
          ],
        },
        {
          title: "Analytics choices",
          paragraphs: [
            "Analytics and advertising storage are denied until a visitor makes a consent choice. Preferences can be changed from the footer.",
            "Configured analytics events describe actions such as catalog search, filters, and outbound link clicks. Event payloads do not include search text, names, phone numbers, or email addresses.",
          ],
        },
        {
          title: "External services",
          paragraphs: [
            "WhatsApp, phone, maps, app stores, DDAJewels authentication, Sanity, and live-rate services are separate services with their own privacy practices.",
          ],
        },
      ]}
    />
  );
}
