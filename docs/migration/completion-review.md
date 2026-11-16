# Functional migration completion review

The historical source remains stack `07f03a567f994aa4c2abdd22346b2f8e6b09c786`.
The target repair starts at `1d3bbf99937223096b5e8fef209fd421044f7802`.
The earlier audit compared stack `6f4582a9a38d95b627f819198d79670692a2548a`;
subsequent sibling checkout updates do not silently redefine the migration baseline.

## Administrative route contract (VIS-50)

All routes are relative to `/app/en/` or `/app/es/`:

| Route                                                                                      | Access                                                                | Rendering                                                              |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `admin/auth/sign-in`                                                                       | Public owner sign-in; password and existing email/TOTP challenge only | SSR, private/no-store                                                  |
| `admin/dashboard`                                                                          | Verified owner                                                        | SSR contact list; guarded client navigation                            |
| `admin/contacts/:id`                                                                       | Verified owner                                                        | SSR contact detail; independently authorized API                       |
| `admin/metrics`                                                                            | Verified owner                                                        | SSR process metrics; independently authorized API                      |
| `admin`, retired `access`, `dashboard`, `dashboard/:id`, `metrics`, unknown paths/suffixes | 404 for every identity                                                | Actual HTTP 404 for direct requests; Angular 404 for client navigation |

The adapted sign-in preserves the reference's centered card, restrained zinc surfaces,
brand header, typography, focus treatment and language/theme controls. The authenticated
shell uses the existing `appShell`, `sidebar`, `topbar` and `navItem` helpers, with
mobile navigation. Public website routes and presentation remain separate.
Registration, Google, passkeys, account/security management and recovery endpoints
remain closed. UI reuse does not broaden backend authorization.

## Functional boundaries

| Capability                    | Restored connection                                                                                     | Verification surface                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Angular errors (VIS-53)       | Browser entrypoint reporter, token, ErrorHandler and same-origin API interceptor                        | Actual entrypoint unit test; compiled browser error/rejection; real intake and Jaeger query                    |
| Astro errors/maps (VIS-56)    | Once-per-document module in preserved BaseLayout; hidden Vite maps                                      | Direct load and ClientRouter; deduplication, opt-out, map HTTP denial and artifact resolution                  |
| SSR diagnostics (VIS-57)      | Server-only Angular ErrorHandler; Astro renderer logger                                                 | Fixed render event codes; no raw message/stack/request serialization; existing HTTP boundaries retain statuses |
| Session lifecycle (VIS-58)    | Central owner state, cancellation, CSRF, BroadcastChannel/storage, focus/online and `/session` realtime | Two tabs, missing channel, expiry/revocation and stale reads using synthetic sessions                          |
| Navigation metrics (VIS-59)   | Browser-only Router observer from the stack; initial navigation excluded                                | Monotonic durations and completed/cancelled/failed outcomes; no route/query/IDs exported                       |
| Human gateway errors (VIS-60) | Portfolio error documents under internal compiled `system-errors` directories                           | HTML/JSON negotiation, real status, locale, no-store and existing CSP; safe JSON fallback without documents    |
| Packaging (VIS-55)            | Explicit local/private-state exclusions independent of Git                                              | Real container-engine COPY tests with a wholly synthetic context; sources/assets remain available              |
| IaC opt-ins (VIS-62)          | Preserve private metrics and browser errors configured in bound environment                             | IaC resource contract; performance stays false; no plan/apply or deployment performed                          |
| PostgreSQL fixture (VIS-63)   | Setup cancellation deadline, bounded queries, two-second container stop and bounded cleanup command     | Owned projects only; phase timings; fresh execution distinguished from cached evidence                         |

Private SSR can embed authorized contact data. Request cookies are forwarded only to
allowlisted read-only same-origin APIs, HTTP transfer caching is disabled, and HTML
is `private, no-store` without ETags. A client guard is not the authorization boundary.
Server handlers continue to authorize every list/detail/metrics API request.

Browser capture sends only the shared allowlist: application, fixed code, error kind,
screen, approved asset fingerprint/position and validated correlation when available.
No error message, raw stack, request body, credential, URL, query or profile data is exported.
Performance remains a separate opt-in; enabling browser errors does not enable it.
Tests enable both only against disposable local infrastructure.

## Post-baseline decisions (VIS-64)

