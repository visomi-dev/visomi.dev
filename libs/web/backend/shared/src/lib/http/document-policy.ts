import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const hash = (value: string) => `'sha256-${createHash('sha256').update(value).digest('base64')}'`;

type DocumentHashes = { scripts: string[]; styles: string[]; attributes: string[] };

function documentHashes(html: string): DocumentHashes {
  return {
    scripts: [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => hash(match[1])),
    styles: [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => hash(match[1])),
    attributes: [...html.matchAll(/\sstyle="([^"]*)"/gi)].map((match) =>
      hash(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')),
    ),
  };
}

// ClientRouter retains the initial document's policy. Authorize the finite set of
// trusted compiled snippets for all public routes, not arbitrary future inline code.
export async function prepareDocumentPolicy(directory: string): Promise<void> {
  const documents: string[] = [];
  const visit = async (folder: string): Promise<void> => {
    const entries = await readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isSymbolicLink()) {
        continue;
      }

      const file = join(folder, entry.name);

      if (entry.isDirectory()) {
        await visit(file);
      } else if (entry.name.endsWith('.html')) {
        const html = await readFile(file, 'utf8');

        documents.push(html);
      }
    }
  };

  await visit(directory);

  const hashes = documentHashes(documents.join('\n'));

  for (const key of ['scripts', 'styles', 'attributes'] as const) {
    hashes[key] = [...new Set(hashes[key])];
  }
  // Astro and gateway compile separately; share only public hashes across their module instances.
  process.env['WEBSITE_CSP_HASHES'] = JSON.stringify(hashes);
}

// Hash exact server-rendered bytes. No unsafe-inline/eval exemption is needed for legacy presentation.
export function documentPolicy(html: string): string {
  const { scripts, styles, attributes } = documentHashes(html);

  try {
    const configured: unknown = JSON.parse(process.env['WEBSITE_CSP_HASHES'] ?? '{}');

    if (configured && typeof configured === 'object') {
      for (const [key, values] of [
        ['scripts', scripts],
        ['styles', styles],
        ['attributes', attributes],
      ] as const) {
        const source: unknown = (configured as Record<string, unknown>)[key];

        if (Array.isArray(source)) {
          values.push(
            ...source.filter(
              (value): value is string => typeof value === 'string' && /^'sha256-[A-Za-z0-9+/]{43}='$/.test(value),
            ),
          );
        }
      }
    }
  } catch {
    /* Invalid configuration fails closed to hashes of this document only. */
  }

  return [
    "default-src 'self'",
    `script-src 'self' ${[...new Set(scripts)].join(' ')}`,
    `style-src 'self' ${[...new Set(styles)].join(' ')}`,
    `style-src-attr 'unsafe-hashes' ${[...new Set(attributes)].join(' ')}`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ');
}
