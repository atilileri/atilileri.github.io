#!/usr/bin/env bash
# PROTOTYPE — route 1: Oracle infographic in the scratch notebook.
set -u
NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a
cd "$(dirname "$0")"
date +%s > t_start
notebooklm source add -n $NB --type text --title "PROTOTYPE hook gordijn" "$(cat ../hook.md)" --json > source.json 2>&1
sleep 20
PROMPT="One single illustration of this memory scene, no statistics, no bullet lists: an angry chef in white chef's clothes with a name tag reading GORDON hides behind a long living-room curtain, raising a padel racket like a spatula; only his shoes under the curtain and his furious face at its edge are visible; the curtain is labelled 'gordijn'. Big picture, very little text."
for style in sketch-note kawaii clay; do
  s=$(date +%s)
  notebooklm generate infographic -n $NB --style $style --orientation square --detail concise --wait --timeout 900 --json "$PROMPT" > gen-$style.json 2>&1
  echo "$style $(( $(date +%s) - s ))s exit=$?" >> timings.txt
done
notebooklm download infographic --help > download-help.txt 2>&1
