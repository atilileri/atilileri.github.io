#!/usr/bin/env bash
# PROTOTYPE for issue #141 - throwaway. Blind level probe over a manifest of texts.
set -u
S="$(dirname "$0")"
NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a   # scratch, empty
CLI=$HOME/.local/bin/notebooklm
MODE=${1:-blind}          # blind | labelled
N=${2:-3}
OUT=$S/results-$MODE.tsv
mkdir -p "$S/answers"
: > "$OUT"
while IFS=$'\t' read -r LABEL TRUTH REL; do
  if [ "$MODE" = blind ]; then F="$S/clean/$REL"; else F="$S/cal/$REL"; fi
  W=$(wc -w < "$F")
  P=$(mktemp)
  {
    echo "You are shown a transcript of spoken Dutch. Judge the CEFR level of the Dutch language in it,"
    echo "for a learner preparing for the Staatsexamen NT2. Ignore the topic. Judge only the language."
    echo "Answer in exactly this format and add nothing else:"
    echo "LEVEL: <A1|A2|B1|B2|C1>"
    echo "CONFIDENCE: <low|medium|high>"
    echo "WHY: <one sentence>"
    echo
    if [ "$MODE" = labelled ]; then
      echo "TITLE: $(basename "$REL" .txt)"
      echo
    fi
    echo "TRANSCRIPT:"
    cat "$F"
  } > "$P"
  for i in $(seq 1 "$N"); do
    t0=$(date +%s)
    A=$($CLI --quiet ask --prompt-file "$P" -n "$NB" --new --yes 2>&1)
    t1=$(date +%s)
    printf '%s\n' "$A" > "$S/answers/$MODE-$LABEL-$i.txt"
    LVL=$(printf '%s' "$A" | grep -oE 'LEVEL:[[:space:]]*[ABC][12]' | head -1 | grep -oE '[ABC][12]')
    CNF=$(printf '%s' "$A" | grep -oiE 'CONFIDENCE:[[:space:]]*(low|medium|high)' | head -1 | grep -oiE '(low|medium|high)')
    printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$MODE" "$LABEL" "$TRUTH" "${LVL:-NONE}" "${CNF:-none}" "$((t1-t0))" "$W" >> "$OUT"
  done
  rm -f "$P"
done < "$S/manifest.tsv"
echo "DONE $MODE"
