"use client";

import {
  AndroidLogoIcon,
  AppleLogoIcon,
  CaretDownIcon,
  ListIcon,
  MagnifyingGlassIcon,
  WhatsappLogoIcon,
  SignOutIcon,
  UserCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Payal Brands", href: "/silver-payal-brands" },
  { label: "Live Rates", href: "/rates" },
  { label: "Our Showroom", href: "/about" },
  { label: "Guides", href: "/guides" },
  { label: "Contact", href: "/contact" },
];

type AccountState =
  { status: "guest" } | { status: "user"; name: string; authStatus: string };

export function SiteHeader({
  loginAvailable = true,
}: {
  loginAvailable?: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const [account, setAccount] = useState<AccountState>({ status: "guest" });

  useEffect(() => {
    let active = true;
    async function loadAccount() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          user?: { name?: unknown; authStatus?: unknown } | null;
        };
        if (!active) return;
        const name =
          typeof payload.user?.name === "string"
            ? payload.user.name.trim()
            : "";
        if (!name) {
          setAccount({ status: "guest" });
          return;
        }
        setAccount({
          status: "user",
          name,
          authStatus:
            typeof payload.user?.authStatus === "string"
              ? payload.user.authStatus
              : "approved",
        });
      } catch {
        // The public website remains usable while account status is unavailable.
      }
    }
    void loadAccount();
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAccount({ status: "guest" });
      setIsOpen(false);
    }
  }

  return (
    <header
      className="site-header relative z-40"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setSearchOpen(false);
          setIsOpen(false);
          if (isOpen) menuToggle.current?.focus();
          else if (searchOpen) searchToggle.current?.focus();
        }
      }}
    >
      <div className="masthead site-container">
        <div className="masthead-left">
          <button
            ref={searchToggle}
            type="button"
            className="header-search"
            aria-label="Search the collection"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setIsOpen(false);
            }}
          >
            <MagnifyingGlassIcon size={21} aria-hidden="true" />
            <span className="hidden xl:inline">Search</span>
          </button>
          <nav aria-label="Primary navigation" className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-8">
              {navigation
                .filter(
                  (item) =>
                    item.href === "/products" ||
                    item.href === "/silver-payal-brands" ||
                    item.href === "/rates",
                )
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={
                        pathname.startsWith(item.href) ? "page" : undefined
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
        <div className="masthead-brand">
          <BrandMark compact masthead />
        </div>
        <div className="masthead-right">
          <nav aria-label="Showroom navigation" className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-8">
              <li>
                <Link href="/about">Our Showroom</Link>
              </li>
              <li>
                <Link href="/guides">Guides</Link>
              </li>
            </ul>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {pathname.startsWith("/rates") ? (
              <div
                data-rates-header-actions="desktop"
                data-testid="rates-header-actions-desktop"
                className={clsx(
                  "flex items-center gap-1",
                  account.status === "guest" && "hidden",
                )}
              />
            ) : null}
            <DesktopAccount
              loginAvailable={loginAvailable}
              account={account}
              pathname={pathname}
              onLogout={logout}
            />
          </div>
          <a
            className="header-enquiry hidden xl:flex"
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            aria-label="Enquire on WhatsApp"
            data-analytics="whatsapp_click"
            data-analytics-placement="header"
          >
            <WhatsappLogoIcon size={23} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="header-menu lg:hidden"
            ref={menuToggle}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setIsOpen(!isOpen);
              setSearchOpen(false);
            }}
          >
            {isOpen ? <XIcon size={25} /> : <ListIcon size={25} />}
          </button>
        </div>
      </div>
      {searchOpen ? (
        <form
          id="site-search"
          role="search"
          action="/products"
          className="site-search site-container"
        >
          <label htmlFor="header-query">Find your next meaningful piece</label>
          <div className="flex gap-3">
            <input
              autoFocus
              id="header-query"
              type="search"
              name="q"
              placeholder="Search coins, idols, utensils…"
              required
              className="min-w-0 flex-1"
            />
            <button className="button-primary" type="submit">
              Search
            </button>
          </div>
        </form>
      ) : null}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={clsx(
          "absolute inset-x-0 top-full border-b border-line bg-paper px-4 py-5 shadow-[0_20px_35px_rgba(36,32,28,0.1)] lg:hidden",
          isOpen ? "block" : "hidden",
        )}
      >
        <div
          className="bg-ink text-white lg:hidden"
          data-testid="mobile-app-download-bar"
        >
          <div className="site-container flex min-h-12 items-center justify-between gap-3 py-1.5">
            <p className="min-w-0 text-xs font-semibold leading-tight">
              Download DDA Silver app
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={siteConfig.androidUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Download DDA Silver for Android"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 text-[0.6875rem] font-bold text-white no-underline"
                data-analytics="app_store_click"
                data-analytics-platform="android"
                data-analytics-placement="mobile_app_bar"
              >
                <AndroidLogoIcon size={16} aria-hidden="true" />
                Android
              </a>
              <a
                href={siteConfig.iosUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Download DDA Silver for iPhone"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 text-[0.6875rem] font-bold text-white no-underline"
                data-analytics="app_store_click"
                data-analytics-platform="ios"
                data-analytics-placement="mobile_app_bar"
              >
                <AppleLogoIcon size={16} aria-hidden="true" />
                iPhone
              </a>
            </div>
          </div>
        </div>

        <ul className="site-container grid">
          <li className="border-b border-line pb-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <MobileAccount
                  loginAvailable={loginAvailable}
                  account={account}
                  pathname={pathname}
                  onLogin={() => setIsOpen(false)}
                  onLogout={logout}
                />
              </div>
              {pathname.startsWith("/rates") ? (
                <div
                  data-rates-header-actions="mobile"
                  className={clsx(
                    "flex shrink-0 items-center gap-1",
                    account.status === "guest" && "hidden",
                  )}
                />
              ) : null}
            </div>
          </li>
          {navigation.map((item) => (
            <li
              key={item.href}
              className="border-b border-line last:border-b-0"
            >
              <Link
                href={item.href}
                className="flex min-h-14 items-center justify-between py-3 font-semibold no-underline"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function DesktopAccount({
  account,
  pathname,
  loginAvailable,
  onLogout,
}: {
  account: AccountState;
  pathname: string;
  loginAvailable: boolean;
  onLogout: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeMenu(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", closeMenu);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (account.status === "guest") {
    return (
      <a
        href={loginAvailable ? loginHref(pathname) : "/login"}
        rel="nofollow"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-copper px-5 py-2 text-sm font-bold text-ink no-underline transition-colors hover:bg-copper hover:text-white"
        data-analytics="login_start"
        data-analytics-placement="header"
      >
        <UserCircleIcon size={19} aria-hidden="true" />
        Login
      </a>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 max-w-48 items-center gap-2 rounded-full border border-copper px-4 py-2 text-sm font-bold text-ink"
        aria-label={`Account menu for ${account.name}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <UserCircleIcon size={19} aria-hidden="true" />
        <span className="truncate">{account.name}</span>
        <CaretDownIcon size={14} aria-hidden="true" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.65rem)] min-w-56 border border-line bg-paper p-2 shadow-[0_18px_35px_rgba(36,32,28,0.14)]"
        >
          <p className="px-3 py-2 text-xs text-ink-muted">
            Signed in through DDAJewels
          </p>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold hover:bg-paper-strong"
            onClick={() => void onLogout()}
          >
            <SignOutIcon size={18} aria-hidden="true" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MobileAccount({
  account,
  pathname,
  loginAvailable,
  onLogin,
  onLogout,
}: {
  account: AccountState;
  pathname: string;
  loginAvailable: boolean;
  onLogin: () => void;
  onLogout: () => Promise<void>;
}) {
  if (account.status === "guest") {
    return (
      <a
        href={loginAvailable ? loginHref(pathname) : "/login"}
        rel="nofollow"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-copper px-5 py-3 font-bold text-white no-underline"
        data-analytics="login_start"
        data-analytics-placement="mobile_menu"
        onClick={onLogin}
      >
        <UserCircleIcon size={20} aria-hidden="true" />
        Login
      </a>
    );
  }

  return (
    <div className="grid gap-3 border-t border-line pt-4">
      <p className="flex items-center gap-2 font-semibold">
        <UserCircleIcon size={20} aria-hidden="true" />
        <span className="truncate">{account.name}</span>
      </p>
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-copper px-5 py-3 font-bold text-ink"
        onClick={() => void onLogout()}
      >
        <SignOutIcon size={19} aria-hidden="true" />
        Logout
      </button>
    </div>
  );
}

function loginHref(pathname: string) {
  const returnTo =
    pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/";
  return `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}
