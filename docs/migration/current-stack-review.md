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

## Workspace decisions

| Area                              | Difference and disposition                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website, brand, social and worker | Preserve the Astro portfolio, canonical URLs, ClientRouter, WebGL, print résumé, contact form and social-card worker. The upstream public site and UI catalog have different content. Portfolio error documents use the shared gateway fallback and local branding. Both sites already share UI recipes and theme timing.                                                                                                   |
| UI foundations                    | Keep the approved typography, color, spacing and brand. Port the Angular shell projection, scrolling, sidebar, topbar, mobile navigation and dialog, localized theme switcher and page loader. Retain the portfolio theme key and localized URLs. The desktop sidebar uses a complementary landmark for AXE.                                                                                                                |
| Sign-in and PinInput              | Render the stack card and separate the password and verification steps at the existing sign-in URL. Use the merged native segmented control and field association with six-digit email/TOTP and one-time-code autocomplete. Preserve the verified-owner password, CSRF, cookie and logout contracts. Public registration, extra providers, account management and recovery remain excluded under VIS-21, VIS-50 and VIS-64. |
| Database and persistence          | Stack PRs #24–#26 split the DB libraries and add opaque sync, encrypted persistence and offline PIN custody with API, gateway and client adapters. The portfolio retains its PostgreSQL contact migrations, owner read boundary and Redis worker. Moving the newer persistence surface would require a decision on the portfolio's data and authorization contracts.                                                        |
| Gateway, API, edge and realtime   | Preserve compiled sibling exports, proxy allowlists, CSP/nonce, private SSR, the worker mount, owner authorization and session invalidation. The upstream static namespace carries mail/BIMI assets and its WASM policy supports local vault custody. Those changes depend on existing scope decisions for mail and vault.                                                                                                  |
| Operational telemetry             | The destination has explicit opt-ins, local HTTP counts, Angular and Astro capture, private maps, and controlled SSR events. The diagnostics work adds a short view of accepted error reports with actual trace IDs. Keep Jaeger private and preserve map denial.                                                                                                                                                           |
| Analytics                         | VIS-82 supplies the shared observer and PostgreSQL receiver. VIS-83 consumes the same implementation with portfolio page names and a private owner query. See [visit analytics](visit-analytics.md).                                                                                                                                                                                                                        |
| Repository tooling                | The historical matrix covers skills, Codex, VS Code, Claude, OpenCode, QMD, CI and Railway. Shared build, patches and readiness mechanisms are present. Destination project paths, worker builds, deployment bindings and auth contracts require adaptations. Upstream build/watch rules for new persistence projects depend on the persistence decision.                                                                   |
| Email                             | Keep the existing shared templates and SMTP contract. VIS-64 defers versioned mail-origin assets. DNS, DMARC, BIMI and provider settings follow their operational approvals.                                                                                                                                                                                                                                                |

The persistence and tooling gaps prevent a whole-workspace equivalence claim.
The [historical inventory](stack-files.json) and [verification record](completion-review.md)
retain the original source SHA and acceptance results.

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
