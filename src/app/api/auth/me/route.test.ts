import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, cookiesMock, readBoundedJsonMock } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
  },
  cookiesMock: vi.fn(),
  readBoundedJsonMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/auth/config", () => ({
  authConfig: {
    introspectUrl: "https://ddajewels.com/api/v1/auth/sso/introspect",
    clientId: "ddasilver",
    clientSecret: "s".repeat(32),
  },
  authCookiesSecure: false,
  isAuthConfigured: true,
  sessionCookie: "dda_session",
  sessionCookieMaxAgeSeconds: 400 * 24 * 60 * 60,
}));
vi.mock("@/lib/security/external-service", () => ({
  readBoundedJson: readBoundedJsonMock,
}));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  cookiesMock.mockResolvedValue(cookieStore);
  cookieStore.get.mockReturnValue({ value: "satellite_session_token" });
});

describe("GET /api/auth/me", () => {
  it("returns the authorized DDAJewels identity for an active session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
    );
    readBoundedJsonMock.mockResolvedValue({
      active: true,
      user: {
        subject: "user_1",
        display_name: "Asha",
        auth_status: "approved",
      },
      expires_at: "2026-08-28T12:00:00.000Z",
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: {
        id: "user_1",
        name: "Asha",
        authStatus: "approved",
        isApproved: true,
        emailVerified: true,
        canViewCharts: true,
        canViewBuyingPrice: false,
      },
    });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(cookieStore.set).toHaveBeenCalledWith(
      "dda_session",
      "satellite_session_token",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 400 * 24 * 60 * 60,
      },
    );
  });

  it("uses the authoritative group permissions from DDAJewels", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    readBoundedJsonMock
      .mockResolvedValueOnce({
        active: true,
        user: {
          subject: "user_1",
          display_name: "Asha",
          auth_status: "approved",
        },
        expires_at: "2026-08-28T12:00:00.000Z",
      })
      .mockResolvedValueOnce({
        user: {
          id: "user_1",
          name: "Asha",
          isApproved: true,
          emailVerified: true,
          canViewCharts: false,
          canViewBuyingPrice: true,
        },
      });

    const response = await GET();

    await expect(response.json()).resolves.toMatchObject({
      user: { canViewCharts: false, canViewBuyingPrice: true },
    });
    const meHeaders = fetchMock.mock.calls[1]?.[1]?.headers as
      Record<string, string> | undefined;
    expect(meHeaders?.Cookie).toBe(
      "dda_session=satellite_session_token; __Host-dda_session=satellite_session_token",
    );
  });

  it("clears an inactive satellite session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
    );
    readBoundedJsonMock.mockResolvedValue({ active: false });

    const response = await GET();

    await expect(response.json()).resolves.toEqual({ user: null });
    expect(cookieStore.delete).toHaveBeenCalledWith("dda_session");
  });

  it("does not call DDAJewels when no local session exists", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET();

    await expect(response.json()).resolves.toEqual({ user: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
