import { Studio } from "@/components/studio/studio";
import { createPageMetadata } from "@/lib/seo";
import { isSanityConfigured } from "@/sanity/env";

export const metadata = createPageMetadata({
  title: "Content Studio",
  description: "Private content-management workspace for DDA Silver editors.",
  path: "/studio",
  canonical: false,
  noIndex: true,
});

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6">
        <div>
          <p className="eyebrow">Content setup</p>
          <h1 className="font-display mt-4 text-5xl">Sanity is scaffolded.</h1>
          <p className="mt-5 text-lg leading-8 text-ink-muted">
            Add the Sanity project ID, dataset, and preview token to the
            environment before opening the Studio.
          </p>
        </div>
      </main>
    );
  }

  return <Studio />;
}
