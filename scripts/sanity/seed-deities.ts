import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-28" });
const applyChanges =
  process.argv.includes("--apply") ||
  process.env.SANITY_SEED_DEITIES_APPLY === "1";
const idsArgument = process.argv.find((argument) =>
  argument.startsWith("--ids="),
);
const idsValue =
  idsArgument?.slice("--ids=".length) ??
  process.env.SANITY_SEED_DEITIES_IDS;

const deities = [
  { _id: "deity-krishna", title: "Krishna", slug: "krishna", displayOrder: 1 },
  { _id: "deity-ganesha", title: "Ganesha", slug: "ganesha", displayOrder: 2 },
  {
    _id: "deity-khatu-shyam",
    title: "Khatu Shyam",
    slug: "khatu-shyam",
    displayOrder: 3,
  },
  { _id: "deity-shiva", title: "Shiva", slug: "shiva", displayOrder: 4 },
  { _id: "deity-parvati", title: "Parvati", slug: "parvati", displayOrder: 5 },
  { _id: "deity-hanuman", title: "Hanuman", slug: "hanuman", displayOrder: 6 },
  { _id: "deity-sai-baba", title: "Sai Baba", slug: "sai-baba", displayOrder: 7 },
  { _id: "deity-vishnu", title: "Vishnu", slug: "vishnu", displayOrder: 8 },
  { _id: "deity-lakshmi", title: "Lakshmi", slug: "lakshmi", displayOrder: 9 },
  {
    _id: "deity-saraswati",
    title: "Saraswati",
    slug: "saraswati",
    displayOrder: 10,
  },
  { _id: "deity-kuber", title: "Kuber", slug: "kuber", displayOrder: 11 },
  {
    _id: "deity-kartikeya",
    title: "Kartikeya",
    slug: "kartikeya",
    displayOrder: 12,
  },
  { _id: "deity-radha", title: "Radha", slug: "radha", displayOrder: 13 },
  { _id: "deity-durga", title: "Durga", slug: "durga", displayOrder: 14 },
  {
    _id: "deity-guru-nanak",
    title: "Guru Nanak",
    slug: "guru-nanak",
    displayOrder: 15,
  },
  {
    _id: "deity-jagannath",
    title: "Jagannath",
    slug: "jagannath",
    displayOrder: 16,
  },
  {
    _id: "deity-balabhadra",
    title: "Balabhadra",
    slug: "balabhadra",
    displayOrder: 17,
  },
  {
    _id: "deity-subhadra",
    title: "Subhadra",
    slug: "subhadra",
    displayOrder: 18,
  },
  {
    _id: "deity-kamdhenu",
    title: "Kamdhenu",
    slug: "kamdhenu",
    displayOrder: 19,
  },
  {
    _id: "deity-laughing-buddha",
    title: "Laughing Buddha",
    slug: "laughing-buddha",
    displayOrder: 20,
  },
  {
    _id: "deity-maharaja-agrasen",
    title: "Maharaja Agrasen",
    slug: "maharaja-agrasen",
    displayOrder: 21,
  },
  { _id: "deity-rama", title: "Rama", slug: "rama", displayOrder: 22 },
  { _id: "deity-sita", title: "Sita", slug: "sita", displayOrder: 23 },
  {
    _id: "deity-mahavir",
    title: "Mahavir",
    slug: "mahavir",
    displayOrder: 24,
  },
  { _id: "deity-buddha", title: "Buddha", slug: "buddha", displayOrder: 25 },
  {
    _id: "deity-br-ambedkar",
    title: "B. R. Ambedkar",
    slug: "br-ambedkar",
    displayOrder: 26,
  },
] as const;

const requestedIds = idsValue
  ?.split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const selectedDeities = requestedIds?.length
  ? deities.filter((deity) => requestedIds.includes(deity._id))
  : deities;

if (requestedIds?.length) {
  const foundIds = new Set<string>(selectedDeities.map((deity) => deity._id));
  const unknownIds = requestedIds.filter((id) => !foundIds.has(id));
  if (unknownIds.length > 0) {
    throw new Error(`Unknown deity IDs: ${unknownIds.join(", ")}`);
  }
}

async function main() {
  const { projectId, dataset } = client.config();

  if (!applyChanges) {
    console.log(
      `Dry run only: would seed ${selectedDeities.length} deities into ${projectId}/${dataset}.`,
    );
    console.table(
      selectedDeities.map(({ title, slug, displayOrder }) => ({
        title,
        slug,
        displayOrder,
      })),
    );
    console.log("Re-run with --apply after confirming the target.");
    return;
  }

  if (
    process.env.SANITY_EXPECTED_PROJECT_ID &&
    process.env.SANITY_EXPECTED_PROJECT_ID !== projectId
  ) {
    throw new Error("Sanity project does not match SANITY_EXPECTED_PROJECT_ID");
  }
  if (
    process.env.SANITY_EXPECTED_DATASET &&
    process.env.SANITY_EXPECTED_DATASET !== dataset
  ) {
    throw new Error("Sanity dataset does not match SANITY_EXPECTED_DATASET");
  }

  for (const deity of selectedDeities) {
    await client.createOrReplace({
      _id: deity._id,
      _type: "deity",
      title: deity.title,
      slug: {
        _type: "slug",
        current: deity.slug,
      },
      displayOrder: deity.displayOrder,
    });

    console.log(`Seeded ${deity.title} (${deity._id})`);
  }

  console.log("Deity seed complete.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
