import { defineRailway, github, project, service, type ServiceConfigInput } from 'railway/iac';

export const partial = 'visomi.dev';

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

export const gatewayConfig = {
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
  replicas: { 'us-east4-eqdc4a': 1 },
  deploy: {
    restartPolicyType: 'ON_FAILURE',
    restartPolicyMaxRetries: 3,
    drainingSeconds: 10,
    limitOverride: { containers: { cpu: 1, memoryBytes: 1000000000 } },
  },
  networking: { privateNetworkEndpoint: 'visomidev' },
} satisfies ServiceConfigInput;

// The single-service migration leaves the other resources and both registered domains in Railway.
export const railwayDefinition = defineRailway(() => {
  const gateway = service('visomi.dev', gatewayConfig);

  // Match `config migrate --variables unmanaged` and keep every Railway variable and reference intact.
  return { ...project('visomi', { resources: [gateway] }), variables: { managed: false } };
});

export default railwayDefinition;