| Change group                                     | Decision                                  | Reason                                                                                                                                                                |
| ------------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Versioned mail assets, MAIL_ORIGIN, PNG manifest | Future enhancement                        | Existing SMTP contract and composed verification/security templates remain coherent; adopt origin, assets, branding checks and delivery together in a separate change |
| BIMI, DNS, DMARC and provider settings           | Outside this change                       | Require their own operational scope; no DNS/provider mutations                                                                                                        |
| Passkey AAGUID/custom label schema and UI        | Not applicable to current private sign-in | Method and management routes are closed; do not add migrations or enable a method merely to match files                                                               |
| Password-change confirmation/management UX       | Future enhancement                        | Current owner sign-in exposes no password-change management flow                                                                                                      |
| Shell, theme, language and mobile improvements   | Applicable now, adapted in VIS-50         | Required by the approved private administrative interface                                                                                                             |
| Composed MJML frame and formatted placeholders   | Already incorporated                      | Approved stack PR #17 integration remains part of the fixed baseline                                                                                                  |
| Semantically equivalent control-flow cleanup     | No adoption required                      | No functional gap to repair                                                                                                                                           |

These decisions do not claim the later mail/passkey improvements were baseline omissions.
They preserve the original baseline and avoid introducing partially compatible SMTP APIs.

## Evidence and limits

Run checks through Nx. Use `--skipNxCache` for a fresh acceptance run and identify any
replay or retry explicitly. A green intake response is not storage evidence: the browser
suite separately queries the disposable Jaeger collector by an actual captured trace ID.
Do not replace browser initialization with an injected reporter or manual intake POST.

A clean automated profile cannot reproduce errors from an owner's installed extension.
The supplied console families remain unconfirmed until clean/habitual-profile comparison
and sanitized script origin attribution are available (VIS-51). Do not publish the raw log
or change account cryptography based on those messages.

The Docker context regression demonstrates isolation after the repair. Historical image
metadata alone cannot establish which local private files entered a previous build. No
credential exposure, public distribution or need for global cache deletion is inferred.
Any subsequent inspection/cleanup must identify exact owned image/layer resources and
avoid reading/publishing credentials or deleting unrelated images.

Synthetic acceptance, review, merge and production acceptance are separate. This change
does not apply Railway IaC, deploy, migrate real records, rotate credentials or alter DNS.

## Cross-browser acceptance details

Administrative E2E uses an isolated local TLS ingress and synthetic certificates,
retaining the production CSP and secure cookie name. A browser forward proxy and
child-only DNS mapping route the canonical host to loopback; requests never reach
the production service. Authentication/layout projects use independent fixtures per engine;
telemetry projects run serially on a separate disposable collector fixture so unrelated
layout traffic cannot consume the production intake limits.

