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

Deploy and check the collector first. Unauthenticated/wrong-credential requests
must fail; an authenticated synthetic trace must be accepted. Then enable the
configured gateway OTLP connection. The endpoint is the collector's private domain
on port 4318, protocol `http/protobuf`; authentication comes from the collector's
preserved variable reference. Missing receiver configuration can prevent application
startup, so do not deploy the enabled gateway before provisioning both secrets.

Confirm a synthetic application trace reaches Jaeger and survives a collector restart.
A `/status` response or dashboard `traceExportEnabled` flag is not delivery evidence.
Disable `VISOMI_OTLP_TRACING` to stop application export during rollback; leave the
collector volume and credentials intact. Reconcile the IaC flag with that operational
rollback before the next apply so it does not silently re-enable export.

Native Railway tracing/auto-instrumentation remains disabled. Only the application's
allowlisted operational spans are exported. Browser error/performance capture and
local private dashboard metrics remain disabled independently. OTLP metrics and logs
export remain `none`; local dashboard metrics are process-local, not Jaeger history.

The contact cutover/rollback and owner acceptance gates are documented in
[`docs/migration/contact-cutover.md`](../docs/migration/contact-cutover.md).

## SSR proxy configuration pending

This change does not alter Angular SSR proxy handling. The earlier header-stripping
workaround and its tests have been removed. Correct forwarding configuration is
pending verification of Railway's ingress trust boundary and which headers it
replaces. Do not enable unconditional proxy trust or silence warnings as a substitute
for that verification. Preserve Angular's host allowlist and validate trusted and
untrusted ingress paths before a separate SSR change.
