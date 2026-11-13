// PROTOTYPE for #178. In-memory progress, no persistence. Every variant reads
// the same hub; only the rendering differs.
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { GAMES, GIFTS, SAMPLES, balance, earned, held, prizeWon, type GameId, type GiftId, type Progress } from './data'

export type SampleKey = keyof typeof SAMPLES

export interface Hub {
  progress: Progress
  earned: number
  balance: number
  held: Map<GiftId, number>
  buy: (id: GiftId) => void
  giveBack: (id: GiftId) => void
  /** Simulates one play of a Game: a random score that may beat the Best score */
  play: (id: GameId) => void
  toast: { text: string; tone: 'ok' | 'prize' | 'info'; n: number } | null
}

const Ctx = createContext<Hub | null>(null)
export const useHub = () => useContext(Ctx)!

function clone(p: Progress): Progress {
  return { best: { ...p.best }, jackpot: p.jackpot, log: [...p.log] }
}

export function HubProvider({ sample, children }: { sample: SampleKey; children: ReactNode }) {
  const [progress, setProgress] = useState(() => clone(SAMPLES[sample].progress))
  const [toast, setToast] = useState<Hub['toast']>(null)
  const timer = useRef<number>()
  const say = useCallback((text: string, tone: 'ok' | 'prize' | 'info' = 'ok') => {
    setToast((t) => ({ text, tone, n: (t?.n ?? 0) + 1 }))
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast((t) => (t ? { ...t, text: t.text, tone: t.tone, n: -1 } : t)), 3200)
  }, [])

  const hub = useMemo<Hub>(() => {
    const h = held(progress)
    const bal = balance(progress)
    return {
      progress,
      earned: earned(progress),
      balance: bal,
      held: h,
      toast,
      buy(id) {
        const g = GIFTS.find((x) => x.id === id)!
        if (h.has(id) || bal < g.price) return
        setProgress((p) => ({ ...p, log: [...p.log, { kind: 'buy', gift: id, paid: g.price }] }))
        say(`${g.name} senin! Yedek kodunu almayı unutma.`, 'ok')
      },
      giveBack(id) {
        const paid = h.get(id)
        if (paid == null) return
        const g = GIFTS.find((x) => x.id === id)!
        setProgress((p) => ({ ...p, log: [...p.log, { kind: 'return', gift: id, paid }] }))
        say(`${g.name} iade edildi, ${paid / 2} puan geri geldi.`, 'info')
      },
      play(id) {
        const g = GAMES.find((x) => x.id === id)!
        const before = progress.best[id]
        let score: number
        let jackpot = false
        if (g.luck) {
          jackpot = Math.random() < 1 / 3 // prototype odds; the real slot is ~1 in 30
          score = jackpot ? 100 : Math.floor(Math.random() * 70)
        } else {
          const base = before ?? 50
          score = Math.min(100, Math.max(0, Math.round(base - 15 + Math.random() * 30)))
        }
        const beat = before == null || score > before
        const next = clone(progress)
        if (beat) next.best[id] = score
        if (jackpot) next.jackpot = true
        setProgress(next)
        const wonNow = !prizeWon(g, progress) && prizeWon(g, next)
        if (wonNow) say(`Küçük ödül kazandın: ${g.prize.name}!`, 'prize')
        else if (beat) say(`Yeni rekor: ${g.name} %${score}${g.luck ? '' : ` (+${Math.floor(score) - Math.floor(before ?? 0)} puan)`}`, 'ok')
        else say(`${g.name}: %${score}. Rekorun %${Math.floor(before!)} olarak kaldı.`, 'info')
      },
    }
  }, [progress, toast, say])

  return <Ctx.Provider value={hub}>{children}</Ctx.Provider>
}
