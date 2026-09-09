#!/usr/bin/env bash
# PROTOTYPE for issue #141 - throwaway. Ask about the source itself, not a pasted transcript.
# Blind arm: the source is renamed to a neutral name first. Labelled arm: the real title is restored.
set -u
S="$(dirname "$0")"; NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a; CLI=$HOME/.local/bin/notebooklm
Q='Judge the CEFR level of the Dutch language in the attached source, for a learner preparing for the Staatsexamen NT2 at B1. Ignore the topic; judge only the language. Answer in exactly this format and nothing else: LEVEL: <A1|A2|B1|B2|C1> / CONFIDENCE: <low|medium|high> / WHY: <one sentence>'
: > "$S/results-video2.tsv"
while IFS=$'\t' read -r TAG EXP ID TITLE; do
  for MODE in blind labelled; do
    if [ "$MODE" = blind ]; then NEW="bron"; else NEW="$TITLE"; fi
    $CLI --quiet source rename "$ID" "$NEW" -n "$NB" --json >/dev/null 2>&1
    for i in 1 2 3; do
      t0=$(date +%s)
      A=$($CLI --quiet ask "$Q" -n "$NB" -s "$ID" --new --yes 2>&1)
      t1=$(date +%s)
      printf '%s\n' "$A" > "$S/answers/v2-$MODE-$TAG-$i.txt"
      L=$(printf '%s' "$A" | grep -oE 'LEVEL:[[:space:]]*[ABC][12]' | head -1 | grep -oE '[ABC][12]')
      C=$(printf '%s' "$A" | grep -oiE 'CONFIDENCE:[[:space:]]*(low|medium|high)' | head -1 | grep -oiE '(low|medium|high)')
      printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$TAG" "$EXP" "$MODE" "${L:-NONE}" "${C:-none}" "$((t1-t0))" >> "$S/results-video2.tsv"
    done
  done
done < "$S/vid/final.tsv"
echo "DONE video2"
