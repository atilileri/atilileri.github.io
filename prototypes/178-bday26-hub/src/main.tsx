// PROTOTYPE for #178 — "What does the hub page look like?"
// Four variants of the hub at /20261209/, switchable via ?variant=A|B|C|D and
// the floating bar (← → keys too). ?sample=yeni|orta|son picks the fake
// progress. Everything is in memory: a reload starts over.
import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { SAMPLES, fmt } from './data'
import { HubProvider, useHub, type SampleKey } from './store'
import VariantA, { name as nameA } from './VariantA'
import VariantB, { name as nameB } from './VariantB'
import VariantC, { name as nameC } from './VariantC'
import VariantD, { name as nameD } from './VariantD'
import '../kit/stageshow.css'
import './styles.css'

const VARIANTS = [
  { key: 'A', name: nameA, C: VariantA },
  { key: 'B', name: nameB, C: VariantB },
  { key: 'C', name: nameC, C: VariantC },
  { key: 'D', name: nameD, C: VariantD },
]
const SAMPLE_KEYS = Object.keys(SAMPLES) as SampleKey[]

function readParam(k: string) {
  try { return new URLSearchParams(location.search).get(k) } catch { return null }
}
function writeParam(k: string, v: string) {
  try {
    const u = new URL(location.href)
    u.searchParams.set(k, v)
    history.replaceState(null, '', u)
  } catch { /* sandboxed host: keep it in memory */ }
}

function StateLine() {
  const hub = useHub()
  return <span className="sw-state">Puan {fmt(hub.earned)} · Bakiye {fmt(hub.balance)} · {hub.held.size} hediye</span>
}

function App() {
  const [v, setV] = useState(() => Math.max(0, VARIANTS.findIndex((x) => x.key === (readParam('variant') ?? 'A').toUpperCase())))
  const [sample, setSample] = useState<SampleKey>(() => (SAMPLE_KEYS.includes(readParam('sample') as SampleKey) ? (readParam('sample') as SampleKey) : 'orta'))
  const [run, setRun] = useState(0)

  const go = useCallback((d: number) => setV((i) => (i + d + VARIANTS.length) % VARIANTS.length), [])
  useEffect(() => writeParam('variant', VARIANTS[v].key), [v])
  useEffect(() => writeParam('sample', sample), [sample])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [contenteditable]')) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const Cur = VARIANTS[v].C
  return (
    <HubProvider key={`${sample}-${run}`} sample={sample}>
      <main className="host">
        <Cur />
      </main>
      <nav className="sw" aria-label="Prototip varyantları">
        <span className="sw-tag">PROTOTİP #178</span>
        <button className="sw-arrow" onClick={() => go(-1)} aria-label="Önceki varyant"><ChevronLeft size={16} /></button>
        <span className="sw-label"><b>{VARIANTS[v].key}</b> {VARIANTS[v].name}</span>
        <button className="sw-arrow" onClick={() => go(1)} aria-label="Sonraki varyant"><ChevronRight size={16} /></button>
        <select className="sw-sample" value={sample} onChange={(e) => setSample(e.target.value as SampleKey)} aria-label="Örnek ilerleme">
          {SAMPLE_KEYS.map((k) => <option key={k} value={k}>{SAMPLES[k].label}</option>)}
        </select>
        <button className="sw-arrow" onClick={() => setRun((n) => n + 1)} aria-label="Baştan başla" title="Örnek ilerlemeye dön"><RotateCcw size={14} /></button>
        <StateLine />
      </nav>
    </HubProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
