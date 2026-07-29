import { createClient } from "next-sanity";

import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "@/sanity/env";

export const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: true,
  perspective: "published",
});

export const sanityPreviewClient = sanityClient.withConfig({
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "drafts",
});
