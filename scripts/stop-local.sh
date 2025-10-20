#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$ROOT_DIR/server"
LOG_DIR="/tmp"
SERVER_PID_FILE="$LOG_DIR/phelper-server.pid"
FRONTEND_PID_FILE="$LOG_DIR/phelper-frontend.pid"

# Kill backgrounded server if running
if [ -f "$SERVER_PID_FILE" ]; then
  PID=$(cat "$SERVER_PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "Killing backend PID $PID"
    kill "$PID" || true
  fi
  rm -f "$SERVER_PID_FILE"
fi

# Kill frontend
if [ -f "$FRONTEND_PID_FILE" ]; then
  PID=$(cat "$FRONTEND_PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "Killing frontend PID $PID"
    kill "$PID" || true
  fi
  rm -f "$FRONTEND_PID_FILE"
fi

# Bring down docker compose
echo "Stopping Postgres (docker compose down)..."
(cd "$SERVER_DIR" && docker compose down)

echo "Stopped. To clean logs, remove /tmp/phelper-*-*.log if desired."