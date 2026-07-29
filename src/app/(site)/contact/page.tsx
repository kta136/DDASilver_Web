import {
  ArrowSquareOutIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call, WhatsApp, or visit DDA Silver opposite Nagar Nigam on MG Road in Agra.",
  alternates: { canonical: "/contact" },
};

const contactRows = [
  {
    label: "Phone",
    value: siteConfig.phoneDisplay,
    href: siteConfig.phoneHref,
    analytics: "phone_contact",
    icon: PhoneIcon,
  },
  {
    label: "WhatsApp",
    value: siteConfig.whatsappDisplay,
    href: buildGeneralWhatsAppUrl(),
    analytics: "whatsapp_contact",
    icon: WhatsappLogoIcon,
  },
  {
    label: "Showroom",
    value: siteConfig.address,
    href: siteConfig.mapUrl,
    analytics: "map_contact",
    icon: MapPinIcon,
  },
];

export default function ContactPage() {
  return (
    <main id="main-content" className="section-shell">
      <div className="site-container">
        <p className="eyebrow">Contact & visit</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_31rem] lg:items-end">
          <h1 className="font-display text-balance text-6xl font-semibold leading-[0.88] sm:text-8xl">
            Let&apos;s find the right silver piece.
          </h1>
          <p className="text-lg leading-8 text-ink-muted">
            There is no enquiry form and no customer submission is stored on
            this website. Contact the showroom directly instead.
          </p>
        </div>

        <div className="mt-10 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1fr_1fr]">
          <div className="grid divide-y divide-line border-y border-line">
            {contactRows.map((row) => {
              const Icon = row.icon;
              return (
                <a
                  key={row.label}
                  href={row.href}
                  target={row.href.startsWith("http") ? "_blank" : undefined}
                  rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group grid gap-4 py-6 no-underline sm:grid-cols-[8rem_1fr_auto] sm:items-center"
                  data-analytics={row.analytics}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                    {row.label}
                  </span>
                  <span className="font-display text-3xl font-semibold">
                    {row.value}
                  </span>
                  <Icon
                    size={23}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>

          <aside className="bg-white p-7 sm:p-10">
            <ClockIcon size={30} className="text-copper" aria-hidden="true" />
            <h2 className="font-display mt-5 text-4xl font-semibold">
              Showroom hours
            </h2>
            <p className="mt-4 text-lg leading-8">{siteConfig.hours}</p>
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              Hours can change on holidays. Call before a special trip.
            </p>
            {siteConfig.googleBusinessUrl ? (
              <a
                href={siteConfig.googleBusinessUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold no-underline hover:text-copper-dark"
                data-analytics="google_business"
              >
                Google Business Profile
                <ArrowSquareOutIcon size={17} aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-7 border-t border-line pt-5 text-xs leading-5 text-ink-muted">
                The verified Google Business Profile URL is still required
                before launch.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
