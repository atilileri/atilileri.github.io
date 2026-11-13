// B — Hediye vitrini: the shop is the page. A strip of Game tickets runs across
// the top (each ticket's stub is its Small prize); under it a shelf of Gift
// cards with price tags. The Balance is a split bar: earned, spent, left.
import { Gift, Lock } from 'lucide-react'
import { Count } from '../kit'
import { GAMES, GIFTS, fmt, pct, prizeWon, spent } from './data'
import { useHub } from './store'
import { Btn, Frame, GameGlyph, GiftGlyph } from './ui'

export const name = 'Hediye vitrini'

function Tickets() {
  const hub = useHub()
  return (
    <div className="vb-tickets" role="list">
      {GAMES.map((g) => {
        const best = hub.progress.best[g.id]
        const won = prizeWon(g, hub.progress)
        return (
          <button key={g.id} className="vb-ticket" role="listitem" data-won={won || undefined} onClick={() => hub.play(g.id)} title={`${g.name} — oyna`}>
            <span className="vb-ticket-main">
              <span className="vb-ticket-top"><GameGlyph id={g.id} size={14} /> {g.name}</span>
              <span className="vb-ticket-best">{best == null ? 'Oyna' : pct(best)}</span>
            </span>
            <span className="vb-stub" title={g.prize.name}>
              {won ? <Gift size={14} aria-hidden /> : <Lock size={14} aria-hidden />}
              <span className="vb-stub-name">{g.prize.name}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function VariantB() {
  const hub = useHub()
  const sp = spent(hub.progress)
  const max = Math.max(hub.earned, 1)
  const wonCount = GAMES.filter((g) => prizeWon(g, hub.progress)).length
  return (
    <Frame className="vb" tab="Çağla'nın hediye vitrini" tokens={{ '--ss-accent': '#b4483c', '--ss-font': '"Nunito", system-ui, sans-serif' }}>
      {(layout) => (
        <div className="vb-page" data-layout={layout}>
          <header className="vb-hero">
            <div className="vb-hello">
              <div className="vb-kicker">9 Aralık 2026</div>
              <div className="vb-title">Çağla'nın hediye vitrini</div>
            </div>
            <div className="vb-wallet">
              <div className="vb-wallet-row">
                <span className="vb-wallet-big"><Count value={hub.balance} format={fmt} /></span>
                <span className="vb-wallet-unit">puan harcayabilirsin</span>
              </div>
              <div className="vb-split" aria-hidden>
                <span className="vb-split-spent" style={{ width: `${Math.min(100, (sp / max) * 100)}%` }} />
              </div>
              <div className="vb-wallet-legend">
                <span><i className="dot spent" />Hediyelere {fmt(sp)}</span>
                <span><i className="dot left" />Kalan {fmt(hub.balance)}</span>
                <span className="vb-of">Toplam kazandığın {fmt(hub.earned)}</span>
              </div>
            </div>
          </header>

          <div className="vb-section-head">
            <div className="vb-h2">Puan topla</div>
            <div className="vb-note">Biletin ucundaki küçük ödül, o oyunda %95 yapınca senin. {wonCount}/11 kazandın.</div>
          </div>
          <Tickets />

          <div className="vb-section-head">
            <div className="vb-h2">Hediyeni seç</div>
            <div className="vb-note">İade edersen fiyatının yarısı geri gelir.</div>
          </div>
          <div className="vb-shelf">
            {GIFTS.map((g) => {
              const mine = hub.held.has(g.id)
              const short = g.price - hub.balance
              return (
                <div key={g.id} className="vb-card" data-held={mine || undefined} data-short={!mine && short > 0 ? '' : undefined}>
                  <div className="vb-card-art"><GiftGlyph id={g.id} size={28} /></div>
                  <span className="vb-tag">{fmt(g.price)}</span>
                  <div className="vb-card-name">{g.name}</div>
                  <div className="vb-card-desc">{g.desc}</div>
                  <div className="vb-card-foot">
                    {mine ? (
                      <>
                        <span className="vb-mine">Senin</span>
                        <Btn size="small" variant="ghost" onPress={() => hub.giveBack(g.id)}>İade et, {hub.held.get(g.id)! / 2} geri al</Btn>
                      </>
                    ) : short > 0 ? (
                      <span className="vb-short">{fmt(short)} puan daha</span>
                    ) : (
                      <Btn size="medium" variant="primary" onPress={() => hub.buy(g.id)}>Satın al</Btn>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Frame>
  )
}
