# Agent Integration Model: Themis

## Why Agents Matter Here

This task system is a strong fit for AI/code agents because the data model is structured by intent, not only by display.

Instead of forcing an agent to reconstruct context from chat history, task data can already contain:

- objective
- requirements
- acceptance criteria
- scope boundaries
- status
- next step
- references

## Agent Roles

### 1. Planning Agent

Uses task definitions to:

- identify missing scope
- suggest subtasks
- detect dependencies
- improve acceptance criteria

### 2. Execution Agent

Uses task context to:

- implement specific scoped changes
- generate diffs or code proposals
- run verification tasks
- update task progress after execution

### 3. Review Agent

Uses task definition plus resulting code state to:

- check scope alignment
- identify missing tests or regressions
- compare implementation vs acceptance criteria

### 4. Documentation Agent

Uses task history to:

- summarize progress
- convert updates into changelogs
- extract decisions into durable project documentation

## Agent-Readable Task View

Every task should expose a normalized machine view.

Example shape:

```json
{
  "id": "task_123",
  "title": "Implement task detail update composer",
  "objective": "Make daily progress updates fast and structured.",
  "status": "ready",
  "scope": {
    "in": ["detail page composer", "update log persistence"],
    "out": ["notifications", "comment threads"]
  },
  "requirements": ["capture summary", "capture blocker", "capture next step"],
  "acceptanceCriteria": ["updates render chronologically", "new updates save without page reload"],
  "dependencies": ["task detail API"],
  "references": ["/docs/products/themis-task-system/03_workflow.md"],
  "latestUpdate": {
    "summary": "API shape is ready.",
    "nextStep": "Implement frontend composer."
  }
}
```

## Integration Patterns

### Read Pattern

Agent asks for:

- task by id
- tasks by initiative
- tasks ready for execution
- tasks blocked by missing definition

### Write Pattern

Agent may be allowed to:

- propose updated scope
- append execution updates
- suggest subtasks
- mark criteria complete

Recommended rule:

- agents can propose and append operational data
- humans remain the authority for high-impact scope changes unless explicitly delegated

## Safety Model

Agent integration should preserve human trust.

Guidelines:

- distinguish human-authored vs agent-authored updates
- never silently rewrite task intent
- log important automated changes as decisions or updates
- require explicit approval for destructive or scope-changing actions

## Long-Term Opportunity

This system can become a structured operating layer where:

- tasks guide agents
- agents produce updates back into tasks
- execution history stays connected to planning context
