#!/usr/bin/env bash
# Builds the zip to upload to the Chrome Web Store (manifest.json at the root of the zip).
set -euo pipefail
cd "$(dirname "$0")/.."

npm test

version=$(node -p "require('./extension/manifest.json').version")
mkdir -p dist
out="dist/leetcode-autocomplete-${version}.zip"
rm -f "$out"
(cd extension && zip -rq "../$out" . -x '.*' -x '*/.*')
echo "Created $out"
