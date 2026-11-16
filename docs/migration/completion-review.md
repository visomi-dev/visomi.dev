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

| Check                                                           | Result                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `PLAYWRIGHT_BROWSERS=all pnpm nx run app-e2e:e2e --skipNxCache` | 84 passed across Chromium, Firefox and WebKit; HTTPS, secure cookies, real capture/storage, sessions, route denial and AXE |
| `pnpm nx run site-e2e:e2e --skipNxCache`                        | 145 passed, including the 40 preserved pixel/content/SEO comparisons; no flaky or skipped cases                            |
| `pnpm nx run web-api:test --skipNxCache`                        | 45 suites / 342 tests passed, including PostgreSQL teardown                                                                |
| `pnpm nx run web-gateway:test --skipNxCache`                    | 171 tests passed; compiled Angular render failure returns HTTP 500 with bounded diagnostics                                |
| `pnpm nx run dev-testing:test --skipNxCache`                    | 94 tests passed, including owned process groups, provider pipe draining, timeout and cleanup ownership                     |
| `pnpm nx run web-site:test --skipNxCache`                       | Passed; WebGL acquisition failure keeps a static background without an uncaught browser error                              |
| `pnpm nx run web-gateway:deployment-check --skipNxCache`        | Passed; IaC contracts, tooling and migration inventory                                                                     |

Earlier API runs passed their assertions but failed teardown and are **not** acceptance
passes. Native Podman detection avoids the Docker compatibility compose bridge;
provider completion drains inherited pipes for a bounded interval. Setup and cleanup
have separate deadlines, and cleanup retries share one total deadline.

Screenshots reviewed: English desktop light sign-in, Spanish mobile dark sign-in and
Spanish mobile authenticated metrics. Visual alignment uses the fixed source/reference
and shared layout tokens; no claim of pixel identity to an independently rendered stack.

Historical local artifact review was limited to metadata and six recent candidate image
filesystems, inspected read-only with networking disabled. One identified application
image had no `.private-operations` directory. This is not an exhaustive certification of
all historical caches; no unrelated images were pruned and no exposure was established.
