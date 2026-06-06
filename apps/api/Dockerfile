# WinMarket V2 API - Production Dockerfile
FROM oven/bun:1.1-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY ../../package.json ../../bun.lock* ../../
COPY ../../packages ./packages

# Install dependencies
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS builder
WORKDIR /app

# Copy source code and dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY ../../packages ./packages

# Generate Prisma client and build
RUN bun run db:generate
RUN bun run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle

# Copy environment template
COPY --chown=nodejs:nodejs .env.production .env.production.template

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version && curl -f http://localhost:4001/health || exit 1

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 4000 4001

# Start the application
CMD ["bun", "run", "dist/index.js"]