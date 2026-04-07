# Build stage - use bun for fast builds
FROM oven/bun:1-debian AS base
WORKDIR /app

# Copy entire monorepo for workspace deps
COPY . .

# Install deps (including devDependencies for vite)
RUN bun install

# Build the web app
RUN bun run --filter @ember-galaxies/web build

# Production stage - use node:22 for runtime compatibility
FROM node:22-alpine AS production
WORKDIR /app

# Install bun for running vite
RUN npm install -g bun

# Copy built artifacts and node_modules
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/web/dist ./dist
COPY --from=base /app/apps/web/package.json ./package.json

EXPOSE 5173

# Run with node directly (not bunx) for Node.js 22 compatibility
CMD ["node", "node_modules/vite/bin/vite.js", "preview", "--port", "5173", "--host"]
