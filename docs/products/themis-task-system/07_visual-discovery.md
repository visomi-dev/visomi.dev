# Visual Discovery: Themis

## Purpose

This document translates the current Themis product docs into an initial visual direction for the first design explorations.

It is based on:

- `00_overview.md`
- `01_prd.md`
- `02_architecture.md`
- `03_workflow.md`
- `04_agent-integration.md`
- `05_ux-model.md`
- `06_delivery-plan.md`
- `../../branding/personal-brand-prompt.md`

## Design Reading Of The Product

The product is not a generic project management dashboard.

It is a structured work surface for defining, clarifying, and executing tasks with low cognitive load.

The UI therefore needs to communicate:

- calm control instead of activity theater
- clarity of definition before execution
- structured operational data instead of chat-like chaos
- lightweight daily use without losing rigor
- human and agent readability from the same source of truth

## Core Visual Thesis

Recommended direction for the first visuals:

**Operational notebook with system-grade structure.**

This means:

- editorial calm in spacing and typography
- interface rigor in layout, labels, status, and field grouping
- very limited accent color usage
- low chrome and low decoration
- repeated simple components instead of many custom surfaces

The product should feel closer to a precise workspace than a management dashboard.

## Product Personality

The visual language should feel:

- deliberate
- exact
- quiet
- modern
- technical without looking like a developer toy

It should not feel:

- playful
- crowded
- enterprise-heavy
- colorful by default
- like a generic SaaS template

## Recommended Visual Direction

### Direction A: Operational Notebook

This is the recommended primary route for first mockups.

Characteristics:

- bright or softly tinted neutral canvas
- dense information, but with strong whitespace rhythm
- large, clear task titles
- mono metadata rows for status, owner, initiative, dates, and labels
- section blocks with calm separators instead of card overload
- timeline-like update history with concise operational entries

Why it fits:

- aligns with the "focused operational notebook" goal
- supports reading and writing equally well
- keeps the task detail view as the core screen
- avoids looking like backlog software from the last decade

### Direction B: Structured Control Surface

Good secondary exploration.

Characteristics:

- darker neutral surfaces or stronger contrast panels
- more explicit status rails and data grouping
- slightly more console-like density
- stronger use of mono and technical labels

Risk:

- can become too tool-like or cold
- may over-emphasize engineering aesthetics over clarity

### Direction C: Editorial Planner

Good for marketing or overview screens, but not the best default for V1 app screens.

Characteristics:

- more typography-led compositions
- broader spacing
- softer, more narrative layout rhythm

Risk:

- may under-serve dense daily operational use

## First Screens To Design

## Screen Order For Documentation And Review

Use this sequence when reviewing or presenting the current Themis visual explorations:

1. Landing Page
2. Sign In
3. Dashboard
4. Projects Overview

The initial dashboard exploration confirmed an important risk: when Themis starts from active-task density, the first impression drifts toward an overloaded PM tool.

Because the user may be managing many projects at the same time, the first screen should orient around projects first, then drill into tasks.

### 1. Projects Overview

Goal:

- give an immediate sense of control across multiple active projects
- create a stronger first impression than a dense task dashboard
- help the user enter the correct workstream quickly

Must visually emphasize:

- project name and concise summary
- current health or momentum
- active task counts by state
- most important next step or blocker
- recent activity signal

Recommended composition:

- strong page heading and short workspace context
- vertical or masonry-like list of project blocks
- each project block should feel like a calm operational briefing, not a KPI card
- each block should allow quick entry into project detail or active tasks
- optional light sidebar for cross-project signals only if it stays quiet

### 2. Inbox / Triage

Goal:

- turn captured work into defined work quickly

Must visually emphasize:

- missing definition markers
- task title and summary
- status and priority at scan speed
- lightweight bulk review rhythm

Recommended composition:

- compact top quick-create composer
- filter row below
- vertical list of tasks with definition completeness signal
- right-side preview panel on desktop optional, stacked on mobile

### 3. Task Detail

Goal:

- become the single source of truth for one task

This should be the second high-fidelity screen after projects overview.

Must visually emphasize:

- title, summary, and current status immediately
- progressive definition sections
- visible scope boundaries
- requirements and acceptance criteria as structured lists
- updates and decisions as durable history
- next step as a first-class operational field

Recommended composition:

- persistent header with title, status, priority, owner
- primary content column for definition and updates
- secondary rail for metadata, linked items, completeness, dependencies
- update composer visually separated, but always easy to reach

