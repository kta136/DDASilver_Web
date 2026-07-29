"use client";

export function ConsentPreferencesButton() {
  return (
    <button
      type="button"
      className="text-left text-sm text-ink-muted underline decoration-line-strong hover:text-ink"
      onClick={() => window.dispatchEvent(new Event("dda-open-consent"))}
    >
      Cookie preferences
    </button>
  );
}
