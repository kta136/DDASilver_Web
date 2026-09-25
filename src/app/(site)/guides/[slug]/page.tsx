import { notFound } from "next/navigation";
import { EditorialPage } from "@/components/editorial-page";
import { guides } from "@/data/guides";
import {
  formatGuideProductExample,
  loadPublishedGuideProductExamples,
} from "@/lib/guide-product-examples";
import { createPageMetadata } from "@/lib/seo";
import { getPublishedProduct } from "@/sanity/lib/catalog";

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
  const productExampleSlugs =
    "productExampleSlugs" in guide ? guide.productExampleSlugs : [];
  const exampleProducts = productExampleSlugs?.length
    ? await loadPublishedGuideProductExamples(
        productExampleSlugs,
        getPublishedProduct,
      )
    : [];

  return (
    <EditorialPage
      eyebrow="DDA Silver guide"
      title={guide.title}
      intro={guide.intro}
      sections={[
        ...guide.sections,
        ...(exampleProducts.length
          ? [
              {
                title: "Product examples",
                paragraphs: [
                  "These examples show how the recorded dimensions and weight describe a specific piece.",
                ],
                links: exampleProducts.map((product) => ({
                  label: formatGuideProductExample(product),
                  href: `/products/${product.slug}`,
                })),
              },
            ]
          : []),
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
