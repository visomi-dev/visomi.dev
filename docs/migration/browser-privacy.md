# Browser privacy and private diagnostics

VIS-88 through VIS-91 follow [visomi-stack PR #33](https://github.com/visomi-dev/visomi-stack/pull/33).
The reference is its merge into `main`, `cbcc8717e91f7706fe741a6fc48012623e9aa658`,
compared against first parent `19f4464c7b5a91c30fa8daf17b1bbb9e9a3f7eba`.
Destination [visomi.dev PR #52](https://github.com/visomi-dev/visomi.dev/pull/52) started this
increment at `39911d36dab2a87904317041258bfc3a274419bc` on `codex/fix/stack-admin-parity`.

| Reference pattern                                      | visomi.dev                                                                                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared consent and sanitized in-memory queue           | Astro portfolio and Angular admin use the same browser decision key, reporter and performance lifecycle.                                                      |
| Public localized settings and manual report indicators | `/privacy/` and `/es/privacy/` follow the portfolio's existing URL conventions. Angular uses `appUI` for notices, report dialogs, controls and privacy links. |
| Canonical intake and private receiver                  | `/telemetry/visits` keeps VIS-83 and PostgreSQL. VIS-81 retains its owner-only diagnostic feed, source-map isolation and signed correlation.                  |
| Bilingual editorial review                             | Portfolio copy and structure stay in place. Functional text is adjusted for the owner and privacy flows.                                                      |
| Optional Vault example in VIS-87                       | Omitted by the cloud-only PostgreSQL product decision.                                                                                                        |

## VIS-88 consent presentation

The Portfolio reconciliation starts at `c602f9d0f12be160d6f1d8c82f81c680b36f39cf`
on PR #52. Its Stack source is main `7ab065ca29d92c6ea34f71abe09bb094102611e4`,
tree `173dd53474d2a5b568084f06381e60604be2d659`, the merge of
[Stack PR #36](https://github.com/visomi-dev/visomi-stack/pull/36) after
[Stack PR #35](https://github.com/visomi-dev/visomi-stack/pull/35).
The Portfolio and Angular use the same placement and countdown utilities as
Stack with their existing tokens, components and localized routes.

The compact card sits at the bottom left on tall desktop viewports with a fine
pointer. It yields when keyboard focus moves outside the card. On narrow, short
and touch viewports, it stays in flow after the primary content. The persistent
footer link lives on the public Portfolio and leads to `/privacy/` or
`/es/privacy/`. The shared consent notice links to the explanation of how data
is used. Both controls use the same variant and size. The sign-in notice flows
after the viewport-height form so its appearance cannot recenter the form during
hydration.

A fresh grant replaces the local notice with a 10-second confirmation. The
es-MX acknowledgment is “Gracias.” The countdown is visual and its separate
status region announces the acknowledgment once. Revocation, a browser privacy
signal, or navigation ends the confirmation. Expiry leaves the grant in place.
The public Privacy settings continue to show the effective status and allow
revocation while a notice is dismissed. Cross-tab consent propagates without
replaying the confirmation on receiving surfaces.

The Angular shell follows the Stack component-folder convention. Its centered
content uses a full-width scroll region with a stationary header and compact
desktop sidebar. The Portfolio preserves its owner navigation and mobile drawer
destinations. Stack's Google loading change was reviewed against the Portfolio's
password and email/TOTP sign-in contract. Google is not exposed by this sign-in,
so the provider UI and skeleton have no Portfolio entry point. See the
[owner-auth scope](current-stack-review.md).

## Browser behavior

The choice begins off and is shared by documents on the exact same origin,
including the Astro and Angular surfaces. Consent permits future observations.
Performance requires a fresh document and shuts down when consent is revoked.
The visit observer counts only public, allowlisted portfolio pages. Browser
privacy signals GPC and DNT suspend automatic sharing. The server continues to
reject analytics POSTs that carry these preferences. No tracking cookies or
backfill are introduced. The local preference value stays in the browser.

A browser can keep up to five sanitized summaries in memory for five minutes
when automatic sharing is off. A one-off send submits the selected summary to
the existing same-origin diagnostic intake and leaves the browser choice intact.
The preview shows predefined exception type, error category and screen category.
Automatic errors can also include a verified compiled asset fingerprint and
source position, or signed technical correlation for an observed API failure.
Private metrics, browser intake and server tracing have independent lifecycles.

## Transition and rollback

- The gateway derives its canonical intake origin from `AUTH_ORIGIN`, defaulting
  to `https://visomi.dev` when the variable is absent. Verify the exact externally
  reachable scheme, hostname and port against the configured origin before any
  future rollout. Verify the PostgreSQL readiness and asset allowlists separately.
- Server trace export uses the complete `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_PROTOCOL`
  and `OTEL_EXPORTER_OTLP_HEADERS` set privately. An absent set starts without
  export. Partial or unsafe settings fail startup. The receiver must be private
  and authenticated. Test a stored synthetic trace and an unauthenticated denial
  before relying on delivery. Railway edge tracing and `ASTRO_TELEMETRY_DISABLED`
  stay at their existing settings.
- To stop server export on the new version, remove the complete OTLP set together.
  To roll back application behavior, use the previous approved release and its
  matching configuration. Keep the PostgreSQL data and
  Jaeger volume. Reconcile the declarative configuration before applying it again.

## Editorial examples

| Earlier label                                          | English                             | Español (México)                                   |
| ------------------------------------------------------ | ----------------------------------- | -------------------------------------------------- |
| Access dashboard                                       | Continue                            | Continuar                                          |
| Verify access                                          | Verify code                         | Verificar código                                   |
| Confirm your sign-in                                   | Enter your verification code        | Ingresa tu código de verificación                  |
| Open menu                                              | Navigation menu                     | Menú de navegación                                 |
| External trace export is enabled in the configuration. | Private trace export is configured. | La exportación privada de trazas está configurada. |

Verification uses synthetic local fixtures. Keep hosted origin/receiver checks,
real ingress verification and physical device checks as future release evidence.

### Repeatable checks

The original 40 public parity cases use a stored rejection, verify the localized
privacy footer link, then compare the existing portfolio content and pixels with
its approved baselines. The new notice and report controls have their own browser
assertions. The original comparison dimensions and thresholds still apply.

- `app-e2e` exercises the shared decision on the exact synthetic HTTPS origin,
  unchanged PostgreSQL visit aggregation, a wrong-origin rejection, keyboard and
  mobile layouts, GPC/DNT, and default-off and revocation network behavior.
- The browser report cases assert that preview and discard send nothing, manual
  delivery transmits one sanitized summary, and timeout clears the local queue.
  They verify owner-only results and resolve the report's trace through private
  Jaeger. The same cases capture the EN desktop, ES mobile, and consent views.
- `web-gateway:jaeger-check` verifies private authentication, redaction, trace
  persistence through a receiver restart, and bounded behavior during an outage.
  Backend unit coverage exercises missing, partial, unsafe and complete OTLP sets.
