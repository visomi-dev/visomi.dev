# Railway Config as Code migration (VIS-62)

Railway stops reading `railway.json` on **December 1, 2026**. The running
deployment stays up. The stored service settings take over on the next
deployment after the cutoff or after the deployed commit no longer contains the
auto-detected file. Changing the TypeScript in Git alone has no effect on Railway.
[Railway migration guide](https://docs.railway.com/infrastructure-as-code#migrating-from-config-as-code)

## Scope and evidence

- The named partial `visomi.dev` targets the existing `visomi.dev` service in
  project `visomi`, environment `production`. The old `web-gateway` declaration
  was an incomplete model of production. Use the existing service identity and
  GitHub source `visomi-dev/visomi.dev` on `main`.
- The [production service](https://railway.com/project/866f46e7-1d66-4cb7-9793-0b89db25990b/service/8efe2ba3-1921-462c-b0b9-3375c26f531d?environmentId=3711cead-a360-4880-abc8-6472f21dbb68)
  has no stored Config File path and no IaC owners as observed on November 20, 2026. It auto-detects the root `railway.json`. Keep that file until the
  replacement settings are in effect and verified. A path-clearing cutover and
  its undo have nothing to change for this service.
- The deployment evidence in [VIS-62](https://linear.app/visomi/issue/VIS-62)
  showed 18 effective watch patterns and `/api/ready` at 60 seconds. The stored
  service settings have three patterns and no readiness check. The partial
  persists the legacy settings along with `ON_FAILURE` and three retries.
  It retains the existing Dockerfile, entrypoint and schema migration
  `node libs/backend/shared/tools/database/migrate.mjs` with the platform's
  existing pre-deploy timeout. The older proposed 120-second override was
  absent from both the stored settings and the reviewed deployment.
- Railway continues to manage both domains. The apex `visomi.dev` has an
  implicit target port and `www.visomi.dev` explicitly targets 8080. Both
  domain records, the private Jaeger service and its existing `jaeger-data`
  mount at `/badger`, Postgres and Redis and their volumes are outside the
  proposed changes. Jaeger has no public domain or TCP proxy.
- The partial leaves all Railway variables unmanaged. Preserve the existing
  `DATABASE_URL`, `REDIS_URL`, `AUTH_ORIGIN`, auth and SMTP settings,
  `VISOMI_PRIVATE_METRICS` and the complete `OTEL_EXPORTER_OTLP_*` receiver
  configuration and references. Check reference targets privately before
  cutover. This review retrieved names and binding metadata only.
- Stale names still present include `VISOMI_BROWSER_TELEMETRY`,
  `VISOMI_BROWSER_PERFORMANCE` and `VISOMI_OTLP_TRACING`. The current app uses
  the browser's default-off, revocable consent for automatic reporting and
  performance. Manual sanitized reports remain independently explicit.
  Leave the old variables in Railway so the prior release can still roll
  back with its matching settings. See [browser privacy](../docs/migration/browser-privacy.md).

## Read-only review

Use an existing authorized CLI session. Set `RAILWAY_PROJECT_ID` and
`RAILWAY_ENVIRONMENT_ID` to the verified project and production environment IDs
from the service link. Check that an existing project-scoped token, if in use,
targets that same environment. The recorded review used Railway CLI 5.74.0
and the repository's locked SDK. Run from the repository root.

```sh
railway config partials list --json
railway config plan --file .railway/railway.ts --verbose --detailed-exit-code
pnpm nx run web-gateway:deployment-check
pnpm nx run web-gateway:jaeger-check
```

The redacted plan on November 20 reported **0 to add, 2 to change, 0 to destroy**
and 36 variables outside IaC. It proposed only the watch settings and readiness
and retry updates for the existing service. The CLI normalizes the current retry
default to an unset field in this diff. Ownership and the environment
configuration etag matched before and after planning. Exit code 2 means changes
are pending. Keep values redacted and share only the reviewed summary. A plan is
a comparison against stored settings. It does not attest to variable values,
reference targets, DNS, ingress, private connectivity or a future deployment.

## Future cutover and rollback

1. Confirm the exact service, environment, source branch, empty Config File
   path, current IaC owners and absence of staged changes. Record the current
   successful deployment ID and the nonsecret settings to use for rollback.
   Compare the effective deployment settings with the stored service settings.
   Check that both domains and all existing service and volume IDs still match.
2. Refresh the redacted plan immediately before any authorized change. Accept
   only the two setting groups above on the existing gateway. Stop on any
   create, delete, replacement, volume or domain change, source change,
   variable or reference change, or edit to another service. Reconcile any
   ownership or configuration drift before planning again.
3. In an approved deployment window, apply only the reviewed partial. The
   first apply claims ownership and can start a deployment. If IaC cannot be
   used, the same authorized review can persist just the approved fields on
   the existing service in Railway settings. Retain `railway.json` through
   migration verification and handle its removal separately.
4. Verify the persisted settings, expected pre-deploy result, readiness and
   existing source trigger. Check HTTPS and the expected apex and www behavior,
   authorized owner access, private PostgreSQL/Redis and Jaeger connectivity,
   and consent behavior with synthetic acceptance data. Re-run the scoped plan
   and compare service, domain and volume identities. Keep Jaeger's authenticated
   intake on 4318 and its query UI on private networking.
5. If verification fails, stop rollout. If deployment occurred, use the
   previously approved revision and its compatible runtime settings. Restore
   the saved gateway setting fields through the same reviewed scope. Preserve
   the database, Redis, Jaeger volume, domains and existing references. The
   auto-detected file can still provide its overrides before the cutoff, but
   after December 1 a Git rollback alone cannot restore them. Consult the
   [contact rollback runbook](../docs/migration/contact-cutover.md) before any
   schema or data recovery action.

## SSR proxy configuration and release gate

With a public HTTPS `AUTH_ORIGIN`, production SSR uses Angular's official
`trustProxyHeaders` allowlist for
`x-forwarded-host` and `x-forwarded-proto` only. Before rendering, a guard requires
exactly one `Host` and `X-Forwarded-Host` matching the HTTPS `AUTH_ORIGIN` host,
and exactly one `X-Forwarded-Proto: https`. It rejects duplicate fields, comma
lists, foreign hosts/ports and insecure schemes rather than rewriting headers.
The existing Angular host allowlist remains in force. Development is unchanged.

This does not authenticate the immediate network peer and does not grant trust
to client IP claims. Express IP trust remains independent and unchanged.
Angular receives a separate web Request without `Forwarded`, `X-Forwarded-For`
or client-IP/geo headers (see `ssr-request.ts`). The original Express request,
its headers and socket remain intact. Host/proto validation runs before this
conversion; only those two forwarded headers are allowed for URL construction.
Other unsupported proxy headers may still produce Angular warnings.

Before merging or deploying this change, verify the live `AUTH_ORIGIN` is the
canonical public HTTPS origin and verify Railway delivers the required unique
Host/X-Forwarded-Host/X-Forwarded-Proto combination through every supported
public ingress path. An absent AUTH_ORIGIN or an HTTP loopback origin preserves the default Angular
adapter without adding proxy trust, supporting standalone/local production builds.
An invalid configured public origin fails initialization. With the public HTTPS
policy enabled, missing or mismatched ingress headers return HTTP 400 for SSR.
Test both the legitimate public route and forged/duplicate headers, including
private-network access. Synthetic local tests are not proof of Railway ingress
behavior. No additional environment variable or proxy CIDR trust is introduced.

## Server rendering

App routes default to server rendering, including private owner screens. Server-only
API forwarding is restricted to the current request's same origin and allowlisted
read-only GET endpoints. Cookies remain request-scoped; concurrent requests must not
share authentication. HTTP transfer caching is disabled and rendered HTML is
`private, no-store`, without an ETag. Hydration supports localized content.
