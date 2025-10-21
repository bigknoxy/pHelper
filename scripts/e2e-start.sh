#!/usr/bin/env bash
# Starts DB, backend, and frontend in order and waits for backend health
# Usage: bash scripts/e2e-start.sh
set -euo pipefail
export PATH="$PATH:./node_modules/.bin"
# Start DB (docker compose in server/)
echo "Starting DB via docker compose..."
cd server
docker compose up -d
cd -
# Start backend migrations and server in background
echo "Starting backend (prisma migrate && ts-node-dev)..."
# run migrate (non-failing) then start server using ts-node-dev
(cd server && npx prisma migrate deploy --schema=prisma/schema.prisma || true &)
# Start the backend server in background
(cd server && npx ts-node-dev --respawn --transpile-only src/server.ts &) 
# Wait for backend health
BACKEND_URL=${BACKEND_URL:-http://localhost:4000}
HEALTH_URL="$BACKEND_URL/api/health"
echo "Waiting for backend health at $HEALTH_URL"
SECONDS=0
TIMEOUT=240
until curl -sSf "$HEALTH_URL" >/dev/null; do
  if [ "$SECONDS" -ge "$TIMEOUT" ]; then
    echo "Timeout waiting for backend health"
    exit 1
  fi
  sleep 1
done
echo "Backend healthy after $SECONDS seconds"
# Start client
echo "Starting client (vite)..."
# Start vite in background
(npx vite &) 
# Wait for frontend
FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}
echo "Waiting for frontend at $FRONTEND_URL"
SECONDS=0
TIMEOUT=120
until curl -sSf "$FRONTEND_URL" >/dev/null; do
  if [ "$SECONDS" -ge "$TIMEOUT" ]; then
    echo "Timeout waiting for frontend"
    exit 1
  fi
  sleep 1
done
echo "Frontend ready after $SECONDS seconds"
# Keep the script running so Playwright can reuse the started servers if needed
# Tail /dev/null will block forever without using much CPU
tail -f /dev/null
