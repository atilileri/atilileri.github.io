<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

// A pre-recorded, scripted session — no shell, no server. Pure client-side replay.
type Line = { kind: 'cmd' | 'out' | 'ok' | 'dim'; text: string; pause?: number }
const script: Line[] = [
  { kind: 'cmd', text: '$ claude', pause: 500 },
  { kind: 'dim', text: '  Claude Code — atilileri.github.io', pause: 300 },
  { kind: 'cmd', text: '> /wayfinder chart the exec presentation', pause: 700 },
  { kind: 'out', text: '  ▸ Naming the destination…', pause: 400 },
  { kind: 'out', text: '  ▸ Mapping the frontier (breadth-first)…', pause: 400 },
  { kind: 'out', text: '  ▸ Created map #4 + 9 child tickets', pause: 500 },
  { kind: 'ok', text: '  ✓ 3 prototype sessions dispatched in parallel', pause: 600 },
  { kind: 'cmd', text: '> /prototype slidev capability showcase', pause: 700 },
  { kind: 'out', text: '  ▸ scaffolding deck…  building 12 slides…', pause: 500 },
  { kind: 'ok', text: '  ✓ static build → dist/  (GitHub-Pages ready)', pause: 400 },
]

const shown = ref<Line[]>([])
const typing = ref('')
const done = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []

function play() {
  reset()
  let i = 0
  const step = () => {
    if (i >= script.length) { done.value = true; return }
    const line = script[i++]
    if (line.kind === 'cmd') {
      let j = 0
      const typeChar = () => {
        typing.value = line.text.slice(0, j++)
        if (j <= line.text.length) timers.push(setTimeout(typeChar, 28))
        else { shown.value.push(line); typing.value = ''; timers.push(setTimeout(step, line.pause ?? 300)) }
      }
      typeChar()
    } else {
      shown.value.push(line)
      timers.push(setTimeout(step, line.pause ?? 300))
    }
  }
  step()
}
function reset() {
  timers.forEach(clearTimeout); timers = []
  shown.value = []; typing.value = ''; done.value = false
}
onUnmounted(reset)
</script>

<template>
  <div class="term">
    <div class="bar">
      <span class="dot r" /><span class="dot y" /><span class="dot g" />
      <span class="title">zsh — claude</span>
      <button class="replay" @click="play">▶ replay</button>
    </div>
    <div class="body">
      <div v-for="(l, i) in shown" :key="i" :class="['line', l.kind]">{{ l.text }}</div>
      <div v-if="typing" class="line cmd">{{ typing }}<span class="cursor">▋</span></div>
      <div v-if="done" class="line dim">—— end of recording ——</div>
    </div>
  </div>
</template>

<style scoped>
.term {
  width: 100%; border-radius: .7rem; overflow: hidden; border: 1px solid #23232f;
  font-family: 'DM Mono', ui-monospace, monospace; box-shadow: 0 30px 60px #0008;
}
.bar { display: flex; align-items: center; gap: .5rem; background: #16161f; padding: .55rem .9rem; }
.dot { width: 11px; height: 11px; border-radius: 50%; }
.dot.r { background: #ff5f56; } .dot.y { background: #ffbd2e; } .dot.g { background: #27c93f; }
.title { margin-left: .5rem; font-size: .72rem; color: #6a6a80; }
.replay {
  margin-left: auto; background: #7c5cff; color: #fff; border: 0; border-radius: 4px;
  padding: .2rem .7rem; font-size: .7rem; cursor: pointer; font-family: inherit;
}
.body { background: #0b0b11; padding: 1rem 1.1rem; min-height: 14rem; font-size: .82rem; line-height: 1.75; }
.line { white-space: pre-wrap; }
.line.cmd { color: #e8e8f0; }
.line.out { color: #8a8aa8; }
.line.ok { color: #4ade80; }
.line.dim { color: #55556a; font-style: italic; }
.cursor { animation: blink 1s steps(2) infinite; color: #7c5cff; }
@keyframes blink { 50% { opacity: 0; } }
</style>
