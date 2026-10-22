#!/usr/bin/env bash
# Draws one Picture in the Oracle's scratch notebook and writes
# public/images/nederlands/<owner>.webp. Run it from the repo root, in the
# background: the page that shows the Picture is already written (ORACLE.md).
#
#   draw.sh <scratch-id> <owner> <style> <scene> <instruction>
set -euo pipefail
nb=$1 owner=$2 style=$3 scene=$4 instruction=$5
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

src=$(notebooklm --quiet source add --type text --title "$owner" "$scene" -n "$nb" --json | jq -r .source.id)
task=$(notebooklm --quiet generate infographic "$instruction" -n "$nb" -s "$src" --style "$style" \
  --language tr --orientation square --detail concise --wait --json | jq -r .task_id)
notebooklm --quiet download infographic -n "$nb" -a "$task" "$tmp/$owner.png" >/dev/null
notebooklm --quiet source delete "$src" -n "$nb" -y >/dev/null

mkdir -p public/images/nederlands
ffmpeg -loglevel error -y -i "$tmp/$owner.png" -vf scale=900:-1 -quality 75 "public/images/nederlands/$owner.webp"
echo "public/images/nederlands/$owner.webp"
