#!/usr/bin/env bash
set -euo pipefail

# A convenience script to start the full stack for local development.
# Usage: run from the repo root: ./scripts/start-local.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$ROOT_DIR/server"
LOG_DIR="/tmp"
SERVER_LOG="$LOG_DIR/phelper-server.log"
FRONTEND_LOG="$LOG_DIR/phelper-frontend.log"
SERVER_PID_FILE="$LOG_DIR/phelper-server.pid"
FRONTEND_PID_FILE="$LOG_DIR/phelper-frontend.pid"

echo "Repository root: $ROOT_DIR"

# 1) Start Postgres via Docker Compose (server/docker-compose.yml)
echo "Starting Postgres (docker compose)..."
(cd "$SERVER_DIR" && docker compose up -d)

# 2) Install server deps
echo "Installing server dependencies..."
(cd "$SERVER_DIR" && npm install)

# 3) Attempt Prisma migrations (may fail if Postgres is still initializing)
echo "Running Prisma migrations (safe to re-run)..."
# allow migration to fail without exiting the script
(cd "$SERVER_DIR" && npx prisma migrate dev --schema=prisma/schema.prisma) || true

# 4) Start backend (TypeScript) with ts-node-dev in background
echo "Starting backend (ts-node-dev) — logs: $SERVER_LOG"
# Start backend in server dir; capture PID
(cd "$SERVER_DIR" && nohup npx ts-node-dev --respawn --transpile-only src/server.ts > "$SERVER_LOG" 2>&1 & echo $! > "$SERVER_PID_FILE")

echo "Backend started with PID: $(cat "$SERVER_PID_FILE")"

# 5) Install root deps and start frontend (Vite) in background
echo "Installing frontend dependencies (root)..."
(cd "$ROOT_DIR" && npm install)

echo "Starting frontend (Vite) — logs: $FRONTEND_LOG"
(cd "$ROOT_DIR" && nohup npm run dev > "$FRONTEND_LOG" 2>&1 & echo $! > "$FRONTEND_PID_FILE")

echo "Frontend started with PID: $(cat "$FRONTEND_PID_FILE")"

# 6) Give services a moment to come up and run quick health checks
sleep 3

# Backend health
echo -n "Checking backend health (http://localhost:4000/api/health) ... "
if curl -sSf http://localhost:4000/api/health >/dev/null; then
  echo "OK"
else
  echo "DOWN — check $SERVER_LOG"
fi

# Frontend health
echo -n "Checking frontend (http://localhost:5173) ... "
if curl -sSf http://localhost:5173 >/dev/null; then
  echo "OK"
else
  echo "DOWN — check $FRONTEND_LOG"
fi

# Summary
cat <<EOF

Started services (logs):
- Backend log : $SERVER_LOG
- Frontend log: $FRONTEND_LOG

PIDs:
- Backend PID file : $SERVER_PID_FILE
- Frontend PID file: $FRONTEND_PID_FILE

Notes:
- If Prisma migrations fail because Postgres is still initializing, re-run this script or run:
    cd server && npx prisma migrate dev --schema=prisma/schema.prisma
- To view logs:
    tail -f $SERVER_LOG
    tail -f $FRONTEND_LOG
- To stop the docker Postgres:
    cd server && docker compose down
EOF
