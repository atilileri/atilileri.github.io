#!/usr/bin/env bash
# PROTOTYPE — stage 2 scenarios (#147): 5 liked styles x 2 realistic scenarios, Turkish captions, no famous names in prompts.
set -u
cd "$(dirname "$0")"
NB=b796a2ef-f96b-43af-a798-7bd02e5a0a9a
OUT=/home/neo/projects/atilileri.github.io/public/prototype/dutch-hook-images/sc
LOG=run.txt
n=$(node -e 'console.log(require("./scenarios.json").length)')
for ((i=0;i<n;i++)); do
  get() { node -e 'const s=require("./scenarios.json")['$i'];console.log(s[process.argv[1]])' "$1"; }
  id=$(get id); style=$(get style); prompt=$(get prompt)
  srcText="$(node -e 'const s=require("./scenarios.json")['$i'];console.log(`Dutch lesson item: ${s.nl} (Turkish: ${s.tr}; English: ${s.en}). Scenario type: ${s.kind}.\n\nMemory hook (Turkish):\n${s.hook}\n\nScene to illustrate:\n${s.prompt}`)')"
  sid=$(notebooklm source add -n $NB --type text --title "PROTOTYPE $id" "$srcText" --json 2>/dev/null < /dev/null | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{console.log(JSON.parse(d).source.id)}catch(e){}})')
  sleep 20
  s=$(date +%s); tries=0; status=FAILED
  while :; do
    sleep 60
    notebooklm generate infographic -n $NB -s "$sid" --style $style --language tr --orientation square --detail concise --wait --timeout 900 --json "$prompt" > $id.json 2>&1 < /dev/null
    if grep -q -i "RATE_LIMITED\|quota" $id.json; then echo "$(date -u +%H:%M) quota hit on $id — waiting 15 min" >> $LOG; sleep 840; continue; fi
    tries=$((tries+1))
    tid=$(node -e 'try{const j=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));if(j.status==="completed")console.log(j.task_id)}catch(e){}' $id.json)
    if [ -n "$tid" ]; then
      notebooklm download infographic -n $NB -a "$tid" --force $OUT/$id.png >/dev/null 2>&1 < /dev/null && chmod 644 $OUT/$id.png \
        && ~/bin/ffmpeg -v error -i $OUT/$id.png -vf scale=900:-1 -q:v 3 -y $OUT/$id.jpg && rm $OUT/$id.png && status=ok
      break
    fi
    [ $tries -ge 2 ] && break   # Q3: one retry, then no image
  done
  echo "$id style=$style $status tries=$tries $(( $(date +%s)-s ))s source=$sid" >> $LOG
done
echo DONE >> $LOG
