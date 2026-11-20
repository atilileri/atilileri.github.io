/**
 * The glyphs of the birthday games site (/20261209/, built on #193): one
 * emoji per Game and per Gift, plus the two the Small prize foot flips
 * between. Presentation only, so it lives beside the catalogue rather than
 * in it: `./catalogue.ts` is the locked wording of #176/#177 and should
 * carry nothing a redesign would touch.
 *
 * WHY EMOJI. The hub prototype (#178) drew lucide icons; the site has no
 * icon dependency and the spec wants the hub "playful and warm" (story 11).
 * Emoji are both, cost no bytes, and render in colour from her own system
 * font. They are marked `aria-hidden` wherever they are drawn: the name next
 * to each one is the text, the glyph is decoration.
 *
 * Shared on purpose: the hub's tiles and shop, a Game's start screen (#194)
 * and the Proof's lists (#197) show the same glyph for the same thing. The
 * slot machine's six reel symbols (#200) are here for the same reason: the
 * rule in `./slot.ts` knows them by name only.
 */
import type { GameId, GiftId } from "./catalogue.ts";
import type { SlotSymbol } from "./slot.ts";

export const GAME_ICON: Record<GameId, string> = {
  milyoner: "❓",
  nerede: "📍",
  hafiza: "🃏",
  wordle: "🔤",
  sarki: "🎵",
  piyano: "🎹",
  kadraj: "🖼️",
  surus: "🚲",
  yuruyus: "🥾",
  kayak: "⛷️",
  bavul: "🧳",
  renk: "🎨",
  barista: "☕",
  slot: "🍒",
};

export const GIFT_ICON: Record<GiftId, string> = {
  gezi: "✈️",
  objektif: "📷",
  yinyin: "🎫",
  kayakekip: "❄️",
  pikap: "💿",
  karsu: "🎤",
  atolye: "📸",
  theragun: "💆",
  urban: "🛍️",
  kurs: "🎓",
  rocky: "🍿",
  deslak: "🍽️",
};

/** The Small prize foot: a lock until it is won, a wrapped present after. */
export const PRIZE_LOCKED_ICON = "🔒";
export const PRIZE_WON_ICON = "🎁";

/** The slot machine's reels: the six symbols Atıl named on #182. */
export const SLOT_SYMBOL_ICON: Record<SlotSymbol, string> = {
  camera: "📷",
  ski: "⛷️",
  note: "🎵",
  wine: "🍷",
  heart: "❤️",
  mountain: "🏔️",
};
