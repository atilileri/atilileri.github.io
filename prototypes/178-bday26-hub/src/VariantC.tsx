// C — Çıkartma albümü: three tabs, one job each. A scoreboard of Games with a
// flag on the 95% line; a sticker album where each Small prize is an empty
// dashed slot until won; a plain shop list split into "Sende" and "Dükkân".
import { useState } from 'react'
import { Flag, Lock } from 'lucide-react'
import { Count, Tabs } from '../kit'
import { GAMES, GIFTS, PRIZE_BAR, fmt, pct, pointsOf, prizeWon } from './data'
import { useHub } from './store'
import { Btn, Frame, GameGlyph, GiftGlyph } from './ui'

export const name = 'Çıkartma albümü'

const STICKER = ['#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#e11d48', '#eab308']

function Board() {
  const hub = useHub()
  return (
    <div className="vc-board">
      {GAMES.map((g) => {
        const best = hub.progress.best[g.id]
        const won = prizeWon(g, hub.progress)
        return (
          <div key={g.id} className="vc-row" data-won={won || undefined}>
            <span className="vc-icon"><GameGlyph id={g.id} size={16} /></span>
            <div className="vc-name">
              <div className="vc-gname">{g.name}</div>
              <div className="vc-hint">{g.luck ? 'Şans oyunu · puan vermez' : g.hint}</div>
            </div>
            <div className="vc-lane" aria-hidden>
              {!g.luck && <div className="vc-lane-fill" style={{ width: `${best ?? 0}%` }} />}
              {!g.luck && <Flag className="vc-flag" size={14} style={{ left: `${PRIZE_BAR}%` }} />}
              {g.luck && <div className="vc-lane-luck">{hub.progress.jackpot ? 'Jackpot geldi!' : 'Jackpot bekleniyor'}</div>}
            </div>
            <div className="vc-best">{pct(best)}</div>
            <div className="vc-pts">{g.luck ? '' : best == null ? '' : `${pointsOf(g, best)} p`}</div>
            <Btn size="small" variant="primary" onPress={() => hub.play(g.id)}>Oyna</Btn>
          </div>
        )
      })}
    </div>
  )
}

function Album() {
  const hub = useHub()
  return (
    <div className="vc-album">
      {GAMES.map((g, i) => {
        const won = prizeWon(g, hub.progress)
        const best = hub.progress.best[g.id]
        return (
          <div key={g.id} className="vc-slot" data-won={won || undefined}>
            <div className="vc-sticker" style={{ ['--c' as string]: STICKER[i], ['--tilt' as string]: `${(i % 3) * 3 - 3}deg` }}>
              {won ? <GameGlyph id={g.id} size={26} /> : <Lock size={20} />}
            </div>
            <div className="vc-sname">{g.prize.name}</div>
            <div className="vc-sdesc">{g.prize.desc}</div>
            <div className="vc-shint">
              {won ? `${g.name} ile kazandın` : g.luck ? 'Slot makinesinde jackpot' : `${g.name}: %${PRIZE_BAR} lazım${best != null ? `, rekorun ${pct(best)}` : ''}`}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Shop() {
  const hub = useHub()
  const mine = GIFTS.filter((g) => hub.held.has(g.id))
  return (
    <div className="vc-shop">
      <div className="vc-h3">Sende ({mine.length})</div>
      {mine.length === 0 && <div className="vc-empty">Henüz hediye almadın. Aşağıdan seç!</div>}
      {mine.map((g) => (
        <div key={g.id} className="vc-gift" data-held>
          <span className="vc-icon"><GiftGlyph id={g.id} /></span>
          <div className="vc-name"><div className="vc-gname">{g.name}</div><div className="vc-hint">{g.desc}</div></div>
          <Btn size="small" variant="secondary" onPress={() => hub.giveBack(g.id)}>İade et (+{hub.held.get(g.id)! / 2})</Btn>
        </div>
      ))}
      <div className="vc-h3">Dükkân</div>
      {GIFTS.filter((g) => !hub.held.has(g.id)).map((g) => {
        const ok = hub.balance >= g.price
        return (
          <div key={g.id} className="vc-gift">
            <span className="vc-icon"><GiftGlyph id={g.id} /></span>
            <div className="vc-name"><div className="vc-gname">{g.name}</div><div className="vc-hint">{g.desc}</div></div>
            <div className="vc-price">{fmt(g.price)}</div>
            <Btn size="small" variant={ok ? 'primary' : 'tertiary'} disabled={!ok} onPress={() => hub.buy(g.id)}>{ok ? 'Al' : 'Yetmiyor'}</Btn>
          </div>
        )
      })}
    </div>
  )
}

export default function VariantC() {
  const hub = useHub()
  const [tab, setTab] = useState(0)
  const won = GAMES.filter((g) => prizeWon(g, hub.progress)).length
  const labels = ['Oyunlar', `Küçük ödüller ${won}/11`, `Hediyeler · ${hub.held.size}`]
  return (
    <Frame className="vc" tab="Çağla'nın albümü" tokens={{ '--ss-accent': '#e2601f', '--ss-font': '"Nunito", system-ui, sans-serif' }}>
      {(layout) => (
        <div className="vc-page" data-layout={layout}>
          <header className="vc-top">
            <div className="vc-title">Çağla'nın doğum günü albümü</div>
            <div className="vc-bal">
              <span className="vc-bal-label">Bakiye</span>
              <span className="vc-bal-v"><Count value={hub.balance} format={fmt} /></span>
              <span className="vc-bal-of">/ {fmt(hub.earned)} kazanılan</span>
            </div>
          </header>
          <div className="vc-tabs" onClick={(e) => {
            const el = (e.target as HTMLElement).closest('.ss-tabs__tab')?.querySelector('[data-i]')
            if (el) setTab(Number(el.getAttribute('data-i')))
          }}>
            <Tabs items={labels.map((l, i) => <span key={i} data-i={i} role="tab" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setTab(i)}>{l}</span>)} value={tab} />
          </div>
          <div className="vc-panel">
            {tab === 0 && <Board />}
            {tab === 1 && <Album />}
            {tab === 2 && <Shop />}
          </div>
        </div>
      )}
    </Frame>
  )
}
