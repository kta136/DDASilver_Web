FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

ARG SOURCE_COMMIT=development
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_ENV
ARG NEXT_PUBLIC_SANITY_PROJECT_ID
ARG NEXT_PUBLIC_SANITY_DATASET
ARG NEXT_PUBLIC_GA_ID
ARG ENABLE_LEGACY_REDIRECTS

ENV NEXT_DEPLOYMENT_ID=${SOURCE_COMMIT} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_SITE_ENV=${NEXT_PUBLIC_SITE_ENV} \
    NEXT_PUBLIC_SANITY_PROJECT_ID=${NEXT_PUBLIC_SANITY_PROJECT_ID} \
    NEXT_PUBLIC_SANITY_DATASET=${NEXT_PUBLIC_SANITY_DATASET} \
    NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID} \
    ENABLE_LEGACY_REDIRECTS=${ENABLE_LEGACY_REDIRECTS}

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner

ARG SOURCE_COMMIT=development

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NEXT_DEPLOYMENT_ID=${SOURCE_COMMIT} \
    APP_VERSION=${SOURCE_COMMIT} \
    SOURCE_COMMIT=${SOURCE_COMMIT}

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
