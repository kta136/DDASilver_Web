import { defineCliConfig } from "sanity/cli";

import { sanityDataset, sanityProjectId } from "./src/sanity/env";

export default defineCliConfig({
  api: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
  },
  typegen: {
    path: "./src/sanity/lib/queries.ts",
    schema: "./src/sanity/schema.json",
    generates: "./src/sanity/types.ts",
  },
});
