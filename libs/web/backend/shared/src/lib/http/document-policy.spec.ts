import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { documentPolicy, prepareDocumentPolicy } from './document-policy';

const hash = (value: string) => `'sha256-${createHash('sha256').update(value).digest('base64')}'`;

afterEach(() => vi.unstubAllEnvs());
it('permits exact compiled snippets across client navigation while rejecting injected source tokens', async () => {
  const root = await mkdtemp(join(tmpdir(), 'visomi-csp-'));

  try {
    await mkdir(join(root, 'es'));

    await writeFile(
      join(root, 'index.html'),
      '<script>publicHome()</script><style>body{display:block}</style><div style="color: &quot;blue&quot; &amp; red"></div>',
    );

    await writeFile(join(root, 'es/index.html'), '<script>publicSpanish()</script>');

    await writeFile(join(root, 'ignored.txt'), '<script>untrusted()</script>');

    await symlink(join(root, 'ignored.txt'), join(root, 'linked.html'));

    await prepareDocumentPolicy(root);

    delete process.env['WEBSITE_CSP_HASHES'];
    expect(documentPolicy('')).toContain("default-src 'self'");

    await prepareDocumentPolicy(root);

    const policy = documentPolicy('<script>current()</script>');

    for (const text of ['publicHome()', 'publicSpanish()', 'current()', 'body{display:block}', 'color: "blue" & red']) {
      expect(policy).toContain(hash(text));
    }
    expect(policy).not.toContain(hash('untrusted()'));
    expect(policy).not.toContain("'unsafe-inline'");
    expect(policy).not.toContain("'unsafe-eval'");
    vi.stubEnv(
      'WEBSITE_CSP_HASHES',
      JSON.stringify({ scripts: ["'unsafe-inline'", null, hash('trusted()')], styles: true }),
    );
    expect(documentPolicy('')).toContain(hash('trusted()'));
    expect(documentPolicy('')).not.toContain("'unsafe-inline'");
    for (const value of ['invalid', 'null', '{}']) {
      vi.stubEnv('WEBSITE_CSP_HASHES', value);
      expect(documentPolicy('')).toContain("default-src 'self'");
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
