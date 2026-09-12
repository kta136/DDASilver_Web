// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { register } from "./instrumentation";
import { startGalleryPricingWorker } from "./lib/pricing/background";

const start = vi.hoisted(() => vi.fn(() => () => {}));
vi.mock("./lib/pricing/background", () => ({ startGalleryPricingWorker: start }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("pricing worker registration", () => {
  it.each([
    ["edge", "phase-production-server", "fixture"],
    ["nodejs", "phase-production-build", "fixture"],
    ["nodejs", "phase-production-server", ""],
  ])("does not start outside a Node server with an explicit volume (%s, %s, %s)", async (runtime, phase, directory) => {
    vi.stubEnv("NEXT_RUNTIME", runtime);
    vi.stubEnv("NEXT_PHASE", phase);
    vi.stubEnv("GALLERY_PRICING_DIR", directory);
    await register();
    expect(startGalleryPricingWorker).not.toHaveBeenCalled();
  });

  it("starts once per process, including concurrent registration", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    vi.stubEnv("GALLERY_PRICING_DIR", "fixture");
    vi.stubGlobal("ddaGalleryPricingWorker", undefined);
    await Promise.all([register(), register()]);
    expect(startGalleryPricingWorker).toHaveBeenCalledOnce();
  });
});
