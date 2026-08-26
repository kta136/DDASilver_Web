// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  parseBody: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("next/cache", () => mocks);
vi.mock("next-sanity/webhook", () => ({ parseBody: mocks.parseBody }));
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: () => ({ allowed: true }),
}));
import { POST } from "@/app/api/sanity/revalidate/route";
beforeEach(() => {
  vi.stubEnv("SANITY_REVALIDATE_SECRET", "test-secret");
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllEnvs());
const request = () =>
  new NextRequest("http://localhost/api/sanity/revalidate", { method: "POST" });
describe("Sanity publish webhook", () => {
  it.each(["product", "category", "collection", "deity", "sanity.imageAsset"])(
    "invalidates dependent data for %s",
    async (_type) => {
      mocks.parseBody.mockResolvedValue({
        isValidSignature: true,
        body: { _type, _id: "published", slug: "silver-bowl" },
      });
      expect((await POST(request())).status).toBe(200);
      expect(mocks.revalidateTag).toHaveBeenCalledWith("sanity-catalog", {
        expire: 0,
      });
      expect(mocks.revalidateTag).toHaveBeenCalledWith("product", {
        expire: 0,
      });
      expect(mocks.revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    },
  );
  it("rejects unauthenticated or malformed requests without invalidation", async () => {
    mocks.parseBody.mockResolvedValue({
      isValidSignature: false,
      body: { _type: "product" },
    });
    expect((await POST(request())).status).toBe(401);
    mocks.parseBody.mockRejectedValue(new Error("Malformed body"));
    expect((await POST(request())).status).toBe(400);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
  it("ignores draft events", async () => {
    mocks.parseBody.mockResolvedValue({
      isValidSignature: true,
      body: { _type: "product", _id: "drafts.product" },
    });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});
