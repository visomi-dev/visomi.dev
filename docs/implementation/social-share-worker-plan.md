# Social Share Worker Plan

## Goal

Build a reusable backend worker that generates social share images for the website with `puppeteer-core`, processes work through BullMQ, writes artifacts to temporary storage, and lets the platform promote the final images into the website public asset contract.

## Agreed Constraints

- The worker lives as a separate project: `apps/worker`.
- The worker is integrated into the platform through `apps/server`.
- Astro stays unchanged as the consumer of the final public SEO image paths.
- Worker output is generated into temporary storage first.
- The platform promotes finished images into `apps/website/public/images/seo/...`.
- Local temporary storage lives under `tmp/` inside the repository.

## Delivery Shape

### Worker Responsibilities

- own the BullMQ worker runtime
- render standalone social image HTML with embedded CSS
- enforce social image card rules
- screenshot PNG output with `puppeteer-core`
- write batch output and manifest files into temporary storage

### Server Responsibilities

- enqueue social image generation work
- wait for batch completion when requested
- promote finished artifacts into the website public directory contract
- mirror promoted assets into the built Astro client directory when it exists at runtime

### Website Responsibilities

- keep using the existing `/images/seo/...` public paths
- remain unchanged as the final asset consumer

## Social Image Rules

The worker should enforce the following rules inspired by the FIU guidance:

- fixed `1200 x 630` canvas
- one dominant message per card
- large headline sized for small previews
- strong text-to-background contrast
- page-specific messaging instead of one generic default card
- small but visible brand marker
- simple composition with limited competing elements
- a small number of supporting highlights only

## Initial Page Set

- `en/home`
- `en/journey`
- `en/projects`
- `en/resume`
- `en/contact`
- `es/home`
- `es/journey`
- `es/projects`
- `es/resume`
- `es/contact`

## Runtime Flow

1. `server` enqueues a BullMQ job for one page or the whole website batch.
2. `worker` creates a normalized social card model from page-specific content.
3. `worker` renders standalone HTML with embedded styles and a blocked layout.
4. `worker` captures the image through Chromium and writes PNG files into `tmp/og-images/<run-id>/...`.
5. `worker` writes a batch manifest describing generated artifacts.
6. `server` promotes the generated files into `apps/website/public/images/seo/...`.
7. `server` also mirrors the promoted files into `dist/apps/website/client/images/seo/...` when available so the running monolith can immediately serve the refreshed images.

## Review Checklist

- BullMQ queue and worker are reusable for future async jobs.
- The worker can generate one page or the full website batch.
- The image card rules are encoded in code and documentation.
- The generated files land in temp storage first.
- The platform can promote outputs into the website public directory contract.

## Status

### Implemented

- `libs/shared/social-images` — shared domain library with types, content, renderer, paths, and promotion logic.
- `apps/worker` — BullMQ worker with `social-images` queue, Puppeteer renderer, and graceful shutdown.
- `apps/server` — server integration with enqueue, promote, and static serve routes.
- `scripts/generate-social-images.mjs` — standalone generation script (no BullMQ required) for local dev and CI use.
- All 10 images generated and placed in `apps/website/public/images/seo/`.
- Docker multi-stage build updated with `worker-runtime` stage that installs Chromium on Debian slim.

### Run the Generator

```bash
# Requires Redis running locally
redis-server --daemonize yes

# Set Chromium path if not using the default
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium node scripts/generate-social-images.mjs
```

### Production Generation (via BullMQ + Worker)

```bash
# Start the worker
REDIS_URL=redis://localhost pnpm nx serve worker

# Enqueue a full website generation from the server
curl -X POST http://localhost:8080/api/internal/social-images/website?wait=true
```

### Environment Variables

| Variable                    | Default         | Description                          |
| --------------------------- | --------------- | ------------------------------------ |
| `REDIS_URL`                 | _(required)_    | Redis connection URL                 |
| `PUPPETEER_EXECUTABLE_PATH` | _(auto-detect)_ | Path to Chromium binary              |
| `OG_IMAGE_STORAGE_DIR`      | `tmp/og-images` | Temp storage root for run artifacts  |
| `WORKER_CONCURRENCY`        | `1`             | Number of concurrent jobs per worker |

- The server can serve refreshed assets without requiring Astro changes.
- Docker includes a Chromium-capable worker runtime.
