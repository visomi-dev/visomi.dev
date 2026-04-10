# Social Share Image Rules

## Purpose

These rules define the baseline visual and content constraints for backend-generated social share cards.

## Card Rules

1. Always render at `1200 x 630`.
2. Preserve a blocked, non-responsive layout tuned for the final export size.
3. Lead with one dominant message that can be understood at a glance.
4. Use large headline typography that remains readable in small link previews.
5. Keep contrast high between the background and all important text.
6. Keep branding visible but secondary to the message.
7. Use page-specific copy instead of one default image for every page.
8. Limit supporting details to a few short highlights.
9. Avoid busy backgrounds, weak hierarchy, or multiple competing calls to action.
10. Export stable PNG assets under the `/images/seo/<locale>/<page>.png` contract.

## Implementation Notes

- The worker should normalize card content before rendering.
- Titles should be short enough to preserve large typography.
- Highlights should be capped to avoid noisy cards.
- The renderer should use embedded CSS so the screenshot output is self-contained.
- The server promotes completed artifacts into the website public directory contract.
