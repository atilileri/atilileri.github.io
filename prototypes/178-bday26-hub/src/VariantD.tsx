// D — Yolculuk: the Games are stops on one winding trail, each stop a ring
// that fills to her Best score, its Small prize hung beside it like a tag.
// The Balance floats top-right; the Gift shop is a drawer at the window's foot
// that she pulls up when she wants to spend.
import { useState } from 'react'
import { ChevronUp, Gift, Lock } from 'lucide-react'
import { Count } from '../kit'
import { GAMES, GIFTS, PRIZE_BAR, fmt, pct, pointsOf, prizeWon } from './data'
import { useHub } from './store'
import { Btn, Frame, GameGlyph, GiftGlyph } from './ui'

export const name = 'Yolculuk'

function Ring({ value, won }: { value?: number; won: boolean }) {
  const r = 26
  const c = 2 * Math.PI * r
  const v = value ?? 0
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="vd-ring" data-won={won || undefined} aria-hidden>
      <circle cx="32" cy="32" r={r} className="vd-ring-track" />
      <circle cx="32" cy="32" r={r} className="vd-ring-arc" strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 32 32)" />
      {/* the 95% mark */}
      <line x1="32" y1="2" x2="32" y2="9" className="vd-ring-mark" transform={`rotate(${PRIZE_BAR * 3.6} 32 32)`} />
    </svg>
  )
}

function Drawer({ open, setOpen }: { open: boolean; setOpen: (b: boolean) => void }) {
  const hub = useHub()
  return (
    <div className="vd-drawer" data-open={open || undefined}>
      <button className="vd-drawer-handle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Gift size={16} aria-hidden />
        <span className="vd-drawer-title">Hediye dükkânı</span>
        <span className="vd-drawer-meta">{hub.held.size > 0 ? `${hub.held.size} hediye sende · ` : ''}{fmt(hub.balance)} puanın var</span>
        <ChevronUp size={16} className="vd-chev" aria-hidden />
      </button>
      <div className="vd-drawer-body">
        <div className="vd-shelf">
          {[...GIFTS].sort((a, b) => Number(hub.held.has(b.id)) - Number(hub.held.has(a.id))).map((g) => {
            const mine = hub.held.has(g.id)
            const ok = hub.balance >= g.price
            return (
              <div key={g.id} className="vd-gift" data-held={mine || undefined}>
                <div className="vd-gift-top"><GiftGlyph id={g.id} size={18} /><span className="vd-gift-price">{fmt(g.price)}</span></div>
                <div className="vd-gift-name">{g.name}</div>
                <div className="vd-gift-desc">{g.desc}</div>
                {mine
                  ? <Btn size="small" variant="secondary" onPress={() => hub.giveBack(g.id)}>İade et · +{hub.held.get(g.id)! / 2}</Btn>
                  : <Btn size="small" variant={ok ? 'primary' : 'tertiary'} disabled={!ok} onPress={() => hub.buy(g.id)}>{ok ? 'Al' : `${fmt(g.price - hub.balance)} eksik`}</Btn>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function VariantD() {
  const hub = useHub()
  const [open, setOpen] = useState(false)
  return (
    <Frame className="vd" tab="Çağla'nın yolculuğu" tokens={{ '--ss-accent': '#2b59c3', '--ss-font': '"Nunito", system-ui, sans-serif' }}>
      {(layout) => (
        <div className="vd-page" data-layout={layout}>
          <div className="vd-bal">
            <span className="vd-bal-v"><Count value={hub.balance} format={fmt} /></span>
            <span className="vd-bal-l">puan</span>
          </div>
          <header className="vd-top">
            <div className="vd-title">Çağla'nın 9 Aralık yolculuğu</div>
            <div className="vd-sub">Her durak bir oyun. %95'e ulaş, yanındaki küçük ödül senin olsun.</div>
          </header>
          <ol className="vd-trail">
            {GAMES.map((g, i) => {
              const best = hub.progress.best[g.id]
              const won = prizeWon(g, hub.progress)
              return (
                <li key={g.id} className="vd-stop" data-side={i % 2 ? 'r' : 'l'} data-won={won || undefined}>
                  <button className="vd-node" onClick={() => hub.play(g.id)} title={`${g.name} — oyna`}>
                    <Ring value={g.luck ? (hub.progress.jackpot ? 100 : 0) : best} won={won} />
                    <span className="vd-node-icon"><GameGlyph id={g.id} size={20} /></span>
                  </button>
                  <div className="vd-card">
                    <div className="vd-card-head">
                      <span className="vd-step">{i + 1}</span>
                      <span className="vd-name">{g.name}</span>
                      <span className="vd-best">{pct(best)}</span>
                    </div>
                    <div className="vd-meta">{g.luck ? 'Şans oyunu, puan vermez' : best == null ? 'Henüz oynamadın' : `${pointsOf(g, best)} puan kazandırdı`}</div>
                    <div className="vd-tag" data-won={won || undefined}>
                      {won ? <Gift size={14} aria-hidden /> : <Lock size={14} aria-hidden />}
                      <span><b>{g.prize.name}</b>{won ? ' — kazandın!' : g.luck ? " — jackpot'ta" : ` — %${PRIZE_BAR}'te`}</span>
                    </div>
                  </div>
                </li>
              )
            })}
            <li className="vd-finish">
              <button className="vd-finish-btn" onClick={() => setOpen(true)}><Gift size={18} aria-hidden /> Yolun sonu: hediye dükkânı</button>
            </li>
          </ol>
          <Drawer open={open} setOpen={setOpen} />
        </div>
      )}
    </Frame>
  )
}
