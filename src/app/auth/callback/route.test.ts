import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  checkRateLimitMock,
  cookieStore,
  cookiesMock,
  readBoundedJsonMock,
  verifyAuthTransactionMock,
} = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(),
  cookieStore: {
    get: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
  },
  cookiesMock: vi.fn(),
  readBoundedJsonMock: vi.fn(),
  verifyAuthTransactionMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("@/lib/auth/config", () => ({
  authConfig: {
    tokenUrl: "https://ddajewels.com/api/v1/auth/sso/token",
    clientId: "ddasilver",
    clientSecret: "s".repeat(32),
  },
  authCookiesSecure: false,
  authOrigin: "http://localhost:3010",
  authTransactionCookie: "dda_auth_transaction",
  isAuthConfigured: true,
  sessionCookie: "dda_session",
  sessionCookieMaxAgeSeconds: 400 * 24 * 60 * 60,
}));
vi.mock("@/lib/auth/transaction", () => ({
  safeEqual: (left: string, right: string) => left === right,
  verifyAuthTransaction: verifyAuthTransactionMock,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));
vi.mock("@/lib/security/external-service", () => ({
  readBoundedJson: readBoundedJsonMock,
}));

import { GET } from "./route";

const transaction = {
  state: "expected_state",
  nonce: "expected_nonce_that_is_long_enough",
  verifier: "verifier_value_that_is_long_enough_for_pkce_1234567890",
  returnTo: "/rates",
  expiresAt: Date.now() + 60_000,
};

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimitMock.mockReturnValue({ allowed: true });
  cookiesMock.mockResolvedValue(cookieStore);
  cookieStore.get.mockReturnValue({ value: "signed_transaction" });
  verifyAuthTransactionMock.mockReturnValue(transaction);
});

describe("GET /auth/callback", () => {
  it("sets a host-only DDA Silver session after a valid code exchange", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
    );
    readBoundedJsonMock.mockResolvedValue({
      session_token: "satellite_session_token_1234567890",
      expires_in: 400 * 24 * 60 * 60,
      nonce: "expected_nonce_that_is_long_enough",
    });

    const response = await GET(callbackRequest("expected_state"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3010/rates",
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "dda_session",
      "satellite_session_token_1234567890",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 400 * 24 * 60 * 60,
      },
    );
    expect(cookieStore.delete).toHaveBeenCalledWith("dda_auth_transaction");
  });

  it("rejects altered state before contacting DDAJewels", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(callbackRequest("altered_state"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3010/login?error=handoff_failed",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cookieStore.delete).toHaveBeenCalledWith("dda_auth_transaction");
  });

  it("rejects a nonce mismatch and shows the generic retry page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
    );
    readBoundedJsonMock.mockResolvedValue({
      session_token: "satellite_session_token_1234567890",
      expires_in: 3600,
      nonce: "wrong_nonce",
    });

    const response = await GET(callbackRequest("expected_state"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3010/login?error=handoff_failed",
    );
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("uses a generic temporary-unavailable error when exchange times out", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    const response = await GET(callbackRequest("expected_state"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3010/login?error=temporarily_unavailable",
    );
    expect(cookieStore.delete).toHaveBeenCalledWith("dda_auth_transaction");
  });
});

function callbackRequest(state: string) {
  return new Request(
    `http://localhost:3010/auth/callback?code=opaque_authorization_code&state=${state}`,
  );
}
