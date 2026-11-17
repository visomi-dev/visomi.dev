# Website UI foundations

The portfolio reuses the UI foundations of `visomi-stack`, adapted to the visual
identity already present in `visomi.dev`. It retains its neutral palette, Inter and
monospace typography, page composition, spacing, imagery, content and URLs.

Reference for the coordinated motion contract: upstream commit
`87f6ebc310e92041ced494764757e5aab58706a2`, `styles.base.css`, the UI recipes and
`apps/web/site/src/components/theme-behavior.astro`. This is a selective adoption of
UI behavior, not a new migration baseline for unrelated authentication or infrastructure.

## Shared implementation

`libs/web/frontend/ui/src/styles.css` contains focus, loader and theme behavior. The
existing root stylesheet and the website import that single source. The website's
`src/shared/ui.ts` adapts the structural/interaction `foundation` exports of the same
recipes used by Angular. It supplies no conflicting palette, spacing or font classes;
existing portfolio appearance remains with its components. Full recipe defaults are
unchanged. The library is included in Tailwind scanning and Nx dependency selection.

| Website surface                                  | Reused foundation                                                  | Portfolio-owned presentation                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Navbar, locale links, footer, public error pages | Link/button focus and interaction                                  | Existing fixed navigation, responsive menu, brand artwork and neutral hover colors      |
| Home, journey, projects, contact, résumé         | Container/card intrinsic sizing; typography with ordinary wrapping | Existing widths, hierarchy, timeline, charts, imagery and print résumé                  |
| Project filters and screen selectors             | Native button interaction and focus                                | Existing selected-state classes, filtering and image selection                          |
| Contact                                          | Shared control focus/disabled states and feedback layout           | Existing field dimensions, server validation, error visibility and success/error colors |
| Code examples                                    | Plain code recipe, keyboard focus and horizontal overflow          | Existing syntax highlighting, framing and padding                                       |
| Theme switcher                                   | Shared native-button structure, artwork, reel and clock            | Existing 40px control, yellow sun and white moon; localized accessible name             |
| Navigation progress                              | Shared page-color clock and reduced-motion policy                  | Existing thin, nonblocking bar and navigation lifecycle                                 |
| Decorative background                            | Shared theme clock and reduced-motion policy                       | Existing light grid/blobs and dark shader; no replacement artwork                       |

The contact form intentionally keeps server errors visible after submission. It does
not adopt the demo field's client-only reveal rules, which could hide a server error.
The thin navigation bar, shader, timeline/charts and résumé print composition are
product-specific presentations, not additional copies of generic UI controls.

## Motion and lifecycle

The theme reel, page paint properties and decorative layer transition use the shared
`--ui-theme-duration-ms: 400` and `--ui-theme-easing: ease-in-out` tokens. Colors,
borders, shadows, filters and SVG colors change in the same interaction. Reduced
motion applies immediately. Superseding a change cancels its pending cleanup, so an
old timer cannot hide the newly active background. Static layers remain functional
when WebGL cannot initialize. Astro's initial page-load notification does not restart
an interaction already underway; replacement controls initialize without a reel.

The public website retains the `theme` preference key. Private Angular session state,
owner isolation, canonical sign-in routes and authentication behavior are independent.

## Verification

The E2E suite measures actual icon/background animations and direct page paint at
0, 200 and 399 ms in both directions on every page and locale. It checks the shared
CSS timing declarations, rapid reversal, keyboard activation, storage/system behavior,
Astro navigation and reduced motion. Unit tests cover pending cleanup cancellation,
blocked persistence and static background behavior without WebGL.

Existing AXE, navigation, branding and 40-view content/SEO/geometry/pixel comparisons
remain in place; their visual baselines are not regenerated for this work. Screenshots
from parity runs are local evidence under `artifacts/migration/parity/`.
