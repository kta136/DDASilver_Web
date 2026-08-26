"use client";

import {
  AndroidLogoIcon,
  AppleLogoIcon,
  CaretDownIcon,
  ListIcon,
  SignOutIcon,
  UserCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import { siteConfig } from "@/lib/site";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Live Rates", href: "/rates" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

type AccountState =
  { status: "guest" } | { status: "user"; name: string; authStatus: string };

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
    <header className="relative z-40 border-b border-line bg-paper/95 backdrop-blur">
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

      <div className="site-container flex min-h-20 items-center justify-between gap-6 min-[90rem]:min-h-[6.25rem]">
        <BrandMark />

        <div className="hidden items-center gap-7 lg:flex">
          <nav aria-label="Primary navigation">
            <ul className="flex items-center gap-9">
              {navigation.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        "relative py-3 text-sm font-semibold no-underline transition-colors hover:text-copper-dark",
                        isActive ? "text-ink" : "text-ink-muted",
                      )}
                    >
                      {item.label}
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-1 h-px bg-copper"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
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
              account={account}
              pathname={pathname}
              onLogout={logout}
            />
          </div>
        </div>

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
          <li className="border-b border-line pb-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <MobileAccount
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
  onLogout,
}: {
  account: AccountState;
  pathname: string;
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
        href={loginHref(pathname)}
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
  onLogin,
  onLogout,
}: {
  account: AccountState;
  pathname: string;
  onLogin: () => void;
  onLogout: () => Promise<void>;
}) {
  if (account.status === "guest") {
    return (
      <a
        href={loginHref(pathname)}
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
