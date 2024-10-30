FROM imbios/bun-node:latest-current-slim AS build
WORKDIR /usr/src/app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:distroless
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/server.mjs ./dist/visomi.dev/server.mjs
EXPOSE 8080
ENTRYPOINT [ "bun", "dist/visomi.dev/server.mjs" ]
