#!/usr/bin/env bash
# PROTOTYPE for issue #141 - throwaway. Judge each video twice: transcript alone, then with its title.
set -u
S="$(dirname "$0")"; NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a; CLI=$HOME/.local/bin/notebooklm
: > "$S/results-video.tsv"
while IFS=$'\t' read -r TAG EXP ID TITLE; do
  for MODE in blind labelled; do
    P=$(mktemp)
    {
      echo "You are shown a transcript of spoken Dutch from a video. Judge the CEFR level of the Dutch in it,"
      echo "for a learner preparing for the Staatsexamen NT2 at B1. Ignore the topic. Judge only the language."
      echo "Answer in exactly this format and add nothing else:"
      echo "LEVEL: <A1|A2|B1|B2|C1>"
      echo "CONFIDENCE: <low|medium|high>"
      echo "WHY: <one sentence>"
      echo
      [ "$MODE" = labelled ] && { echo "VIDEO TITLE: $TITLE"; echo; }
      echo "TRANSCRIPT:"
      cat "$S/vid/$TAG-clean.txt"
    } > "$P"
    for i in 1 2 3; do
      t0=$(date +%s)
      A=$($CLI --quiet ask --prompt-file "$P" -n "$NB" --new --yes 2>&1)
      t1=$(date +%s)
      printf '%s\n' "$A" > "$S/answers/video-$MODE-$TAG-$i.txt"
      L=$(printf '%s' "$A" | grep -oE 'LEVEL:[[:space:]]*[ABC][12]' | head -1 | grep -oE '[ABC][12]')
      C=$(printf '%s' "$A" | grep -oiE 'CONFIDENCE:[[:space:]]*(low|medium|high)' | head -1 | grep -oiE '(low|medium|high)')
      printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$TAG" "$EXP" "$MODE" "${L:-NONE}" "${C:-none}" "$((t1-t0))" >> "$S/results-video.tsv"
    done
    rm -f "$P"
  done
done < "$S/vid/final.tsv"
echo "DONE video"
