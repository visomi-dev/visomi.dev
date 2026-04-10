import { SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from './types';
import type { SocialImageCardModel } from './types';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderSocialImageHtml = (card: SocialImageCardModel) => {
  const highlightsMarkup = card.highlights
    .map((highlight) => `<span class="chip">${escapeHtml(highlight)}</span>`)
    .join('');
  const highlightsLabel = card.locale === 'es' ? 'claves' : 'highlights';

  return `<!doctype html>
<html lang="${escapeHtml(card.locale)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(card.title)}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        width: ${SOCIAL_IMAGE_WIDTH}px;
        height: ${SOCIAL_IMAGE_HEIGHT}px;
        overflow: hidden;
      }

      body {
        background:
          radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 34%),
          radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.18), transparent 32%),
          linear-gradient(145deg, #020617 0%, #0f172a 48%, #111827 100%);
        color: #f8fafc;
      }

      .frame {
        display: grid;
        grid-template-columns: 1.28fr 0.72fr;
        gap: 24px;
        width: 100%;
        height: 100%;
        padding: 52px;
      }

      .content,
      .panel {
        min-width: 0;
      }

      .content {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        width: 100%;
      }

      .content-main {
        width: 100%;
      }

      .eyebrow {
        margin: 0 0 18px;
        color: rgba(226, 232, 240, 0.82);
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }

      .title {
        margin: 0;
        font-size: 68px;
        font-weight: 800;
        line-height: 0.96;
        letter-spacing: -0.06em;
        text-wrap: balance;
        width: 100%;
      }

      .subtitle {
        margin: 24px 0 0;
        color: rgba(226, 232, 240, 0.9);
        font-size: 26px;
        line-height: 1.3;
        width: 100%;
      }

      .accent {
        margin: 18px 0 0;
        color: rgba(191, 219, 254, 0.82);
        font-size: 19px;
        line-height: 1.4;
        width: 100%;
      }

      .cta {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        align-self: flex-start;
        margin-top: 24px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.07);
        padding: 14px 18px;
        color: #f8fafc;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cta-dot {
        border-radius: 999px;
        background: linear-gradient(135deg, #38bdf8, #22c55e);
      }

      .cta-dot {
        width: 12px;
        height: 12px;
        box-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
      }

      .panel {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 18px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 32px;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.56));
        padding: 26px;
        box-shadow: 0 28px 72px rgba(2, 6, 23, 0.42);
      }

      .panel-top {
        display: grid;
        gap: 0;
      }

      .panel-header,
      .panel-section {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 22px;
        background: rgba(15, 23, 42, 0.56);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 18px;
      }

      .window-dots {
        display: flex;
        gap: 8px;
      }

      .window-dots span {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.5);
      }

      .label {
        color: rgba(148, 163, 184, 0.96);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .panel-section {
        display: grid;
        gap: 16px;
        padding: 18px;
      }

      .highlights {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .chip {
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        padding: 10px 14px;
        color: rgba(248, 250, 252, 0.94);
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <main class="frame">
      <section class="content">
        <div class="content-main">
          <p class="eyebrow">${escapeHtml(card.eyebrow)}</p>
          <h1 class="title">${escapeHtml(card.title)}</h1>
          <p class="subtitle">${escapeHtml(card.subtitle)}</p>
          <p class="accent">${escapeHtml(card.accent)}</p>
          <div class="cta">
            <span class="cta-dot"></span>
            <span>${escapeHtml(card.cta)}</span>
          </div>
        </div>
      </section>

      <aside class="panel">
        <div class="panel-top">
          <div class="panel-header">
            <div class="window-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="label">${escapeHtml(card.previewLabel)}</span>
          </div>
        </div>

        <div class="panel-section">
          <span class="label">${highlightsLabel}</span>
          <div class="highlights">${highlightsMarkup}</div>
        </div>
      </aside>
    </main>
  </body>
</html>`;
};

export { renderSocialImageHtml };
