import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr";
import { isAuthConfigured } from "@/lib/auth/config";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Customer Login",
  description:
    "Continue securely to DDAJewels to use your existing shared customer account.",
  path: "/login",
  canonical: false,
  noIndex: true,
});

export default function LoginPage() {
  return (
    <main id="main-content" className="section-shell">
      <div className="site-container grid gap-8 lg:grid-cols-[1fr_30rem] lg:items-start">
        <div>
          <p className="eyebrow">Shared DDA account</p>
          <h1 className="font-display text-balance mt-4 max-w-4xl text-6xl font-semibold leading-[0.88] sm:text-8xl">
            One account,
            <br />
            securely handed off.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-ink-muted">
            DDAJewels remains responsible for passwords, Google sign-in,
            signup, and account recovery. DDA Silver receives only a
            short-lived authorization code and keeps its own secure session.
          </p>
        </div>

        <aside className="border border-line bg-white p-7 sm:p-9">
          <ShieldCheckIcon size={34} className="text-copper" aria-hidden="true" />
          <h2 className="font-display mt-5 text-4xl font-semibold">
            Continue to DDAJewels
          </h2>
          <p className="mt-4 text-sm leading-6 text-ink-muted">
            Your existing DDAJewels account is preserved. DDA Silver never
            stores your password.
          </p>
          {isAuthConfigured ? (
            <a
              href="/api/auth/login?returnTo=%2Frates"
              className="button-primary mt-7 w-full no-underline"
              data-analytics="login_start"
              data-analytics-placement="login_page"
            >
              Continue securely
              <ArrowRightIcon size={18} aria-hidden="true" />
            </a>
          ) : (
            <div className="mt-7 border border-copper/35 bg-[#fff7f4] p-4 text-sm leading-6 text-ink-muted">
              Shared login is scaffolded but unavailable until the DDAJewels
              authorization and token endpoints are configured.
            </div>
          )}
          <a
            href={`${siteConfig.sisterBrandUrl}/login`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold no-underline hover:text-copper-dark"
          >
            Account help on DDAJewels
            <ArrowSquareOutIcon size={16} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </main>
  );
}
