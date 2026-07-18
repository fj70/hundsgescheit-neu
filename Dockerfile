# hundsgescheit.de — Next.js 16 (standalone) + SQLite. Fuer Coolify.
FROM node:22-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# DB zuerst anlegen + seeden — der Build (SSG/generateStaticParams) liest die DB aus.
RUN mkdir -p /app/seed \
    && DATABASE_URL="file:/app/seed/prod.db" npx prisma migrate deploy \
    && DATABASE_URL="file:/app/seed/prod.db" npx tsx prisma/seed.ts
RUN DATABASE_URL="file:/app/seed/prod.db" npm run build

# ---- Runner (schlank) ----
FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/seed/prod.db ./seed/prod.db
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
# DB liegt auf einem Volume (persistiert ueber Deploys)
ENV DATABASE_URL="file:/app/data/prod.db"
EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
