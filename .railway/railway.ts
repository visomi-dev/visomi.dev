import { defineRailway, github, preserve, project, service } from 'railway/iac';

export const watchPatterns = [
  '/apps/web/**',
  '/apps/worker/**',
  '/libs/**',
  '/tools/**',
  '/patches/**',
  '/package.json',
  '/pnpm-lock.yaml',
  '/pnpm-workspace.yaml',
  '/nx.json',
  '/tsconfig*.json',
  '/.node-version',
  '/Dockerfile',
  '/.dockerignore',
  '/.railway/**',
];

// Bind to the existing application service during the approved release; no database,
// broker or collector is declared here. Their ownership remains with VIS-16.
export default defineRailway(() => {
  const gateway = service('web-gateway', {
    source: github('visomi-dev/visomi.dev', { branch: 'main', commitSha: null, checkSuites: true }),
    root: '/',
    tracing: { enabled: false, autoInstrumentation: false },
    domains: [{ domain: 'visomi.dev', port: 8080 }],
    build: { builder: 'DOCKERFILE', dockerfilePath: 'Dockerfile', watchPatterns },
    deploy: {
      startCommand: 'node dist/apps/web/gateway/main.js',
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
      SMTP_FROM: preserve(),
      SMTP_USER: preserve(),
      SMTP_PASSWORD: preserve(),
      SOCIAL_IMAGE_INTERNAL_TOKEN: preserve(),
      VISOMI_OTLP_TRACING: 'false',
      VISOMI_BROWSER_TELEMETRY: 'false',
      VISOMI_BROWSER_PERFORMANCE: 'false',
      OTEL_METRICS_EXPORTER: 'none',
      OTEL_LOGS_EXPORTER: 'none',
    },
  });

  return project('visomi.dev', { resources: [gateway] });
});
