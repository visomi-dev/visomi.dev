# Architecture Proposal: Themis

## Recommended Direction

Build the first version as a monolith-friendly module inside this workspace.

Suggested shape:

- frontend app surface for daily usage
- backend API for structured task operations
- database for durable task storage
- agent-oriented read/write endpoints or action layer

This can live behind the same Node runtime already used by the repo.

## Frontend

### Recommended Role

The frontend should be optimized for:

- rapid task capture
- low-friction updates
- structured reading and editing
- minimal visual clutter

### Suggested Frontend Model

- list view for triage
- detail view for single-task work
- quick-create composer
- update composer
- status and priority controls
- lightweight relationship graph or linked items list

### Candidate Stack

Two valid directions:

1. Angular app module

- best if the product becomes a richer internal application
- strong forms, state, and long-lived interfaces

2. Astro + islands for simpler UI

- best if the first version stays compact and server-driven
- lower complexity for early product iteration

Recommended for this idea:

- Angular for the actual task system UI
- Astro remains for public marketing/portfolio surfaces

Reason:

- this system is interaction-heavy
- task editing and filtering fit Angular better than a mostly static website surface

## Backend

### Recommended Role

The backend should own:

- validation
- persistence
- task lifecycle transitions
- structured querying
- agent-safe task access

### Suggested Placement

- implement under `apps/api`
- expose task endpoints and supporting domain services
- optionally compose with BullMQ later for automation workflows

### Example Service Boundaries

- task definitions
- task updates
- task relationships
- task snapshots/history
- agent exports

## Data Model

### Core Entities

#### Initiative

- id
- title
- summary
- status
- owner
- labels

#### Task

- id
- initiativeId
- title
- summary
- problem
- expectedOutcome
- scopeIn
- scopeOut
- priority
- status
- owner
- labels
- dueAt optional
- createdAt
- updatedAt

#### Requirement

- id
- taskId
- content
- order

#### Acceptance Criterion

- id
- taskId
- content
- order
- completed optional

#### Update Log

- id
- taskId
- summary
- details
- nextStep
- blocker
- createdAt
- author

#### Decision

- id
- taskId
- summary
- rationale
- consequence
- createdAt

#### Link

- id
- taskId
- kind
- url
- title

#### Relationship

- id
- fromTaskId
- toTaskId
- type

## Persistence

For this system, prefer a normal application database rather than Astro DB.

Reason:

- this is product-domain data
- it will likely need richer queries
- it should support evolution into a larger internal system

Best fit:

- PostgreSQL
- likely behind `apps/api`

## API Shape

Example endpoints:

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `POST /api/tasks/:id/updates`
- `POST /api/tasks/:id/decisions`
- `POST /api/tasks/:id/requirements`
- `GET /api/tasks/:id/agent-view`

## Deployment Fit

This architecture fits the current monolith direction:

- same repo
- same Node gateway
- same Docker deployment unit initially
- future extraction remains possible if needed
