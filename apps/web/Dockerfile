# Build stage
FROM oven/bun:1-debian AS base
WORKDIR /app

COPY . .

RUN bun install
RUN bun run --filter @ember-galaxies/web build

FROM nginx:alpine AS production
COPY --from=base /app/apps/web/dist /usr/share/nginx/html
COPY --from=base /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
