// PROTOTYPE for #178. Small shared pieces: icons, a clickable kit Button, the
// toast, and the frame (a Stage holding a laptop browser window). Layout is
// never shared: each variant owns its whole page.
import type { ReactNode, CSSProperties } from 'react'
import {
  Aperture, Bike, CircleHelp, Cherry, Crop, Disc3, Footprints, Gift as GiftIcon, GraduationCap, Hand, Images, Luggage, MapPin,
  MountainSnow, Music, Palette, Piano, Plane, Popcorn, ShoppingBag, Snowflake, SpellCheck, Ticket, Camera, Mic2,
} from 'lucide-react'
import { Button, Stage, Toast, Window, type LookTokens } from '../kit'
import type { ButtonProps } from '../kit'
import type { GameId, GiftId } from './data'
import { useHub } from './store'

export const GAME_ICON: Record<GameId, typeof Piano> = {
  milyoner: CircleHelp, slot: Cherry, surus: Bike, piyano: Piano, nerede: MapPin, hafiza: Images,
  kadraj: Crop, sarki: Music, wordle: SpellCheck, yuruyus: Footprints, kayak: MountainSnow,
}

export const GIFT_ICON: Record<GiftId, typeof Piano> = {
  gezi: Plane, objektif: Aperture, yinyin: Ticket, kayakekip: Snowflake, pikap: Disc3, haftasonu: Luggage,
  karsu: Mic2, atolye: Camera, theragun: Hand, urban: ShoppingBag, resim: Palette, kurs: GraduationCap, rocky: Popcorn,
}

export function GameGlyph({ id, size = 16, ...rest }: { id: GameId; size?: number; className?: string; style?: CSSProperties }) {
  const I = GAME_ICON[id]
  return <I size={size} strokeWidth={2} aria-hidden {...rest} />
}
export function GiftGlyph({ id, size = 16, ...rest }: { id: GiftId; size?: number; className?: string; style?: CSSProperties }) {
  const I = GIFT_ICON[id]
  return <I size={size} strokeWidth={2} aria-hidden {...rest} />
}
export { GiftIcon }

/** The kit's Button, made really clickable and keyboard-reachable. */
export function Btn({ onPress, disabled, ...rest }: ButtonProps & { onPress?: () => void; disabled?: boolean }) {
  return (
    <Button
      {...rest}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onPress?.() }}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPress?.() } }}
    />
  )
}

export function HubToast({ className }: { className?: string }) {
  const { toast } = useHub()
  return (
    <div className={`hub-toast-slot ${className ?? ''}`}>
      <Toast show={!!toast && toast.n > 0} data-tone={toast?.tone}>{toast?.text ?? ' '}</Toast>
    </div>
  )
}

export const W = 1200
export const H = 760

/**
 * The device: a laptop browser at atilileri.github.io/20261209/, its page
 * scrolling inside. Wide is the laptop she plays on; compact is a phone
 * column (touch is only a bonus).
 */
export function Frame({ className, tokens, tab, children }: { className: string; tokens: LookTokens; tab: string; children: (layout: 'wide' | 'compact') => ReactNode }) {
  return (
    <Stage width={W} height={H} compact={{ below: 640, width: 358, height: 720 }} className={`frame ${className}`} tokens={tokens}>
      {(_s, _r, layout) => (
        <Window
          className="frame-window"
          tabs={layout === 'wide' ? [tab] : undefined}
          nav={layout === 'wide'}
          urlShape="pill"
          url={layout === 'wide' ? 'atilileri.github.io/20261209/' : '…github.io/20261209/'}
          body={{ className: 'frame-body', 'data-crop': true }}
        >
          <div className="frame-scroll">{children(layout)}</div>
          <HubToast />
        </Window>
      )}
    </Stage>
  )
}
