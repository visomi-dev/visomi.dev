import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { partial, railwayDefinition } from '../../.railway/railway';

const configuration = await railwayDefinition();
const [gateway] = configuration.resources;
const jaegerConfig = readFileSync(new URL('../../.railway/jaeger.yaml', import.meta.url), 'utf8');

test('the migration claims only the existing gateway and keeps its GitHub source', () => {
  assert.equal(configuration.name, 'visomi');
  assert.equal(partial, 'visomi.dev');
  assert.deepEqual(
    configuration.resources.map((resource) => resource.address),
    ['service.visomi.dev'],
  );
  assert.deepEqual(gateway.source, {
    type: 'github',
    repo: 'visomi-dev/visomi.dev',
    branch: 'main',
    checkSuites: false,
  });
  assert.deepEqual(gateway.networking, { privateNetworkEndpoint: 'visomidev' });
  assert.equal(gateway.volumeAttachments, undefined);
});

test('existing variables and references stay unmanaged by the partial', () => {
  assert.deepEqual(configuration.variables, { managed: false });
  assert.equal(gateway.variables, undefined);
  assert.equal(gateway.tracing, undefined);
});

test('the gateway retains its running entrypoint and schema migration without a new timeout', () => {
  assert.equal(gateway.deploy.startCommand, 'node dist/apps/web/gateway/main.js');
  assert.deepEqual(gateway.deploy.preDeployCommand, ['node libs/backend/shared/tools/database/migrate.mjs']);
  assert.equal(gateway.deploy.preDeployTimeoutSeconds, undefined);
});

test('the existing collector config authenticates intake and persists traces under its own mount', () => {
  assert.match(jaegerConfig, /keys: \/badger\/keys/);
  assert.match(jaegerConfig, /values: \/badger\/values/);
  assert.match(jaegerConfig, /ephemeral: false/);
  assert.match(jaegerConfig, /spans: 48h/);
  assert.match(jaegerConfig, /authenticator: basicauth\/ingest/);
  assert.match(jaegerConfig, /\$\{env:JAEGER_HTPASSWD\}/);
});
