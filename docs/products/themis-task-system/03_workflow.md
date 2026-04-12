# Workflow Design: Themis

## Desired Workflow

The task workflow should feel like a disciplined but lightweight progression from idea to execution.

## Task Lifecycle

### 1. Capture

Purpose:

- register the work before it gets lost

Required fields:

- title
- short summary
- owner optional

Status:

- `captured`

### 2. Define

Purpose:

- make the task actionable

Definition checklist:

- problem is clear
- expected outcome is clear
- scope in is defined
- scope out is defined
- requirements exist
- acceptance criteria exist

Status:

- `defined`

### 3. Ready

Purpose:

- confirm the task is executable without major ambiguity

Ready checklist:

- no critical blockers
- owner is known
- dependencies are visible
- next step is known

Status:

- `ready`

### 4. In Progress

Purpose:

- track active execution with frequent low-friction updates

Expected behavior:

- add update log entries
- record decisions
- update blockers
- refresh next step

Status:

- `in_progress`

### 5. Review

Purpose:

- validate that the task outcome matches its definition

Checklist:

- acceptance criteria reviewed
- scope drift acknowledged
- relevant links attached

Status:

- `review`

### 6. Done

Purpose:

- close the work with enough historical signal for future understanding

Status:

- `done`

## Daily Update Workflow

The daily update interaction should be extremely simple.

Recommended update structure:

- what changed
- what is blocked
- what is next

This should take less than one minute.

## Scope Management Workflow

When scope changes:

1. log a decision
2. update scope in/out
3. update acceptance criteria if needed
4. mark whether the change affects timing or dependencies

## Initiative Workflow

Initiatives should group tasks, but not replace task-level clarity.

Initiatives should answer:

- why this stream exists
- what outcomes matter
- which tasks belong to it
- what current progress looks like

## Operational Principle

The system should make it harder to start vague work and easier to keep clear work moving.
