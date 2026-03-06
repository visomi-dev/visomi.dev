# Implementation Plan: visomi.dev Modernization

This document outlines the plan for rehashing the personal website using Nx, Angular 21, and Node.js, following the "google stitch" design.

## Phase 1: Design Translation & Core Features

### 1. Theme Management

- [ ] Create a `ThemeService` in `apps/website/src/app/shared/theme` to handle Light/Dark mode.
- [ ] Implement logic to persist theme preference in `localStorage`.
- [ ] Integrate with Tailwind CSS `class` strategy for `dark:` support.
- [ ] Implement `ThemeSwitcher` component based on `@legacy/src/app/shared/theme-switcher`.

### 2. Global UI Components

- [ ] Implement `PageNavigationLoader` in `apps/website/src/app/shared/page-navigation-loader` using CSS animations (Angular 21 standard).
- [ ] Ensure `LanguageSwitcher` is working correctly with the new layout.
- [ ] Update `App` component to include global elements.

### 3. Home Page Translation

- [ ] Translate `examples/stitch_minimalist_personal_page/home_no_navbar` to `apps/website/src/app/home`.
- [ ] Implement `dark:` classes from `home_dark_mode_no_navbar`.
- [ ] Integrate `Background` component (Three.js shader).
- [ ] Migrate content from `@legacy/src/app/landing/content/introduction`.

### 4. Journey Page Translation

- [ ] Translate `examples/stitch_minimalist_personal_page/journey_no_navbar` to `apps/website/src/app/journey`.
- [ ] Implement `dark:` classes from `journey_dark_mode_no_navbar`.
- [ ] Migrate content from `@legacy/src/app/landing/content/about-me` and experience data.

### 5. Projects Page Translation

- [ ] Translate `examples/stitch_minimalist_personal_page/projects_no_navbar` to `apps/website/src/app/projects`.
- [ ] Implement `dark:` classes from `projects_dark_mode_no_navbar`.
- [ ] Migrate content from `@legacy/src/app/landing/content/projects`.

### 6. Resume Page Translation

- [ ] Translate `examples/stitch_minimalist_personal_page/resume_no_navbar` to `apps/website/src/app/resume`.
- [ ] Implement `dark:` classes from `resume_dark_mode_no_navbar`.
- [ ] Migrate content from `@legacy/src/app/resume`.

### 7. Contact Page Translation

- [ ] Translate `examples/stitch_minimalist_personal_page/contact_no_navbar` to `apps/website/src/app/contact`.
- [ ] Implement `dark:` classes from `contact_dark_mode_no_navbar`.
- [ ] Migrate content from `@legacy/src/app/landing/content/contact`.

## Phase 2: Refinement & Content Migration

- [ ] Audit all content in `@legacy` and ensure it's fully migrated.
- [ ] Enhance content where gaps exist to match the high-fidelity design.
- [ ] Ensure SEO and metadata are correctly configured for each route.
- [ ] Final validation of responsiveness and performance.

## Standards

- Angular 21 (Signals, standalone components, zoneless).
- CSS Animations (Avoid `@angular/animations`).
- Tailwind CSS v4.
- Nx Workspace conventions.
