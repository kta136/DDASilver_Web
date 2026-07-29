import type { Metadata } from "next";

import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Rates disclaimer",
  robots: { index: false, follow: false },
};

export default function RatesDisclaimerPage() {
  return (
    <EditorialPage
      eyebrow="Rate information"
      title="Rates disclaimer"
      intro="Live-rate information is supplied by DDAJewels and presented for customer reference."
      notice="Owner and legal review is required before launch. This page is not final legal advice."
      sections={[
        {
          title: "Source and timing",
          paragraphs: [
            "DDAJewels remains the source of truth for customer and market-reference rates. DDA Silver does not calculate, edit, or substitute rate values.",
            "Network delays, market closure, data-source interruptions, or device conditions can make a displayed value stale or unavailable.",
          ],
        },
        {
          title: "No transaction guarantee",
          paragraphs: [
            "A displayed rate does not guarantee a transaction price or product availability. Confirm applicable rates and terms directly with the showroom.",
          ],
        },
        {
          title: "Unavailable states",
          paragraphs: [
            "If no valid snapshot is available, the website intentionally shows dashes and an unavailable message rather than zero or an estimated value.",
          ],
        },
      ]}
    />
  );
}
