# visomi.dev

Personal engineering portfolio built with Nx, Astro and Angular, using the runtime and tooling from
[visomi-stack](https://github.com/visomi-dev/visomi-stack).

The public portfolio keeps its original content, design, WebGL background, printable CV, brand assets
and English/Spanish URLs. The Angular app is a blank private shell with an owner-only contact dashboard.
Contact submissions use PostgreSQL; social images use the existing BullMQ/Redis worker.

## Projects and routes

| Project        | Responsibility                                                                                    | Routes                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `web-gateway`  | Owns HTTP, shared authentication, PostgreSQL, telemetry and worker lifecycle                      | Single entrypoint                                                               |
| `web-site`     | Original Astro portfolio and contact form                                                         | `/`, `/journey/`, `/projects/`, `/resume/`, `/contact/`, and `/es/` equivalents |
| `web-app`      | Private Angular shell, access screen and protected list/detail                                    | `/app/en/`, `/app/es/`                                                          |
| `web-api`      | Import-safe Express composition, health/readiness, contact API and minimal private authentication | `/api` when embedded                                                            |
| `web-realtime` | Stack transport infrastructure; no product/business routes                                        | Owned by gateway when authentication is configured                              |
| `web-edge`     | Optional, undeployed Cloudflare path guard; local build/tests only                                | Prepared route configuration                                                    |
| `worker`       | Social-image validation, Chromium rendering and artifact promotion                                | Protected `/api/internal/social-images`                                         |

`apps/ng-website` is retained as an archived reference and excluded from active Nx projects.
The old composition server and unsafe shared-environment Jest E2E harnesses have been replaced.

## Development and verification

Use the Node version in `.node-version` and pnpm 12.15.0. Configuration names/placeholders are in
`.env.example`; never commit environment values. Local Compose creates only development PostgreSQL
and Redis; it does not provision or change the existing external services.

```sh
pnpm install --frozen-lockfile
pnpm nx build web-gateway
pnpm nx run web-gateway:serve
pnpm nx run web-api:serve
pnpm nx run web-site:serve
pnpm nx run-many -t lint typecheck typecheck-tests deployment-check --parallel=2
pnpm nx run-many -t test --parallel=2
pnpm nx run-many -t e2e --parallel=1
pnpm nx run web-gateway:container-check
pnpm nx run web-gateway:jaeger-check
```

Builds/startup never migrate a database. Use an explicitly approved destination when running
`pnpm nx run backend-shared:db-migrate`. Isolated tests create unique local Compose projects and
synthetic identities; they never reuse ambient database credentials or an already-running application.
Production runtime startup is `node dist/apps/web/gateway/main.js`, normally on port 8080.
For public-site inspection without configured dependencies, explicitly set `DISABLE_WORKER=true`;
contact readiness remains unavailable until the PostgreSQL schema is present.

## Private owner access

Reuse the existing stack identity with a verified email. Set `AUTH_ORIGIN`, `AUTH_RP_ID`, `SESSION_SECRET`
and `OWNER_EMAIL`, optionally pinning `OWNER_USER_ID`. SMTP and/or the configured TOTP factor supplies
the stack's second-factor proof. No public signup, password reset, OAuth enrollment or account-management
routes are exposed. Missing owner/auth configuration denies access. The owner enters through
`/app/en/access` or `/app/es/access`; authorization is enforced again on every contact API request.
Private responses are `no-store`, list/detail data never enter SSR/transfer state, and message content
is rendered as escaped text. Telemetry export is disabled unless explicitly enabled by an operator.

## Migration and release

[Migration provenance, parity and source inventory](docs/migration/README.md) describe the integration.
[Contact cutover and rollback](docs/migration/contact-cutover.md) cover dry-run, freeze/drain, exclusive
backups, reconciliation, idempotency and preservation of post-cutover submissions during rollback.

The integration prepares one PR into main. Merge, deployment, provisioning, DNS/credential changes,
and reading or migrating real contact data require separate authorization.
