# Monolith Gateway Architecture

Patrón de arquitectura para aplicaciones web full-stack, diseñado para iterar
rápido en etapas tempranas sin sacrificar la capacidad de extraer runtimes
independientes cuando la escala lo demande.

## Filosofía

> Un repo, un entrypoint, un contenedor. Hasta que la escala obligue a separar.

Recuperar la sensación productiva de un monolito clásico (Laravel, Django, Rails)
con tooling moderno de frontend y backend. Cada runtime puede ejecutarse de forma
aislada en desarrollo y convivir en un mismo proceso en producción.

**Principios:**

- **Monolith-first.** Arrancar con un solo deploy. Dividir solo cuando haya
  presión operacional real (CPU, memoria, tráfico, aislamiento de fallos).
- **Runtime-separated.** Cada responsabilidad (API, worker, SPA, sitio público)
  vive en su propio directorio con su propio build. Puede correr standalone o
  compuesta.
- **Extraction-ready.** Si mañana la API necesita escalar independiente, se
  extrae sin reescribir. Las interfaces entre runtimes ya están definidas.
- **KISS.** Exports planos, sin factories innecesarias, sin capas de
  abstracción que no resuelvan un problema concreto.

---

## Stack Preferido

| Capa | Herramienta | Justificación |
|------|-------------|---------------|
| **Orquestración** | **Nx** + pnpm workspaces | Task running, caché, dependency graph, generators, affected commands. Es el pegamento central del monorepo. |
| **Frontend SPA** | **Angular** (preferido sobre React) | Framework completo con SSR, i18n, forms, router incluidos. Menos dependencias externas. |
| **Frontend público** | **Astro** + Node adapter | SEO, i18n, contenido estático y dinámico. Adaptador Node en modo middleware. |
| **API** | **Express 5** | Ecosistema, madurez, tipado. Preferido sobre Fastify por familiaridad del equipo. |
| **Background jobs** | **BullMQ** + Redis | Colas, workers, schedulers. Redis como broker y pub/sub cross-runtime. |
| **Base de datos** | **PostgreSQL** (Drizzle ORM o Supabase) | Drizzle para schema-as-code y migraciones. Supabase cuando se necesita auth, realtime y storage. |
| **Validación** | **Zod v4** | Schemas compartidos entre API, worker y frontend. |
| **Runtime** | **Node.js LTS** (24.x actual) | ESM para nuevos proyectos. |
| **Deploy** | **Docker** single-container | Railway, Fly.io, o VPS. Un Dockerfile, una imagen. |
| **CI** | **GitHub Actions** + Nx Cloud | Distributed task execution, affected commands. |

---

## Nx — El Orquestador Central

**Nx es el pegamento que hace viable el monolith-gateway en el día a día.**
No es solo un task runner: es el sistema que permite que múltiples apps
coexistan en un mismo repositorio sin fricción.

### Lo que Nx aporta al patrón

- **Ejecución local multi-app.** `nx run server:serve` levanta el gateway
  compuesto; `nx run api:serve` levanta solo la API en hot-reload.
  Cada desarrollador elige qué partes necesita vivas en cada momento.

- **Build dependency graph.** El build de `server` declara `dependsOn: [api,
  app, site, worker]`. Nx resuelve el orden, ejecuta en paralelo lo que
  puede, y cachea resultados. Un `nx build server` dispara 5 builds sin
  que el desarrollador piense en el orden.

- **Caché inteligente.** Si no cambiaste `apps/web/api`, Nx restaura el build
  desde caché. Esto hace que el ciclo "cambiar código → ver resultado" sea
  de segundos incluso con 5+ apps en el monorepo.

- **Affected commands.** `nx affected:test` solo ejecuta tests de los
  proyectos impactados por tus cambios. Fundamental para CI rápido.

- **Plugins.** Nx infiere targets de build, serve, test, lint, typecheck
  desde Vite, esbuild, Jest, Playwright. Cero configuración repetitiva.

- **Generators.** `nx g @nx/node:app apps/web/nueva-api` crea una app con
  project.json, tsconfig, y wiring listo en segundos.

En esencia: **sin Nx, este patrón sería un dolor mantener. Con Nx, es
trivial.** Es la primera dependencia que se instala y la base sobre la
que se construye todo lo demás.

---

## Estructura de Directorios

