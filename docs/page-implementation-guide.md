# Page Implementation Guide: Stitch Minimalist Design

This guide outlines the process for implementing new pages or sections in the Visomi.dev website based on the `examples/stitch_minimalist_personal_page` reference designs. Use this to maintain consistency when implementing `Contact`, `Projects`, or `Resume` pages.

---

## 1. Analysis & Decomposition

Before writing code, analyze the reference design (HTML and Screenshots) to identify logical sections.

- **Smart Component (Page):** The top-level component that manages the route and composes sub-sections.
- **Dumb Components (Sections):** Break the page into 4-6 smaller, focused components.
- **Naming:** Follow the "Screaming Architecture". Folders and files should describe what they _do_, not what they _are_.

**Example:**

- `pages/contact/` (Smart)
- `pages/contact/form/`, `pages/contact/hero/` (Dumb)

---

## 2. Component Scaffolding

Use the Nx generator to create the structure, then adjust it to follow our strict conventions.

```bash
pnpm nx g @nx/angular:component apps/website/src/app/pages/my-page/my-component --path-case=kebab --style=css
```

### Required Adjustments

- **Remove `Component` suffix** from class name (e.g., `Hero`, not `HeroComponent`).
- **Remove `standalone: true`** (it's the default in v20+).
- **Match Filenames:** Ensure `.ts`, `.html`, and `.css` all share the same base name.
- **Host Binding (Styling):** Use the `host` property to set the component's base styling (background, text color, layout) using Tailwind classes. This centralizes themes in the TS decorator instead of spreading them across CSS files.
  ```ts
  @Component({
    host: {
      class: /* tw */ 'block min-h-full w-full bg-surface-light text-muted-light dark:bg-surface-dark dark:text-muted-dark',
    },
  })
  ```

---

## 3. Implementation Patterns

### Styling with Tailwind v4

- **Gradients:** Use `bg-linear-to-*` instead of `bg-gradient-to-*`.
- **Opacity:** Use `/number` syntax (e.g., `bg-white/10` or `dark:bg-white/2`).
- **Design Tokens:** Always prefer semantic project tokens defined in `styles.css`.
- **No Hardcoded Values:** Never use hardcoded colors (hex, rgb) or pixel values in templates or CSS. Use Tailwind's default utility classes (e.g., `text-xs`, `max-w-screen-2xl`, `left-5`) or custom tokens defined in `@theme`.
- **No `col-span-1` Redundancy:** Avoid using `col-span-1` in grid layouts when it is already the default behavior (e.g., in single-column mobile views).

### Shared UI Components

Always check `shared/ui/` for reusable components before implementing local ones.

- **Form Inputs:** Use `<app-input />` from `shared/ui/form/input/input.ts` instead of raw `<input>` elements. It follows the Signal-based reactive pattern and includes standard styling.

### Internationalization (i18n)

Every user-facing string MUST have an `i18n` marker with a custom ID.

- **Markdown Template ID:** `@@{page}{Section}{Descriptor}`
  ```html
  <h1 i18n="@@contactHeroTitle">Get in Touch</h1>
  ```
- **Custom IDs:** Always use `@@` prefix.
- **Dynamic Strings (TS):** Use `$localize`:
  ```ts
  const placeholder = $localize`:@@contactFormNamePlaceholder:Your name`;
  ```

---

## 4. State & Signals

- Use `signal()` for local state.
- Use `computed()` for derived state.
- **Effects:** Must be declared as `readonly` class properties.

---

## 5. Verification Checklist

### Automated Tests

1. **Linting:** Run `pnpm nx lint website`. Fix all violations, especially `import-x/order` (blank line between Angular and local imports).
2. **Unit Tests:** Run `pnpm nx test website`.
   - Ensure `test-setup.ts` includes `@angular/localize/init`.
   - Ensure browser globals like `matchMedia` are mocked in `test-setup.ts` if used.

### Manual Review

- Test both **Light** and **Dark** modes.
- Verify **Responsive** behavior (mobile-first).
- Verify **Accessibility** (semantic HTML, aria-labels for icons).
