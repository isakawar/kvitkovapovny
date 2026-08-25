#!/usr/bin/env bash
# Run this ON THE SERVER, from the project root, after copying dump.sql and
# media.tar.gz there (see scripts/export-for-deploy.sh). Loads your local
# dev content — products, categories, hero, pricing plans, everything — into
# the server's database and media volume, so you don't have to re-enter any
# of it in the admin panel.
#
# Usage: ./scripts/import-on-server.sh
# Safe to re-run: it drops/recreates tables from the dump each time.

set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f dump.sql ] || [ ! -f media.tar.gz ]; then
  echo "dump.sql and/or media.tar.gz not found in $(pwd)."
  echo "Copy them here first (see scripts/export-for-deploy.sh), then re-run."
  exit 1
fi

echo "Starting the database..."
docker compose up -d db

echo "Waiting for Postgres to be healthy..."
DB_CID=$(docker compose ps -q db)
until [ "$(docker inspect -f '{{.State.Health.Status}}' "$DB_CID")" = "healthy" ]; do
  sleep 2
done

echo "Restoring database dump..."
docker compose exec -T db psql -U payload -d kvitkova < dump.sql

# The dump comes from a dev-push-synced database (no formal migration
# history), so Payload's migration tracking needs to be told the schema is
# already current — otherwise `payload migrate` on app startup will try to
# recreate tables that already exist from the restore.
echo "Marking the schema as already migrated..."
docker compose exec -T db psql -U payload -d kvitkova -c "
  delete from payload_migrations;
  insert into payload_migrations (name, batch) values ('20260825_103829_initial_schema', 1);
"

echo "Building and starting the app..."
docker compose up -d --build app

echo "Waiting for the app container to exist..."
until docker compose ps -q app | grep -q .; do
  sleep 1
done
APP_CID=$(docker compose ps -q app)

echo "Restoring uploaded media..."
docker cp media.tar.gz "$APP_CID":/tmp/media.tar.gz
docker exec "$APP_CID" sh -c "mkdir -p /app/media && tar -xzf /tmp/media.tar.gz -C /app/media && rm /tmp/media.tar.gz"

echo ""
echo "Done! Your local dev content is now live on the server."
echo "The app is still building on first boot — check progress with:"
echo "  docker compose logs -f app"
