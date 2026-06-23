#!/usr/bin/env bash
set -euo pipefail

# Export onus-gtm-lite to a standalone directory ready for git init + push.
#
# Usage:
#   ./scripts/export-repo.sh [target-dir]
#
# Example:
#   ./scripts/export-repo.sh ../onus-gtm-lite-standalone

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="${1:-../onus-gtm-lite-standalone}"

echo "Exporting OnusGTM Lite from:"
echo "  $SOURCE_DIR"
echo "to:"
echo "  $TARGET_DIR"

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

rsync -a \
  --exclude node_modules \
  --exclude dist \
  --exclude .env \
  --exclude data/documents/* \
  --exclude data/chunks.json \
  --exclude data/generations.json \
  --exclude data/documents-index.json \
  "$SOURCE_DIR/" "$TARGET_DIR/"

cat <<EOF

Export complete.

Next steps:
  cd "$TARGET_DIR"
  cp .env.example .env
  # Edit .env and set OPENAI_API_KEY=sk-...
  npm install
  npm run dev
  # Open http://localhost:5173

Optional — initialize a new git repository:
  git init
  git add .
  git commit -m "Initial commit: OnusGTM Lite"
  git remote add origin <your-remote-url>
  git push -u origin main

EOF
