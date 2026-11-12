# Branding Docs

This folder contains personal branding and positioning prompts.

- `personal-brand-prompt.md`

The approved artwork lives in `assets/brand`. The public website imports those SVGs directly:
desktop navigation uses `logotype.svg`, mobile uses `isotype.svg`, and ClientRouter loading uses
`visomi-loader.svg`. Dark page themes invert the black artwork without changing its paths.
The loader's SVG includes a static fallback for `prefers-reduced-motion`.

Both the public website and private app use `favicon.svg`. Its dark-scheme rule changes only the ink
color. The public `/favicon.svg` endpoint is prerendered from that canonical file; do not add another
manually maintained favicon to the site's public directory.
