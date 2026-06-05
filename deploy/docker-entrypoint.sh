#!/bin/sh
set -e

echo "==> Running database migrations..."

# Wait for PostgreSQL to be ready
until pg_isready -h "${DB_HOST:-db}" -p 5432 -U postgres 2>/dev/null; do
  echo "Waiting for database..."
  sleep 2
done

# Run all migration SQL files in order
for f in /app/server/server/db/migrations/*.sql; do
  if [ -f "$f" ]; then
    echo "Applying migration: $(basename "$f")"
    PGPASSWORD="${DB_PASSWORD:-postgres}" psql \
      -h "${DB_HOST:-db}" \
      -U postgres \
      -d zhongai \
      -f "$f" \
      --set ON_ERROR_STOP=1 \
      || echo "Migration $(basename "$f") may have already been applied, continuing..."
  fi
done

echo "==> Migrations complete."

# Seed admin if needed
if [ -f /app/server/scripts/seed-admin.cjs ]; then
  echo "==> Running admin seed (if not exists)..."
  cd /app/server && node scripts/seed-admin.cjs || echo "Admin seed skipped (may already exist)"
fi

echo "==> Starting server on port 5200..."
exec node /app/server/server/index.mjs
