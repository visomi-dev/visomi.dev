# UX Model

## UX Goal

The interface should feel calmer and lighter than typical project management software while still being structurally rigorous.

The product should feel closer to:

- a focused operational notebook
- a developer-native control surface

Not closer to:

- a noisy enterprise dashboard
- a bloated work operating system

## Primary Views

### 1. Inbox / Triage View

Purpose:

- review captured tasks
- quickly promote them into defined work

Should show:

- title
- status
- priority
- owner
- missing definition markers

### 2. Task Detail View

Purpose:

- single source of truth for one task

Should show:

- summary
- scope in/out
- requirements
- acceptance criteria
- updates
- decisions
- links
- next step

This is the core screen.

### 3. Today View

Purpose:

- show active work only

Should show:

- ready tasks
- in-progress tasks
- blocked tasks
- stale tasks with no recent update

### 4. Initiative View

Purpose:

- group tasks around an outcome

Should show:

- initiative summary
- tasks by state
- notable blockers
- recent decisions

## Design Principles

### Minimal Hierarchy, Strong Meaning

The UI should use a small number of components repeatedly:

- cards
- sections
- badges
- update composer
- task status controls

### Structured by Default

Users should not need to invent formatting.

Examples:

- requirements are list items
- decisions are first-class entries
- updates follow a simple format

### Fast Editing

Updates should feel lightweight.

Examples:

- inline edit where reasonable
- quick-add composer
- keyboard-first flow for common actions

### Low Visual Noise

Avoid:

- too many colors
- too many nested panels
- too many status vocabularies

## Recommended Interaction Model

### Quick Create

Small top-level composer with only:

- title
- summary
- optional initiative

### Progressive Definition

Once created, the task detail view guides the user through:

- problem
- outcome
- scope
- requirements
- acceptance criteria

### Update Composer

Single compact input pattern:

- summary
- blocker
- next step

### Visible Completeness

Each task should show a definition completeness indicator, for example:

- missing scope
- missing requirements
- missing acceptance criteria
- ready for execution

## UX Tone

The product should feel:

- deliberate
- calm
- exact
- useful
- modern

Not:

- playful for its own sake
- overloaded with PM jargon
- generic SaaS-dashboard looking
