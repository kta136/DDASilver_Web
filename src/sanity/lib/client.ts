import { createClient } from "next-sanity";

import { sanityApiVersion, sanityDataset, sanityProjectId } from "@/sanity/env";

export const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  // Next owns public caching, so revalidation must read the current origin.
  useCdn: false,
  perspective: "published",
  timeout: 10_000,
  maxRetries: 1,
});

export const sanityPreviewClient = sanityClient.withConfig({
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "drafts",
});
