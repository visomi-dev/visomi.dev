export const year = new Date().getFullYear();

export const currentFocusSnippet = String.raw`const currentPlatform = {
  automation: createPipeline({
    runtime: ['NestJS', 'Puppeteer', 'BullMQ'],
    storage: ['Redis', 'SQLite'],
    maintenance: 'JSON-driven rules',
  }),
  aiSolutions: {
    frontend: ['React', 'React Router v7', 'Zustand', 'React Hook Form', 'Zod'],
    backend: ['FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL'],
    agents: ['CrewAI', 'Python domain services'],
  },
};`;

export const architectureSnippet = String.raw`workspace/
  apps/
    shell
    pricing
    analytics
  libs/
    ui
    api-contracts
    validation

// reusable foundations for teams and faster delivery`;

export const foundationsSnippet = String.raw`for ticket in incidents:
    diagnose(ticket)
    automate_if_repeatable(ticket)

deploy('python-scripts')
learn('django', 'linux', 'networks')
build('from support into software')`;
