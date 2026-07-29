import { describe, expect, it } from "vitest";

import { isSafeReturnTo } from "@/lib/auth/transaction";

describe("auth return URL allowlist", () => {
  it("accepts local paths", () => {
    expect(isSafeReturnTo("/rates?from=login")).toBe("/rates?from=login");
  });

  it("rejects protocol-relative and external URLs", () => {
    expect(isSafeReturnTo("//evil.example/path")).toBe("/");
    expect(isSafeReturnTo("https://evil.example/path")).toBe("/");
  });
});
