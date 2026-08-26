// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  getCatalogListing: vi.fn(),
  checkRateLimit: vi.fn(),
}));
vi.mock("@/sanity/lib/catalog", () => ({
  getCatalogListing: mocks.getCatalogListing,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));
import { GET } from "@/app/api/catalog/route";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.checkRateLimit.mockReturnValue({ allowed: true });
});
describe("paginated catalog endpoint", () => {
  it("passes filters and collection scope and never publicly caches preview responses", async () => {
    mocks.getCatalogListing.mockResolvedValue({
      result: { products: [], total: 0, page: 1 },
    });
    const response = await GET(
      new Request(
        "http://localhost/api/catalog?category=coin&page=2&collection=gifts",
      ),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.getCatalogListing.mock.calls[0][0].get("page")).toBe("2");
    expect(mocks.getCatalogListing.mock.calls[0][2]).toBe("gifts");
  });
  it("returns a controlled error without demo products or internal details", async () => {
    mocks.getCatalogListing.mockRejectedValue(
      new Error("sensitive upstream detail"),
    );
    const response = await GET(new Request("http://localhost/api/catalog"));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("sensitive");
  });
  it("rate limits repeated requests", async () => {
    mocks.checkRateLimit.mockReturnValue({ allowed: false, retryAfter: 10 });
    const response = await GET(new Request("http://localhost/api/catalog"));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("10");
    expect(mocks.getCatalogListing).not.toHaveBeenCalled();
  });
});
