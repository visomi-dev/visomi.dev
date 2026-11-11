import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { workspaceRoot } from '@nx/devkit';
import { expect, test } from '@playwright/test';

export function registerPrivateApiTests(prefix: string): void {
  test('runtime health/readiness and closed registration are available without template business routes', async ({
    request,
  }) => {
    const health = await request.get(`${prefix}/health`);
    const ready = await request.get(`${prefix}/ready`);

    expect(health.status()).toBe(200);
    expect(ready.status()).toBe(200);
    for (const path of ['/password/sign-up', '/passkeys/registration/options', '/google/start']) {
      const response = await request.post(`${prefix}/auth${path}`, { data: {} });

      expect(response.status()).toBe(404);
      expect(response.headers()['cache-control']).toContain('no-store');
    }
    const schemaResponse = await request.get(`${prefix}/openapi.json`);
    const schema = await schemaResponse.json();

    expect(schema.paths['/auth/password/sign-up']).toBeUndefined();
    expect(schema.paths['/contact/submissions']).toBeDefined();
  });

  test('public contact input is validated and malformed/oversized payloads remain private', async ({ request }) => {
    const input = {
      name: 'Synthetic sender',
      email: 'sender@example.test',
      locale: 'es',
      type: 'other',
      message: 'Synthetic public request body.',
    };
    const sent = await request.post(`${prefix}/contact/submissions`, { data: input });

    expect(sent.status()).toBe(201);
    const awaitedResult1 = await sent.json();

    expect(awaitedResult1).toEqual({ sent: true });
    const invalid = await request.post(`${prefix}/contact/submissions`, { data: { ...input, email: 'invalid' } });

    expect(invalid.status()).toBe(422);
    const malformed = await request.post(`${prefix}/contact/submissions`, {
      headers: { 'content-type': 'application/json' },
      data: '{',
    });

    expect(malformed.status()).toBe(400);
    const oversized = await request.post(`${prefix}/contact/submissions`, {
      data: { ...input, message: 'x'.repeat(30_000) },
    });

    expect(oversized.status()).toBe(413);
    expect(oversized.headers()['cache-control']).toContain('no-store');
    const awaitedResult2 = await oversized.text();

    expect(awaitedResult2).not.toContain(input.email);
  });

  test('server authorization protects list/detail IDs and session CSRF cannot be bypassed', async ({
    request,
    baseURL,
  }) => {
    const directory = resolve(workspaceRoot, 'tmp', `browser-fixture-${new URL(baseURL!).port}`);
    const awaitedResult3 = await readFile(resolve(directory, 'session.json'), 'utf8');
    const manifest = JSON.parse(awaitedResult3);
    const cookie = (role: string) => `visomi.sid=${encodeURIComponent(manifest.cookies[role])}`;
    const anonymous = await request.get(`${prefix}/contact/submissions/1`);

    expect(anonymous.status()).toBe(401);
    for (const path of ['/submissions', '/submissions/1']) {
      const other = await request.get(`${prefix}/contact${path}`, { headers: { cookie: cookie('other') } });

      expect(other.status()).toBe(403);
      expect(other.headers()['cache-control']).toContain('no-store');
    }
    const page = await request.get(`${prefix}/contact/submissions?limit=1`, { headers: { cookie: cookie('owner') } });

    expect(page.status()).toBe(200);
    const result = await page.json();

    expect(result.items).toHaveLength(1);
    expect(result.next).toBeTruthy();
    expect(result.items[0]).not.toHaveProperty('message');
    const detail = await request.get(`${prefix}/contact/submissions/${result.items[0].id}`, {
      headers: { cookie: cookie('owner') },
    });

    expect(detail.status()).toBe(200);
    expect(detail.headers()['cache-control']).toContain('no-store');
    const invalidId = await request.get(`${prefix}/contact/submissions/not-an-id`, {
      headers: { cookie: cookie('owner') },
    });

    expect(invalidId.status()).toBe(400);
    const forbidden = await request.post(`${prefix}/auth/logout`, {
      headers: { cookie: cookie('owner'), origin: baseURL! },
      data: {},
    });

    expect(forbidden.status()).toBe(403);
  });
}
