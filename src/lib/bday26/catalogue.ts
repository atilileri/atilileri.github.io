/**
 * The birthday games catalogue (/20261209/, spec #192): the 14 Games with
 * their Small prizes, and the 12 Gifts with their prices. Data only — the
 * ledger (`./ledger.ts`) turns it into Points, Balance and prizes, and the
 * hub and the Proof read it for names and text.
 *
 * WHERE THE TEXT COMES FROM. Every Gift name, description and price, and
 * every Small prize name and description, is the locked wording of #177
 * (catalogue text) and #176 (prices). The hub prototype's data file
 * (`prototype/178-hub`) carried that wording verbatim, and this file started
 * from it (#193). The Turkish Game names and the one-line rules were a DRAFT
 * in that prototype; the build keeps them and Atıl approves or edits them on
 * #193. Change a name here and nowhere else — the tiles, the Game pages and
 * the Proof all read this table.
 *
 * ORDER MATTERS. `GAMES` is the hub's tile order (4 columns on her screen, 14 tiles: the
 * 10 skill Games, the 3 Prize Games, the slot machine last). `GIFTS` is
 * sorted by price, high to low, as #176 lists them, and the shop shows them
 * in that order. The price tiers of #176
 * (1: 670–950, 2: 340–500, 3: 260–333) are NEVER shown and are not stored
 * here: she sees only prices.
 *
 * RULES THE DATA CARRIES.
 *   - A Game's `id` is its route slug: `/20261209/<id>/` (spec, "Route and
 *     page shell"). Short ASCII, no diacritics.
 *   - `luck: true` marks the slot machine: it gives no Points, and its Small
 *     prize is won by a jackpot, not by a 95% Best score.
 *   - `prizeGame: true` marks a Prize Game (#213; glossary "Prize Game"): it
 *     gives no Points, and its Small prize is won at a 95% Best score like a
 *     skill Game's. So the 1,000 the Games can give stays 10 × 100.
 *   - The weekend trip and the paint set left the shop to become the Small
 *     prizes of Bavul hazırla and Renk karıştır (#213). She had not played
 *     yet, so no saved progress holds them and their ids are gone.
 *   - Every price is a multiple of 10, so a Return (half back) is a whole
 *     number of Points. `catalogue.test.ts` pins that, because the ledger's
 *     arithmetic quietly relies on it.
 *   - "Ya da senin seçtiğin" Gifts (lens, trips, ski gear, Urban Shopper,
 *     the Yin Yin city) are ONE Gift each; the examples stay in the text and
 *     the choice is made in person (#177).
 *   - De Slak was Piyano's Small prize until Atıl gave Piyano the kanun song
 *     (2026-11-19); it moved to the shop at 100, below every tier of #176.
 *   - The concert Gifts stay buyable after their dates (#177): nothing here
 *     carries a date, on purpose.
 */

export type GameId =
  | "milyoner"
  | "slot"
  | "surus"
  | "piyano"
  | "nerede"
  | "hafiza"
  | "kadraj"
  | "sarki"
  | "wordle"
  | "yuruyus"
  | "kayak"
  | "bavul"
  | "renk"
  | "barista";

export type SmallPrize = { name: string; desc: string };

export type Game = {
  id: GameId;
  /** Turkish name, as the tile shows it. Draft until Atıl approves (#193). */
  name: string;
  /** The one-line rule, as she would read it on the tile. Draft, same. */
  rule: string;
  /** The slot machine: no Points, Small prize on a jackpot. */
  luck?: boolean;
  /** A Prize Game (#213): no Points, Small prize at a 95% Best score. */
  prizeGame?: boolean;
  prize: SmallPrize;
};

/** The one Small prize bar: a skill Game's or a Prize Game's Best score at
 *  or above this wins. */
export const PRIZE_BAR = 95;

/** The most Points she can ever earn: 10 skill Games × 100. */
export const MAX_POINTS = 1000;

