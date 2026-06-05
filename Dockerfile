# ============================================
# Stage 1: Build H5 miniapp
# ============================================
FROM node:20-alpine AS miniapp-build

RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

WORKDIR /app/miniapp

COPY miniapp/package.json miniapp/pnpm-lock.yaml miniapp/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY miniapp/ ./

RUN pnpm run build:h5

# ============================================
# Stage 2: Build Nuxt server
# ============================================
FROM node:20-alpine AS server-build

RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

WORKDIR /app/server

COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy H5 build output into Nitro's public directory
COPY --from=miniapp-build /app/miniapp/dist/build/h5 /app/server/public/h5

COPY server/ ./

RUN pnpm run build

# ============================================
# Stage 3: Production image (Nitro only, no nginx/supervisord)
# ============================================
FROM node:20-alpine AS production

# postgresql-client needed for migration scripts in entrypoint
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy server build output
COPY --from=server-build /app/server/.output /app/server

# Copy migration files and seed scripts for entrypoint
COPY --from=server-build /app/server/server/db/migrations /app/server/server/db/migrations
COPY --from=server-build /app/server/scripts /app/server/scripts
COPY --from=server-build /app/server/node_modules /app/server/node_modules

# Copy and set entrypoint script
COPY deploy/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 5200 (Nitro handles all routing)
EXPOSE 5200

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5200/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
