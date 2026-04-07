FROM node:24-alpine AS base

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

RUN pnpm nx run server:build:production

FROM base AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /workspace/dist ./dist

EXPOSE 8080

CMD ["node", "dist/apps/server/main.js"]
