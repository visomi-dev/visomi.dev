# visomi.dev stack migration

## Provenance and constraints

The integration branch starts at website main `9511109c233f2a6a7604c80fa1597aa338e9135d`.
It incorporates PR #41 head `ad095e9bf51276201c5a39330575b686c9f51f47` and PR #42 head
`051ef523cc5208154e88376e65cabc1815899b08`, without conflicts, at `f2cfa9c`.
The PRs remain closed; neither is reopened or merged on GitHub.
The source stack was revalidated after the owner's update at
`c7e362b6fe4dc14ede081ba9090a5345ba5b7bcb`. Both source checkouts were clean.

`baseline.json` records source hashes before migration. `stack-files.json` inventories
all tracked source-stack files, including hidden files, with copy destinations and exclusions.
Only tracked files were read/copied; no local env files, credentials, sessions or database
contents were imported. MCP configuration is versioned without starting its connections.

The owner's decision is to reuse stack authentication. Authorization requires an explicitly
configured owner with a verified email; no default identity or first-user enrollment is used.
The confirmed address belongs in operator configuration, not hardcoded application policy.
No merge, deployment, infrastructure provisioning, DNS change, credential change or real-data
migration has been performed. These operations are separate release gates.

## Public baseline

English is unprefixed: `/`, `/journey/`, `/projects/`, `/resume/`, `/contact/`.
Spanish equivalents are `/es/`, `/es/journey/`, `/es/projects/`, `/es/resume/`, `/es/contact/`.
Keep trailing-slash redirects, canonical/hreflang links, sitemap, social-image URLs,
project content/assets, theme state, ClientRouter reinitialization, WebGL and printable CV.
The contact persistence boundary changes; its visible form remains the original. Minimal required accessibility corrections are documented below.

The integrated production build passed using only synthetic database configuration.
`parity/baseline` contains 40 production-browser captures and content/SEO manifests:
10 destinations × 2 themes × mobile (375×812) / desktop (1440×900).
The capture hides only canvas pixels because procedural WebGL output varies between frames;
WebGL behavior is verified separately. All other content, layout, fonts and metadata are compared.
A per-channel tolerance of 20 and maximum changed-pixel ratio of 0.2% permits rasterization noise;
page dimensions and normalized body text/SEO must match exactly.
Captures disable LCD text antialiasing so host Fontconfig cannot add colored subpixels.
The same 40 stored references match with zero changed pixels on both the developer host and Ubuntu Playwright image.
Run the `website-parity` Nx target against the current artifact on loopback; keep both recorded reference sets intact.

## Runtime and configuration inventory

Before: gateway `server`, API and realtime bootstrap, Angular social-card preview,
Astro public portfolio/contact action + Astro DB/Turso, BullMQ social-image worker + Redis,
static social-image manifests/PNG promotion. The API main was also imported as an entrypoint;
the migration replaces this with the stack's side-effect-free module loader.

After: stack gateway/API/Angular/realtime composition and shared backend/tooling, original
Astro portfolio, PostgreSQL contact API/owner dashboard, existing BullMQ social-image worker.
Redis remains one existing dependency. No template website, public signup or unrelated product
screens are carried into the application's routes.

Configuration is listed by name only: `HOST`, `PORT`, `SITE_URL`, `DATABASE_URL`, `REDIS_URL`,
`AUTH_ORIGIN`, `AUTH_RP_ID`, `SESSION_SECRET`, `OWNER_EMAIL`, `OWNER_USER_ID`,
`AUTH_TOTP_ENCRYPTION_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `SMTP_USER`, `SMTP_PASSWORD`,
`SOCIAL_IMAGE_INTERNAL_TOKEN`, `DISABLE_WORKER`, `VISOMI_OTLP_TRACING`,
`VISOMI_BROWSER_TELEMETRY`, `VISOMI_BROWSER_PERFORMANCE`.
Legacy migration input is an explicit offline export; the application no longer requires
`ASTRO_DB_REMOTE_URL` or `ASTRO_DB_APP_TOKEN`.

## Necessary exceptions to the source stack

- Keep original Astro components, CSS, fonts, content, scripts, assets, unprefixed English URLs,
  prerender/cache/CV improvements and identity. Template public pages are excluded.
- Keep existing social-image generation, BullMQ/Redis worker, contracts and public artifact URLs.
- Angular is a blank shell plus owner contact list/detail and private authentication integration;
  template public login/signup and account-management screens are excluded.
- Adapt source package/repository/domain names and commands; remove developer-specific PATH values.
- PostgreSQL/Redis infrastructure from VIS-16 is reused; no second database/broker or Jaeger service
  is provisioned. Exporting operational telemetry is explicit opt-in and must exclude request data.
- Worker builds use the matching Nx esbuild executor; its tests and the migrated runtimes use Vitest.
  Backend artifacts use Rolldown. These are compatibility tasks, not alternate production architecture.

Implementation and verification evidence will be recorded per issue and in the final PR.

## Final architecture adaptations

- Private Angular entrypoints preserve the stack's `/app/en/` and `/app/es/` locale bases. Both roots
  are empty; `/access` supports only the confirmed existing owner's password and second factor.
  Guards and resolvers fetch essential list/detail data before activation; private routes render
  on the client and cannot embed contact data in SSR output.
- Original public content was split into typed English/Spanish/project data modules without changing
  values. A stale predecessor assertion expected `06 // Idiomas`; the integrated baseline already
  rendered `Idiomas`, which remains unchanged.
