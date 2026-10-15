# Private Drive → public GitHub Actions boundary (proposed, NOT ENABLED)

**Current status:** The 10-render benchmark uses only original synthetic text. No private/company assets or texts are accepted into the public workflow. A strict UUID-only public dispatch contract and a scoped Google Drive transport adapter have been unit-tested with entirely fake data; **no real private credentials, authenticated transfer, protected environment, or job dispatch is configured**.

## Trust boundaries
- Google Drive: private original footage, fonts, script, generated assets, review statuses.
- Public repository: Helios engine integration and *generic* reusable animation code; only synthetic/cleared test images.
- Public GitHub Actions: ephemeral runner allowed to see selected private data only after an explicitly approved, least-privilege credential path is configured, not through inputs/logs/artifacts.
- Operator's ChatGPT: can read Drive via the connected app; this credential is NOT automatically available to Actions.

## Proposed job contract
Workflow dispatch receives only a random UUIDv4 (not a secret token, URL, customer identifier, filenames or user text). A *trusted main-branch only* workflow obtains narrow, time-bound access (prefer GitHub OIDC -> GCP Workload Identity Federation). The authorized identity must have access only to a dedicated staging Drive folder; confirm service-account Drive quota and write-back ability before launch. Job config is fetched after authentication, never passed in the GitHub URL, workflow name, dispatch inputs or PR. A scoped job status includes job UUID, approved effect IDs, phase, metrics, Drive file IDs in Drive only.

## Security gates that MUST be satisfied before the private-data switch is turned on
1. Explicit owner approval of the public runner and Google identity/storage region; confirm company policy permits data temporarily processed on GitHub-hosted runners.
2. Provision exact WIF identity provider audience/repository/ref/environment claims on GCP, restricted to protected default branch; approve protected GitHub Environment.
3. Never expose OIDC request URL/token, access tokens, direct Drive download links, copied filenames, customer text or bytes to public logs/artifacts/caches.
4. Protect against prompt-to-JS/code injection: no user-provided JS/HTML is executed with credentials. Trusted code obtains data and parses a strict schema. Browser must not have ambient credentials. Avoid external fetches to arbitrary user URLs.
5. Eliminate artifact uploading for private jobs. Write final MOV/MP4 and QA directly to designated private Drive subfolder with checksum and access check; record failure transitions safely.
6. Automatic cleanup on success/error; zero private files from public repo, public PR logs, public GitHub Pages and artifact storage.
7. Test with **fake, non-sensitive** staging files first; audit that no company names/contents appear anywhere accessible publicly.
8. Set explicit cost/cadence guardrails and reject untrusted PR event for private workflow. Branch/test workflow must never activate private-data permissions.

## Tested (non-secret simulation only)
- `private-job-contract.mjs` validates UUIDv4-only dispatch (rejects script text, URLs, arbitrary keys), strict effect IDs and constrained private job parameters; outputs a redacted public status.
- `private-drive-adapter.mjs` can search a pinned Drive staging folder, validate exact UUID-named JSON, and upload MOV only to a pinned output folder using a Drive resumable session; host allowlisting prohibits arbitrary external upload URLs.
- `private-job-contract.test.mjs` and `private-drive-adapter.test.mjs` run in a **contents:read-only** GitHub Actions workflow. Mock responses prove access boundaries; they **do not prove Google OAuth, Drive file permissions, large media throughput, cross-chat Job dispatch or any real upload**.
- GCP WIF identities generally represent service accounts; permissions to a personal My Drive and the ability of service accounts to create files must be verified. Do not assume WIF automatically grants personal Google Drive write access. Alternative is securely authorized user OAuth or a compatible shared-drive setup, with credential storage explicitly approved.

## Blocked until external permissions exist
No Google Workload Identity provider, GitHub protected environment, private Drive staging share, workflow_dispatch connector or user-visible on-demand job API is configured by this R&D branch. It is unsafe to pretend this is deployable merely because isolated Helios CI is green. Manual connector-mediated transfer of *synthetic* results to Drive is not the same as automatic private pipeline.

## Decision hygiene
Do not merge into main, configure secrets, migrate renderer, or route company footage based solely on the presence of this design. Human visual approval and Premiere native import remain separate gates.
