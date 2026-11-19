# Current stack reconciliation

| Checkout                    | Revision                                 |
| --------------------------- | ---------------------------------------- |
| Historical inventory source | 07f03a567f994aa4c2abdd22346b2f8e6b09c786 |
| Clean visomi-stack main     | 6c7cc6104c85f1c2fb5ad405ac073fffcc26772b |
| Clean visomi.dev main       | c4a30f1caefefa54bf6bcfe4650ce4ce5a8f7635 |

The two main revisions were cloned separately. The historic PR #41 and #42
heads are already ancestors of the destination. Stack PR #26 was merged before
the comparison. Its merged source supplies the PIN control.

The historical inventory covers 1,127 blobs (551 copied, 276 adapted, 300
excluded). Its validator found zero structural errors and 41 destination
digests that had changed at the destination base. Those hashes record
historical provenance. The current comparison walks both tracked Git trees,
using historical relocations when available and the same relative path
otherwise. Of 1,300 current source paths, 523 had the same Git blob at
destination, 294 differed and 483 had no blob at the mapped location. The
source delta contains 389 current new or altered paths and one removal when
renames are paired. The comparisons include hidden tooling.

## Administrative UI reconciliation with Stack PR #32

The administrative UI comparison uses [Stack PR #32](https://github.com/visomi-dev/visomi-stack/pull/32), branch
`feature/visomi-stack-consolidation`, at [98bb0e69161c166b8b2c46907558f971f31ae8c2](https://github.com/visomi-dev/visomi-stack/tree/98bb0e69161c166b8b2c46907558f971f31ae8c2).
GitHub recorded the source PR as merged during the review. The branch and `refs/pull/32/head` both retained that
SHA, which remains the comparison source.
The `main` revisions above record the earlier repository inventory. The UI review covered the Angular route tree,
the source authenticated, auth and not-found layouts, password credentials and verification, shared auth feedback
and code entry, shell/navigation/theme/language controls, and the recipes for the native directives used below.

| visomi.dev surface                                     | Stack implementation used                                                                                                                                                                                                                                                                               | Product or repository adaptation                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner sign-in and verification                         | `AuthLayout`, `PasswordCredentials`, `PasswordVerify`, `CodeEntry`, `AuthFeedback`, `Field` and `PinInput` inform the composition. The template uses the source `Card`, `Button`, `Input`, `Heading`, `Text`, `Alert`, label, description and error bindings. Loading uses the button's busy indicator. | The existing owner route contains both steps and keeps the same form and session contracts. The product excludes Stack's account lifecycle, extra sign-in methods, recovery flows and backup-code entry.                                                                                                                                                         |
| PinInput                                               | One labeled native control, one-time-code autocomplete, opt-in formatted paste before `maxlength`, native selection, and a full-width grid with the source's responsive gap.                                                                                                                            | The owner PIN remains masked, with separate centered marks so the user-requested geometry holds in all three engines. The existing normalized paste accepts other separators as well. Stack's plaintext code-entry mode, Signal Forms binding and vault callers are outside this port.                                                                           |
| Administrative shell and preferences                   | Source `AppShell` projection, `Sidebar`, `Topbar`, `NavItem`, `Navbar`, `Dialog`, `Button` and alert patterns. The native mobile dialog closes at the desktop breakpoint and returns focus on Escape.                                                                                                   | The product navigation, logo and locale paths stay local. The language switcher preserves canonical links for both locales, including the current locale, as required by the existing client-routing tests. It preserves the portfolio path and query parameters. The sidebar retains its complementary landmark, and the dialog retains explicit initial focus. |
| Contact requests, detail, visits and technical metrics | Source card, headings, text, links, button links, feedback and native disclosure. Browser report details use `DescriptionList` and `Code`.                                                                                                                                                              | Stack has no equivalent owner dashboard routes. The data presentation, link targets, filters and semantic lists stay with their existing routes and DTOs.                                                                                                                                                                                                        |
| Angular 404                                            | Source card, title, status-code text and button-link pattern.                                                                                                                                                                                                                                           | The page returns the visitor to the portfolio and uses the existing gateway status and routing.                                                                                                                                                                                                                                                                  |

Standalone directives use direct imports from the existing UI recipes. Components keep the repository's external
HTML and CSS files and local camel-case input bindings to satisfy its Angular lint rules. Layout utilities still
specify page spacing, grids, wrapping and brand geometry. The public Astro
website, its design tokens, owner authorization, and cloud-only persistence continue to follow the decisions below.
Browser verification covers both locales, narrow and desktop viewports, light and dark themes, Axe, native
navigation and dialog focus, OTP paste and slot geometry, contact pages, visit periods, and opening and closing
technical report details by keyboard. Physical devices and OS autofill are tracked separately under VIS-80.

The Portfolio Angular source groups its private routes under `admin/admin.routes.ts`, loaded lazily by the root
router. Dashboard, metrics, visits, and the shell live in that feature. Its password sign-in component lives at
`admin/auth/sign-in/password`, and its session service at `admin/auth/session.ts`. The canonical sign-in URL remains
`/admin/auth/sign-in` in both localized app mounts. The app-wide 404 lives at `not-found/not-found.ts`.

## Workspace decisions

| Area                              | Difference and disposition                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website, brand, social and worker | Preserve the Astro portfolio, canonical URLs, ClientRouter, WebGL, print résumé, contact form and social-card worker. The upstream public site and UI catalog have different content. Portfolio error documents use the shared gateway fallback and local branding. Both sites already share UI recipes and theme timing.                                                                                                   |
| UI foundations                    | Keep the approved typography, color, spacing and brand. Port the Angular shell projection, scrolling, sidebar, topbar, mobile navigation and dialog, localized theme switcher and page loader. Retain the portfolio theme key and localized URLs. The desktop sidebar uses a complementary landmark for AXE.                                                                                                                |
| Sign-in and PinInput              | Render the stack card and separate the password and verification steps at the existing sign-in URL. Use the merged native segmented control and field association with six-digit email/TOTP and one-time-code autocomplete. Preserve the verified-owner password, CSRF, cookie and logout contracts. Public registration, extra providers, account management and recovery remain excluded under VIS-21, VIS-50 and VIS-64. |
| Database and persistence          | Michael approved cloud-only persistence for visomi.dev. Keep its existing PostgreSQL contact, auth, session and visit contracts and migrations. Optional vault, local custody and encrypted sync concern a separate stack capability. The Redis worker retains its existing contract. See the path-level scope below.                                                                                                       |
| Gateway, API, edge and realtime   | Preserve compiled sibling exports, proxy allowlists, CSP/nonce, private SSR, the worker mount, owner authorization and session invalidation. Vault-specific route wiring and its client WASM allowances are outside the cloud-only scope. The mail/BIMI asset namespace follows VIS-64.                                                                                                                                     |
| Operational telemetry             | The destination has explicit opt-ins, local HTTP counts, Angular and Astro capture, private maps, and controlled SSR events. The diagnostics work adds a short view of accepted error reports with actual trace IDs. Keep Jaeger private and preserve map denial.                                                                                                                                                           |
| Analytics                         | VIS-82 supplies the shared observer and PostgreSQL receiver. VIS-83 consumes the same implementation with portfolio page names and a private owner query. See [visit analytics](visit-analytics.md).                                                                                                                                                                                                                        |
| Repository tooling                | The historical matrix covers skills, Codex, VS Code, Claude, OpenCode, QMD, CI and Railway. Shared build, patches and readiness mechanisms are present. Destination project paths, worker builds, deployment bindings and auth contracts require adaptations. The optional vault and sync projects carry their own build/watch entries.                                                                                     |
| Email                             | Keep the existing shared templates and SMTP contract. VIS-64 defers versioned mail-origin assets. DNS, DMARC, BIMI and provider settings follow their operational approvals.                                                                                                                                                                                                                                                |

## Persistence scope by source path

VIS-20 and VIS-25 use the cloud-only product decision for current acceptance. The rows below
apply to the pinned stack revision. The [historical inventory](stack-files.json) and
[verification record](completion-review.md) retain the original source SHA and acceptance results.

| Stack source area                                                                                                                                                                  | visomi.dev disposition                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `libs/backend/db/src/lib/database.ts`, `schema-auth.ts`, auth migrations and `libs/backend/db/tools/migrate.mjs`                                                                   | Keep the existing PostgreSQL pool, auth/session and migration contracts in `libs/backend/shared`. Keep PostgreSQL storage for contact records and visit aggregates.                               |
| `apps/web/api/src/db/`, `apps/web/app/src/app/db/`, `apps/web/app/src/app/shared/vault/`, `libs/shared/db/`, `libs/web/frontend/db/` and their persistence/vault integration tests | Outside scope by product decision. This covers the sample workspace, vault, browser replica, local key custody, offline PIN/PRF unlock and encrypted synchronization.                             |
| `libs/backend/db/src/lib/schema-{persistence,vault}.ts` and the three persistence/vault migrations dated `20261116`                                                                | Outside scope by product decision. The existing owner-only PostgreSQL schema covers the portfolio's cloud data.                                                                                   |
| `apps/web/gateway/src/{app,main,api-module}.ts` and workspace build/watch configuration                                                                                            | Retain the shared gateway and deployment patterns for the portfolio's projects. Optional vault mounts, feature-specific CSP allowances and build targets follow their feature's scope.            |
| `apps/web/app/src/app/ui/forms/pin-input.*`                                                                                                                                        | Reused under `apps/web/app/src/app/shared/pin-input/` for the owner email/TOTP challenge. Verification remains part of authentication with the existing CSRF, cookie and authorization contracts. |

## Acceptance boundaries

The product decision resolves the persistence scope of the architecture comparison. VIS-25
tracks runtime acceptance evidence within that scope. The Firefox canvas failures reproduced
on the destination baseline and the review branch. VIS-62 tracks effective Railway
configuration and VIS-63 tracks fixture stability under contention. Synthetic migration and
recovery evidence belongs to the existing [contact cutover runbook](contact-cutover.md).
Operational release and rollback are tracked in VIS-26. VIS-80 separately tracks physical
autofill for the owner verification control.

A fresh `pnpm nx run web-api:test --skip-nx-cache` on the PR implementation passed 345
tests with the existing coverage thresholds. The contact suites included the read-only dry
run, concurrent cutovers, idempotent retry, reconciliation and rollback/replay into an
isolated libSQL database. The production release and validation with real accounts remain
within the existing operational approval gates.

## Administrative browser CI

Two runs of the same documentation-only commit timed out while Ubuntu was downloading Playwright
system dependencies. Both stopped before running the administrative tests. The administrative
job now starts the three browsers from the official Playwright image matching the frozen package
version. Nx and the PostgreSQL fixtures stay on the runner. The server binds to loopback and
mounts the installed Playwright package read-only. The setup still has a five-minute budget.

The first hosted run reached the administrative suite and retried a WebKit revocation test after
its shared fixture returned HTTP 429 from the production auth limiter. Session synchronization
now has a separate fixture per engine. The revocation assertions and auth limits are unchanged.

## Railway deployment metadata

The active deployment of `c4a30f1` has a resolved manifest that selects `Dockerfile`, uses the
watch patterns in the root `railway.json`, and checks `/api/ready` with a 60-second timeout.
Its effective pre-deploy command is `node libs/backend/shared/tools/database/migrate.mjs`.
The manifest records no explicit pre-deploy timeout. The versioned TypeScript definition
declares 120 seconds. The watch patterns and readiness path in the resolved manifest come from
the repository file. The separately stored service settings report a shorter watch list.

The service reports the expected names for its PostgreSQL, Redis and telemetry bindings.
The read-only comparison covered deployment settings and variable names. Effective opt-in values
and reference targets remain an operator check for VIS-62. Railway documents retirement of legacy
Config as Code on December 1, 2026. Future source-trigger validation belongs to the approved
release process. See the [Railway configuration reference](https://docs.railway.com/config-as-code/reference).

## Diagnostics and storage

The technical metrics view identifies HTTP 4xx and 5xx as response classes.
It retains the current 15-minute process-local counters, which reset on
restart. The gateway exposes up to 50 accepted browser reports within 15
minutes exclusively to the verified owner. Each can show a fixed screen
category, validated compiled asset fingerprint and position, and the generated
trace ID. Raw exception messages, stacks, request paths, resource IDs, queries
and form contents stay outside the diagnostic contract.

With export configured, the owner can search that trace ID in their private
Jaeger instance to confirm delivery. Jaeger's receiver and storage determine
availability and retention. Collapsing a report only affects the display.
The gateway stores no individual HTTP request records for this panel.
Railway service aggregates and the individual browser trace serve different
diagnostic needs.
