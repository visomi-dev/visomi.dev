FROM node:24-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

FROM base AS deps

WORKDIR /workspace

COPY package.json pnpm-lock.yaml nx.json tsconfig.base.json ./

RUN pnpm install --frozen-lockfile

FROM deps AS build

ARG ASTRO_DB_REMOTE_URL
ARG ASTRO_DB_APP_TOKEN

ENV ASTRO_DB_REMOTE_URL=$ASTRO_DB_REMOTE_URL
ENV ASTRO_DB_APP_TOKEN=$ASTRO_DB_APP_TOKEN

COPY . .

RUN pnpm nx run-many -t build --projects server,worker --configuration production

FROM base AS runtime-base

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /workspace/dist ./dist
COPY --from=build /workspace/dist/libs/shared/social-images ./node_modules/@visomi.dev/shared-social-images

FROM runtime-base AS server-runtime

EXPOSE 8080

CMD ["node", "dist/apps/server/main.js"]

FROM runtime-base AS worker-runtime

RUN apt-get update \
  && apt-get install --yes --no-install-recommends chromium ca-certificates fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["node", "dist/apps/worker/main.js"]

FROM server-runtime AS runtime
