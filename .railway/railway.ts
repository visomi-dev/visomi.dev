import { defineRailway, github, project, service } from 'railway/iac';

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

// This is the single-service migration of railway.json. The other services and volumes stay outside this partial.
export const railwayDefinition = defineRailway(() => {
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
    replicas: { 'us-east4-eqdc4a': 1 },
    deploy: {
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 3,
      drainingSeconds: 10,
      limitOverride: { containers: { cpu: 1, memoryBytes: 1000000000 } },
    },
    // Apex and www remain registered in Railway with their existing target ports.
    networking: { privateNetworkEndpoint: 'visomidev' },
  });

  // Match `config migrate --variables unmanaged` and keep every Railway variable and reference intact.
  return { ...project('visomi', { resources: [gateway] }), variables: { managed: false } };
});

export default railwayDefinition;
