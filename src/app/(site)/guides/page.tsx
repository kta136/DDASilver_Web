import { EditorialPage } from "@/components/editorial-page";
import { guides } from "@/data/guides";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Silver Buying & Care Guides",
  description:
    "Choose a silver gift, understand product specifications and prepare the right care questions with DDA Silver's guides for showroom enquiries in Agra.",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <EditorialPage
      eyebrow="Buying guides"
      title="Choose with confidence."
      intro="Practical questions to help you compare silver pieces and speak with the Agra showroom about the item you want."
      sections={guides.map((guide) => ({
        title: guide.title,
        paragraphs: [guide.intro],
        links: [{ label: "Read the guide", href: `/guides/${guide.slug}` }],
      }))}
    />
  );
}
