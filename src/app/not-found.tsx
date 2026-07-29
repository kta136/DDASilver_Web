import Link from "next/link";

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Page Not Found",
  description:
    "The requested DDA Silver page could not be found. Return to the silver catalog or use the main navigation to continue.",
  path: "/",
  canonical: false,
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="site-container flex min-h-[55vh] items-center py-14">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="font-display mt-4 text-7xl font-semibold">
          This page could not be found.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
          Return to the showroom catalog or use the main navigation to
          continue.
        </p>
        <Link href="/products" className="button-primary mt-8 no-underline">
          Explore products
        </Link>
      </div>
    </main>
  );
}
