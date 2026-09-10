# Jars and Handis — 10 September 2026

The owner identified the Floral Crystal-Knob Silver Sindoor Dani as a Handi
and asked for jars and this type of vessel to move from Gifts to Utensils.
Visual inspection of the live gallery identified six matching Handis:
SD-11 through SD-16. SD-01 through SD-10 are different devotional containers
and are outside this correction.

The four jars are `product-dda-img-20260830-11`, `-12`, `-13` and `-15`.
The migration uses exact product IDs, updates any existing drafts, validates
the final product schema and destination pricing coverage, backs up the
documents locally, and applies revision-guarded patches in one transaction.

Handi titles, descriptions, optional SEO titles and gallery alt text are
corrected. Document IDs, references, URLs, images, measurements and explicit
pricing settings are retained. The moved items inherit the existing Utensils
category pricing rules. `jar` and `handi` are supported by the shared catalog
taxonomy, gallery filters and Studio schema.

Deploy the taxonomy support before applying the content change:

```powershell
npx sanity exec scripts/sanity/migrate-jars-handis.ts --with-user-token
npx sanity exec scripts/sanity/migrate-jars-handis.ts --with-user-token -- --apply
```

The script is idempotent. Backups are saved under ignored `tmp/jars-handis/`.
Historical gallery ingestion manifests retain their original delivery record;
this correction supersedes the affected product metadata. If those historical
batches are overwritten, rerun this migration afterward.
