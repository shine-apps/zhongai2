#!/bin/sh
set -e

# Parse DATABASE_URL (postgresql://user:password@host:port/dbname)
# Extract components using shell parameter expansion
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@db:5432/zhongai}"
# Strip protocol and credentials -> host:port/dbname
db_authority=$(echo "$DB_URL" | sed -E 's|^.*://||; s|^.*@||')
db_host=$(echo "$db_authority" | sed -E 's|[:/].*||')
db_port=$(echo "$db_authority" | sed -E 's|^[^:/]*||; s|^/.*||; s|^:||')
db_port="${db_port:-5432}"

echo "==> Running database migrations..."
echo "    Database host: ${db_host}:${db_port}"

# Wait for PostgreSQL to be ready
until pg_isready -h "$db_host" -p "$db_port" 2>/dev/null; do
  echo "Waiting for database..."
  sleep 2
done

# Run all migration SQL files in order
for f in /app/server/server/db/migrations/*.sql; do
  if [ -f "$f" ]; then
    echo "Applying migration: $(basename "$f")"
    psql "$DB_URL" \
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
