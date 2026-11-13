// A — Oyun salonu: an arcade board. Games are the page (a 3-column grid of
// tiles, each with its Small prize on the tile's foot); the Gift shop is a
// column on the right that is always in view.
import { Gift, Lock, Printer, Save } from 'lucide-react'
import { Count, Badge } from '../kit'
import { GAMES, GIFTS, PRIZE_BAR, fmt, pct, pointsOf, prizeWon } from './data'
import { useHub } from './store'
import { Btn, Frame, GameGlyph, GiftGlyph } from './ui'

export const name = 'Oyun salonu'

function Tiles() {
  const hub = useHub()
  return (
    <div className="va-grid">
      {GAMES.map((g) => {
        const best = hub.progress.best[g.id]
        const won = prizeWon(g, hub.progress)
        return (
          <div key={g.id} className="va-tile" data-won={won || undefined}>
            <div className="va-tile-head">
              <span className="va-icon"><GameGlyph id={g.id} size={18} /></span>
              <div className="va-tile-name">
                <div className="va-name">{g.name}</div>
                <div className="va-hint">{g.hint}</div>
              </div>
            </div>
            <div className="va-score">
              <div>
                <div className="va-label">Rekor</div>
                <div className="va-best">{best == null ? '—' : pct(best)}</div>
              </div>
              <div className="va-pts">{g.luck ? 'Puan vermez' : best == null ? 'Henüz oynamadın' : `${pointsOf(g, best)} puan`}</div>
            </div>
            {!g.luck && (
              <div className="va-track" aria-hidden>
                <div className="va-fill" style={{ width: `${best ?? 0}%` }} />
                <div className="va-bar95" style={{ left: `${PRIZE_BAR}%` }} />
              </div>
            )}
            <div className="va-prize" data-won={won || undefined}>
              {won ? <Gift size={16} aria-hidden /> : <Lock size={16} aria-hidden />}
              <div className="va-prize-text">
                <div className="va-prize-name">{g.prize.name}</div>
                <div className="va-prize-sub">{won ? 'Kazandın!' : g.luck ? "Jackpot'ta senin" : `%${PRIZE_BAR} yapınca senin`}</div>
              </div>
              <Btn size="small" variant={won ? 'secondary' : 'primary'} onPress={() => hub.play(g.id)}>Oyna</Btn>
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
  const rest = GIFTS.filter((g) => !hub.held.has(g.id))
  return (
    <aside className="va-shop">
      <div className="va-shop-head">
        <div className="va-h2">Hediye dükkânı</div>
        <div className="va-shop-bal">Bakiye <b><Count value={hub.balance} format={fmt} /></b></div>
      </div>
      {mine.length > 0 && (
        <div className="va-mine">
          <div className="va-label">Sende olanlar</div>
          {mine.map((g) => (
            <div key={g.id} className="va-gift" data-held>
              <span className="va-gicon"><GiftGlyph id={g.id} /></span>
              <div className="va-gtext">
                <div className="va-gname">{g.name}</div>
                <div className="va-gdesc">{g.desc}</div>
              </div>
              <Btn size="small" variant="secondary" onPress={() => hub.giveBack(g.id)}>İade et · +{hub.held.get(g.id)! / 2}</Btn>
            </div>
          ))}
        </div>
      )}
      <div className="va-list">
        {rest.map((g) => {
          const short = g.price - hub.balance
          return (
            <div key={g.id} className="va-gift">
              <span className="va-gicon"><GiftGlyph id={g.id} /></span>
              <div className="va-gtext">
                <div className="va-gname">{g.name}</div>
                <div className="va-gdesc">{g.desc}</div>
              </div>
              <div className="va-buy">
                <div className="va-price">{fmt(g.price)}</div>
                {short > 0
                  ? <div className="va-short">{fmt(short)} eksik</div>
                  : <Btn size="small" variant="primary" onPress={() => hub.buy(g.id)}>Al</Btn>}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default function VariantA() {
  const hub = useHub()
  const won = GAMES.filter((g) => prizeWon(g, hub.progress)).length
  return (
    <Frame className="va" tab="İyi ki doğdun Çağla!" tokens={{ '--ss-accent': '#e0446a', '--ss-font': '"Nunito", system-ui, sans-serif' }}>
      {(layout) => (
        <div className="va-page" data-layout={layout}>
          <header className="va-top">
            <div>
              <div className="va-title">İyi ki doğdun, Çağla!</div>
              <div className="va-sub">Oyna, rekor kır, puanlarını hediyeye çevir.</div>
            </div>
            <div className="va-stats">
              <div className="va-stat"><div className="va-label">Kazandığın</div><div className="va-statv"><Count value={hub.earned} format={fmt} /></div></div>
              <div className="va-stat" data-main><div className="va-label">Bakiye</div><div className="va-statv"><Count value={hub.balance} format={fmt} /> <small>puan</small></div></div>
              <div className="va-stat"><div className="va-label">Küçük ödül</div><div className="va-statv">{won}<small>/11</small></div></div>
            </div>
            <div className="va-tools">
              <Btn size="small" variant="ghost" icon={<Save size={14} />}>Yedekle</Btn>
              <Btn size="small" variant="ghost" icon={<Printer size={14} />}>Belge</Btn>
            </div>
          </header>
          <div className="va-main">
            <section>
              <div className="va-h2">Oyunlar <Badge tone="accent">{Object.keys(hub.progress.best).length}/11 oynandı</Badge></div>
              <Tiles />
            </section>
            <Shop />
          </div>
        </div>
      )}
    </Frame>
  )
}
