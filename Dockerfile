# ----------- Build Stage -----------
FROM node:lts-slim AS builder

WORKDIR /usr/src/app

# Install dependencies needed during build (with no recommended packages)
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Set build-time environment variable
ARG NEXT_PUBLIC_BASE_URL=https://sar-stg-prmt-portal-api.wulooj.com/api
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

# Install dependencies
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY . .

# Build application
RUN --mount=type=cache,target=/usr/src/app/.next/cache \
    yarn build

# ----------- Production Stage -----------
FROM node:lts-slim AS runner

WORKDIR /usr/src/app

# Create non-root user
RUN useradd -m -s /bin/bash appuser

# Install curl for healthcheck (Trivy-compliant)
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy only required files from build stage
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/yarn.lock ./yarn.lock
COPY --from=builder /usr/src/app/next.config.js ./next.config.js

# Install only production dependencies
RUN --mount=type=cache,target=/root/.cache/yarn \
    yarn install --frozen-lockfile --production --network-timeout 100000 && \
    yarn cache clean

# Set correct ownership
RUN chown -R appuser:appuser /usr/src/app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_BASE_URL=https://sar-stg-prmt-portal-api.wulooj.com/api

# Start the application
CMD ["yarn", "start"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1
