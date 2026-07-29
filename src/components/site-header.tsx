"use client";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { RatesPortalLink } from "@/components/rates-portal-link";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Live Rates", href: "/rates", ratesPortal: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="site-container flex min-h-20 items-center justify-between gap-6 min-[90rem]:min-h-[6.25rem]">
        <BrandMark />

        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {navigation.map((item) => {
              const isActive =
                item.ratesPortal
                  ? false
                  : item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const linkClassName = clsx(
                "relative py-3 text-sm font-semibold no-underline transition-colors hover:text-copper-dark",
                isActive ? "text-ink" : "text-ink-muted",
              );
              const content = (
                <>
                  {item.label}
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-1 h-px bg-copper"
                    />
                  ) : null}
                </>
              );

              return (
                <li key={item.href}>
                  {item.ratesPortal ? (
                    <RatesPortalLink className={linkClassName}>
                      {content}
                    </RatesPortalLink>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={linkClassName}
                    >
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex size-12 items-center justify-center rounded-full border border-line bg-paper-strong text-ink lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <XIcon size={23} /> : <ListIcon size={23} />}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={clsx(
          "absolute inset-x-0 top-full border-b border-line bg-paper px-4 py-5 shadow-[0_20px_35px_rgba(36,32,28,0.1)] lg:hidden",
          isOpen ? "block" : "hidden",
        )}
      >
        <ul className="site-container grid">
          {navigation.map((item) => (
            <li key={item.href} className="border-b border-line last:border-b-0">
              {item.ratesPortal ? (
                <RatesPortalLink
                  className="flex min-h-14 items-center justify-between py-3 font-semibold no-underline"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                  <span aria-hidden="true">→</span>
                </RatesPortalLink>
              ) : (
                <Link
                  href={item.href}
                  className="flex min-h-14 items-center justify-between py-3 font-semibold no-underline"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
