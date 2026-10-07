# ==============================================================================
# Multi-stage Dockerfile for Consultorio Urbano Backend API
# ==============================================================================

# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for compiling
COPY package*.json ./
RUN npm ci

# Copy TypeScript configs and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Security: Run as unprivileged node user
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "dist/index.js"]
