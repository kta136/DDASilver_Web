import type { CatalogEditorialSection } from "@/types/catalog";

// Seed copy for Sanity. Subsequent edits belong in Studio; the migration never
// overwrites an editor's existing guidance.
export const categoryEditorial: Record<string, CatalogEditorialSection[]> = {
  coin: [
    {
      heading: "Choose a coin by design and weight",
      body: "Browse round, oval, square and rectangular silver coins, including devotional and occasion designs. Open an individual coin to compare its recorded weight, purity and front-and-back photographs. A design name alone does not identify its size: check the gram weight before enquiring about several similar pieces.",
    },
    {
      heading: "Compare the details before requesting a quote",
      body: "Use the purity and shape filters to narrow the range. Weight and purity describe different properties, and a bullion reference rate is not a finished coin quotation. Send the product link or reference to the showroom and ask about current availability, the final quote and any packaging you need for your occasion.",
    },
  ],
  idols: [
    {
      heading: "Find the right deity and composition",
      body: "The idol catalog includes individual deities, pairs and larger compositions. Use the deity and construction filters, then inspect the photographs for the pose, base, arch and decorative details. A Lakshmi–Ganesha pair and an individual Ganesha idol serve different display needs even when their weights are similar.",
    },
    {
      heading: "Check dimensions as well as weight",
      body: "Measure the space where the idol will stand and compare the listed height, width and depth where available. Weight alone does not establish height or construction. If a measurement is not shown, ask the showroom to check it for that reference before deciding. Confirm the pieces included in a set and the care suitable for its finish.",
    },
  ],
  utensils: [
    {
      heading: "Browse by the type of piece",
      body: "The utensils range includes glasses, bowls, spoons, plates and pooja thali sets. Use the product-type filter to compare similar items. For glasses, review the stated height; for bowls and plates, look for the diameter. Photographs show the design, but they are not a reliable scale or a measure of capacity.",
    },
    {
      heading: "Plan a set around its intended use",
      body: "Compare each item's recorded purity, weight and dimensions. For a coordinated set, ask which vessels or accessories are included and whether the displayed measurements refer to the tray or another component. Discuss your intended use and the correct cleaning method with the showroom before purchase, especially for decorated or enamelled pieces.",
    },
  ],
  purse: [
    {
      heading: "Compare the shape, handle and decoration",
      body: "Silver purses vary in panel design, outline and handle style. Look through the product photograph and compare the recorded weight and purity. A heavier purse is not necessarily larger inside. If you need it to hold particular belongings, request the internal dimensions and a closure check for the selected reference.",
    },
    {
      heading: "Choose a piece for your occasion",
      body: "For wedding or festive use, consider how the purse will be carried and how its finish complements the outfit. Ask the showroom about the exact item, current availability, care and packaging before making a decision. Decorative details can require different handling from an undecorated silver surface.",
    },
  ],
  gifts: [
    {
      heading: "Start with the recipient and the occasion",
      body: "Explore decorative, devotional and ceremonial silver gifts. Compare what the recipient will use or display, the space available and the details visible in each photograph. A product name may describe a set, so read the item information and confirm the included pieces rather than assuming everything in a styled arrangement is supplied.",
    },
    {
      heading: "Make the enquiry specific",
      body: "Send the product link or reference together with your occasion and required date. Check the recorded weight, purity and dimensions, and ask for any missing measurements. Availability, the final quotation, packaging and any requested service need confirmation from the showroom; the catalog is a browsing and enquiry service.",
    },
  ],
  jhula: [
    {
      heading: "Choose a jhula to fit your display",
      body: "Compare the frame, hanging seat and ornamentation in each product photograph. The catalog lists the recorded silver weight and dimensions where available. Before choosing, measure the intended display space and ask the showroom to confirm both the overall dimensions and the usable seat area for your idol.",
    },
    {
      heading: "Confirm the components",
      body: "Ask whether your selected reference is the jhula alone or includes other pieces. Do not assume an idol or accessory is included without confirmation. Discuss suitable handling, assembly and care for the hanging parts and decorative details, and request a current quote for the exact product.",
    },
  ],
  gold: [
    {
      heading: "Gold coins and bars",
      body: "This category contains gold products, separate from the silver coin range. Compare the stated material, purity and gram weight on each product page. Use the individual product reference when enquiring so that similarly named gold and silver pieces are not confused.",
    },
    {
      heading: "Check the item and final quotation",
      body: "A published reference metal rate is not a final price for a finished coin or bar. Ask the showroom to confirm availability, the item's documentation, the final quotation and any applicable charges before purchase. Do not infer hallmarking, certification or a resale promise from a catalog photograph.",
    },
  ],
};

