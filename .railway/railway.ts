import { readFileSync } from 'node:fs';

import { defineRailway, github, image, preserve, project, service, volume } from 'railway/iac';

export const jaegerImage =
  'jaegertracing/jaeger:2.22.0@sha256:4d9387a02389204ef9a256cf291a36cfbae91983010e403b4d300202d07eff2a';
export const jaegerConfig = readFileSync(new URL('./jaeger.yaml', import.meta.url), 'utf8');

export const watchPatterns = [
  '/apps/web/**',
  '/apps/worker/**',
  '/assets/**',
  '/libs/**',
  '/tools/**',
  '/patches/**',
  '/package.json',
  '/pnpm-lock.yaml',
  '/pnpm-workspace.yaml',
  '/nx.json',
  '/tsconfig*.json',
  '/.node-version',
  '/styles.base.css',
  '/.postcssrc.json',
  '/railway.json',
  '/Dockerfile',
  '/.dockerignore',
  '/.railway/**',
];

// Bind these resources to the existing production services before applying.
// PostgreSQL and Redis stay externally managed; preserve their connection references.
export const railwayDefinition = defineRailway(() => {
  const traces = volume('jaeger-data', { sizeMB: 1024, region: 'us-east4-eqdc4a' });
  const jaeger = service('jaeger', {
    source: image(jaegerImage),
    tracing: { enabled: false, autoInstrumentation: false },
    replicas: { 'us-east4-eqdc4a': 1 },
    volumeMounts: { '/badger': traces },
    // No domains or TCP proxy: both OTLP and the unauthenticated query UI stay private.
    deploy: {
      startCommand: '/cmd/jaeger/jaeger-linux --config env:JAEGER_CONFIG',
      limitOverride: { containers: { cpu: 0.5, memoryBytes: 500000000 } },
      healthcheckPath: '/status',
      healthcheckTimeout: 60,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 3,
      drainingSeconds: 10,
      sleepApplication: false,
    },
    env: {
      PORT: '13133',
      // Railway volumes are root-owned; only this private storage process uses UID 0.
      RAILWAY_RUN_UID: '0',
      JAEGER_CONFIG: jaegerConfig,
      JAEGER_HTPASSWD: preserve(),
      OTLP_AUTH_HEADER: preserve(),
    },
  });
  const gateway = service('web-gateway', {
    source: github('visomi-dev/visomi.dev', { branch: 'main', commitSha: null, checkSuites: true }),
    root: '/',
    tracing: { enabled: false, autoInstrumentation: false },
    domains: [{ domain: 'visomi.dev', port: 8080 }],
    build: { builder: 'DOCKERFILE', dockerfilePath: 'Dockerfile', watchPatterns },
    deploy: {
      startCommand: 'node dist/apps/web/gateway/main.js',
      preDeployCommand: ['node libs/backend/shared/tools/database/migrate.mjs'],
      preDeployTimeoutSeconds: 120,
      healthcheckPath: '/api/ready',
      healthcheckTimeout: 60,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 3,
      drainingSeconds: 10,
      sleepApplication: false,
    },
    env: {
      APP_NAME: 'web-gateway',
      HOST: '0.0.0.0',
      PORT: '8080',
      NODE_ENV: 'production',
      ASTRO_TELEMETRY_DISABLED: '1',
      DATABASE_URL: preserve(),
      REDIS_URL: preserve(),
      AUTH_TRUST_PROXY: preserve(),
      AUTH_ORIGIN: preserve(),
      AUTH_RP_ID: preserve(),
      SESSION_SECRET: preserve(),
      OWNER_EMAIL: preserve(),
      OWNER_USER_ID: preserve(),
      AUTH_TOTP_ENCRYPTION_KEY: preserve(),
      SMTP_HOST: preserve(),
      SMTP_PORT: preserve(),
      SMTP_SECURE: preserve(),
      SMTP_FROM: preserve(),
      SMTP_USER: preserve(),
      SMTP_PASSWORD: preserve(),
      SOCIAL_IMAGE_INTERNAL_TOKEN: preserve(),
      VISOMI_OTLP_TRACING: 'true',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://${{jaeger.RAILWAY_PRIVATE_DOMAIN}}:4318',
      OTEL_EXPORTER_OTLP_PROTOCOL: 'http/protobuf',
      OTEL_EXPORTER_OTLP_HEADERS: jaeger.env.OTLP_AUTH_HEADER,
      VISOMI_PRIVATE_METRICS: 'false',
      VISOMI_BROWSER_TELEMETRY: 'false',
      VISOMI_BROWSER_PERFORMANCE: 'false',
      OTEL_METRICS_EXPORTER: 'none',
      OTEL_LOGS_EXPORTER: 'none',
    },
  });

  return project('visomi.dev', { resources: [gateway, jaeger, traces] });
});

export default railwayDefinition;
