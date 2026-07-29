import { Breadcrumbs } from "@/components/breadcrumbs";

type EditorialSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type EditorialPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: EditorialSection[];
  notice?: string;
};

export function EditorialPage({
  eyebrow,
  title,
  intro,
  sections,
  notice,
}: EditorialPageProps) {
  return (
    <main id="main-content" className="section-shell">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_30rem] lg:items-end">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="font-display text-balance mt-4 text-6xl font-semibold leading-[0.9] sm:text-8xl">
              {title}
            </h1>
          </div>
          <p className="text-lg leading-8 text-ink-muted">{intro}</p>
        </div>

        {notice ? (
          <p className="mt-8 border border-copper/35 bg-[#fff7f4] p-5 text-sm leading-6 text-ink-muted">
            {notice}
          </p>
        ) : null}

        <div className="mt-10 grid gap-8 border-t border-line pt-10 lg:grid-cols-[18rem_1fr]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
            DDA Silver
          </p>
          <div className="grid max-w-3xl gap-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-4xl font-semibold">
                  {section.title}
                </h2>
                <div className="mt-4 grid gap-4 text-base leading-8 text-ink-muted">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="grid gap-3 pl-5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="list-disc pl-1">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
