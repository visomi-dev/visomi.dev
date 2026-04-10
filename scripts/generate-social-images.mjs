import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..', '..');
const tmpDir = resolve(rootDir, 'tmp', 'og-images');

const SOCIAL_IMAGE_WIDTH = 1200;
const SOCIAL_IMAGE_HEIGHT = 630;

const locales = ['en', 'es'];
const pages = ['home', 'journey', 'projects', 'resume', 'contact'];

const socialImageContentByPage = {
  contact: {
    en: {
      accent: 'Direct line for architecture, advisory, and product collaboration.',
      cta: 'Start the conversation',
      eyebrow: 'VISOMI.DEV / CONTACT',
      highlights: ['Architecture consulting', 'Technical leadership', 'Fast response'],
      subtitle: 'Architecture consulting, technical leadership, and high-impact product collaboration.',
      title: 'Initialize connection.',
    },
    es: {
      accent: 'Canal directo para arquitectura, advisory y colaboracion de producto.',
      cta: 'Iniciar conversacion',
      eyebrow: 'VISOMI.DEV / CONTACTO',
      highlights: ['Consultoria tecnica', 'Liderazgo', 'Respuesta rapida'],
      subtitle: 'Consultoria de arquitectura, liderazgo tecnico y colaboracion en productos de alto impacto.',
      title: 'Iniciemos la conexion.',
    },
  },
  home: {
    en: {
      accent: 'Senior engineering for products that need clear foundations and durable systems.',
      cta: 'Explore the portfolio',
      eyebrow: 'VISOMI.DEV / HOME',
      highlights: ['Scalable platforms', 'AI workflows', 'Technical leadership'],
      subtitle: 'Senior full-stack engineering, reusable architecture, and AI-enabled workflows.',
      title: 'Architecting software that ships and scales.',
    },
    es: {
      accent: 'Ingenieria senior para productos que necesitan bases claras y sistemas duraderos.',
      cta: 'Explorar portafolio',
      eyebrow: 'VISOMI.DEV / INICIO',
      highlights: ['Plataformas escalables', 'Flujos con IA', 'Liderazgo tecnico'],
      subtitle: 'Ingenieria full-stack senior, arquitectura reutilizable y flujos de trabajo potenciados por IA.',
      title: 'Software pensado para salir a produccion y escalar.',
    },
  },
  journey: {
    en: {
      accent: 'From fintech to internal platforms, with the architecture decisions behind the work.',
      cta: 'See the timeline',
      eyebrow: 'VISOMI.DEV / JOURNEY',
      highlights: ['Fintech', 'Internal platforms', 'Leadership'],
      subtitle: 'A career timeline across fintech, internal platforms, product systems, and technical leadership.',
      title: 'Engineering journey through scale, teams, and platforms.',
    },
    es: {
      accent: 'De fintech a plataformas internas, con las decisiones de arquitectura detras del trabajo.',
      cta: 'Ver la linea de tiempo',
      eyebrow: 'VISOMI.DEV / TRAYECTORIA',
      highlights: ['Fintech', 'Plataformas internas', 'Liderazgo'],
      subtitle: 'Una linea de tiempo entre fintech, plataformas internas, sistemas de producto y liderazgo tecnico.',
      title: 'Trayectoria en escala, equipos y plataformas.',
    },
  },
  projects: {
    en: {
      accent: 'Editorial case studies covering delivery constraints, interface decisions, and system design.',
      cta: 'Open the case studies',
      eyebrow: 'VISOMI.DEV / PROJECTS',
      highlights: ['Fintech', 'SaaS', 'Product architecture'],
      subtitle: 'Case studies across fintech, SaaS, internal tools, and scalable product architecture.',
      title: 'Selected projects built with real delivery constraints.',
    },
    es: {
      accent: 'Casos de estudio editoriales con restricciones reales, decisiones de interfaz y diseno de sistemas.',
      cta: 'Abrir casos de estudio',
      eyebrow: 'VISOMI.DEV / PROYECTOS',
      highlights: ['Fintech', 'SaaS', 'Arquitectura de producto'],
      subtitle: 'Casos de estudio en fintech, SaaS, herramientas internas y arquitectura de producto escalable.',
      title: 'Proyectos seleccionados construidos con restricciones reales de entrega.',
    },
  },
  resume: {
    en: {
      accent: 'A focused snapshot of roles, leadership, and engineering depth across multiple product stages.',
      cta: 'Review the resume',
      eyebrow: 'VISOMI.DEV / RESUME',
      highlights: ['Experience', 'Leadership', 'Systems thinking'],
      subtitle: 'Experience, leadership, systems thinking, and delivery across multiple product stages.',
      title: 'Resume and experience snapshot.',
    },
    es: {
      accent: 'Un resumen claro de experiencia, liderazgo y profundidad tecnica en distintas etapas de producto.',
      cta: 'Revisar curriculum',
      eyebrow: 'VISOMI.DEV / CURRICULUM',
      highlights: ['Experiencia', 'Liderazgo', 'Pensamiento sistemico'],
      subtitle: 'Experiencia, liderazgo, pensamiento sistemico y ejecucion a traves de multiples etapas de producto.',
      title: 'Resumen de experiencia profesional.',
    },
  },
};

