# Build for the Kvitkova Povnya storefront (Next.js 16 + Payload CMS).
#
# `next build` prerenders several storefront pages against the database, so
# it can't run at `docker build` time (no DB is reachable there). Instead
# this image ships full source + node_modules and builds on container start,
# once docker-compose's `depends_on: db: condition: service_healthy` has
# guaranteed Postgres is actually up. First boot is slower (~build time);
# restarts after that just re-run the same build. This also means changing
# NEXT_PUBLIC_SERVER_URL only needs a container restart, not an image rebuild.
#
# Full node_modules (not a trimmed `next build` standalone output) also means
# one-off admin scripts run on the server exactly like local dev —
# e.g. `docker compose exec app npm run seed`.

FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Applies to every process in this container, including one-off scripts run
# via `docker compose exec app ...` — keeps Payload's migration-based (not
# dev push-based) schema behavior consistent everywhere, not just in the
# `next start` server process.
ENV NODE_ENV=production
# Opts into `prodMigrations` (see payload.config.ts) — real deploys run
# `payload migrate` against a fresh/empty database, never dev-style push.
ENV PAYLOAD_USE_MIGRATIONS=true

CMD ["sh", "-c", "npm run payload migrate && npm run build && npm run start"]
