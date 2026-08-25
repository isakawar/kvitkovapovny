#!/usr/bin/env bash
# Run this LOCALLY (in the project root) to package everything you've
# configured in the dev admin panel — products, categories, hero, pricing
# plans, formats section, uploaded photos, etc. — so it can be loaded onto
# the server without redoing any of it by hand.
#
# Usage: ./scripts/export-for-deploy.sh
# Then copy the output to the server, e.g.:
#   scp deploy-export/dump.sql deploy-export/media.tar.gz user@server:/path/to/kvitkova-povnya/
# and run scripts/import-on-server.sh there.

set -euo pipefail
cd "$(dirname "$0")/.."

DB_CONTAINER="kvitkova-dev-postgres"
OUT_DIR="deploy-export"
mkdir -p "$OUT_DIR"

echo "Dumping local dev database from $DB_CONTAINER..."
docker exec "$DB_CONTAINER" pg_dump -U payload -d kvitkova --clean --if-exists --no-owner --no-privileges \
  > "$OUT_DIR/dump.sql"

echo "Archiving uploaded media..."
tar -czf "$OUT_DIR/media.tar.gz" -C media .

echo ""
echo "Done. Created:"
echo "  $OUT_DIR/dump.sql   ($(du -h "$OUT_DIR/dump.sql" | cut -f1))"
echo "  $OUT_DIR/media.tar.gz  ($(du -h "$OUT_DIR/media.tar.gz" | cut -f1))"
echo ""
echo "Copy both to the server's project directory, then run scripts/import-on-server.sh there:"
echo "  scp $OUT_DIR/dump.sql $OUT_DIR/media.tar.gz <user>@<server>:/path/to/kvitkova-povnya/"
