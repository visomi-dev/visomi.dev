# The Design Process for Engineers (Design as Engineering)

As a software engineer, you are accustomed to thinking in systems, inputs, outputs, architectures, and constraints. Professional UX/UI (User Experience / User Interface) design follows exactly the same principles, just with a different vocabulary.

Designing is not "making it look pretty." It is **solving graphic and functional communication problems under a set of constraints**.

Here is the mapping of how a professional design process translates to your engineering experience:

## 1. Discovery (Requirements Gathering and Discovery)

In engineering: "Analyze the problem, talk to the client, define use cases and infrastructure constraints."
In design: "User research, audience definition, competitive analysis, and value proposition definition (Brand Identity)."

**Key Concepts:**

- **User Personas (End Users):** Who consumes your site? (e.g., CTOs, Tech Leads, IT Recruiters, Freelance Clients).
- **Value Proposition:** You are not just a human, you are a "Product" that solves a problem. Your product is: "Mature, scalable, and AI-augmented software engineering."
- **Design Constraints:** What you already defined in `01_design_constrain_block.md`.

## 2. Information Architecture (Architecture Design and Database)

In engineering: "Define data models, relationships, microservices, and API endpoints."
In design: "Information Architecture (IA), Site Mapping, and User Flows."

**Key Concepts:**

- **Site Map:** The hierarchy of pages (Home -> Projects, Home -> Resume, etc.).
- **User Flows:** The path a user takes. E.g., A Tech Lead visits Home -> Reads your intro -> Goes to 'Projects' to see your code/architecture -> Goes to 'Resume' -> Goes to 'Contact'.
- **Content Hierarchy:** What information is most important on a screen and how it is grouped (Headers, Subheaders, metadata).

## 3. Wireframing (Prototyping and Proof of Concept)

In engineering: "Make a box diagram, a functional MVP on the backend without worrying about optimization, just to see that the logic works."
In design: "Low-fidelity wireframes."

**Key Concepts:**

- **Wireframes:** Black and white (or grayscale) drawings using only rectangles and basic text to define _where_ everything goes, without colors, final typography, or animations. This ensures the structure works before investing time in painting.

## 4. Design System & Tokens (Environment Variables and Primitives)

In engineering: "Configure global constants, environment variables, core utilities, and reusable abstractions."
In design: "Design Tokens and UI Kit."

**Key Concepts:**

- **Design Tokens:** The atomic values of design. Instead of saying "this text is dark gray," you say `color-text-secondary = #4a4a4a`. Includes:
  - Typographic scales (h1, h2, body, caption).
  - Spacing scales (spacing-1, spacing-2... spacing-8).
  - Color palettes (surfaces, backgrounds, text, accents).
  - Layout measurements (border-radius, max-widths).
- **Layout Primitives:** Wrapper components that have no logic, they only dictate how content is placed (Container, Stack, Grid, Section).

## 5. UI Design and High-Fidelity Prototyping (Interface Implementation)

In engineering: "Write the final feature applying the components and utilities built in the previous step."
In design: "High-Fidelity (Hi-Fi) Mockups."

**Key Concepts:**

- **Final Mockups:** This is where colors, precise typography, images (like the animated space background you mentioned) are applied, and the exact "look and feel" is decided.
- **Micro-interactions:** Designing what happens when you _hover_, _focus_, or _click_ on an element.

## 6. Design QA & Handoff (Testing and Deploy)

In engineering: "Unit testing, E2E testing, CI/CD."
In design: "Design QA, accessibility testing (color contrast, keyboard navigation), and handoff to development."

---

## Your Action Plan: How to apply this to your case

Since you already have the constraints (`01_design_constrain_block.md`) and the instructions (`02_instructions.md`), we have jumped straight to the **Discovery** step.

The next step is not to go to the code and paste components, but to **build your system**. In the documentation files I generated:

1. `05_product_definition.md` defines your identity as a "Product" (Inputs/Outputs).
2. `06_action_plan.md` gives you the sequential steps to execute this refactor the right way.