export const curatedCollections = [
  {
    slug: "silver-ganesha-idols",
    title: "Silver Ganesha Idols",
    description:
      "Compare individual Ganesha silver idols by pose, arch, construction and recorded measurements. Explore the photographs and enquire about a specific reference.",
    editorialSections: [
      {
        heading: "Compare individual Ganesha designs",
        body: "This selection brings together individual Ganesha idols rather than Lakshmi–Ganesha pairs. Look for differences in the seat, arch and base, and compare the recorded weight and dimensions. For a mandir or a smaller display, confirm the complete height and footprint of the selected piece.",
      },
      {
        heading: "Prepare your enquiry",
        body: "Send the product reference and the space you have available. Ask for any missing dimensions, confirm the construction and request care guidance for the finish shown. Current availability and the final quote are confirmed by the Agra showroom.",
      },
    ],
  },
  {
    slug: "lakshmi-ganesha-silver-idol-pairs",
    title: "Lakshmi–Ganesha Silver Idol Pairs",
    description:
      "Explore silver idol pairs featuring Lakshmi and Ganesha. Compare the composition, recorded weight and display dimensions before contacting the Agra showroom.",
    editorialSections: [
      {
        heading: "A pair needs space for both figures",
        body: "Review whether the figures share a base or stand separately in the product photograph. Ask which measurements describe the entire pair and which describe an individual figure. Compare the recorded weight without assuming two different pairs have the same dimensions or construction.",
      },
      {
        heading: "Confirm what is included",
        body: "Use the product link to ask about the exact pair, any base or accessories, current availability and the final quotation. If you need an individual Ganesha idol instead, browse the separate Ganesha selection or use the deity filter in the idol catalog.",
      },
    ],
  },
  {
    slug: "silver-pooja-thali-sets",
    title: "Silver Pooja Thali Sets",
    description:
      "Browse silver pooja thali sets with coordinated ritual vessels. Compare tray designs, recorded diameters, weights and purity for your selected reference.",
    editorialSections: [
      {
        heading: "Compare the tray and its vessels",
        body: "Check the thali's stated diameter and inspect the accompanying pieces in the photograph. Different sets can contain different vessels; ask the showroom for the exact contents. Where one weight is recorded for a set, confirm its scope before comparing it with an individual plate.",
      },
      {
        heading: "Plan for display and care",
        body: "Consider where the set will be used and stored. Decorated surfaces and enamel details may need specific care, so ask about cleaning the selected finish. Send the reference and your occasion when requesting availability and a current quotation.",
      },
    ],
  },
  {
    slug: "silver-wedding-gifts",
    title: "Silver Wedding Gifts",
    description:
      "A small selection of ceremonial and decorative silver gift ideas, including a wedding scroll holder, a silver purse, a Ganesha idol and a pooja thali set.",
    editorialSections: [
      {
        heading: "Choose for the recipient",
        body: "This selection offers different kinds of wedding gift: a ceremonial scroll holder, an occasion purse, a devotional idol and a pooja thali set. Consider how the recipient would use or display the piece instead of choosing by weight alone.",
      },
      {
        heading: "Confirm the details for the occasion",
        body: "Open each product to view its photograph and recorded specifications. Ask the showroom about availability for your required date, packaging and the final quotation. Any engraving, delivery or other special request needs separate confirmation; it is not included simply because a product appears in this selection.",
      },
    ],
  },
] as const;
