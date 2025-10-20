#!/usr/bin/env bash
# Simple smoke script to test auth endpoints
set -euo pipefail
BASE=http://localhost:4000/api
EMAIL=test+smoke@example.com
PASS=password

# register (ignore error if exists)
curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' -d "{\"email\": \"$EMAIL\", \"password\": \"$PASS\"}" || true

# login
TOKEN=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\": \"$EMAIL\", \"password\": \"$PASS\"}" | jq -r .token)
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Login failed"
  exit 2
fi

# health
curl -s "$BASE/health" | jq .

echo "OK"
