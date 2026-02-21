<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Architecture Rules: Screaming & Feature-Based

1. The "Screaming" Directory Rule
   The Principle: The folder structure must reveal what the application does (Auth, Checkout, Billing), not what frameworks it uses (Controllers, Services, Components).

The Prohibition: Never create top-level folders named services/, models/, or components/ containing files from multiple domains.

2. Standard Feature Anatomy
   Every feature (e.g., auth) must follow this internal anatomy to maintain consistency across apps/api and apps/website:

```plaintext
auth/
├── entities.ts # Pure business logic: Types and Entities.
├── repositories.ts # Repositories, API calls, Persistence, State (NgRx/Signals/Prisma).
├── services.ts # Services that orchestrate the logic.
├── dtos.ts # Data Transfer Objects.
├── utils.ts # Utility functions.
├── constants.ts # Constants.
├── enums.ts # Enums.
├── errors.ts # Errors.
```

The Rule: Outer layers may know about inner layers, but never the other way around.

The Flow: Feature → Data-access → Domain.

Strict Constraint: Code inside domain/ must be agnostic. It should never import framework-specific code (e.g., HttpHeaders, Express.Request, or @angular/core).

4. Cross-Domain Communication (The Sandbox Rule)
   The Rule: One domain (e.g., orders) must not reach into the private internals of another (e.g., auth).

The Access: If orders needs data from auth, it must use a public interface or a shared service. Never deep-import files from another feature’s private folders.

5. Smart vs. Dumb Components (Frontend)
   Smart Components (feature/): Connected to services, handle state, and "know" where the data comes from.

Dumb Components (ui/): Only receive data via @Input() and emit events via @Output(). They are 100% reusable and logic-free.

6. Data Mapping (Anti-Corruption Layer)
   The Rule: Do not pass raw database rows (Backend) or raw JSON responses (Frontend) throughout the entire app.

The Action: Create a Mapper or a class in the domain/ layer to sanitize and transform external data into the format your business logic actually needs.

7. File Naming Convention
   The Rule: Names must be descriptive and follow the name.type.ts pattern.

Examples: login.controller.ts, auth.repository.ts, user.model.ts, auth.routes.ts
