# Action Plan: Frontend Refactor Execution

To ensure your website reflects architectural maturity, we won't improvise by writing HTML or copying components randomly.

We are going to follow a process similar to Domain-Driven Design (DDD), but applied to Design Systems.

## Phase 1: Base Architecture and Tokens (The Foundation)

_Objective: Migrate your visual identity (Constraints) to mathematical variables (CSS/SCSS)._

1. **Define the Typographic Scale:** We will create font size variables (h1, h2, body, small) using `rem` for accessibility.
2. **Define the Spacing Scale:** We will create spacing variables (spacing-1 to spacing-auto) to ensure perfect visual rhythm (no random paddings).
3. **Define Semantic Palette:** Color variables for backgrounds, primary text, secondary text, borders, and subtle accents.
4. **Implement Tokens in Angular:** Configure global styles in your Angular/Nx project with these tokens and strict reset rules.

_Methodology:_ We won't touch any component until this is configured.

## Phase 2: Layout Primitives (Invisible Structures)

_Objective: Create the structural wrappers of your site, without logic, just positioning._

1. `Container`: Manages maximum width and centering.
2. `Section`: Manages vertical spacing between blocks (padding and margin).
3. `Stack` / `Flex`: Manages how internal elements align (horizontally or vertically).
4. `PageShell`: The main wrapper for routes (Manages Nav, Footer, and Outlet).

_Methodology:_ This eliminates 80% of spaghetti CSS in future components.

## Phase 3: Core Components System (UI Kit)

_Objective: Build the "Lego" blocks at an atomic level, based on your "Minimalism and High Signal-to-Noise" rule._

1. **Button / Link:** Clear call to actions, no excessive gradients, precise transitions.
2. **Typography Components:** Wrappers for Text with pre-defined classes.
3. **Card:** Clean structure for projects, no heavy borders, leaning on whitespace.
4. **Badge / Tag:** To display technologies (Angular, Nx, SSR, AI) elegantly.
5. **Form Elements:** Input, Textarea, Label (minimalist, accessible).

_Methodology:_ Native manual implementation in Angular (no Radix/Shadcn), ensuring they support native SSR and follow the "calm confidence" style.

## Phase 4: Page Composition (Wireframing with Code)

_Objective: Assemble the routes using primitives, injecting your real content._

1. **Route `/` (Home):** New Hero, clean integration of the existing animated background, refactoring the Tubelight Nav to an ultra-minimalist version, and your introduction.
2. **Route `/projects`:** "Upwork" style layout, grid of cards using the `Card` and `Badge` components.
3. **Route `/resume`:** Translating your CV to perfect semantic HTML, focused on human readability and ATS parsing.
4. **Route `/contact`:** Form UI integration.

_Methodology:_ Start with "raw" content (black/white text) applying only the hierarchical structure, then polish the details.

## Phase 5: Refinement, i18n, and Accessibility

_Objective: Senior engineer level._

1. Audit semantic tags (`<header>`, `<main>`, `<article>`, `<nav>`).
2. Configure _i18n_ infrastructure in Angular for the content we just placed.
3. Refine transitions / micro-animations making sure they last the right amount (fast, concise, "engineered").
4. Validate that Angular SSR compilation delivers optimized, pure HTML for SEO with no unnecessary load times.
