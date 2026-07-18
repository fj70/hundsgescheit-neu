#!/bin/sh
set -e

# Beim ersten Start: geseedte DB aufs Volume kopieren (bleibt dann erhalten).
mkdir -p /app/data /app/public/uploads/cms
if [ ! -f /app/data/prod.db ]; then
  echo "→ Erstes Hochfahren: initialisiere Datenbank aus Seed."
  cp /app/seed/prod.db /app/data/prod.db
fi

exec node server.js
