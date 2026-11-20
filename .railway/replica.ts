import { readFileSync } from 'node:fs';

import { defineRailway, image, postgres, preserve, project, redis, service, volume } from 'railway/iac';

/* eslint-disable import-x/extensions, no-restricted-syntax -- Railway's native Node evaluator requires extensions. */
import { jaegerImage } from './jaeger-image.ts';
import { gatewayConfig } from './railway.ts';
/* eslint-enable import-x/extensions, no-restricted-syntax */

export const replicaDefinition = defineRailway(({ projectName, projectId, environmentId, shared }) => {
  if (!projectId || !environmentId || !projectName || !/^visomi-replica(?:-[a-z0-9]+)*$/.test(projectName)) {
    throw new Error('Select a separate Railway project named visomi-replica or visomi-replica-<suffix>.');
  }

  const database = postgres('Postgres');
  const cache = redis('Redis');
  const region = 'us-east4-eqdc4a';
  const traces = volume('jaeger-data', { sizeMB: 1024, region });
  const jaeger = service('jaeger', {
    source: image(jaegerImage),
    replicas: { [region]: 1 },
    volumeMounts: { '/badger': traces },
    start: '/cmd/jaeger/jaeger-linux --config env:JAEGER_CONFIG',
    healthcheck: '/status',
    healthcheckTimeout: 60,
    deploy: {
      limitOverride: { containers: { cpu: 0.5, memoryBytes: 500000000 } },
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 3,
      drainingSeconds: 10,
    },
    env: {
      PORT: '13133',
      RAILWAY_RUN_UID: '0',
      JAEGER_CONFIG: readFileSync(new URL('./jaeger.yaml', import.meta.url), 'utf8'),
      JAEGER_HTPASSWD: shared.VISOMI_REPLICA_JAEGER_HTPASSWD,
      OTLP_AUTH_HEADER: shared.VISOMI_REPLICA_OTLP_AUTH_HEADER,
    },
  });

  const gateway = service('visomi.dev', {
    ...gatewayConfig,
    env: {
      DATABASE_URL: database.env.DATABASE_URL,
      REDIS_URL: cache.env.REDIS_URL,
      REALTIME_REDIS_URL: cache.env.REDIS_URL,
      AUTH_ORIGIN: 'https://${{shared.VISOMI_REPLICA_HOST}}',
      AUTH_RP_ID: shared.VISOMI_REPLICA_HOST,
      OWNER_EMAIL: shared.VISOMI_REPLICA_OWNER_EMAIL,
      SESSION_SECRET: shared.VISOMI_REPLICA_SESSION_SECRET,
      OWNER_USER_ID: preserve(),
      AUTH_TOTP_ENCRYPTION_KEY: preserve(),
      SMTP_HOST: preserve(),
      SMTP_PORT: preserve(),
      SMTP_SECURE: preserve(),
      SMTP_FROM: preserve(),
      SMTP_USER: preserve(),
      SMTP_PASSWORD: preserve(),
      SOCIAL_IMAGE_INTERNAL_TOKEN: shared.VISOMI_REPLICA_SOCIAL_IMAGE_TOKEN,
      ASTRO_TELEMETRY_DISABLED: '1',
      VISOMI_PRIVATE_METRICS: 'false',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://${{jaeger.RAILWAY_PRIVATE_DOMAIN}}:4318',
      OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf',
      OTEL_EXPORTER_OTLP_HEADERS: jaeger.env.OTLP_AUTH_HEADER,
      OTEL_METRICS_EXPORTER: 'none',
      OTEL_LOGS_EXPORTER: 'none',
    },
  });

  return project(projectName, { resources: [gateway, database, cache, jaeger, traces] });
});

export default replicaDefinition;