const clampText = (value, maxLength) => {
  const normalizedValue = value.replace(/\s+/g, ' ').trim();
  if (normalizedValue.length <= maxLength) return normalizedValue;
  return `${normalizedValue.slice(0, maxLength - 1).trimEnd()}…`;
};

const normalizeCard = (card, page, locale) => ({
  accent: clampText(card.accent, 96),
  brandLabel: 'VISOMI.DEV',
  cta: clampText(card.cta, 26),
  eyebrow: card.eyebrow,
  footerLabel: locale === 'es' ? 'ingenieria de software' : 'software engineering',
  highlights: card.highlights.map((h) => clampText(h, 28)).slice(0, 3),
  locale,
  page,
  previewLabel: locale === 'es' ? 'vista previa' : 'preview state',
  subtitle: clampText(card.subtitle, 140),
  title: clampText(card.title, 72),
  toneLabel: locale === 'es' ? 'claro, tecnico y enfocado' : 'clear, technical, focused',
});

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderHtml = (card) => {
  const highlightsMarkup = card.highlights.map((h) => `<span class="chip">${escapeHtml(h)}</span>`).join('');

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
      * { box-sizing: border-box; }
      html, body {
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
      .content, .panel { min-width: 0; }
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
      .cta-dot, .brand-dot { border-radius: 999px; background: linear-gradient(135deg, #38bdf8, #22c55e); }
      .cta-dot { width: 12px; height: 12px; box-shadow: 0 0 24px rgba(56, 189, 248, 0.45); }
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
      .brand-dot { width: 10px; height: 10px; box-shadow: 0 0 24px rgba(34, 197, 94, 0.42); }
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
      .panel-top { display: grid; gap: 16px; }
      .panel-header, .stack-item, .metric {
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
      .window-dots { display: flex; gap: 8px; }
      .window-dots span {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.5);
      }
      .label, .metric-label {
        color: rgba(148, 163, 184, 0.96);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .stack { display: grid; gap: 14px; }
      .stack-item { padding: 18px; }
      .stack-item strong { display: block; margin-top: 10px; font-size: 24px; line-height: 1.2; }
      .highlights { display: flex; flex-wrap: wrap; gap: 12px; }
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
      .metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .metric { padding: 18px; }
      .metric-value { margin-top: 10px; font-size: 30px; font-weight: 800; letter-spacing: -0.04em; }
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
            <div class="window-dots"><span></span><span></span><span></span></div>
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
            <div class="metric-value">1200x630</div>
          </div>
        </div>
      </aside>
    </main>
  </body>
</html>`;
};

const chromiumPathCandidates = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome-stable'];

const findChromium = async () => {
  for (const candidate of chromiumPathCandidates) {
    try {
      const { access } = await import('node:fs/promises');
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  throw new Error('Chromium not found');
};

const generateImages = async () => {
  const executablePath = process.env['PUPPETEER_EXECUTABLE_PATH'] || (await findChromium());
  console.log(`[ generate ] using Chromium at ${executablePath}`);

  const browser = await puppeteer.launch({
    executablePath,
    args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  try {
    let count = 0;
    for (const locale of locales) {
      for (const page of pages) {
        const content = socialImageContentByPage[page]?.[locale];
        const card = normalizeCard(content, page, locale);
        const html = renderHtml(card);
        const outDir = resolve(tmpDir, locale);
        const outPath = resolve(outDir, `${page}.png`);
        const publicDir = resolve(rootDir, 'apps', 'website', 'public', 'images', 'seo', locale);
        const publicPath = resolve(publicDir, `${page}.png`);

        await mkdir(outDir, { recursive: true });
        await mkdir(publicDir, { recursive: true });

        const page2 = await browser.newPage();
        try {
          await page2.setViewport({ deviceScaleFactor: 1, width: SOCIAL_IMAGE_WIDTH, height: SOCIAL_IMAGE_HEIGHT });
          await page2.setContent(html, { waitUntil: 'networkidle0' });
          await page2.screenshot({ path: outPath, type: 'png' });
        } finally {
          await page2.close();
        }

        await copyFile(outPath, publicPath);
        count++;
        console.log(`[ generate ] ${locale}/${page} -> ${publicPath}`);
      }
    }
    console.log(`[ generate ] done — ${count} images generated`);
  } finally {
    await browser.close();
  }
};

generateImages().catch((err) => {
  console.error('[ generate ] failed:', err);
  process.exit(1);
});