```
apps/
  web/
    api/          # Express API — rutas, middleware, schemas por feature
    api-e2e/      # Jest E2E para API
    app/          # Angular/React SPA — la aplicación principal
    app-e2e/      # Playwright E2E para la SPA
    site/         # Astro — landing, docs, SEO. Adaptador Node middleware.
    site-e2e/     # Playwright smoke tests
    server/       # Gateway de composición — el entrypoint público
    server-e2e/   # Jest E2E para el gateway compuesto
    realtime/     # Socket.IO (opcional) — WebSocket delivery
    realtime-e2e/ # Jest E2E para realtime
  worker/         # BullMQ — background jobs
  worker-e2e/     # Jest E2E para worker
libs/
  shared/         # Infraestructura cross-runtime: DB, Redis, logger, env, HTTP
  <domain>/       # Librerías de dominio: contratos, servicios, tipos
```

Cada app en `apps/` es un proyecto Nx independiente con su propio
`project.json`, `tsconfig` y build target.

---

## El Gateway — Pieza Central

El gateway (`apps/web/server`) es un servidor **Express** que compone todos
los runtimes en un solo proceso. Es el único entrypoint público.

### Comportamiento por Host

El gateway es **host-aware**: resuelve qué servir según el subdominio.

| Host | Path | Handler |
|------|------|---------|
| `api.<domain>` | `/*` | Express API |
| `app.<domain>` | `/*` | SPA (static + fallback) |
| `<domain>` / `www.<domain>` | `/api/*` | Express API |
| `<domain>` / `www.<domain>` | `/app/*` | SPA (static + fallback) |
| `<domain>` / `www.<domain>` | `/_astro/*`, `/assets/*` | Astro client static |
| `<domain>` / `www.<domain>` | `/*` (resto) | Astro SSR catch-all |

### Bootstrap

```typescript
// apps/web/server/src/main.ts
async function bootstrap() {
  // Dynamic imports de los builds compilados
  const apiHandler = await loadApiApp();        // dist/apps/web/api/main.js
  const astroHandler = await loadAstroHandler(); // dist/apps/web/site/server/entry.mjs

  // Worker como child process
  spawn('node', ['dist/apps/worker/main.js'], { stdio: 'inherit' });

  // Gateway Express con routing por host
  const app = createGatewayApp({ apiHandler, astroHandler, ... });

  app.listen(8080);
}
```

### Routing

```typescript
// apps/web/server/src/gateway.ts
function createGatewayApp(deps) {
  const app = express();

  // Subdominios: routers independientes
  apiSubdomain.use(apiHandler);                   // api.<domain>/*
  appSubdomain.use('/', serveSpa(webDist));       // app.<domain>/*

  // Dominio principal
  mainDomain.use('/api', apiHandler);
  mainDomain.use('/app', serveSpa(webDist));
  mainDomain.use(serveStatic(astroClientFolder));
  mainDomain.use(astroHandler);                   // catch-all SSR

  // Router por host
  app.use((req, res, next) => {
    if (req.hostname === 'api.<domain>')  return apiSubdomain(req, res, next);
    if (req.hostname === 'app.<domain>')  return appSubdomain(req, res, next);
    return mainDomain(req, res, next);
  });

  return app;
}
```

### SPA Fallback

La SPA se sirve con `express.static()` para assets y un fallback manual
para client-side routing:

```typescript
function serveSpa(distFolder: string): RequestHandler[] {
  return [
    serveStatic(distFolder, { index: false }),
    (req, res) => res.sendFile(path.join(distFolder, 'index.html')),
  ];
}
```

---

## Patrón de Composición por Runtime

Cada runtime sigue el mismo contrato: **exporta una función para composición
y tiene un entrypoint standalone para desarrollo.**

### API

```typescript
// apps/web/api/src/app.ts — exporta el app sin hacer listen
export function createApp(): Express {
  const app = express();
  // ... middleware, rutas
  return app;
}

// apps/web/api/src/main.ts — standalone entrypoint
import { createApp } from './app';
createApp().listen(3000);
```

### SPA (Angular)

```typescript
// apps/web/app/server.ts — SSR handler exportable
export function createRequestHandler(): Express {
  const app = express();
  app.use(serveStatic(browserDistFolder));
  app.use(angularApp.handle);  // SSR + SPA fallback
  return app;
}
```

### SPA (React/Vite)

- Build con `base: '/app/'` para assets bajo el prefijo correcto.
- React Router con `basename` condicional (según subdominio).
- Servir con `express.static()` + fallback a `index.html`.

