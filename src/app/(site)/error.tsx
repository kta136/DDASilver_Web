"use client";

export default function SiteError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="site-container py-20">
      <h1 className="font-display text-5xl">We couldn’t load this page.</h1>
      <p className="mt-5 text-ink-muted">
        Please try again shortly. Our showroom team can also help with product
        enquiries.
      </p>
      <button type="button" onClick={reset} className="button-primary mt-7">
        Try again
      </button>
    </main>
  );
}
