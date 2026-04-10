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
        grid-template-columns: 1.18fr 0.82fr;
        gap: 34px;
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
        justify-content: space-between;
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
        max-width: 11ch;
        font-size: 76px;
        font-weight: 800;
        line-height: 0.94;
        letter-spacing: -0.06em;
        text-wrap: balance;
      }

      .subtitle {
        margin: 24px 0 0;
        max-width: 28ch;
        color: rgba(226, 232, 240, 0.9);
        font-size: 28px;
        line-height: 1.28;
      }

      .accent {
        margin: 18px 0 0;
        max-width: 32ch;
        color: rgba(191, 219, 254, 0.82);
        font-size: 20px;
        line-height: 1.42;
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

      .cta-dot,
      .brand-dot {
        border-radius: 999px;
        background: linear-gradient(135deg, #38bdf8, #22c55e);
      }

      .cta-dot {
        width: 12px;
        height: 12px;
        box-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
      }

      .footer {
        display: flex;
        align-items: center;
        gap: 14px;
        color: rgba(191, 219, 254, 0.92);
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .brand-dot {
        width: 10px;
        height: 10px;
        box-shadow: 0 0 24px rgba(34, 197, 94, 0.42);
      }

      .panel {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 32px;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.56));
        padding: 26px;
        box-shadow: 0 28px 72px rgba(2, 6, 23, 0.42);
      }

      .panel-top {
        display: grid;
        gap: 16px;
      }

      .panel-header,
      .stack-item,
      .metric {
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

      .label,
      .metric-label {
        color: rgba(148, 163, 184, 0.96);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .stack {
        display: grid;
        gap: 14px;
      }

      .stack-item {
        padding: 18px;
      }

      .stack-item strong {
        display: block;
        margin-top: 10px;
        font-size: 24px;
        line-height: 1.2;
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

      .metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .metric {
        padding: 18px;
      }

      .metric-value {
        margin-top: 10px;
        font-size: 30px;
        font-weight: 800;
        letter-spacing: -0.04em;
      }
    </style>
  </head>
  <body>
    <main class="frame">
      <section class="content">
        <div>
          <p class="eyebrow">${escapeHtml(card.eyebrow)}</p>
          <h1 class="title">${escapeHtml(card.title)}</h1>
          <p class="subtitle">${escapeHtml(card.subtitle)}</p>
          <p class="accent">${escapeHtml(card.accent)}</p>
          <div class="cta">
            <span class="cta-dot"></span>
            <span>${escapeHtml(card.cta)}</span>
          </div>
        </div>

        <div class="footer">
          <span class="brand-dot"></span>
          <span>${escapeHtml(card.brandLabel)}</span>
          <span>${escapeHtml(card.footerLabel)}</span>
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

          <div class="stack">
            <div class="stack-item">
              <span class="label">${card.locale === 'es' ? 'enfoque' : 'focus'}</span>
              <strong>${escapeHtml(card.page)}</strong>
            </div>

            <div class="stack-item">
              <span class="label">${card.locale === 'es' ? 'tono' : 'tone'}</span>
              <strong>${escapeHtml(card.toneLabel)}</strong>
            </div>
          </div>
        </div>

        <div class="highlights">${highlightsMarkup}</div>

        <div class="metrics">
          <div class="metric">
            <div class="metric-label">locale</div>
            <div class="metric-value">${escapeHtml(card.locale.toUpperCase())}</div>
          </div>
          <div class="metric">
            <div class="metric-label">format</div>
            <div class="metric-value">1200×630</div>
          </div>
        </div>
      </aside>
    </main>
  </body>
</html>`;
};

export { renderSocialImageHtml };