Error/performance POSTs use CORS fetch mode with fixed same-origin relative endpoints,
credentials omitted, `no-referrer` and redirects rejected. This preserves `Origin` in
Firefox/WebKit; same-origin fetch mode plus no-referrer can produce `Origin: null`.
The intake still requires the exact allowed Origin and signed token. No origin
allowlist was relaxed. See the [Fetch standard](https://fetch.spec.whatwg.org/#append-a-request-origin-header).

## Local acceptance record (2026-11-16)

Fresh runs use `NX_NO_CLOUD=true` and `--skipNxCache`; cached results are not counted here.
Administrative and public Nx E2E cache inputs include `PLAYWRIGHT_BROWSERS` so a
Chromium-only result cannot stand in for the three-engine matrix. The late-response
scenario waits for the client's session connection and captures an authorized 200
response before revocation; SSR-visible rows alone are not a hydration readiness signal.

| Check                                                           | Result                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `PLAYWRIGHT_BROWSERS=all pnpm nx run app-e2e:e2e --skipNxCache` | 84 passed across Chromium, Firefox and WebKit; HTTPS, secure cookies, real capture/storage, sessions, route denial and AXE |
| `pnpm nx run site-e2e:e2e --skipNxCache`                        | 145 passed, including the 40 preserved pixel/content/SEO comparisons; no flaky or skipped cases                            |
| `pnpm nx run web-api:test --skipNxCache`                        | 45 suites / 342 tests passed, including PostgreSQL teardown                                                                |
| `pnpm nx run web-gateway:test --skipNxCache`                    | 171 tests passed; compiled Angular render failure returns HTTP 500 with bounded diagnostics                                |
| `pnpm nx run dev-testing:test --skipNxCache`                    | 98 tests passed, including owned process groups, provider pipe draining, timeout and cleanup ownership                     |
| `pnpm nx run web-site:test --skipNxCache`                       | Passed; WebGL acquisition failure keeps a static background without an uncaught browser error                              |
| `pnpm nx run web-gateway:deployment-check --skipNxCache`        | Passed; IaC contracts, tooling and migration inventory                                                                     |

Earlier API runs passed their assertions but failed teardown and are **not** acceptance
passes. Native Podman detection avoids the Docker compatibility compose bridge;
provider completion drains inherited pipes for a bounded interval. Podman cleanup
selects actual resources by exact project label instead of walking all declared services.
On this busy shared host, network removal alone can exceed the former 20-second
cleanup allowance: a fresh isolated migration run measured 32.77 seconds for cleanup,
versus 3.99 seconds in another run. The setup deadline remains 40 seconds; cleanup has one 45-second
budget shared by every resource and retry, a two-second container stop and matching
60-second teardown/runner windows. The migration rehearsal's 100-second total covers
both deadlines plus its actual migration assertions. No production deadline or coverage
threshold changes. A later fresh acceptance pass does not erase earlier teardown failures.

Screenshots reviewed: English desktop light sign-in, Spanish mobile dark sign-in and
Spanish mobile authenticated metrics. Visual alignment uses the fixed source/reference
and shared layout tokens; no claim of pixel identity to an independently rendered stack.

Historical local artifact review was limited to metadata and six recent candidate image
filesystems, inspected read-only with networking disabled. One identified application
image had no `.private-operations` directory. This is not an exhaustive certification of
all historical caches; no unrelated images were pruned and no exposure was established.

## PR #49 owner-session review follow-up

The local and fetched PR branch both started at reviewed commit
`1a71866433982ed3b110c70d74d4149821acc7cb`, with no local changes. These repairs
preserve that history and the existing tests.

- Logout errors now propagate to the administrative shell without announcing success,
  clearing the current owner state or navigating away. Only an acknowledged logout
  invalidates local data and notifies other tabs. Network/HTTP 500 regressions assert
  a visible error, an active synthetic server session and a successful subsequent retry.
- Private-path recognition covers contact IDs in both localized and router-relative
  paths. Expired-session unit cases and a browser case with controlled server-side
  session revocation verify data removal and redirect from contact detail. The browser
  fixture uses revocation rather than waiting for a production session TTL.
- Focus/online checks preserve in-flight resolvers while the server still authorizes
  the owner. Confirmed loss of ownership also cancels reads when the user ID is unchanged.
  Delayed pagination and detail responses reproduced the original bug: the captured
  response was HTTP 200 and the server still authorized the owner, but the final view
  contained zero contacts. The repaired tests require the captured data to appear.

The eight initial regression unit cases failed before the repair; all 42 Angular tests
passed after it, including a guard against cancelling sign-in on anonymous public-page checks.
The five focused browser scenarios passed in Chromium, Firefox and WebKit (15 cases),
using the existing HTTPS fixtures and only synthetic sessions. Earlier green CI is not
evidence for these newly exercised scenarios. No production, credential, infrastructure,
merge or deployment operation is part of this follow-up.

The expanded combined run exposed shared authentication rate-budget exhaustion.
Review scenarios use separate local fixtures per engine, retaining the production
limits and all existing test assertions. The migration inventory keeps its historical
snapshot and reports the two expected source/test digest differences from these repairs.

Fresh final acceptance: `PLAYWRIGHT_BROWSERS=all NX_NO_CLOUD=true pnpm nx run
app-e2e:e2e --skipNxCache --output-style=static` passed all 99 cases (84 retained
and 15 new), alongside the 42 Angular tests. Lint/type checks passed for `web-app`
and `app-e2e`; `web-gateway:deployment-check` passed with its dependency replay
identified separately. The earlier combined rate-limited run is not an acceptance pass.

## Repository-wide sign-in route audit

The follow-up started from clean local and fetched PR branches at `0824758`.
The audit covered tracked application/library code, templates, localized routing,
tests, documentation, hidden configuration and development/deployment tooling.
Generated outputs, Git history and private operator state are not rewritten.

The only owner sign-in entrypoints are `/app/en/admin/auth/sign-in` and
`/app/es/admin/auth/sign-in`. Client routes, SSR route definitions, owner guards,
session redirects and language links already agreed on that contract. No runtime
alias or legacy login redirect was added. Private APIs retain independent owner
authorization, the password/second-factor flow and logout/session protections.

Corrections found by the audit:

- The root README still recommended the retired entrypoints and incorrectly said
  list/detail data never entered SSR. It now documents the agreed entrypoints,
  private SSR HTML, disabled transfer caching and 404 app roots.
- The migration README still described empty roots and the old access screen.
- Two gateway test dispatches and the development reload fixture used abbreviated
  sign-in paths. They now use the agreed administrative route.
- The ESLint fixture referenced a removed stack auth test path. It now resolves
  configuration for the actual owner dashboard E2E file.

Intentional remaining references:

- `stack-files.json` retains the historical source filename
  `apps/web/app-e2e/auth/access.auth.spec.ts` and its original digest. It is excluded
  provenance, not a current application route or test file.
- Negative route tests name retired paths to prove rejection. This audit names them
  only as retired paths; current instructions use the agreed sign-in entrypoint.
- Authorization fields, accessibility references, retention/access policy and
  stable `dashboardAccess...` translation IDs describe concepts, not URI aliases.

Regression coverage checks both localized SSR and Angular client navigation:
the agreed entrypoint renders, private-route denial uses the exact localized
sign-in destination, and retired/abbreviated/encoded app paths return 404 with no
Location header. Owner and non-owner credentials are verified before testing their
legacy rejection. Client navigation reaches the 404 view without document reloads
or a hidden compatibility redirect. Existing session regressions remain intact.

Outside the app namespace, the website's existing generic trailing-slash rule still
normalizes `/access` to `/access/`; the latter returns 404 and never enters sign-in.
This public URL normalization is not an application compatibility route. Current
Railway/CI/Compose configuration contains no obsolete sign-in destination, and no
production configuration, merge, auto-merge or deployment operation is authorized
by this audit.

Audit validation: fresh Angular 42, gateway 171 and fixture-library 98 tests passed.
Gateway development-tool checks, lint/types and formatting passed; static cache
replays are separate from the fresh test runs. The first expanded browser run
passed 108 cases and exposed an incorrect new assertion expecting `owner: false`.
The private API correctly rejects an authenticated non-owner with 403
`access_denied`; the assertion now requires that exact denial after verifying
authentication. Subsequent local runs stopped during fixture setup/cleanup before
running cases while the shared Podman host was also running another repository's
tests. Neither those attempts nor the earlier concurrent-build failure count as
acceptance. No test, rate limit or fixture deadline was relaxed. The PR records
the new HEAD's independent CI outcome and browser matrix evidence.

## Authentication code organization follow-up

The scope correction starts from clean local and fetched PR branches at `24ae06a`.
An audit of tracked names, source directories and available Git history found no
current `access/` code directory to rename. The concrete authentication UI was
`apps/web/app/src/app/pages/sign-in`; its session code was scattered under `shared`.
The reported `access/` folder cannot be attributed to this HEAD; the concrete
feature being reorganized is sign-in and its owner-session support.

The stack's pinned migration baseline `07f03a5` groups authentication under
`apps/web/app/src/app/auth`, including `password` and `session`. The current stack
checkout retains that organization. The portfolio now follows those boundaries:

- Password/second-factor sign-in moves to `auth/password/sign-in`, retaining the
  component's matching external template/style names and all behavior.
- Owner session, its regression suite, private-request interceptor and owner guard
  move to `auth/session`. All consumers, providers and lazy route imports point
  directly to the new files; old modules and import compatibility shims are absent.
- Translation source-location metadata points to the moved template. Stable IDs,
  translations, canonical routes and SSR route definitions retain their meaning.

Backend authentication already uses `src/auth`. Its baseline
`access-errors.integration.spec.ts` and `access-management.integration.spec.ts`
exercise access levels and method/session lifecycle; those names are retained.
Accessibility, owner authorization wording, negative route cases and historical
inventory paths/digests remain intentional. No route alias, compatibility redirect,
new authentication method or publicly exposed account-management route is added.

The owner-session implementation is byte-identical to `24ae06a`; its moved tests
change only the interceptor import. All 42 Angular tests, lint and types passed
fresh after relocation, alongside the localized production build. The existing browser matrix continues to cover canonical
localized SSR/client routing, second factor, isolation, logout and all three session
review regressions. The PR records final-HEAD browser/CI results separately.

The first organization CI run (`#151`, `8e72c64`) found six inventory entries whose
historical destinations had moved. They now record explicit `relocatedTo` metadata;
all pre-existing inventory fields, source/destination paths, hashes and 1,127-entry
counts remain unchanged. Validation follows the current file for existence and drift,
and new tests reject missing/unsafe relocation targets or omitted relocation metadata.
This metadata is provenance tracking only; no source module or URL alias is retained.
Fresh `web-gateway:deployment-check` passed 47 contract tests (including the three
new relocation regressions) plus its three development-tool checks. The inventory
check passed with unchanged counts and ten separately reported digest differences.
