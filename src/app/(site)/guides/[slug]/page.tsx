import { notFound } from "next/navigation";
import { EditorialPage } from "@/components/editorial-page";
import { guides } from "@/data/guides";
import { createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return createPageMetadata({
    title: guide.title,
    description: guide.intro,
    path: `/guides/${guide.slug}`,
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();
  return (
    <EditorialPage
      eyebrow="DDA Silver guide"
      title={guide.title}
      intro={guide.intro}
      sections={[
        ...guide.sections,
        {
          title: "Explore more",
          paragraphs: [],
          links: [
            { label: "All buying guides", href: "/guides" },
            { label: "Visit the showroom", href: "/contact" },
          ],
        },
      ]}
    />
  );
}
