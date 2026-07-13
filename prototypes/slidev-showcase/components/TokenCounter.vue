<script setup lang="ts">
import { computed, ref } from 'vue'
import { encode } from 'gpt-tokenizer'

const text = ref(
  'You are a senior engineer. Please, if you would be so kind, ' +
  'kindly go ahead and carefully review the following code and ' +
  'let me know your thoughts in great detail.',
)

// Live client-side tokenization — runs entirely in the browser (GitHub-Pages-safe).
const tokens = computed(() => {
  try {
    return encode(text.value)
  } catch (e) {
    return []
  }
})

const chars = computed(() => text.value.length)
const words = computed(() => (text.value.trim() ? text.value.trim().split(/\s+/).length : 0))

// Illustrative pricing (USD per 1M input tokens) — for the demo only.
const pricePerM = 3
const cost = computed(() => ((tokens.value.length / 1_000_000) * pricePerM).toFixed(6))

// A tighter rewrite, to show the "optimization" payoff live.
const optimized = 'Senior engineer: review this code and give detailed feedback.'
function optimize() {
  text.value = optimized
}
</script>

<template>
  <div class="tok">
    <textarea
      v-model="text"
      spellcheck="false"
      class="tok-input"
      rows="4"
    />

    <div class="tok-stats">
      <div class="stat"><span class="n">{{ tokens.length }}</span><span class="l">tokens</span></div>
      <div class="stat"><span class="n">{{ words }}</span><span class="l">words</span></div>
      <div class="stat"><span class="n">{{ chars }}</span><span class="l">chars</span></div>
      <div class="stat cost"><span class="n">${{ cost }}</span><span class="l">/ call</span></div>
    </div>

    <div class="tok-viz">
      <span
        v-for="(t, i) in tokens"
        :key="i"
        class="chip"
        :style="{ background: `hsl(${(t * 57) % 360} 70% 55% / .85)` }"
      >{{ t }}</span>
    </div>

    <button class="tok-btn" @click="optimize">✨ Optimize this prompt →</button>
  </div>
</template>

<style scoped>
.tok { width: 100%; font-family: 'DM Mono', ui-monospace, monospace; }
.tok-input {
  width: 100%; padding: .8rem 1rem; border-radius: .6rem;
  background: #0e0e14; color: #e8e8f0; border: 1px solid #2a2a3a;
  font-size: .95rem; line-height: 1.5; resize: vertical; outline: none;
}
.tok-input:focus { border-color: #7c5cff; box-shadow: 0 0 0 3px #7c5cff33; }
.tok-stats { display: flex; gap: 1.2rem; margin: 1rem 0 .6rem; }
.stat { display: flex; flex-direction: column; align-items: flex-start; }
.stat .n { font-size: 1.9rem; font-weight: 700; line-height: 1; color: #fff; }
.stat .l { font-size: .7rem; text-transform: uppercase; letter-spacing: .12em; color: #8a8aa0; }
.stat.cost .n { color: #4ade80; }
.tok-viz { display: flex; flex-wrap: wrap; gap: 3px; max-height: 5.5rem; overflow: auto; margin-bottom: 1rem; }
.chip {
  font-size: .62rem; padding: 1px 5px; border-radius: 4px; color: #06060a;
  font-weight: 700;
}
.tok-btn {
  background: linear-gradient(90deg, #7c5cff, #ff5c8a); color: #fff; border: 0;
  padding: .6rem 1.2rem; border-radius: 2rem; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: transform .15s;
}
.tok-btn:hover { transform: translateY(-2px); }
</style>
