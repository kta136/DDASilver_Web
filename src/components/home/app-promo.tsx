import {
  AndroidLogoIcon,
  AppleLogoIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react/ssr";

import { siteConfig } from "@/lib/site";

export function AppPromo() {
  return (
    <section className="section-shell border-t border-line bg-ink text-white">
      <div className="site-container grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d99482]">
            DDA Silver app
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-5xl font-semibold leading-[0.95] sm:text-6xl">
            Silver rates and showroom discovery, wherever you are.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
            Use the existing DDA Silver app to check rates, browse gallery
            updates, and find showroom information.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a
            href={siteConfig.androidUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 items-center gap-3 rounded-full border border-white/25 px-5 font-semibold no-underline hover:bg-white hover:text-ink"
            data-analytics="app_android"
          >
            <AndroidLogoIcon size={24} aria-hidden="true" />
            Android app
            <ArrowSquareOutIcon size={17} aria-hidden="true" />
          </a>
          <a
            href={siteConfig.iosUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 items-center gap-3 rounded-full border border-white/25 px-5 font-semibold no-underline hover:bg-white hover:text-ink"
            data-analytics="app_ios"
          >
            <AppleLogoIcon size={24} aria-hidden="true" />
            iPhone app
            <ArrowSquareOutIcon size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
