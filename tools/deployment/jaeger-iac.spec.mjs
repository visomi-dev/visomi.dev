import assert from 'node:assert/strict';
import test from 'node:test';

import { railwayDefinition, jaegerConfig, jaegerImage } from '../../.railway/railway';

const configuration = await railwayDefinition();
const resource = (name) => configuration.resources.find((item) => item.name === name);
const gateway = resource('web-gateway');
const jaeger = resource('jaeger');
const data = resource('jaeger-data');
const literal = (value) => ({ type: 'literal', value });

test('collector is pinned, private and uses persistent bounded storage', () => {
  assert.deepEqual(jaeger.source, { type: 'image', image: jaegerImage });
  assert.match(jaegerImage, /:2\.22\.0@sha256:[a-f0-9]{64}$/);
  assert.equal(jaeger.networking, undefined);
  assert.deepEqual(data.config, { sizeMB: 1024, region: 'us-east4-eqdc4a' });
  assert.deepEqual(jaeger.volumeAttachments['jaeger-data'], {
    volume: data.address,
    mountPath: '/badger',
    volumeConfig: data.config,
  });
  assert.equal(jaeger.deploy.healthcheckPath, '/status');
  assert.equal(jaeger.deploy.startCommand, '/cmd/jaeger/jaeger-linux --config env:JAEGER_CONFIG');
  assert.deepEqual(jaeger.variables.PORT, literal('13133'));
  assert.deepEqual(jaeger.deploy.limitOverride, { containers: { cpu: 0.5, memoryBytes: 500000000 } });
  assert.deepEqual(jaeger.variables.JAEGER_CONFIG, literal(jaegerConfig));
  assert.match(jaegerConfig, /ephemeral: false/);
  assert.match(jaegerConfig, /spans: 48h/);
  assert.match(jaegerConfig, /authenticator: basicauth\/ingest/);
  assert.match(jaegerConfig, /\$\{env:JAEGER_HTPASSWD\}/);
});

test('collector credentials are preserved and gateway references them without exposing values', () => {
  assert.deepEqual(jaeger.variables.JAEGER_HTPASSWD, { type: 'preserve' });
  assert.deepEqual(jaeger.variables.OTLP_AUTH_HEADER, { type: 'preserve' });
  assert.deepEqual(gateway.variables.OTEL_EXPORTER_OTLP_HEADERS, {
    type: 'reference',
    resource: jaeger.address,
    output: 'OTLP_AUTH_HEADER',
  });
  assert.deepEqual(
    gateway.variables.OTEL_EXPORTER_OTLP_ENDPOINT,
    literal('http://${{jaeger.RAILWAY_PRIVATE_DOMAIN}}:4318'),
  );
  assert.deepEqual(gateway.variables.OTEL_EXPORTER_OTLP_PROTOCOL, literal('http/protobuf'));
  assert.deepEqual(gateway.variables.VISOMI_OTLP_TRACING, literal('true'));
});

test('native tracing and unrelated capture remain off; existing dependencies stay preserved', () => {
  for (const service of [gateway, jaeger]) {
    assert.deepEqual(service.tracing, { enabled: false, autoInstrumentation: false });
  }
  for (const flag of ['VISOMI_PRIVATE_METRICS', 'VISOMI_BROWSER_TELEMETRY', 'VISOMI_BROWSER_PERFORMANCE']) {
    assert.deepEqual(gateway.variables[flag], literal('false'));
  }
  for (const flag of ['OTEL_METRICS_EXPORTER', 'OTEL_LOGS_EXPORTER']) {
    assert.deepEqual(gateway.variables[flag], literal('none'));
  }
  for (const name of ['DATABASE_URL', 'REDIS_URL', 'SESSION_SECRET', 'SMTP_PASSWORD', 'AUTH_TOTP_ENCRYPTION_KEY']) {
    assert.deepEqual(gateway.variables[name], { type: 'preserve' });
  }
  assert.deepEqual(configuration.resources.map((item) => item.name).sort(), ['jaeger', 'jaeger-data', 'web-gateway']);
});

test('gateway retains schema migration and SMTP TLS configuration', () => {
  assert.deepEqual(gateway.deploy.preDeployCommand, ['node libs/backend/shared/tools/database/migrate.mjs']);
  assert.equal(gateway.deploy.preDeployTimeoutSeconds, 120);
  assert.deepEqual(gateway.variables.SMTP_SECURE, { type: 'preserve' });
});