### 4. Today View

Goal:

- show active execution without backlog noise

Must visually emphasize:

- ready
- in progress
- blocked
- stale

Recommended composition:

- sectional grouping by execution state
- very concise task rows or compact cards
- age of latest update as a key signal

### 5. Initiative View

Goal:

- show grouped work without losing task clarity

This can stay lower priority for visual exploration round one.

## Information Hierarchy Rules

### Level 1

- task title
- task status
- current next step

### Level 2

- summary
- problem
- expected outcome
- scope in / scope out

### Level 3

- requirements
- acceptance criteria
- decisions
- update history
- links and relationships

### Metadata Layer

- owner
- priority
- initiative
- labels
- timestamps
- agent/human attribution

The interface should make the difference between core task meaning and supporting metadata obvious at a glance.

## Core Components For First Visuals

Keep the component vocabulary intentionally small:

- page header
- quick-create composer
- filter bar
- task row
- compact status badge
- completeness indicator
- section block
- checklist list
- update composer
- update timeline item
- decision item
- metadata rail block

This directly follows the existing UX guidance to reuse a small number of components repeatedly.

## Layout Principles

- mobile first
- one strong reading column by default
- second column only when it reduces scrolling or improves scan speed
- use separation by spacing, rules, and typography before using filled cards
- avoid nested panel stacks where possible
- preserve a stable layout between read and edit states

## Draft Visual System Direction

### Color

- neutral-first palette
- one restrained accent for interactive or active states
- one warning tone for blockers and missing definition
- status colors should be muted, not saturated

Suggested posture:

- background: warm-neutral or cool-neutral, but not pure marketing white
- surfaces: subtle elevation difference only where needed
- text: strong contrast for titles, softer contrast for metadata

### Typography

- sans-serif for primary reading
- monospace for metadata, ids, labels, timestamps, and system signals
- bigger task titles than a typical dashboard
- clear distinction between section heading, field label, and body copy

### Spacing

- generous outer spacing
- tight internal rhythm for structured lists
- section spacing should communicate task stages clearly

### Shape

- low to medium corner radius
- avoid overly rounded playful components
- borders should do more work than shadows

### Motion

- quick and subtle
- used mainly for state changes, panel reveals, and save feedback
- no decorative transitions

## Screen-Specific Notes

### Inbox / Triage

- completeness should be visible before opening the task
- missing fields should read as guidance, not error states
- row density should support scanning many items quickly

### Task Detail

- problem and outcome should feel like anchor sections near the top
- scope in and scope out should appear as a paired block
- requirements and acceptance criteria should be easy to scan and edit inline
- updates need chronological clarity, not chat bubbles

### Update Composer

Use a compact structured pattern:

- what changed
- blocker
- next step

This composer should feel operational and fast, closer to a system input than a comment box.

## Anti-Patterns To Avoid

- colorful kanban-board aesthetics as the main product identity
- excessive cards inside cards
- heavy left navigation plus crowded top bars plus multiple side panels
- status colors carrying too much meaning alone
- oversized analytics widgets in V1
- chat-style updates that hide structure
- decorative gradients and startup-marketing polish

## Recommended First Mockup Sequence

1. Task detail desktop
2. Task detail mobile
3. Inbox / triage desktop
4. Today view desktop
5. Quick-create interaction states

Reason:

The task detail screen is the product's center of gravity. Once that screen is visually solved, the surrounding views can inherit its system.

## Design Decisions Already Supported By Existing Docs

- The task detail view is the core screen.
- The UI must stay calmer than typical PM software.
- The product should avoid noisy dashboard patterns.
- Structure should be visible by default.
- Quick capture and quick updates are core workflows.
- Agent-readable data should remain legible to humans.

## Open Questions Before Hi-Fi Design

1. Should the first visual exploration lean light mode first, dark mode first, or both in parallel?
2. Should initiatives be visually present in the first round, or deferred behind task-first screens?
3. How prominent should agent-oriented actions be in V1 compared with human-only flows?
4. Should the first version optimize more for solo usage density or for future team readability?

## Recommendation

Start with **Operational Notebook** as the main direction and design the **Projects Overview** screen first.

That path gives Themis a stronger first impression, reflects the reality of managing multiple concurrent projects, and reduces the risk of the product looking like another crowded task dashboard. After that, design the **Task Detail** screen as the operational center of gravity.
