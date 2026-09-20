#!/usr/bin/env bash
# PROTOTYPE #90 — draw every Picture the rules allow, through the Oracle.
# Route locked by #146/#147; budget by #131 (ten per Session, five unprompted + five offered).
# One retry on failure, then no image (#147). Logs everything to log.txt.
set -u
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:$PATH"

NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a          # the Oracle's scratch notebook
OUT=../../public/prototype/90-superbowl-session
mkdir -p "$OUT"

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a log.txt; }

if [ "${1:-}" = "--source" ]; then
  log "adding source to scratch"
  notebooklm source add -n $NB --type text --title "PROTOTYPE 90 match report words" "$(cat source.md)" --json > source-add.json 2>&1
  cat source-add.json | tee -a log.txt
  exit 0
fi

n=$(python3 -c 'import json;print(len(json.load(open("pictures.json"))))')
log "=== $n pictures to draw ==="

for i in $(seq 0 $((n - 1))); do
  read -r FILE STYLE < <(python3 -c "
import json;p=json.load(open('pictures.json'))[$i];print(p['file'],p['style'])")
  if [ -s "$OUT/$FILE.png" ]; then log "$FILE — already drawn, skip"; continue; fi
  python3 -c "
import json;p=json.load(open('pictures.json'))[$i];open('.prompt','w').write(p['prompt'])"

  for attempt in 1 2; do
    s=$(date +%s)
    notebooklm generate infographic -n $NB --style "$STYLE" --orientation square \
      --detail concise --language tr --wait --timeout 900 --json \
      --prompt-file .prompt > "gen-$FILE.json" 2>&1
    rc=$?
    took=$(( $(date +%s) - s ))
    if [ $rc -eq 0 ]; then
      notebooklm download infographic -n $NB --latest "$OUT/$FILE.png" >> log.txt 2>&1
      if [ -s "$OUT/$FILE.png" ]; then
        log "$FILE ($STYLE) OK attempt=$attempt ${took}s $(stat -c%s "$OUT/$FILE.png") bytes"
        break
      fi
    fi
    log "$FILE ($STYLE) FAIL attempt=$attempt rc=$rc ${took}s :: $(head -c 300 "gen-$FILE.json" | tr '\n' ' ')"
    [ $attempt -eq 2 ] && log "$FILE — no image, Lesson keeps the text (#147 rule)"
    sleep 5
  done
  sleep 3
done

log "=== done. drawn: $(ls -1 "$OUT"/*.png 2>/dev/null | wc -l) / $n ==="
