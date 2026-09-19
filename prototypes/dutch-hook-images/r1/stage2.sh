#!/usr/bin/env bash
# PROTOTYPE — stage 2 (#147): auto, academic (code 12), and a no-famous-name control on the failing styles.
set -u
cd "$(dirname "$0")"
NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a
SRC=48377d82-7bce-4733-84ac-23143fa952f8
OUT=/home/neo/projects/atilileri.github.io/public/prototype/dutch-hook-images/r1
PY=~/.local/share/uv/tools/notebooklm-py/bin/python
LOG=stage2.txt
until grep -q DONE sweep.txt; do sleep 30; done
PROMPT="One single illustration of this memory scene, no statistics, no bullet lists: an angry chef in white chef's clothes with a name tag reading GORDON hides behind a long living-room curtain, raising a padel racket like a spatula; only his shoes under the curtain and his furious face at its edge are visible; the curtain is labelled 'gordijn'. Big picture, very little text."
CONTROL="One single illustration of this memory scene, no statistics, no bullet lists: an angry cook in an apron hides behind a long living-room curtain, raising a padel racket like a spatula; only his shoes under the curtain and his furious face at its edge are visible; the curtain is labelled 'gordijn'. Big picture, very little text."

save() { # name json
  local id; id=$(node -e 'try{const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));if(j.status==="completed")console.log(j.task_id)}catch(e){}' "$2")
  if [ -n "$id" ]; then
    notebooklm download infographic -n $NB -a "$id" --force $OUT/$1.png >/dev/null 2>&1 && chmod 644 $OUT/$1.png \
      && ~/bin/ffmpeg -v error -i $OUT/$1.png -vf scale=900:-1 -q:v 3 -y $OUT/$1.jpg && rm $OUT/$1.png
    echo ok
  fi
}
quota_wait() { # $1 = file holding the last output; loops while it says RATE_LIMITED
  grep -q -i "RATE_LIMITED\|RateLimitError\|quota" "$1" || return 1
  echo "$(date -u +%H:%M) quota hit on $(basename $1) — waiting 15 min for the reset" >> $LOG
  sleep 900; return 0
}
cli() { # name style source prompt
  sleep 60; local s=$(date +%s)
  while :; do
    notebooklm generate infographic -n $NB -s "$3" --style $2 --orientation square --detail concise --wait --timeout 900 --json "$4" > s2-$1.json 2>&1 < /dev/null
    quota_wait s2-$1.json || break
  done
  local r; r=$(save $1 s2-$1.json)
  echo "$1 style=$2 ${r:-FAILED} $(( $(date +%s)-s ))s" >> $LOG
}

grep -i "RATE_LIMITED" sweep.txt | while read -r style hash rest; do cli "sweep-$style-rerun" "$style" $SRC "$PROMPT"; done
cli auto-1 auto $SRC "$PROMPT"
cli auto-2 auto $SRC "$PROMPT"
for n in 1 2; do
  sleep 60; s=$(date +%s)
  while :; do $PY academic.py $NB $SRC "$PROMPT" $OUT/academic-$n.png > s2-academic-$n.txt 2>&1; quota_wait s2-academic-$n.txt || break; done
  if [ -f $OUT/academic-$n.png ]; then chmod 644 $OUT/academic-$n.png; ~/bin/ffmpeg -v error -i $OUT/academic-$n.png -vf scale=900:-1 -q:v 3 -y $OUT/academic-$n.jpg && rm $OUT/academic-$n.png; r=ok; else r=FAILED; fi
  echo "academic-$n style=12 $r $(( $(date +%s)-s ))s" >> $LOG
done
CTL=$(notebooklm source add -n $NB --type text --title "PROTOTYPE control hook gordijn (no name)" "$CONTROL" --json 2>/dev/null | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{console.log(JSON.parse(d).source.id)}catch(e){}})')
echo "control source $CTL" >> $LOG
sleep 20
for style in professional bento-grid editorial anime scientific; do
  cli control-$style $style "$CTL" "$CONTROL"
done
echo DONE >> $LOG
