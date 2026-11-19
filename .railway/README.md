# Release configuration

The gateway consumes existing PostgreSQL and Redis connections via `preserve()`.
This configuration additionally owns the private Jaeger service and its persistent
`jaeger-data` volume, matching the approved hosted deployment. It does not provision
another database or broker, migrate Turso data, or prepare the owner account.

## Reconcile before applying

Bind `web-gateway` to the existing `visomi.dev` application service, and bind `jaeger`
and `jaeger-data` to their existing service and volume in the same production
environment. Names in this file are IaC addresses, not permission to create duplicate
resources. Review the plan before apply: reject unexpected replacement, deletion,
public networking, database/Redis changes or credential rotation. Merging this file
alone does not apply infrastructure. The gateway retains the production database migration pre-deploy command
`node libs/backend/shared/tools/database/migrate.mjs` (120-second timeout). It applies
versioned schema migrations, not legacy contact data imports. Preserve existing
source bindings when reconciling this intentionally partial definition.

Jaeger uses the stack's pinned 2.22.0 image, a 1 GiB volume mounted at `/badger`, and
48-hour trace retention. The collector listens privately on 4318; the health check
uses 13133 `/status`. Query/UI 16686 has no authentication in `jaeger.yaml`: do not
add a public domain or TCP proxy. Use an authorized private tunnel or authenticated
access layer for inspection. UID 0 is limited to this private storage container
because Railway volumes are root-owned; the application image remains non-root.

## Credentials and ordered activation

Supply `JAEGER_HTPASSWD` (bcrypt htpasswd record) and matching `OTLP_AUTH_HEADER`
(`Authorization=Basic ...`) directly through the approved Railway secret workflow.
Both values are `preserve()` so subsequent applies retain them. Never commit them,
print them in CI, or copy credentials from another project's collector.

Before a future release, provision the private collector and verify that requests
with missing or wrong credentials are denied. The gateway exports eligible spans
when the complete `OTEL_EXPORTER_OTLP_*` receiver configuration is valid. Use
Jaeger's private domain on port 4318, protocol `http/protobuf`, and the preserved
Authorization header reference. A partial, malformed or non-private configuration
prevents startup. Leave all three variables unset for environments with no receiver.

Confirm a synthetic application trace reaches Jaeger and survives a collector restart.
The `/status` response and `traceExportEnabled` indicate health and configuration,
respectively. Delivery requires a stored trace. To stop export on this version,
unset the complete OTLP configuration as a set and reconcile the declaration
before the next apply. Keep the collector volume and credentials for rollback.

Native Railway tracing and Astro tool telemetry keep their existing settings.
`VISOMI_PRIVATE_METRICS` keeps its independent opt-in. Browser intake is available
for the canonical `AUTH_ORIGIN` and the available assets and PostgreSQL pool.
Automatic browser reporting follows the browser's revocable choice. OTLP metrics
and logs exports stay off. The dashboard reports process-local measurements.

The contact cutover/rollback and owner acceptance gates are documented in
[`docs/migration/contact-cutover.md`](../docs/migration/contact-cutover.md).

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
