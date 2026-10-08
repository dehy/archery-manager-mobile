#!/bin/sh
# Refresh the pinned API contract from the backend repository, then regenerate the types.
# Usage: npm run api:sync [ref]   (ref defaults to main)
set -eu
cd "$(dirname "$0")/.."
REF="${1:-main}"
gh api "repos/dehy/archery-manager/contents/docs/api/openapi.yaml?ref=$REF" --jq .content | base64 -d > api/openapi.yaml
npm run --silent api:generate
echo "Synced api/openapi.yaml from dehy/archery-manager@$REF"