export const GAMES: readonly Game[] = [
  { id: "milyoner", name: "Milyoner", rule: "12 soru, kolaydan zora", prize: { name: "Yemek Kartı", desc: "Ne istersen pişiriyorum." } },
  { id: "nerede", name: "Bu nerede?", rule: "Fotoğraftaki yeri bul", prize: { name: "Paleis Het Loo gezisi", desc: "Apeldoorn'daki Paleis Het Loo sarayına bir gezi." } },
  { id: "hafiza", name: "Hafıza kartları", rule: "8 çift fotoğrafı eşle", prize: { name: "Mei Wah'da akşam yemeği", desc: "Eindhoven'daki Mei Wah'da akşam yemeği." } },
  { id: "wordle", name: "Kelime avı", rule: "Bizim kelimelerle Wordle", prize: { name: "Paper Apps: The Games", desc: "Gladden Design'ın kâğıt oyun defteri." } },
  { id: "sarki", name: "Şarkıyı bil", rule: "İlk notalardan şarkıyı tanı", prize: { name: "Dodo'da kahvaltı", desc: "Sint Gerardusplein'deki Dodo coffee bar'da kahvaltı." } },
  { id: "piyano", name: "Piyano", rule: "Düşen notalara bas", prize: { name: "Kanunda senin şarkın", desc: "Senin seçtiğin bir şarkıyı kanunda çalışıp sana çalıyorum." } },
  { id: "kadraj", name: "Kadraj", rule: "Üçte bir kuralıyla kırp", prize: { name: "Sage bottomless portafiltre", desc: "Mükemmel shot'lar için Sage makinesine bottomless portafiltre." } },
  { id: "surus", name: "Hollanda'da sürüş", rule: "Bisikletlilere yol ver, kanala düşme", prize: { name: "Çift bisiklet çantası", desc: "40 litreden büyük, iki taraflı bisiklet çantası." } },
  { id: "yuruyus", name: "Yürüyüş haritası", rule: "Zirveye en kısa yolu çiz", prize: { name: "Piknik günü", desc: "Yeri sen seç, sepeti ben hazırlayayım." } },
  { id: "kayak", name: "Kayak macerası", rule: "Kayalardan atla, bayrakları topla", prize: { name: "Termal spa günü", desc: "Senin seçtiğin bir termal spada bir gün." } },
  { id: "bavul", name: "Bavul hazırla", rule: "Bavulu boşluksuz doldur, 23 kg'ı aşma", prizeGame: true, prize: { name: "Hafta sonu gezisi", desc: "Kassel, Brugge, Lüksemburg'da yürüyüş ya da senin seçtiğin bir hafta sonu." } },
  { id: "renk", name: "Renk karıştır", rule: "Damlaları karıştır, hedef rengi tuttur", prizeGame: true, prize: { name: "Resim seti", desc: "Akrilik boya, tuval ve şövale — Amsterdam ya da Van Bleiswijck seti." } },
  { id: "barista", name: "Barista", rule: "Öğüt, sıkıştır, demle: yeşil bantta bırak", prizeGame: true, prize: { name: "Simon Levelt kahve tadım paketi", desc: "Simon Levelt'ten çekirdek kahve proefpakket'i." } },
  { id: "slot", name: "Slot makinesi", rule: "Çevir, şansını dene", luck: true, prize: { name: "Kazımalı dünya haritası", desc: "Gittiğimiz yerleri kazıyacağımız bir dünya haritası yapbozu." } },
];

export type GiftId =
  | "gezi"
  | "objektif"
  | "yinyin"
  | "kayakekip"
  | "pikap"
  | "karsu"
  | "atolye"
  | "theragun"
  | "urban"
  | "kurs"
  | "rocky"
  | "deslak";

export type Gift = {
  id: GiftId;
  name: string;
  /** One line, as the shop shows it. */
  desc: string;
  /** In Points. A multiple of 10, always. */
  price: number;
};

export const GIFTS: readonly Gift[] = [
  { id: "gezi", name: "Bir haftalık gezi", price: 950, desc: "Mont-Saint-Martin, Gent, Brüksel ve Ourthe vadisinden geçen bir rota ya da senin seçtiğin bir haftalık gezi." },
  { id: "objektif", name: "Yeni objektif", price: 850, desc: "Senin seçtiğin bir objektif." },
  { id: "yinyin", name: "Yin Yin konseri", price: 800, desc: "Şubat 2027'de iki kişilik Yin Yin konseri: Haarlem, Antwerp ya da Groningen — şehri sen seç." },
  { id: "kayakekip", name: "Kayak ekipmanı", price: 750, desc: "Senin seçtiğin kayak ekipmanı." },
  { id: "pikap", name: "Pikap ve plak avı", price: 500, desc: "Audio-Technica AT-LP3XBTWH pikap ve VinylFarm.EU'da bir plak avı günü." },
  { id: "karsu", name: "Karsu konseri", price: 450, desc: "30 Nisan 2027'de Eindhoven Muziekgebouw'da iki kişilik Karsu konseri." },
  { id: "atolye", name: "Fotoğraf atölyesi", price: 400, desc: "Amsterdam Photo Club ya da Travelmarks Fotodagen'de bir günlük seyahat fotoğrafçılığı atölyesi." },
  { id: "theragun", name: "Theragun Sense", price: 360, desc: "Therabody Theragun Sense masaj cihazı." },
  { id: "urban", name: "Urban Shopper hediyesi", price: 330, desc: "Strijp-S'teki Urban Shopper'dan bir saat ya da senin seçtiğin bir hediye." },
  { id: "kurs", name: "Online fotoğraf kursu", price: 290, desc: "Udemy ya da Skillshare'de senin seçtiğin bir seyahat fotoğrafçılığı kursu." },
  { id: "rocky", name: "Rocky Horror film gecesi", price: 260, desc: "The Rocky Horror Picture Show ile şarkılı, danslı bir film gecesi." },
  { id: "deslak", name: "De Slak'ta akşam yemeği", price: 100, desc: "Eindhoven'daki De Slak'ta akşam yemeği." },
];

/** True when a Game's Best score earns Points: a skill Game. The slot
 *  machine and the Prize Games earn none. */
export function givesPoints(game: Game): boolean {
  return !game.luck && !game.prizeGame;
}

/** The Game with this id. Throws on an unknown id: the catalogue is closed. */
export function gameById(id: GameId): Game {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`bday26: no Game "${id}" in the catalogue`);
  return game;
}

/** The Gift with this id. Throws on an unknown id: the catalogue is closed. */
export function giftById(id: GiftId): Gift {
  const gift = GIFTS.find((g) => g.id === id);
  if (!gift) throw new Error(`bday26: no Gift "${id}" in the catalogue`);
  return gift;
}

/** True when the string is one of the Game ids. For data read from storage. */
export function isGameId(id: string): id is GameId {
  return GAMES.some((g) => g.id === id);
}

/** True when the string is one of the Gift ids. For data read from storage. */
export function isGiftId(id: string): id is GiftId {
  return GIFTS.some((g) => g.id === id);
}
