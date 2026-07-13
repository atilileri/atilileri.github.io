<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// Illustrative: tokens spent by a naive vs. optimized prompt across tasks.
const data = [
  { label: 'System prompt', naive: 1200, lean: 380 },
  { label: 'Few-shot examples', naive: 2400, lean: 900 },
  { label: 'Tool schemas', naive: 1800, lean: 1100 },
  { label: 'User turn', naive: 640, lean: 420 },
  { label: 'Retries / repair', naive: 1500, lean: 260 },
]

const mode = ref<'naive' | 'lean'>('naive')
const grown = ref(false)
onMounted(() => requestAnimationFrame(() => (grown.value = true)))

const max = 2600
const val = (d: typeof data[number]) => (mode.value === 'naive' ? d.naive : d.lean)
const total = computed(() => data.reduce((s, d) => s + val(d), 0))
const saved = computed(() =>
  Math.round((1 - data.reduce((s, d) => s + d.lean, 0) / data.reduce((s, d) => s + d.naive, 0)) * 100),
)
</script>

<template>
  <div class="chart">
    <div class="rows">
      <div v-for="d in data" :key="d.label" class="row">
        <div class="lab">{{ d.label }}</div>
        <div class="track">
          <div
            class="bar"
            :class="mode"
            :style="{ width: grown ? `${(val(d) / max) * 100}%` : '0%' }"
          >
            <span class="v">{{ val(d).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="foot">
      <div class="toggle">
        <button :class="{ on: mode === 'naive' }" @click="mode = 'naive'">Naive</button>
        <button :class="{ on: mode === 'lean' }" @click="mode = 'lean'">Optimized</button>
      </div>
      <div class="total">
        <span class="tn">{{ total.toLocaleString() }}</span> tokens/call
        <span v-if="mode === 'lean'" class="badge">−{{ saved }}% 🎉</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart { width: 100%; font-family: 'DM Mono', ui-monospace, monospace; }
.row { display: grid; grid-template-columns: 9rem 1fr; align-items: center; gap: 1rem; margin: .5rem 0; }
.lab { font-size: .8rem; color: #b8b8d0; text-align: right; }
.track { background: #16161f; border-radius: 6px; overflow: hidden; height: 2.1rem; }
.bar {
  height: 100%; display: flex; align-items: center; justify-content: flex-end;
  padding-right: .6rem; border-radius: 6px;
  transition: width 1s cubic-bezier(.2, .9, .3, 1), background .4s;
}
.bar.naive { background: linear-gradient(90deg, #ff5c8a, #ff9a5c); }
.bar.lean { background: linear-gradient(90deg, #7c5cff, #4ade80); }
.v { font-size: .72rem; font-weight: 700; color: #06060a; }
.foot { display: flex; justify-content: space-between; align-items: center; margin-top: 1.4rem; }
.toggle button {
  background: #16161f; color: #9a9ab0; border: 1px solid #2a2a3a; padding: .4rem 1rem;
  cursor: pointer; font-family: inherit; font-size: .8rem;
}
.toggle button:first-child { border-radius: 6px 0 0 6px; }
.toggle button:last-child { border-radius: 0 6px 6px 0; border-left: 0; }
.toggle button.on { background: #7c5cff; color: #fff; border-color: #7c5cff; }
.total { font-size: 1rem; color: #e8e8f0; }
.total .tn { font-size: 1.6rem; font-weight: 700; }
.badge { margin-left: .6rem; color: #4ade80; font-weight: 700; }
</style>
