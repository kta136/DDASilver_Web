import Link from "next/link";
import type { CatalogEditorialSection } from "@/types/catalog";

export function CatalogEditorial({
  sections,
}: {
  sections?: CatalogEditorialSection[];
}) {
  if (!sections?.length) return null;
  return (
    <aside
      aria-label="Selection guidance"
      className="mt-12 border-t border-line pt-9"
    >
      <div className="grid gap-8 md:grid-cols-2">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-3xl font-semibold">
              {section.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <p className="mt-7 text-sm leading-7">
        Read our <Link href="/guides">silver buying guides</Link> or{" "}
        <Link href="/contact">contact the Agra showroom</Link> to discuss a
        particular piece.
      </p>
    </aside>
  );
}
