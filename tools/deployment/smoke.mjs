import assert from 'node:assert/strict';

const origin = new URL(process.argv[2]);
const request = (path) => fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(10000) });

const api = await request('/api/');
const greeting = await api.json();

assert.equal(api.status, 200);
assert.deepEqual(greeting, { message: 'Hello API' });

for (const locale of ['en', 'es']) {
  const response = await request(locale === 'en' ? '/' : '/es/');

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
  const html = await response.text();

  assert.ok(html.includes(`<html lang="${locale}"`));
  const stylesheet = html.match(/href="([^"]+\.css)"/);

  assert.ok(stylesheet, 'Compiled stylesheet must be linked');
  const asset = await request(new URL(stylesheet[1], response.url));

  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('content-type'), /text\/css/);
}

for (const locale of ['en', 'es']) {
  for (const path of [`/app/${locale}/`, `/app/${locale}/access`, `/app/${locale}/dashboard`]) {
    const response = await request(path);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    assert.ok(html.includes('<app-root'));
    assert.ok(!html.includes('__VISOMI_CSP_NONCE__'));
    const nonce = html.match(/ngcspnonce="([^"]+)"/i)?.[1];

    assert.ok(nonce);
    assert.ok(response.headers.get('content-security-policy').includes(`'nonce-${nonce}'`));
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('etag'), null);
    const stylesheet = html.match(/href="([^"]+\.css)"/);
    const base = html.match(/<base href="([^"]+)"/);

    assert.ok(stylesheet);
    assert.ok(base);
    const documentBase = new URL(base[1], response.url);

    assert.equal(documentBase.pathname, `/app/${locale}/`);
    const asset = await request(new URL(stylesheet[1], documentBase));

    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('content-type'), /text\/css/);
  }
}

const missingApi = await request('/api/missing');
const missingApiBody = await missingApi.json();

assert.equal(missingApi.status, 404);
assert.deepEqual(missingApiBody, { error: 'not_found' });
const anonymous = await request('/api/contact/submissions');

assert.equal(anonymous.status, 401);
assert.match(anonymous.headers.get('cache-control'), /no-store/);
const registration = await request('/api/auth/password/sign-up');

assert.equal(registration.status, 503);
console.log(
  'Gateway, preserved English/Spanish website, private Angular shell, static assets and closed data boundary verified.',
);
