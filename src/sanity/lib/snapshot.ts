import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

const MAX_SNAPSHOTS = 200;
const MAX_AGE_MS = 24 * 60 * 60 * 1_000;
type Snapshot = { savedAt: number; value: unknown };

export interface SnapshotStore {
  get(key: string): Promise<unknown | undefined>;
  set(key: string, value: unknown): Promise<void>;
}

export function createSnapshotStore(directory?: string): SnapshotStore {
  const memory = new Map<string, Snapshot>();
  const fileFor = (key: string) =>
    join(directory!, `${createHash("sha256").update(key).digest("hex")}.json`);
  return {
    async get(key) {
      let snapshot = memory.get(key);
      if (!snapshot && directory) {
        try {
          snapshot = JSON.parse(
            await readFile(fileFor(key), "utf8"),
          ) as Snapshot;
        } catch {
          /* Cold cache is expected. */
        }
      }
      if (
        !snapshot ||
        !Number.isFinite(snapshot.savedAt) ||
        Date.now() - snapshot.savedAt > MAX_AGE_MS
      )
        return;
      return snapshot.value;
    },
    async set(key, value) {
      const serialized = JSON.stringify(value);
      const previous = memory.get(key);
      if (
        previous &&
        JSON.stringify(previous.value) === serialized &&
        Date.now() - previous.savedAt < 60_000
      )
        return;
      memory.delete(key);
      const snapshot = { savedAt: Date.now(), value };
      memory.set(key, snapshot);
      if (memory.size > MAX_SNAPSHOTS)
        memory.delete(memory.keys().next().value!);
      if (!directory) return;
      const target = fileFor(key);
      const temporary = `${target}.${randomUUID()}.tmp`;
      try {
        await mkdir(directory, { recursive: true });
        await writeFile(temporary, JSON.stringify(snapshot), { mode: 0o600 });
        await rename(temporary, target);
        const files = (
          await readdir(directory, { withFileTypes: true })
        ).filter(
          (file) => file.isFile() && /^[a-f0-9]{64}\.json$/.test(file.name),
        );
        // Only this cache's hash-named files are eligible for eviction.
        if (files.length > MAX_SNAPSHOTS) {
          const entries = await Promise.all(
            files.map(async (file) => {
              const path = join(directory, file.name);
              try {
                return {
                  path,
                  savedAt: (
                    JSON.parse(await readFile(path, "utf8")) as Snapshot
                  ).savedAt,
                };
              } catch {
                return { path, savedAt: 0 };
              }
            }),
          );
          await Promise.all(
            entries
              .sort((a, b) => a.savedAt - b.savedAt)
              .slice(0, entries.length - MAX_SNAPSHOTS)
              .map(({ path }) => rm(path, { force: true })),
          );
        }
      } catch {
        console.warn(
          "Sanity recovery snapshot could not be persisted; memory recovery remains available.",
        );
      } finally {
        await rm(temporary, { force: true }).catch(() => undefined);
      }
    },
  };
}
