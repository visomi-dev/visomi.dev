# visomi.dev

Personal engineering portfolio monorepo built with Nx.

This workspace currently combines:

- `apps/website` - Astro website for the public portfolio, localized in English and Spanish
- `apps/server` - Node composition server that mounts the Astro website and the API behind one runtime
- `apps/api` - Express API for backend endpoints and future application services
- `apps/ng-website` - Angular application kept in the repo as a parallel/legacy surface
- `apps/website-e2e` - Playwright smoke and screenshot coverage for the Astro website
- `apps/api-e2e` - Jest-based API e2e coverage

## Architecture

The current production direction is a monolith-style deployment with modern tooling:

- Astro handles the public website
- Astro Actions + Astro DB handle the contact form workflow
- Turso backs Astro DB for contact submissions
- Express remains available for API routes under `/api`
- `apps/server` is the single Node entry point used by Docker and Railway

This keeps the repo modular inside Nx while preserving the operational feel of a single deployable app.

## Workspace Projects

```text
apps/
├── api/           Express API
├── api-e2e/       API end-to-end tests
├── ng-website/    Angular website/app surface
├── server/        Node gateway/composition server
├── website/       Astro portfolio website
└── website-e2e/   Playwright smoke and screenshot tests
```

## Requirements

- Node.js
- pnpm

Install dependencies:

```bash
pnpm install
```

## Local Development

### Astro website only

```bash
pnpm nx run website:serve
```

### Full composed server

```bash
pnpm nx run server:serve
```

### API only

```bash
pnpm nx run api:serve
```

### Angular app

```bash
pnpm nx run ng-website:serve
```

## Build Targets

### CI/server build

Used for Docker and server deployments. Expects Astro DB env vars from the environment.

```bash
pnpm nx run website:build
pnpm nx run server:build
```

### Local website build

Uses `apps/website/.env` through Nx `envFile`.

```bash
pnpm nx run website:build-local
pnpm nx run website:preview-local
```

### Angular production build

```bash
pnpm nx run ng-website:build:production
```

## Testing and Verification

### Lint

```bash
pnpm nx run website:lint
pnpm nx run ng-website:lint
pnpm nx affected -t lint
```

### Unit and integration tests

```bash
pnpm nx run website:test
pnpm nx run api-e2e:e2e
```

### Astro typecheck

```bash
pnpm nx run website:typecheck
```

### Visual regression and screenshots

```bash
pnpm nx run website-e2e:screenshots
pnpm nx run website-e2e:screenshots-home
pnpm nx run website-e2e:screenshots-projects
pnpm nx run website-e2e:screenshots-contact
```

## Contact Form

The contact page uses:

- Astro Actions for form handling
- Zod validation
- Astro DB for persistence
- Turso as the remote database

Relevant files:

- `apps/website/src/actions/index.ts`
- `apps/website/db/config.ts`
- `apps/website/src/pages/contact/index.astro`
- `apps/website/src/pages/es/contact/index.astro`

## Environment Variables

For the Astro website server build and runtime:

```bash
ASTRO_DB_REMOTE_URL=https://visomi-dev-visomi-dev.aws-us-east-1.turso.io
ASTRO_DB_APP_TOKEN=<turso-token>
```

Important:

- Astro DB bakes the remote URL into the server bundle at build time
- Docker/Railway must provide these variables during build and runtime
- local development can use `apps/website/.env`

See also:

- `docs/turso-env.md`
- `docs/monolith-contact-architecture.md`

## Deployment Model

Current deployment direction:

- `main` -> Docker/Railway style server deployment
- GitHub Pages deployment is disabled for the Astro site because the contact workflow depends on server features

The Docker build compiles the composed Node server in `apps/server`, which depends on:

- `apps/website`
- `apps/api`

## Useful Nx Commands

```bash
pnpm nx show projects
pnpm nx show project website --json
pnpm nx graph
pnpm nx run-many -t build
pnpm nx affected -t build,test,lint
```

## Documentation

- `docs/monolith-contact-architecture.md`
- `docs/turso-env.md`
- `docs/redesign/projects.md`

## Notes

- `.husky/pre-commit` runs `pnpm nx affected -t lint`
- SEO/social preview images are sourced from page-specific preview assets under `apps/website/src/assets/seo/`
- The repo still contains the Angular site while Astro is the public production surface
