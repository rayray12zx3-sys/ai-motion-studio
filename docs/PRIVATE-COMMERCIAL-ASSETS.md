# Company-only and public motion asset libraries (M10 boundary)

Keep **public creative material** (CC0 and safe original, synthetic fixtures)
in the public animation repository or another open asset store.

Keep **private material** (company brand marks, internal footage, customer
media, licensed/purchased music, font files and stock graphics) on an approved
company NAS or a restricted local drive. Do NOT push their files, paths,
original license/receipt PDFs or credentials to public GitHub, public CI
artifacts, PR comments or chat examples.

Both libraries share a rights schema, not a storage backend or access token.

## Authorization contract
The new src/creative/asset-authorization.mjs validates:
- public vs private scope; immutable ID and SHA-256 recorded as metadata
- rights basis: CC0, original-owned, company-owned, client-provided,
  purchased-license
- external (private) license-evidence ID, not the license document content
- commercial advertising permission, modification permission, whether
  final-video credit is mandatory, and an optional expiry date

The preflight refuses expired, noncommercial, no-edits or credit-required
materials for advertisements. **Bought media is not automatically cleared
for all commercial ads or clients**. Check the purchased license for named
business, territory, platforms, duration, derivative use and sublicensing,
and whether a client is allowed to receive the resulting video.

The validator returns RIGHTS_METADATA_PRECHECK_PASSED and
requires_human_source_review: true; this cannot substitute for checking
the actual contract or confirming that hash refers to the licensed bytes.

## What is built vs still missing?
Implemented: deterministic metadata validator and synthetic negative/positive
tests, ignored local media directories and public/private boundary.
Not yet implemented: privileged private-media resolver, integration into
actual full company video rendering, contract document verification, access
control on the user's NAS or Work platform. These require authorized private
execution instead of a publicly auditable Actions runner.

M9's public CC0 raster guard remains in force for all public synthetic CI.
Production may later use an isolated private renderer overlay with no need
to change the public template registry or leak private files.
