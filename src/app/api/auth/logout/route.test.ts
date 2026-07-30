import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, cookiesMock } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    delete: vi.fn(),
  },
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/auth/config", () => ({
  authConfig: {
    revokeUrl: "https://ddajewels.com/api/v1/auth/sso/revoke",
    clientId: "ddasilver",
    clientSecret: "s".repeat(32),
  },
  isAuthConfigured: true,
  sessionCookie: "dda_session",
}));
vi.mock("@/lib/security/same-origin", () => ({
  isSameOriginRequest: () => true,
}));

import { POST } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  cookiesMock.mockResolvedValue(cookieStore);
  cookieStore.get.mockReturnValue({ value: "satellite_session_token" });
});

describe("POST /api/auth/logout", () => {
  it("revokes the satellite session before clearing the DDA Silver cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(new Request("https://silver.example/api/auth/logout"));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0]!;
    expect(String(options.body)).toContain("session_token=satellite_session_token");
    expect(cookieStore.delete).toHaveBeenCalledWith("dda_session");
  });

  it("still completes local logout when DDAJewels is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const response = await POST(new Request("https://silver.example/api/auth/logout"));

    expect(response.status).toBe(200);
    expect(cookieStore.delete).toHaveBeenCalledWith("dda_session");
  });
});
