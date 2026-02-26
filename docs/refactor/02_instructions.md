## Instructions

I want to redesign and refactor the **frontend** of my personal website to elevate my professional image and clearly demonstrate my technical expertise—especially how my work is enhanced by AI and agent-based systems.

The frontend must be built with **Angular SSR** inside the existing stack (**Nx + Angular**) and should use the existing codebase as reference from `./legacy`. The implementation must follow the project’s established best practices and conventions. Like AGENTS.md

## Frontend goals

### Structure & Navigation

* Keep the **Home/Landing page** as an introduction.
* Preserve the **current introduction copy**.
* Move **Freelance Projects**, **Resume (CV)**, and **Contact** into **separate pages**.
* Keep navigation minimal and consistent.

### Hero (Home)

* Redesign the **Hero** to be more impactful while prioritizing **minimalism**.
* Integrate the **existing animated background** (already implemented) without redesigning it.
* Ensure the hero composition is clean, responsive, and SSR-safe.
* Redesign the **Tubelight Navbar** to be more impactful while prioritizing **minimalism**, now I think it's too much.

### Projects Page (Upwork-like)

* Implement a dedicated **Projects** page inspired by an **Upwork-style layout**:

  * Strong hierarchy
  * Card/grid listing
  * Optional light filtering/sorting UI (frontend-only)
* The content can be placeholder-driven for now (data wiring handled later).

### Timeline

* Rebuild the timeline components from `@examples/timeline.tsx` into Angular.
* Follow Angular best practices and the project’s UI conventions.
* Ensure the timeline is reusable and themable via the site’s styling system.

### Resume (CV)

* Implement the Resume page as a separate route.
* Keep it structured for:

  * Human readability
  * Print/PDF export compatibility (frontend-only for now)
  * Compatibility with AI/ATS parsing (semantic structure, clean headings, consistent sections)
* Improve the layout following the same website visual guidelines, but avoid overly complex visuals.

### Contact

* Implement a dedicated Contact page route.
* Build a clean, minimal contact form UI (submission wiring handled later).

### Design System & UI Foundations

* Extract and define a consistent **visual style** based on the provided examples.
* Implement **design tokens** (typography, spacing, colors, radius, elevation, motion).
* Build **layout primitives** (Container, Section, PageShell, Stack/Inline).
* Build a minimal **component library v1** (Button, Link, Card, Badge/Tag, Input, Textarea, Label, Divider).
* If any Radix/shadcn-like components are needed by examples, they must be **implemented manually in Angular** (no Radix/shadcn dependencies).

### i18n

* The frontend must support **native Angular i18n**.
* All user-visible strings must be properly marked and organized for translation.

### Documentation

Since the project will be published on GitHub, include frontend documentation in `/docs` covering:

* Visual guidelines and tokens
* Component library usage
* Page composition rules (Home/Projects/Resume/Contact)
* i18n strategy for Angular SSR

You can review the current site at [https://visomi.dev](https://visomi.dev) to understand the existing content structure and overall intent, but the new frontend should be a cleaner, more consistent, minimalist version aligned with senior-level design and implementation quality.

---
