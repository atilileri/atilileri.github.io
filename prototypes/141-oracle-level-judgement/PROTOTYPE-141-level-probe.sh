#!/usr/bin/env bash
# PROTOTYPE for issue #141 - throwaway, not production.
# Asks the Oracle to rate one Dutch text blind, N times, fresh context each time.
# Usage: PROTOTYPE-141-level-probe.sh <textfile> <label> <repeats>
set -u
NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a   # scratch, empty
CLI=$HOME/.local/bin/notebooklm
TXT=$1; LABEL=$2; N=${3:-3}
P=$(mktemp)
{
  echo "You are shown a transcript of spoken Dutch. Judge the CEFR level of the Dutch language in it,"
  echo "for a learner preparing for the Staatsexamen NT2. Ignore the topic. Judge only the language."
  echo "Answer in exactly this format and add nothing else:"
  echo "LEVEL: <A1|A2|B1|B2|C1>"
  echo "CONFIDENCE: <low|medium|high>"
  echo "WHY: <one sentence>"
  echo
  echo "TRANSCRIPT:"
  cat "$TXT"
} > "$P"
for i in $(seq 1 "$N"); do
  t0=$(date +%s)
  OUT=$($CLI --quiet ask --prompt-file "$P" -n "$NB" --new --yes 2>&1)
  t1=$(date +%s)
  LVL=$(printf '%s' "$OUT" | grep -o 'LEVEL:[^\n]*' | head -1)
  CNF=$(printf '%s' "$OUT" | grep -o 'CONFIDENCE:[^\n]*' | head -1)
  printf '%s\trun%d\t%ss\t%s\t%s\n' "$LABEL" "$i" "$((t1-t0))" "${LVL:-NO-LEVEL}" "${CNF:-}"
  printf '%s\n' "$OUT" > "$(dirname "$TXT")/../out-$LABEL-$i.txt"
done
rm -f "$P"
