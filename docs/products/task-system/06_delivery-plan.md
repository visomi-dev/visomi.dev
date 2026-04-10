# Delivery Plan

## Suggested Phases

### Phase 1: Task Definition Core

Build:

- task entity
- task detail screen
- scope fields
- requirements
- acceptance criteria
- status flow

### Phase 2: Daily Execution Layer

Build:

- update composer
- update log timeline
- next step field
- blockers
- stale task surfacing

### Phase 3: Initiative Layer

Build:

- initiative grouping
- initiative view
- task relationships

### Phase 4: Agent Layer

Build:

- agent-readable task view
- agent update endpoints
- structured task export

### Phase 5: Workflow Automation

Build:

- reminders for stale tasks
- automatic summaries
- optional queue-backed processing

## Recommended First Technical Slice

If this starts in the current monolith repo, the first implementation should likely be:

- Angular frontend under a dedicated internal route
- API endpoints in `apps/api`
- PostgreSQL-backed persistence
- mounted through `apps/server`

## Open Questions

Before implementation starts, answer:

1. Is this strictly internal, or potentially productized later?
2. Should initiatives exist in V1, or only tasks and subtasks?
3. Should agent writes be allowed in V1, or only agent reads?
4. Is PostgreSQL the intended persistence layer from day one?
5. Should the first frontend surface live under Angular or Astro?
