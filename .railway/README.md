# Railway production IaC (VIS-62 and VIS-26)

Railway stops reading legacy Config as Code on **December 1, 2026**.
The gateway's Config File setting is empty. Its last verified deployment
auto-detected the root `railway.json` after the settings were persisted by IaC.
The first deployment from a revision without that file is the remaining
verification for the removal.
[Railway migration guide](https://docs.railway.com/infrastructure-as-code#migrating-from-config-as-code)

## Existing production inventory

The definition covers the whole existing `production` environment in `visomi`.
A read-only check on November 20, 2026 found an empty IaC ownership map in that
environment. The four service names and three volume names below matched the
redacted Railway import. The IDs are for review and stay out of the IaC file.
[Production environment and gateway](https://railway.com/project/866f46e7-1d66-4cb7-9793-0b89db25990b/service/8efe2ba3-1921-462c-b0b9-3375c26f531d?environmentId=3711cead-a360-4880-abc8-6472f21dbb68)

| Service    | Existing service ID                  | Source                                                 |
| ---------- | ------------------------------------ | ------------------------------------------------------ |
| visomi.dev | 8efe2ba3-1921-462c-b0b9-3375c26f531d | `visomi-dev/visomi.dev`, `main`, Dockerfile            |
| Postgres   | e1bb76f5-a785-4a41-ab6d-b478188f6a3a | `ghcr.io/railwayapp-templates/postgres-ssl:18`         |
| Redis      | 9654c534-9e42-4747-aab7-da8942d2c5d5 | `redis:8.2.9`                                          |
| jaeger     | cb238562-2b11-402f-adb7-fa861169f536 | Shared Jaeger 2.22.0 image digest in `jaeger-image.ts` |

| Volume          | Existing volume ID                   | Service and mount                   | Size (MB) |
| --------------- | ------------------------------------ | ----------------------------------- | --------- |
| postgres-volume | 811ff583-f45e-4d82-81bc-944966486a2d | Postgres `/var/lib/postgresql/data` | 50000     |
| redis-volume    | 9ff82c46-1cf5-4f24-a4a5-718905138222 | Redis `/data`                       | 5000      |
| jaeger-data     | 9e4b7dcc-245b-4731-b625-88912f18a81f | jaeger `/badger`                    | 1024      |

All three volumes remain in `us-east4-eqdc4a`. Railway's Postgres and Redis
templates retain their existing volume attachments. The definition declares both
disks and mount paths. Expressing either template attachment as a new
`volumeAttachments` entry made the plan propose a mount update, so the code uses
the database mount paths and preserves the existing template bindings. Jaeger's
existing mount is explicit in IaC. [Railway database and volume reference](https://docs.railway.com/infrastructure-as-code/reference#databases)

| Gateway domain | Existing domain ID                   | Target port |
| -------------- | ------------------------------------ | ----------- |
| visomi.dev     | e4d180df-c14a-4af4-8ea1-4ce8b1d47f1a | Implicit    |
| www.visomi.dev | 0d8bbba8-4031-4b0f-9ef5-e3f06bf16127 | 8080        |

The IaC definition records both custom domain bindings, including the implicit
apex port. The gateway remains the only service with public domains. Jaeger
intake on 4318 and its query UI stay private.

## Variables and reference targets

The 48 retained variable declarations use `preserve()`. The reference metadata
resolves the gateway variables below to existing services. Keeping the stored
expressions with `preserve()` avoids rewriting even an equivalent reference.
Database template variables retain their internal references.

| Gateway variable              | Existing target                 |
| ----------------------------- | ------------------------------- |
| `DATABASE_URL`                | `Postgres.DATABASE_URL`         |
| `REDIS_URL`                   | `Redis.REDIS_URL`               |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `jaeger.RAILWAY_PRIVATE_DOMAIN` |
| `OTEL_EXPORTER_OTLP_HEADERS`  | `jaeger.OTLP_AUTH_HEADER`       |

This review used the variable names, IDs and reference edges. The IaC plan
leaves existing credentials, SMTP, owner access and the complete OTLP setup in
place. The API and gateway aggregate HTTP measurements locally for the owner.
Browser reporting, performance and visit measurement start off until explicit
consent. Manual sanitized reports use an independent explicit action.
[Browser privacy](../docs/migration/browser-privacy.md)

Six retired gateway entries remain live. The CLI's
`variables.ignore` policy matches each exact name on `visomi.dev` once and
excludes it from the managed variable diff. These are the browser telemetry
and performance switches, the OTLP tracing switch, the private metrics switch
and the two proxy diagnostic entries. Keep those exclusions until a separately
authorized Railway cleanup removes the entries. Simply omitting managed
variables would propose deleting them. After live cleanup and rollback review,
remove the exclusions and preview the plan again.

## Planning and applied configuration

Use the existing authorized CLI session to target project
`866f46e7-1d66-4cb7-9793-0b89db25990b` and environment
`3711cead-a360-4880-abc8-6472f21dbb68`. The review used Railway CLI 5.74.0 and
the locked TypeScript SDK. The default import preserved variable values and
served as an unchanged baseline. Use read-only metadata for the resource IDs,
mounts, domain ports and reference targets. Keep the imported variable values
redacted and any temporary import outside the working tree.
[Railway import guidance](https://docs.railway.com/infrastructure-as-code#import-an-existing-project)

```sh
railway config partials list --json
railway config plan --file .railway/railway.ts --verbose --detailed-exit-code
pnpm nx run web-gateway:deployment-check
pnpm nx run web-gateway:jaeger-check
```

On November 21, 2026, the authorized plan for release
`58a622ade84ddbd9bbbb392cd5f46612df9c160a` applied the two gateway updates and
included the whole-project claim for the seven existing resources. The gateway
persisted 18 watch patterns, `/api/ready` with a 60-second timeout and three
retries under `ON_FAILURE`. The build, source trigger, entrypoint and pre-deploy
command `node libs/backend/shared/tools/database/migrate.mjs` remained in place.
The stored pre-deploy timeout remained unset.

Deployment `907614b1-43e9-4e74-806d-90d064730e84` succeeded on that release.
The follow-up plan showed zero changes, Railway reported no pending operations
and its named ownership map was empty. The PostgreSQL, Redis and Jaeger
deployments, disks, mounts, domain bindings, 54 variable names and 18 reference
edges matched the pre-apply inventory. Public `/api/health` and `/api/ready`
returned 200 at the apex and after the canonical redirect from `www`. The
deployment manifest retained the migration command, with no independent
execution marker in the filtered logs.
[Verified deployment](https://railway.com/project/866f46e7-1d66-4cb7-9793-0b89db25990b/service/8efe2ba3-1921-462c-b0b9-3375c26f531d?environmentId=3711cead-a360-4880-abc8-6472f21dbb68&id=907614b1-43e9-4e74-806d-90d064730e84)

## Verify the first release without Config as Code

1. Keep the persisted 18 watch patterns for this release. The
   `/railway.json` pattern lets the removal trigger a deploy from `main`.
   Railway's Config File setting is already empty. This removal needs no
   second IaC apply or separate cutover command.
2. After the approved merge, record the deployment ID and the exact commit
   without `railway.json`. Wait for `SUCCESS`, check that the manifest used no
   repository Config File and verify readiness, retries, and the existing
   pre-deploy command. Check apex `/api/health` and `/api/ready` and confirm
   both paths still reach the apex over HTTPS from `www`.
3. Compare Railway metadata against the verified inventory above and run a
   redacted plan. Confirm the same service and volume IDs, mounts, domain
   bindings and references, zero proposed changes, and no pending operations.
4. If validation fails, stop the rollout and review rollback separately. Use
   the prior compatible release and the stored settings as rollback references.
   After December 1, a Git rollback alone cannot restore legacy overrides.
   Follow the [contact rollback runbook](../docs/migration/contact-cutover.md)
   before any schema or data recovery action.

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
