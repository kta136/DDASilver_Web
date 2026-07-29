import { EditorialPage } from "@/components/editorial-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Cookie Policy",
  description:
    "Learn how DDA Silver uses essential browser storage, consent preferences, security controls and optional analytics on this website.",
  path: "/cookies",
  canonical: false,
  noIndex: true,
});

export default function CookiesPage() {
  return (
    <EditorialPage
      eyebrow="Preference control"
      title="Cookies"
      intro="The website uses a small number of browser-storage and session controls for consent, security, and optional analytics."
      notice="Owner and legal review is required before launch. This page is not final legal advice."
      sections={[
        {
          title: "Essential storage",
          paragraphs: [
            "The consent choice is stored in the browser so the website can remember it. Secure, HttpOnly cookies are used during shared-account login and for the DDA Silver session.",
          ],
        },
        {
          title: "Optional analytics and advertising",
          paragraphs: [
            "Google analytics and advertising storage are denied by default. Visitors can allow or refuse each category and can reopen preferences from the website footer.",
          ],
        },
        {
          title: "Changing your choice",
          paragraphs: [
            "Use the Cookie preferences control in the footer at any time. A new choice replaces the earlier stored preference.",
          ],
        },
      ]}
    />
  );
}
