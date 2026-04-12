# Backend Content Model: Themis

## Purpose

This document defines the recommended backend content model for Themis.

It answers a key product question:

Should projects and tasks be stored as markdown files?

## Short Answer

Yes, but not as the only source of truth.

Recommended direction:

- use markdown for rich long-form task and project documentation
- use the application database for structured metadata, workflow state, relationships, permissions, and querying
- version the markdown content explicitly inside the product

This gives Themis the strengths of documentation-first workflows without losing the operational capabilities of a real application.

## Recommendation

Themis should use a **hybrid model**.

### Use Markdown For

- project briefs
- task descriptions
- problem statements
- outcome definitions
- scope notes
- decisions
- update narratives
- agent-readable long-form context

### Use The Database For

- ids
- status
- priority
- owner
- labels
- relationships
- project membership
- timestamps
- filtering fields
- audit records
- permissions
- version metadata

## Why Pure Markdown Files Are Not Enough

Using plain markdown files alone sounds attractive, but it breaks down once Themis becomes a real multi-user product.

Problems with markdown-only storage:

1. querying by status, owner, blocker, or stale state becomes harder
2. concurrent edits become fragile
3. version history is available only if the system is tightly coupled to Git
4. cross-entity relationships become harder to enforce
5. permissions and audit trails become less reliable
6. product-level actions like `ready tasks`, `blocked tasks`, or `projects with stale updates` become less efficient

Markdown-only would fit a personal knowledge base better than an operational product.

## Why Markdown Still Matters

Markdown is still a strong fit for Themis because the product is not only a workflow engine.

It is also a structured documentation system.

Markdown gives Themis:

- durable, readable task definitions
- easy exportability
- strong human readability
- agent-friendly textual context
- future compatibility with repository-based workflows

That makes markdown valuable as a **content format**, even if it is not the whole persistence strategy.

## Recommended Canonical Model

### Core Principle

The database is the canonical operational source.

Markdown is the canonical narrative format for long-form content fields.

That means:

- the product does not rely on filesystem files as its main store
- markdown content is stored and versioned in the database
- the UI renders and edits markdown content through structured fields

## Entity Model

### Project

Suggested structured fields:

- `id`
- `slug`
- `title`
- `summary`
- `status`
- `ownerId`
- `visibility`
- `labels`
- `createdAt`
- `updatedAt`
- `lastActivityAt`

Suggested markdown-backed fields:

- `briefMarkdown`
- `goalsMarkdown`
- `scopeMarkdown`
- `notesMarkdown`

### Task

Suggested structured fields:

- `id`
- `projectId`
- `parentTaskId` optional
- `slug`
- `title`
- `summary`
- `status`
- `priority`
- `ownerId`
- `confidence`
- `blocked`
- `dueAt` optional
- `createdAt`
- `updatedAt`
- `lastActivityAt`

Suggested markdown-backed fields:

- `problemMarkdown`
- `expectedOutcomeMarkdown`
- `scopeInMarkdown`
- `scopeOutMarkdown`
- `implementationNotesMarkdown`

### Task Requirement

- `id`
- `taskId`
- `content`
- `order`
- `completed` optional

### Acceptance Criterion

- `id`
- `taskId`
- `content`
- `order`
- `completed`

### Update Entry

Structured fields:

- `id`
- `taskId`
- `authorId`
- `authorType` (`human` or `agent`)
- `summary`
- `nextStep`
- `blocker`
- `createdAt`

Markdown-backed field:

- `detailsMarkdown`

### Decision

Structured fields:

- `id`
- `taskId`
- `authorId`
- `createdAt`

Markdown-backed fields:

- `summaryMarkdown`
- `rationaleMarkdown`
- `consequenceMarkdown`

## Versioning Model

Versioning should be built into Themis itself, not left only to external Git history.

### Recommendation

Every markdown-backed field change should create a revision record.

This allows:

- restore previous versions
- compare revisions
- inspect who changed what
- keep agent edits visible and auditable

## Revision Entities

### Content Document

Represents the current editable markdown document for a field or content block.

Suggested fields:

- `id`
- `entityType` (`project`, `task`, `update`, `decision`)
- `entityId`
- `fieldName`
- `currentRevisionId`
- `createdAt`
- `updatedAt`

### Content Revision

Represents a single historical version of markdown content.

Suggested fields:

- `id`
- `documentId`
- `revisionNumber`
- `markdown`
- `renderedText` optional cached plain text
- `changeSummary`
- `authorId`
- `authorType` (`human` or `agent`)
- `createdAt`

## Versioning Rules

1. every save to a markdown-backed field creates a new revision
2. the current entity points to the latest revision
3. the UI should allow viewing revision history on important fields
4. agent-created revisions must be clearly labeled
5. major changes should optionally require a change summary

## Git Integration

Git can still be useful, but it should be optional.

### Good Uses Of Git

- export projects or tasks as markdown files
- sync approved content to a repo
- archive important project documentation
- support developer-first workflows

### What Git Should Not Be Responsible For

- real-time application persistence
- permissions
- status transitions
- operational querying
- multi-user collaboration control

So the correct posture is:

- Themis owns the live data model
- Git can be a downstream export or sync target

## API Shape

Suggested endpoints:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `GET /api/content-documents/:id/revisions`
- `POST /api/content-documents/:id/revisions`
- `POST /api/content-documents/:id/restore/:revisionId`

## Rendering Model

The frontend should not treat markdown as loose blobs everywhere.

Instead:

- use structured fields in forms
- render markdown only where long-form context is appropriate
- keep list views driven by structured metadata, not markdown parsing

That preserves speed and clarity in the UI.

## Search Model

Search should combine:

- structured filters from the database
- full-text search across markdown-backed fields

This allows queries like:

- all blocked tasks in project X
- tasks mentioning `rate limiting`
- projects updated in the last 7 days
- tasks with missing scope definition

## Agent Fit

This hybrid model is strong for agents because it separates:

- structured state for reliable automation
- markdown context for richer reasoning

Agent-safe export shape should include both.

Example:

```json
{
  "id": "task_123",
  "title": "Implement project revision history",
  "status": "ready",
  "priority": "high",
  "project": {
    "id": "project_themis",
    "title": "Themis Core"
  },
  "content": {
    "problemMarkdown": "...",
    "expectedOutcomeMarkdown": "...",
    "scopeInMarkdown": "...",
    "scopeOutMarkdown": "..."
  },
  "requirements": ["save markdown revisions", "restore older revisions"],
  "acceptanceCriteria": ["history is visible", "restore creates a new revision"],
  "latestUpdate": {
    "summary": "data model drafted",
    "nextStep": "design revision endpoints"
  }
}
```

## V1 Recommendation

For V1, keep the model simple.

Start with:

1. PostgreSQL as the main store
2. markdown-backed long-form fields stored in normal tables
3. a `content_revisions` table for history
4. project-level and task-level revision history only
5. optional markdown export later

Do not start with:

- filesystem markdown as primary persistence
- Git as the main data source
- event sourcing
- overly granular versioning on every tiny field unless it is markdown-backed

## Final Recommendation

Themis should be **documentation-friendly**, not **filesystem-dependent**.

Best approach:

- database-first for operational state
- markdown-first for rich content fields
- built-in revision history for versioning
- optional Git export later

That gives Themis the clarity of documents and the reliability of a real product backend.
