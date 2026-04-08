# Monolith Contact Form Architecture

## Goal

Recover the productive feeling of a classic Laravel or Django monolith while keeping the codebase split by responsibility inside the Nx workspace.

The first slice is the contact form. It becomes the reference flow for how Astro, planned Astro DB persistence, the Node gateway, Docker, and future queue processing fit together behind one runtime entry point.

## Product Direction

- One public Node entry point for the whole product.
- Astro handles the public marketing pages, the contact form UI, and the first write workflow through native server handling.
- Astro-native server handling owns the first contact form workflow.
- The Node gateway composes Astro and the API in one Express process.
- Docker runs the monolith as one container first.
- Angular SPA or SSR stays part of the workspace and can be mounted later as another surface behind the same gateway.
- BullMQ is planned as the async transport once contact submissions need durable background processing.

## Requested Experience

The desired developer experience is:

- one repository
- one runtime entry point
- one container for local or small production deployments
- one deployment unit until scale forces separation

That gives the same practical feeling as a traditional monolith, even though the internal code is still organized as multiple apps.

## Runtime Topology

Initial monolith composition:

- `apps/server`: gateway and composition root
- `apps/website`: Astro public site rendered through `@astrojs/node` middleware
- `apps/api`: REST API surface for future app/domain endpoints that do not belong in Astro page handling

Planned next composition layers:

- `apps/ng-website`: Angular SSR or SPA application mounted behind the same Node gateway
- BullMQ worker bootstrap inside the same runtime for small deployments, or extracted later into a dedicated container

## Contact Form Flow

1. Visitor opens `/contact/` on the Astro website.
2. The HTML form posts back to the Astro contact page.
3. Astro validates the submission on the server.
4. Astro validates and accepts the submission inside the page flow.
5. The page re-renders with success or validation feedback.
6. Later, accepted submissions can be stored in Astro DB and also enqueue BullMQ jobs without changing the page contract.

## Routing Plan

Current prepared routing:

- `/api/*` -> Express API
- `/*` -> Astro middleware + static assets, including the contact form write flow

Planned routing once Angular is folded into the monolith:

- `/api/*` -> Express API
- `/app/*` -> Angular SSR application
- `/app-spa/*` -> Angular SPA shell if a pure client surface is needed
- `/*` -> Astro public website

## Why The Contact Form Is The Right First Slice

- It crosses UI, HTTP, validation, delivery, and deployment boundaries.
- It is small enough to wire end-to-end without overcommitting to the rest of the architecture.
- It creates a stable contract that can later switch from Astro-only persistence to Astro + BullMQ delivery without changing the form markup.

## Delivery Modes

### Mode 1: Astro-native form handling

Best for the first monolith version.

- Astro accepts the form post directly
- Astro validates the submission inside the page flow
- Astro re-renders the page with the resulting UI state

### Mode 2: BullMQ

Best once contact submissions need retries, provider integration, or auditability.

- Astro accepts the form and hands the validated payload to persistence and queue layers
- Astro or a small domain service writes a BullMQ job
- Worker processes email, CRM sync, webhook fan-out, or moderation
- Astro contract stays the same

Recommended queue payload shape:

```ts
type ContactSubmissionJob = {
  submittedAt: string;
  source: 'astro-contact-form';
  payload: {
    email: string;
    locale: 'en' | 'es';
    message: string;
    name: string;
    type: string;
  };
};
```

## Docker Strategy

### Phase 1: Single Container Monolith

One container runs:

- the Express gateway in `apps/server`
- the Astro middleware build from `apps/website`
- the API build from `apps/api`

This is the target now because it keeps deployment simple.

### Phase 2: Split By Pressure, Not By Fashion

Split only when there is operational pressure such as:

- API scaling independently from public website traffic
- worker throughput requiring isolated CPU or memory limits
- Angular SSR consuming different resources than Astro pages

The likely extraction order is:

1. BullMQ worker into its own container
2. API into its own container
3. Angular SSR surface into its own container if necessary

## Astro Integration Notes

The Astro Node adapter is configured in middleware mode because the gateway server owns the composition.

Important behavior from Astro's Node adapter documentation:

- middleware mode exposes a `handler` from `dist/.../server/entry.mjs`
- static client assets must be served by the outer HTTP server
- the Node gateway can mount Astro beside any Express routes

That is why `apps/server` serves the Astro `client` output statically and forwards all remaining requests to the Astro middleware handler.

## Contact Form Contract

Request:

```http
POST /contact/
Content-Type: application/x-www-form-urlencoded
```

Fields:

- `name`
- `email`
- `type`
- `message`
- `locale`

Responses:

- Astro re-renders the same page with validation errors or success feedback
- accepted submissions are currently handled inside Astro page logic

## Astro-native Contact Slice

The contact form now uses the native Astro server flow described by Astro's forms recipe:

- standard HTML form
- `method="POST"`
- server-side handling in the page frontmatter
- server-side validation
- no required client JavaScript

The first implementation stays fully inside the Astro runtime while still sharing the same Node entry point in `apps/server`.

## Astro DB Role

Astro DB remains the preferred next persistence layer for contact submissions once the workspace adds the required local database configuration.

Benefits for this slice:

- type-safe schema
- local development database support
- simple persistence without introducing a heavier ORM too early
- easy evolution toward queue-backed delivery later

## Angular Preparation Notes

Angular is still part of the intended monolith, but it should be introduced behind a deliberate base path instead of being forced into the root path early.

Before mounting Angular under `/app`, align:

- router base path
- asset URLs
- SSR request handling under a prefixed path
- any SPA fallback behavior

That keeps the public Astro site stable while the Angular product surface evolves separately.

## Next Steps

1. Add persistence for contact submissions.
2. Introduce BullMQ plus Redis using the same API contract.
3. Mount Angular under `/app` with an explicit base-path strategy.
4. Add provider adapters for email or CRM delivery.
5. Add request tracing across gateway, API, and worker execution.
