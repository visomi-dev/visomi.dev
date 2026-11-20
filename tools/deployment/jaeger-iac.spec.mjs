import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createRailwayContext, project } from 'railway/iac';

import { jaegerImage } from '../../.railway/jaeger-image';
import { partial, railwayDefinition } from '../../.railway/railway';
import { replicaDefinition } from '../../.railway/replica';

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

const replicaContext = {
  projectId: 'synthetic-project',
  environmentId: 'synthetic-environment',
  projectName: 'visomi-replica-test',
};

test('the replica can only evaluate for a separate replica project', () => {
  for (const invalid of [
    { ...replicaContext, projectName: 'visomi', environmentName: 'replica' },
    { ...replicaContext, projectName: 'unrelated' },
    { ...replicaContext, projectName: undefined },
    { ...replicaContext, environmentId: undefined },
    { ...replicaContext, projectId: undefined },
  ]) {
    assert.throws(() => replicaDefinition(createRailwayContext(invalid), project), /Select a separate Railway project/);
  }
});

test('a new replica defines only its own services and private persistent storage', async () => {
  const replica = await replicaDefinition(createRailwayContext(replicaContext), project);
  const [web, postgres, redis, jaeger, traces] = replica.resources;

  assert.equal(replica.name, replicaContext.projectName);
  assert.deepEqual(
    replica.resources.map(({ address }) => address),
    ['service.visomi.dev', 'database.Postgres', 'database.Redis', 'service.jaeger', 'volume.jaeger-data'],
  );
  assert.equal(postgres.engine, 'postgres');
  assert.equal(redis.engine, 'redis');
  assert.equal(jaeger.source.image, jaegerImage);
  assert.match(jaegerImage, /:2\.22\.0@sha256:[a-f0-9]{64}$/);
  assert.equal(jaeger.networking, undefined);
  assert.deepEqual(traces.config, { sizeMB: 1024, region: 'us-east4-eqdc4a' });
  assert.equal(jaeger.volumeAttachments['jaeger-data'].mountPath, '/badger');
  assert.equal(jaeger.volumeAttachments['jaeger-data'].volume, traces.address);
  assert.equal(jaeger.variables.JAEGER_CONFIG.value, jaegerConfig);
  assert.equal(jaeger.variables.JAEGER_HTPASSWD.type, 'sharedReference');
  assert.deepEqual(web.source, gateway.source);
  assert.deepEqual(web.build, gateway.build);
  assert.deepEqual(web.deploy, gateway.deploy);
  assert.deepEqual(web.networking, gateway.networking);
});

test('a replica gateway uses its own private references and keeps metrics opt-in off by default', async () => {
  const replica = await replicaDefinition(createRailwayContext(replicaContext), project);
  const [{ variables: env }] = replica.resources;

  assert.deepEqual(env.DATABASE_URL, { type: 'reference', resource: 'database.Postgres', output: 'DATABASE_URL' });
  assert.deepEqual(env.REDIS_URL, { type: 'reference', resource: 'database.Redis', output: 'REDIS_URL' });
  assert.deepEqual(env.REALTIME_REDIS_URL, env.REDIS_URL);
  assert.deepEqual(env.OTEL_EXPORTER_OTLP_HEADERS, {
    type: 'reference',
    resource: 'service.jaeger',
    output: 'OTLP_AUTH_HEADER',
  });
  assert.equal(env.OTEL_EXPORTER_OTLP_ENDPOINT.value, 'http://${{jaeger.RAILWAY_PRIVATE_DOMAIN}}:4318');
  assert.equal(env.AUTH_ORIGIN.value, 'https://${{shared.VISOMI_REPLICA_HOST}}');
  assert.deepEqual(env.SESSION_SECRET, { type: 'sharedReference', name: 'VISOMI_REPLICA_SESSION_SECRET' });
  assert.equal(env.VISOMI_PRIVATE_METRICS.value, 'false');
});
