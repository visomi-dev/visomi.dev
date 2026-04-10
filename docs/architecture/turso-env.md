# Turso Environment

The Astro website now requires Turso credentials at build time and runtime for the contact form action and Astro DB reads/writes.

Required environment variables:

```bash
ASTRO_DB_REMOTE_URL=https://visomi-dev-visomi-dev.aws-us-east-1.turso.io
ASTRO_DB_APP_TOKEN=<your-turso-token>
```

Notes:

- Use the `https://` URL format for Astro DB build and runtime configuration in this app.
- The Docker or Railway runtime must define both variables.
- The build environment must also define both variables for `website:build` and `server:build`.
- For Docker-based deploys, the image build must receive these values as build arguments because Astro DB bakes the remote URL into the generated server bundle.
- Local development can use `apps/website/.env` with `website:build-local` and `website:preview-local`.

Recommended deployment mapping:

- Local: `apps/website/.env`
- CI: repository or environment secrets
- Railway: service variables on the server app, and if using Docker image builds, also available during the build phase

If these variables are missing or malformed, Astro DB will fail during build or request handling.
