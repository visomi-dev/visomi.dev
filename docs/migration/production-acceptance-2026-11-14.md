# Production acceptance — 14 November 2026

All times below are UTC. This records actual production checks separately from
synthetic rehearsals. No credentials, personal identifiers, contact contents,
cookies or login codes are included.

The operator explicitly authorized one SMTP test and one identifiable public
contact submission. This session did not merge or deploy changes, provision an
account, migrate historical contacts, alter DNS/DMARC or expose Jaeger publicly.

## Environment and source

- Railway project `visomi` (`866f46e7-1d66-4cb7-9793-0b89db25990b`),
  environment `production` (`3711cead-a360-4880-abc8-6472f21dbb68`).
- Application service `visomi.dev` (`8efe2ba3-1921-462c-b0b9-3375c26f531d`).
- Initial successful deployment `325e4993-4c2e-45af-9f2c-2a255aa51a2a`,
  source `508bf429a321d8a70834b87a2a0a26c3efe6811e` (PR #46).
- During this work another operator integrated PR #47. Deployment
  `7f5c529d-2e9e-4bc7-b5ef-a2d965744371` reached `SUCCESS`, source
  `c2192742dfbad53667521e6ad72c83ed522b576e`. The working branch was rebased
  onto that source, preserving its public-email Cloudflare exception.

## VIS-43 — configuration prepared; owner acceptance still blocked

The approved identity was supplied explicitly by the owner. A PostgreSQL
read-only transaction found zero matching accounts, zero verified matching
accounts and zero matching password credentials. No alternate/first account
was selected or created.

`AUTH_ORIGIN`, `AUTH_RP_ID`, `DATABASE_URL` and the six SMTP variables were
already configured. `OWNER_EMAIL` and `SESSION_SECRET` were absent from both
the control plane and the running process. The missing owner setting and a
48-byte cryptographically random session secret were subsequently saved using
Railway CLI stdin with `--skip-deploys`. Existing variables were not rotated;
readback checked identity agreement and secret length without printing values.
No deployment was triggered, so these settings await an authorized deployment.

The existing owner-preflight source was bundled locally and executed over SSH
without installing tools or leaving code/secret files in the production
container. It retained the original read-only queries and safe output:

- Running-process environment before configuration: `prepared: false`,
  `code: owner_configuration_invalid`.
- With the saved control-plane owner/session configuration passed only in
  process memory: `prepared: false`, `code: owner_identity_unavailable`.

SMTP TLS connection and authentication succeeded. Exactly one authorized mail
was accepted at `2026-11-14T06:04:44.811Z`, with zero rejected recipients:
Message-ID `<e5050fcb-f526-c744-e086-18f9b4e8a210@localhost>`.
Narrow Gmail searches by that Message-ID and the exact test subject returned
no matching message during this session. SMTP acceptance is **not** evidence
of mailbox delivery or SPF/DKIM/DMARC alignment; those checks remain pending.

Remaining gates: provision the approved identity through the stack's approved
account process with verified email and a user-controlled password; activate
configuration in an authorized deployment; rerun preflight; confirm actual
mail delivery/alignment; let the owner perform sign-in/second-factor acceptance,
then verify owner access, rejection of another identity and logout/revocation.
Private access remains denied until those gates pass. Do not mark this issue Done.

## VIS-44 — real HTTPS submission rejected; correction ready for review

Before submission, a read-only query confirmed zero rows bearing the marker
`VIS-44 produccion 2026-11-14`. The single authorized browser attempt on
`https://visomi.dev/contact/` returned HTTP 403, request ID
`6d300c75-51f6-4bab-b96f-227787c32c59`. A subsequent read-only query confirmed
zero persisted matching rows. The attempt was not repeated or replaced with a
direct API insert.

Empty invalid forms (incapable of passing the input schema) isolated the cause:

| Origin sent to the public HTTPS contact action | Response | Result                                     |
| ---------------------------------------------- | -------- | ------------------------------------------ |
| Public HTTPS origin                            | 403      | Astro cross-site rejection                 |
| Same hostname with HTTP origin                 | 400      | Passed origin check; invalid form rejected |
| Foreign HTTPS origin                           | 403      | Astro cross-site rejection                 |

The pinned Astro Node adapter reconstructs the request over its internal HTTP
connection. Without `security.allowedDomains`, Astro ignores forwarded origin
headers. This caused legitimate HTTPS forms to fail before their action ran.
The fix permits only the configured public hostname, protocol and port while
retaining `security.checkOrigin`. It does not trust arbitrary forwarded hosts
or disable CSRF protection.

Six local browser regressions passed against an owned PostgreSQL fixture:
English/Spanish forms over direct HTTP and a simulated HTTPS ingress, persisted
content read through the owner API, and rejection of foreign origins with both
allowed and forged forwarded hosts. The HTTPS browser requests are fulfilled
entirely by the local fixture; they do not contact production.

The contact flow stores requests; its action does not send email notifications.
Remaining gates: approved release of the correction, one reconciled successful
public submission, read-only confirmation of that same row, and owner
list/detail acceptance after VIS-43. No production row or historical record was
deleted. Production acceptance remains incomplete.

## VIS-45 — real trace storage verified

A harmless public `GET /api/ready` around `2026-11-14T05:58:04Z` returned 200:

| Evidence                                   | Value                                         |
| ------------------------------------------ | --------------------------------------------- |
| Request ID                                 | `48001094-47f8-49f5-b08f-e4e6df3ae391`        |
| Internally generated trace ID              | `dda6eb9d9e39c7545d5a103dbf336cf8`            |
| Span ID                                    | `fa9e3962e9f2400f`                            |
| Service / version / environment            | `web-gateway` / `0.0.1` / `production`        |
| Operation / outcome / status               | `http.request` / `success` / `200`            |
| Stored span start / end (Unix nanoseconds) | `1794635884047000000` / `1794635884060262283` |

The operational log correlates the response request ID to the internally
generated trace. Via SSH and the existing private network, Jaeger's
`GET /api/v3/traces/{traceId}?raw_traces=true` returned HTTP 200 and the stored
HTTP span. A second query at `2026-11-14T06:02:17.957Z` again returned that span.
This verifies storage queryability; it is more than health or exporter startup.

The span contains only `operation`, `outcome`, `http.status_code`, an OK status
and zero events. Resource keys are `service.name`, `service.version` and
`deployment.environment.name`. There are no contact bodies, emails, IPs,
credentials, session values or user-agent values in this trace. No additional
instrumentation, infrastructure, network exposure or retention change was made.

Optional hygiene: both legacy `VISOMI_PROXY_DIAGNOSTIC_*` variable names remain
defined. Searches in source/IaC and 75 deployed JS/MJS/JSON artifacts found no
consumers. Their presence does not imply an active diagnostic. Removal was
left separate from the trace acceptance and did not trigger a deployment.

## VIS-49 — delayed navigation bar, transitions retained

The old Astro script displayed a centered branded box immediately on every
`astro:before-preparation`. It was independent of Angular loading states and
Astro's native content transition.

The replacement is a nonblocking 2px top bar, shown only after 400ms of actual
preparation. Once shown, it remains readable for at least 250ms without delaying
route completion. The node persists across Astro swaps; newer navigations own
the timers, aborted loaders clear them even if their promises never settle,
and page restoration resets state. Slow consecutive navigations keep a single
continuous indicator. Status text follows the current locale and motion stops
for `prefers-reduced-motion`.

The existing ClientRouter and content fade remain enabled. The reference
checkout in `visomi-stack` supplied the thin-bar pattern; no Nive/v0 checkout
was found in the inspected workspace. No changes were recovered from or
written to the stopped Windows checkout.

Local verification and visual evidence are recorded below. These checks do not
establish production deployment or approval to merge/deploy this branch.

## Local verification and visual review

| Check                                                                           | Result                                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `pnpm nx run-many -t lint typecheck -p web-site site-e2e`                       | Passed; no lint warnings or type errors                 |
| `pnpm nx format:check --base=origin/main --head=HEAD`                           | Passed                                                  |
| Affected builds, including site and gateway                                     | Passed as E2E/test dependencies                         |
| `pnpm nx affected -t test --parallel=2 --base=origin/main --head=HEAD --nxBail` | 197 tests passed: site 32, gateway 165                  |
| `pnpm nx affected -t e2e --parallel=1 --base=origin/main --head=HEAD --nxBail`  | 163 tests passed: site 145, app 14, gateway 3, worker 1 |
| History/title/announcement regression, `--repeat-each=2`                        | 8 passed: both languages at 375px and 1440px            |

Browser verification used the installed Chromium runner and owned synthetic
PostgreSQL/Redis/SMTP fixtures. The site suite includes all 40 accessibility
views and the 40-case content/SEO/geometry/contrast parity comparison. Native
fade invocation, fast/slow navigation, superseded requests, network failure
fallback, history, scroll, locale/theme persistence, focus and route
announcements were checked. Firefox/WebKit and actual screen-reader speech
were not exercised.

Visual inspection compared the former centered loader with the new top bar on
the light English home view at 375 × 900, mobile menu open, navigation pending.
The former box covered the introductory text; the new bar leaves it visible.
Spanish mobile and English desktop waiting states were also inspected. Local
artifacts are ignored by Git, never uploaded automatically:

- Before: `/tmp/vis-49-before/loader.png`.
- After: `/tmp/vis-49-after/slow-navigation-en.png`.
- Reproducible after artifacts:
  `dist/.playwright/apps/web/site-e2e/test-output/website-navigation-*/slow-navigation.png`.

Source changes are ready for review. They are not deployed by these checks.
VIS-45 is Done based on actual trace evidence; VIS-49 is ready for PR review.
VIS-43 and VIS-44 remain open with the production gates described above.