- Mandatory repository conventions require direct source imports, type-only imports and strict checking.
  New stack barrel entrypoints were replaced with direct modules. Lifecycle tests still load executable
  modules dynamically to verify import/startup boundaries. Production Nx readiness uses the same Nx 24
  framed JSON protocol through a tiny Node socket helper, avoiding eval and build-tool runtime dependencies.
- Public CSP permits only hashes of trusted compiled snippets. Styles and font assets are external;
  ClientRouter receives the finite cross-route hash set. No `unsafe-inline` or `unsafe-eval` exception
  was introduced. Source maps and private browser routes retain their separate boundaries.
- Generic stack auth infrastructure remains covered with a test-only loopback router; production exposes
  only session, password sign-in/verification and logout. Template registration/account-management E2Es
  were replaced with real owner-only API/browser tests. The worker E2E uses real Redis and Chromium,
  including interruption/recovery, and writes only into an owned temporary workspace.
- Local Compose omits unrelated MinIO/opaque-sync services. Railway is a reviewable single-service
  configuration that references existing PostgreSQL/Redis variables; no external plan/apply was executed.

## Accessibility and visual evidence

The original baseline has AXE contrast, landmark and accessible-name failures (see
`parity/baseline-accessibility.json`). Minimal corrections make the footer semantic, preserve visible
link names, and increase secondary text contrast. These are the only intentional visual exceptions.
No geometry, typography, content or public URL changes are permitted.
The final 40 comparisons have zero changed pixels against the contrast reference; the largest raw
difference from the untouched baseline is 0.2503%, entirely explained by the enumerated contrast changes.

`parity/baseline` retains the original integrated artifact captures. `parity/accessibility-baseline`
replays only the enumerated text-color corrections on that original DOM, using the recorded color
manifests; it cannot alter layout, text, assets or fonts. `scripts/parity-accessibility.mjs` enumerates
those rules. The comparison keeps the original 0.2% rasterization tolerance against this contrast
reference and records the raw difference against the unmodified baseline too. Canvas pixels are hidden
and frame callbacks stopped after page readiness; WebGL behavior is tested separately.

```sh
# Original f2cfa9c artifact on loopback 8181; current artifact on loopback 8182.
PARITY_URL=http://127.0.0.1:8181 pnpm nx run visomi.dev:website-parity:baseline
PARITY_URL=http://127.0.0.1:8181 PARITY_ACCESSIBILITY_BASELINE=true pnpm nx run visomi.dev:website-parity:baseline
PARITY_URL=http://127.0.0.1:8182 pnpm nx run visomi.dev:website-parity
```

Never run a build that replaces the served `dist` tree while capturing/comparing it. Synthetic database
and browser fixtures own separate ports, Compose projects and cleanup; never point them at production.

The source Cloudflare malformed-path guard is also ported as optional `web-edge` infrastructure.
Its local build and tests do not create routes or bind an account. The smoke command requires an owned
loopback origin, and its deployment target is outside this implementation's authorization.

The public E2E suite also runs the 40-view pixel/content/SEO comparison against its owned compiled
gateway fixture, so CI enforces the recorded reference rather than relying only on manual captures.
Browser preparation uses Ubuntu's official HTTPS mirrors and bounded APT acquisition to avoid
the hosted runner's degraded Azure mirror. Signature checks and browser/E2E gates remain required.