### Astro

```javascript
// astro.config.mjs
export default defineConfig({
  adapter: node({ mode: 'middleware' }), // exporta handler(req, res, next)
  output: 'server',
});
```

El build produce `dist/apps/web/site/server/entry.mjs` con un `handler`
que se monta como middleware Express.

### Worker

El worker es un proceso Node independiente. El gateway lo lanza con
`spawn('node', [workerMainJs])` y maneja su ciclo de vida (SIGTERM
para graceful shutdown).

---

## Desarrollo Local (Dev Mode)

Cada app corre standalone con su dev server nativo. Nx orquesta qué
arrancar:

```bash
pnpm nx run api:serve       # Express en :3000 con hot reload
pnpm nx run app:serve       # Vite/Angular dev server en :4200
pnpm nx run site:serve      # Astro dev server en :4200
pnpm nx run server:serve    # Gateway compuesto (necesita builds previos)
```

El gateway en modo dev puede opcionalmente proxy a los dev servers en
lugar de usar los builds compilados, para un DX con hot reload completo.

---

## Build & Deploy

### Dockerfile unificado

```dockerfile
# Stage 1: Build
FROM node:24-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm nx build server  # dependsOn dispara api, app, site, worker

# Stage 2: Runtime
FROM node:24-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/apps/web/server/main.js"]
```

### Build dependencies (Nx)

```json
// apps/web/server/project.json
{
  "targets": {
    "build": {
      "dependsOn": [
        "^build",
        { "projects": ["api", "app", "site", "worker"], "target": "build" }
      ]
    }
  }
}
```

Nx garantiza que `nx build server` ejecute primero los builds de api,
app, site y worker en paralelo (si el DAG lo permite), y solo después
compile el gateway.

---

## Librerías Compartidas (`libs/`)

Código que usan dos o más runtimes va en `libs/`:

```
libs/
  shared/
    src/lib/
      db/           # Cliente DB, pool, migraciones
      redis/        # Conexión Redis, pub/sub
      env.ts         # Zod-validated environment config
      logger.ts      # Pino logger
      http.ts        # HttpError, response envelopes, error handler
  <domain>/
    src/lib/
      contracts/     # Tipos de contratos entre runtimes
      services/      # Lógica de dominio compartida
```

- Compiladas con `@nx/js:tsc`
- Referenciadas en `tsconfig.base.json` con path aliases
- Publicadas como `workspace:*` en `package.json`

---

## Principios de Diseño

1. **Feature-first organization.** Carpetas por feature (`auth/`, `projects/`),
   no por capa técnica (`services/`, `models/`, `controllers/`). El nombre
   de la carpeta dice qué hace el código.

2. **KISS module patterns.** Exports planos. Sin factories, builders ni
   wrappers innecesarios. Cada runtime exporta lo mínimo para composición.

3. **Zod para validación.** Schemas compartidos entre API, worker y frontend.
   Validación en boundaries (API input, queue jobs, env vars).

4. **Redis pub/sub para cross-runtime events.** Reemplaza event emitters
   in-process. Worker, API y realtime se comunican a través de Redis.

5. **ESM para nuevos proyectos.** `"type": "module"` en package.json de cada
   app. Dynamic `import()` en el gateway para cargar builds.

6. **Monolith-first, extraction-ready.** Todo arranca junto. Si un runtime
   necesita escalar independiente, se extrae a su propio deploy sin cambios
   arquitecturales.

7. **TypeScript strict.** `strict: true` en todo el workspace. Tipos sobre
   interfaces. Sin `any` sin justificación.

---

## Cuándo Usar Este Patrón

- **Early-stage apps** que necesitan iterar rápido.
- **Equipos pequeños** (1-3 desarrolladores).
- **E2E tests simples** — un solo proceso que levantar.
- **Deploy simple** — un Dockerfile, un comando.
- **Productos que empiezan como monolito** con la intención de extraer
  runtimes cuando la escala lo justifique.

## Cuándo NO Usarlo

- **Escala masiva desde día 1** — si ya sabes que necesitas escalar
  independientemente API y worker, sepáralos desde el inicio.
- **Equipos grandes** con ownership separado por runtime.
- **Requisitos de compliance** que exigen deploy independiente por
  componente (PCI-DSS, HIPAA).
- **Runtimes con requisitos de infraestructura radicalmente distintos**
  (ej. GPU para ML, WebAssembly, edge functions).
