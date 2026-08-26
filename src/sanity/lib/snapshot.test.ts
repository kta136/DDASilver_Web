// @vitest-environment node
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSnapshotStore } from "@/sanity/lib/snapshot";

afterEach(() => vi.useRealTimers());
describe("catalog recovery storage", () => {
  it("survives a new store instance and leaves unrelated files untouched", async () => {
    const directory = await mkdtemp(join(tmpdir(), "dda-sanity-test-"));
    try {
      await writeFile(join(directory, "keep.txt"), "unrelated");
      await createSnapshotStore(directory).set("published-query", [
        { slug: "silver-bowl" },
      ]);
      expect(
        await createSnapshotStore(directory).get("published-query"),
      ).toEqual([{ slug: "silver-bowl" }]);
      expect(
        (await readdir(directory)).filter((file) => file.endsWith(".tmp")),
      ).toEqual([]);
      expect(await readdir(directory)).toContain("keep.txt");
    } finally {
      if (
        !resolve(directory).startsWith(resolve(tmpdir()) + sep) ||
        !basename(directory).startsWith("dda-sanity-test-")
      )
        throw new Error("Unexpected test directory");
      await rm(directory, { recursive: true, force: true });
    }
  });
  it("expires old recovery data and bounds memory entries", async () => {
    vi.useFakeTimers();
    const store = createSnapshotStore();
    for (let index = 0; index < 201; index++)
      await store.set(String(index), index);
    expect(await store.get("0")).toBeUndefined();
    expect(await store.get("200")).toBe(200);
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);
    expect(await store.get("200")).toBeUndefined();
  });
});
