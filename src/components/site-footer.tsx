import {
  ArrowSquareOutIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { ConsentPreferencesButton } from "@/components/consent/consent-preferences-button";
import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

const legalLinks = [
  { label: "Buying guides", href: "/guides" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Rates disclaimer", href: "/rates-disclaimer" },
  { label: "Cookies", href: "/cookies" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#f1eee9]">
      <div className="site-container grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-10">
        <div>
          <BrandMark compact />
          <p className="mt-6 max-w-md text-sm leading-7 text-ink-muted">
            A modern silver showroom in Agra for jewellery, coins, pooja pieces,
            thoughtful gifts, and homeware.
          </p>
          <a
            href={siteConfig.sisterBrandUrl}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink no-underline hover:text-copper-dark"
            target="_blank"
            rel="noreferrer"
          >
            Visit sister brand DDAJewels
            <ArrowSquareOutIcon size={17} aria-hidden="true" />
          </a>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink">
            Visit & enquire
          </h2>
          <ul className="mt-5 grid gap-4 text-sm text-ink-muted">
            <li>
              <a
                href={siteConfig.phoneHref}
                className="inline-flex items-start gap-3 no-underline hover:text-ink"
                data-analytics="phone_click"
                data-analytics-placement="footer"
              >
                <PhoneIcon className="mt-0.5 shrink-0" size={18} />
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={buildGeneralWhatsAppUrl()}
                className="inline-flex items-start gap-3 no-underline hover:text-ink"
                target="_blank"
                rel="noreferrer"
                data-analytics="whatsapp_click"
                data-analytics-placement="footer"
              >
                <WhatsappLogoIcon className="mt-0.5 shrink-0" size={18} />
                {siteConfig.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.mapUrl}
                className="inline-flex items-start gap-3 no-underline hover:text-ink"
                target="_blank"
                rel="noreferrer"
                data-analytics="map_click"
                data-analytics-placement="footer"
              >
                <MapPinIcon className="mt-0.5 shrink-0" size={18} />
                {siteConfig.address}
              </a>
            </li>
          </ul>
          <p className="mt-5 text-sm leading-6 text-ink-muted">
            {siteConfig.hours}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-ink">
            Information
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-muted no-underline hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <ConsentPreferencesButton />
            </li>
            <li>
              <Link
                href="/login"
                className="text-sm text-ink-muted no-underline hover:text-ink"
                data-analytics="login_start"
                data-analytics-placement="footer"
              >
                Customer login
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="site-container flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DDA Silver. All rights reserved.</p>
          <p>Browse and enquire. No online sales or stock claims.</p>
        </div>
      </div>
    </footer>
  );
}
