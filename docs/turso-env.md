# Turso Environment

The Astro website now requires Turso credentials at build time and runtime for the contact form action and Astro DB reads/writes.

Required environment variables:

```bash
ASTRO_DB_REMOTE_URL=libsql://visomi-dev-visomi-dev.aws-us-east-1.turso.io
ASTRO_DB_APP_TOKEN=<your-turso-token>
```

Notes:

- Use the `libsql://` URL format for Turso.
- The Docker or Railway runtime must define both variables.
- The build environment must also define both variables for `website:build` and `server:build`.
- Local development can use `apps/website/.env` with `website:build-local` and `website:preview-local`.

Recommended deployment mapping:

- Local: `apps/website/.env`
- CI: repository or environment secrets
- Railway: service variables on the server app

If these variables are missing or malformed, Astro DB will fail during build or request handling.
