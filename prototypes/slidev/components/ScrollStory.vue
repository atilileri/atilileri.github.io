<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const root = ref<HTMLElement>()
let obs: IntersectionObserver | undefined

onMounted(() => {
  obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add('in')
      }
    },
    { threshold: 0.35 },
  )
  root.value?.querySelectorAll('[data-reveal]').forEach((el) => obs!.observe(el))
})
onUnmounted(() => obs?.disconnect())

const beats = [
  { big: '3×', t: 'faster to a first draft when the prompt is lean, not verbose.' },
  { big: '−71%', t: 'tokens on the system prompt after one optimization pass.' },
  { big: '9', t: 'decision tickets, charted breadth-first, worked one at a time.' },
  { big: '∞', t: 'the scroll keeps going — this whole slide is a scrollable page.' },
]
</script>

<template>
  <div ref="root" class="scroller">
    <div class="hint">↓ scroll inside this slide ↓</div>
    <section v-for="(b, i) in beats" :key="i" class="beat" data-reveal>
      <div class="big">{{ b.big }}</div>
      <div class="txt">{{ b.t }}</div>
      <div class="idx">0{{ i + 1 }}</div>
    </section>
    <section class="beat final" data-reveal>
      <div class="big grad">You reached the end.</div>
      <div class="txt">Scroll-driven storytelling, embedded in a keyboard-driven deck.</div>
    </section>
  </div>
</template>

<style scoped>
.scroller { height: 100%; overflow-y: auto; scroll-behavior: smooth; scroll-snap-type: y proximity; }
.hint { text-align: center; color: #6a6a80; font-size: .8rem; padding: .5rem 0 1.5rem; letter-spacing: .1em; }
.beat {
  min-height: 78%; display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  scroll-snap-align: center; position: relative; padding-left: 2rem;
  opacity: 0; transform: translateY(48px); transition: opacity .8s, transform .8s;
}
.beat.in { opacity: 1; transform: none; }
.big { font-size: 6.5rem; font-weight: 800; line-height: 1; color: #fff; letter-spacing: -.03em; }
.big.grad {
  font-size: 4rem;
  background: linear-gradient(90deg, #7c5cff, #ff5c8a, #ff9a5c);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.txt { font-size: 1.3rem; color: #b8b8d0; max-width: 26ch; margin-top: 1rem; }
.idx { position: absolute; top: 2rem; right: 2rem; font-size: 1rem; color: #3a3a4a; font-family: 'DM Mono', monospace; }
.final { align-items: center; text-align: center; padding-left: 0; }
</style>
