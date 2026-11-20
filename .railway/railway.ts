import { database, defineRailway, github, image, preserve, project, service, volume } from 'railway/iac';

// eslint-disable-next-line import-x/extensions, no-restricted-syntax -- Railway's native evaluator needs the extension.
import { jaegerImage } from './jaeger-image.ts';

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

export const railwayDefinition = defineRailway(() => {
  const region = 'us-east4-eqdc4a';
  const replicas = { [region]: 1 };
  const storage = { region, allowOnlineResize: true, alerts: { usage: { 80: {}, 95: {}, 100: {} } } };
  const postgresVolume = volume('postgres-volume', { ...storage, sizeMB: 50000 });
  const redisVolume = volume('redis-volume', { ...storage, sizeMB: 5000 });
  const jaegerData = volume('jaeger-data', { ...storage, sizeMB: 1024 });

  const postgres = database('Postgres', 'postgres', {
    image: 'ghcr.io/railwayapp-templates/postgres-ssl:18',
    output: 'DATABASE_URL',
    defaultMountPath: '/var/lib/postgresql/data',
    region,
  });

  postgres.networking = { privateNetworkEndpoint: 'postgres' };

  // Railway owns the template attachment of postgres-volume at defaultMountPath.
  postgres.variables = {
    DATABASE_URL: preserve(),
    PGDATA: preserve(),
    PGDATABASE: preserve(),
    PGHOST: preserve(),
    PGPASSWORD: preserve(),
    PGPORT: preserve(),
    PGUSER: preserve(),
    POSTGRES_DB: preserve(),
    POSTGRES_PASSWORD: preserve(),
    POSTGRES_USER: preserve(),
    RAILWAY_DEPLOYMENT_DRAINING_SECONDS: preserve(),
    SSL_CERT_DAYS: preserve(),
  };

  const redis = database('Redis', 'redis', {
    image: 'redis:8.2.9',
    output: 'REDIS_URL',
    defaultMountPath: '/data',
    region,
  });

  redis.networking = { privateNetworkEndpoint: 'redis' };
  redis.deploy = {
    ...redis.deploy,
    startCommand:
      '/bin/sh -c "rm -rf $RAILWAY_VOLUME_MOUNT_PATH/lost+found/ && exec docker-entrypoint.sh redis-server --requirepass $REDIS_PASSWORD --save 60 1 --dir $RAILWAY_VOLUME_MOUNT_PATH"',
  };

  // Railway owns the template attachment of redis-volume at defaultMountPath.
  redis.variables = {
    REDISHOST: preserve(),
    REDISPASSWORD: preserve(),
    REDISPORT: preserve(),
    REDISUSER: preserve(),
    REDIS_PASSWORD: preserve(),
    REDIS_URL: preserve(),
  };

  const jaeger = service('jaeger', {
    source: image(jaegerImage),
    build: { buildEnvironment: 'V3', builder: 'RAILPACK' },
    start: '/cmd/jaeger/jaeger-linux --config env:JAEGER_CONFIG',
    healthcheck: '/status',
    healthcheckTimeout: 60,
    replicas,
    deploy: {
      drainingSeconds: 10,
      limitOverride: { containers: { cpu: 0.5, memoryBytes: 500000000 } },
      restartPolicyMaxRetries: 3,
    },
    volumeMounts: { '/badger': jaegerData },
    env: {
      JAEGER_CONFIG: preserve(),
      JAEGER_HTPASSWD: preserve(),
      OTLP_AUTH_HEADER: preserve(),
      PORT: preserve(),
      RAILWAY_RUN_UID: preserve(),
    },
  });

  const gateway = service('visomi.dev', {
    source: github('visomi-dev/visomi.dev', { branch: 'main', checkSuites: false }),
    build: {
      buildCommand: '',
      builder: 'DOCKERFILE',
      dockerfilePath: '/Dockerfile',
      nixpacksPlan: { providers: [] },
      watchPatterns,
    },
    start: 'node dist/apps/web/gateway/main.js',
    preDeploy: 'node libs/backend/shared/tools/database/migrate.mjs',
    healthcheck: '/api/ready',
    healthcheckTimeout: 60,
    replicas,
    deploy: {
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 3,
      drainingSeconds: 10,
      limitOverride: { containers: { cpu: 1, memoryBytes: 1000000000 } },
    },
    env: {
      APP_NAME: preserve(),
      ASTRO_DB_APP_TOKEN: preserve(),
      ASTRO_DB_REMOTE_URL: preserve(),
      ASTRO_TELEMETRY_DISABLED: preserve(),
      AUTH_ORIGIN: preserve(),
      AUTH_RP_ID: preserve(),
      AUTH_TRUST_PROXY: preserve(),
      // Keep the existing Postgres, Redis and Jaeger references verbatim on Railway.
      DATABASE_URL: preserve(),
      REDIS_URL: preserve(),
      OTEL_EXPORTER_OTLP_ENDPOINT: preserve(),
      OTEL_EXPORTER_OTLP_HEADERS: preserve(),
      OTEL_EXPORTER_OTLP_PROTOCOL: preserve(),
      HOST: preserve(),
      NODE_ENV: preserve(),
      OTEL_LOGS_EXPORTER: preserve(),
      OTEL_METRICS_EXPORTER: preserve(),
      OWNER_EMAIL: preserve(),
      PORT: preserve(),
      SESSION_SECRET: preserve(),
      SMTP_FROM: preserve(),
      SMTP_HOST: preserve(),
      SMTP_PASSWORD: preserve(),
      SMTP_PORT: preserve(),
      SMTP_SECURE: preserve(),
      SMTP_USER: preserve(),
      VISOMI_BROWSER_PERFORMANCE: preserve(),
      VISOMI_BROWSER_TELEMETRY: preserve(),
      VISOMI_OTLP_TRACING: preserve(),
      VISOMI_PRIVATE_METRICS: preserve(),
      VISOMI_PROXY_DIAGNOSTIC_EXPIRES_AT: preserve(),
      VISOMI_PROXY_DIAGNOSTIC_TOKEN: preserve(),
    },
  });

  // The domains shorthand would default the existing apex to 8080.
  gateway.networking = {
    privateNetworkEndpoint: 'visomidev',
    customDomains: { 'visomi.dev': {}, 'www.visomi.dev': { port: 8080 } },
  };

  return {
    ...project('visomi', { resources: [gateway, postgres, redis, jaeger, postgresVolume, redisVolume, jaegerData] }),
    variables: { managed: true },
  };
});

export default railwayDefinition;
