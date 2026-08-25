# Documentation handbook

These files are the implementation and production-operations authority for the
DDA Silver website until superseded by an approved decision record.

## Document ownership

- Business facts and public claims require owner approval.
- Product data and imagery require owner or catalog-admin approval.
- DDAJewels API and identity changes require the DDAJewels backend owner.
- Production hosting and rollback changes follow
  [delivery-launch-rollback.md](delivery-launch-rollback.md) and
  [oracle-coolify-deployment.md](oracle-coolify-deployment.md).

## Status labels

- **Locked:** approved and not open to implementation-time reinterpretation.
- **Proposed contract:** implementation shape is specified, but the
  corresponding DDAJewels backend endpoint does not yet exist or has not been
  verified in source.
- **Launch blocker:** production must not proceed without completion.
- **Content-configurable:** changeable in Sanity without a code release.

## Maintenance rules

1. Update the relevant document in the same pull request as any behavior change.
2. Record product or architectural reversals in
   [decisions.md](decisions.md).
3. Never bypass the production release checks or change DNS without an approved
   deployment or rollback instruction.
4. Keep secrets, credentials, customer data, and production tokens out of these
   files and out of repository history.
5. Examples must use placeholder values rather than current customer or
   personalized-rate data.

## Catalog terminology

- [Idol item-code terminology](idol-item-codes.md)
- [Product gallery ingestion](product-gallery-ingestion.md) — required
  end-to-end image and Sanity-metadata workflow for folder-based catalog
  requests.

## Production operations

- [Oracle Coolify deployment](oracle-coolify-deployment.md)
- [Delivery, launch, and rollback](delivery-launch-rollback.md)
- [Technical architecture](technical-architecture.md)
