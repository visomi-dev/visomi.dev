import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { jaegerImage } from '../../.railway/jaeger-image';
import * as railway from '../../.railway/railway';

const configuration = await railway.railwayDefinition();
const [gateway, postgres, redis, jaeger, postgresVolume, redisVolume, jaegerData] = configuration.resources;
const jaegerConfig = readFileSync(new URL('../../.railway/jaeger.yaml', import.meta.url), 'utf8');

test('the production definition matches the existing project resources and GitHub source', () => {
  assert.equal(configuration.name, 'visomi');
  assert.equal(Object.hasOwn(railway, 'partial'), false);
  assert.deepEqual(
    configuration.resources.map(({ address }) => address),
    [
      'service.visomi.dev',
      'database.Postgres',
      'database.Redis',
      'service.jaeger',
      'volume.postgres-volume',
      'volume.redis-volume',
      'volume.jaeger-data',
    ],
  );
  assert.deepEqual(gateway.source, {
    type: 'github',
    repo: 'visomi-dev/visomi.dev',
    branch: 'main',
    checkSuites: false,
  });
  assert.deepEqual(gateway.networking, {
    privateNetworkEndpoint: 'visomidev',
    customDomains: { 'visomi.dev': {}, 'www.visomi.dev': { port: 8080 } },
  });
});

test('the managed databases retain their existing images, private endpoints and disks', () => {
  assert.deepEqual(postgres.source, { type: 'image', image: 'ghcr.io/railwayapp-templates/postgres-ssl:18' });
  assert.deepEqual(redis.source, { type: 'image', image: 'redis:8.2.9' });
  assert.deepEqual(postgres.networking, { privateNetworkEndpoint: 'postgres' });
  assert.deepEqual(redis.networking, { privateNetworkEndpoint: 'redis' });
  assert.equal(postgres.defaultMountPath, '/var/lib/postgresql/data');
  assert.equal(redis.defaultMountPath, '/data');
  assert.equal(postgres.volumeAttachments, undefined);
  assert.equal(redis.volumeAttachments, undefined);
  assert.match(redis.deploy.startCommand, /--requirepass \$REDIS_PASSWORD .*--dir \$RAILWAY_VOLUME_MOUNT_PATH/);

  for (const [disk, sizeMB] of [
    [postgresVolume, 50000],
    [redisVolume, 5000],
    [jaegerData, 1024],
  ]) {
    assert.deepEqual(disk.config, {
      sizeMB,
      region: 'us-east4-eqdc4a',
      allowOnlineResize: true,
      alerts: { usage: { 80: {}, 95: {}, 100: {} } },
    });
  }
});

test('all inventoried service variables and references are preserved on Railway', () => {
  assert.deepEqual(configuration.variables, { managed: true });
  for (const [resource, count] of [
    [gateway, 31],
    [postgres, 12],
    [redis, 6],
    [jaeger, 5],
  ]) {
    assert.equal(Object.keys(resource.variables).length, count);
    for (const value of Object.values(resource.variables)) {
      assert.deepEqual(value, { type: 'preserve' });
    }
  }

  for (const name of [
    'DATABASE_URL',
    'REDIS_URL',
    'AUTH_ORIGIN',
    'VISOMI_PRIVATE_METRICS',
    'VISOMI_BROWSER_PERFORMANCE',
    'VISOMI_BROWSER_TELEMETRY',
    'OTEL_EXPORTER_OTLP_ENDPOINT',
    'OTEL_EXPORTER_OTLP_HEADERS',
    'OTEL_EXPORTER_OTLP_PROTOCOL',
  ]) {
    assert.deepEqual(gateway.variables[name], { type: 'preserve' }, name);
  }
});

test('the gateway retains its running entrypoint and schema migration without a new timeout', () => {
  assert.equal(gateway.deploy.startCommand, 'node dist/apps/web/gateway/main.js');
  assert.deepEqual(gateway.deploy.preDeployCommand, ['node libs/backend/shared/tools/database/migrate.mjs']);
  assert.equal(gateway.deploy.preDeployTimeoutSeconds, undefined);
});

test('the existing private Jaeger collector keeps its pinned image, authentication and storage', () => {
  assert.deepEqual(jaeger.source, { type: 'image', image: jaegerImage });
  assert.match(jaegerImage, /:2\.22\.0@sha256:[a-f0-9]{64}$/);
  assert.equal(jaeger.networking, undefined);
  assert.equal(jaeger.deploy.healthcheckPath, '/status');
  assert.equal(jaeger.deploy.healthcheckTimeout, 60);
  assert.deepEqual(jaeger.volumeAttachments['jaeger-data'], {
    volume: jaegerData.address,
    mountPath: '/badger',
    volumeConfig: jaegerData.config,
  });
  assert.match(jaegerConfig, /keys: \/badger\/keys/);
  assert.match(jaegerConfig, /values: \/badger\/values/);
  assert.match(jaegerConfig, /ephemeral: false/);
  assert.match(jaegerConfig, /spans: 48h/);
  assert.match(jaegerConfig, /authenticator: basicauth\/ingest/);
  assert.match(jaegerConfig, /\$\{env:JAEGER_HTPASSWD\}/);
});
