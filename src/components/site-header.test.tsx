// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import { SiteHeader } from "@/components/site-header";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ user: null }),
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("<SiteHeader />", () => {
  it("keeps desktop and mobile Live Rates links inside DDA Silver", () => {
    render(<SiteHeader />);

    const ratesLinks = screen.getAllByRole("link", { name: "Live Rates" });
    expect(ratesLinks).toHaveLength(2);
    for (const link of ratesLinks) {
      expect(link).toHaveAttribute("href", "/rates");
    }
  });

  it("shows branded desktop and mobile login controls that return to the current page", () => {
    render(<SiteHeader />);

    const loginLinks = screen.getAllByRole("link", { name: "Login" });
    expect(loginLinks).toHaveLength(2);
    for (const link of loginLinks) {
      expect(link).toHaveAttribute(
        "href",
        "/api/auth/login?returnTo=%2F",
      );
    }
  });

  it("shows the DDAJewels account name and performs local logout", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: "user_1", name: "Asha", authStatus: "approved" },
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<SiteHeader />);

    const accountButton = await screen.findByRole("button", {
      name: "Account menu for Asha",
    });
    fireEvent.click(accountButton);
    fireEvent.click(screen.getAllByRole("menuitem", { name: "Logout" })[0]!);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }),
    );
    expect(await screen.findAllByRole("link", { name: "Login" })).toHaveLength(
      2,
    );
  });
});
