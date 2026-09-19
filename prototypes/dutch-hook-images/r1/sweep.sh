#!/usr/bin/env bash
# PROTOTYPE — route 1 style sweep: every style except sketch-note and auto, two attempts each, spaced out.
set -u
cd "$(dirname "$0")"
NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a
OUT=/home/neo/projects/atilileri.github.io/public/prototype/dutch-hook-images/r1
PROMPT="One single illustration of this memory scene, no statistics, no bullet lists: an angry chef in white chef's clothes with a name tag reading GORDON hides behind a long living-room curtain, raising a padel racket like a spatula; only his shoes under the curtain and his furious face at its edge are visible; the curtain is labelled 'gordijn'. Big picture, very little text."
for attempt in 1 2; do
  for style in professional bento-grid editorial instructional bricks clay anime kawaii scientific; do
    sleep 60
    s=$(date +%s)
    notebooklm generate infographic -n $NB --style $style --orientation square --detail concise --wait --timeout 900 --json "$PROMPT" > sweep-$style-$attempt.json 2>&1
    secs=$(( $(date +%s) - s ))
    id=$(node -e 'try{const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));if(j.status==="completed")console.log(j.task_id)}catch(e){}' sweep-$style-$attempt.json)
    if [ -n "$id" ]; then
      notebooklm download infographic -n $NB -a "$id" --force $OUT/$style-$attempt.png >/dev/null 2>&1 && chmod 644 $OUT/$style-$attempt.png \
        && ~/bin/ffmpeg -v error -i $OUT/$style-$attempt.png -vf scale=900:-1 -q:v 3 -y $OUT/$style-$attempt.jpg && rm $OUT/$style-$attempt.png
      echo "$style #$attempt ok ${secs}s" >> sweep.txt
    else
      echo "$style #$attempt FAILED ${secs}s $(head -c 120 sweep-$style-$attempt.json | tr '\n' ' ')" >> sweep.txt
    fi
  done
done
echo DONE >> sweep.txt
