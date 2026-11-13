// PROTOTYPE for #178. Catalogue copied from #174 (Games), #176 (prices) and
// #177 (Turkish names, descriptions, Game -> Small prize pairs). Game names in
// Turkish are a draft (#177 says each Game's final text is still open).

export type GameId =
  | 'milyoner' | 'slot' | 'surus' | 'piyano' | 'nerede' | 'hafiza'
  | 'kadraj' | 'sarki' | 'wordle' | 'yuruyus' | 'kayak'

export interface Game {
  id: GameId
  name: string
  hint: string // one-line rule, as she would read it
  luck?: boolean // the slot machine: no Points, Small prize on a jackpot
  prize: { name: string; desc: string }
}

export const GAMES: Game[] = [
  { id: 'milyoner', name: 'Milyoner', hint: '12 soru, kolaydan zora', prize: { name: 'Yemek Kartı', desc: 'Ne istersen pişiriyorum.' } },
  { id: 'nerede', name: 'Bu nerede?', hint: 'Fotoğraftaki yeri bul', prize: { name: 'Paleis Het Loo gezisi', desc: "Apeldoorn'daki Paleis Het Loo sarayına bir gezi." } },
  { id: 'hafiza', name: 'Hafıza kartları', hint: '8 çift fotoğrafı eşle', prize: { name: "Mei Wah'da akşam yemeği", desc: "Eindhoven'daki Mei Wah'da akşam yemeği." } },
  { id: 'wordle', name: 'Kelime avı', hint: 'Bizim kelimelerle Wordle', prize: { name: 'Paper Apps: The Games', desc: "Gladden Design'ın kâğıt oyun defteri." } },
  { id: 'sarki', name: 'Şarkıyı bil', hint: 'İlk notalardan şarkıyı tanı', prize: { name: "Dodo'da kahvaltı", desc: "Sint Gerardusplein'deki Dodo coffee bar'da kahvaltı." } },
  { id: 'piyano', name: 'Piyano', hint: 'Düşen notalara bas', prize: { name: "De Slak'ta akşam yemeği", desc: "Eindhoven'daki De Slak'ta akşam yemeği." } },
  { id: 'kadraj', name: 'Kadraj', hint: 'Üçte bir kuralıyla kırp', prize: { name: 'Sage bottomless portafiltre', desc: "Mükemmel shot'lar için Sage makinesine bottomless portafiltre." } },
  { id: 'surus', name: "Hollanda'da sürüş", hint: 'Bisikletlere yol ver, kanala düşme', prize: { name: 'Çift bisiklet çantası', desc: '40 litreden büyük, iki taraflı bisiklet çantası.' } },
  { id: 'yuruyus', name: 'Yürüyüş haritası', hint: 'Zirveye en kısa yolu çiz', prize: { name: 'Piknik günü', desc: 'Yeri sen seç, sepeti ben hazırlayayım.' } },
  { id: 'kayak', name: 'Kayak macerası', hint: 'Kayalardan atla, bayrakları topla', prize: { name: 'Termal spa günü', desc: 'Senin seçtiğin bir termal spada bir gün.' } },
  { id: 'slot', name: 'Slot makinesi', hint: 'Çevir, şansını dene', luck: true, prize: { name: 'Kazımalı dünya haritası', desc: 'Gittiğimiz yerleri kazıyacağımız bir dünya haritası yapbozu.' } },
]

export type GiftId =
  | 'gezi' | 'objektif' | 'yinyin' | 'kayakekip' | 'pikap' | 'haftasonu' | 'karsu'
  | 'atolye' | 'theragun' | 'urban' | 'resim' | 'kurs' | 'rocky'

export interface Gift { id: GiftId; name: string; desc: string; price: number }

// Sorted by price, high to low, as #176 lists them. Tiers are never shown.
export const GIFTS: Gift[] = [
  { id: 'gezi', name: 'Bir haftalık gezi', price: 950, desc: 'Mont-Saint-Martin, Gent, Brüksel ve Ourthe vadisinden geçen bir rota ya da senin seçtiğin bir haftalık gezi.' },
  { id: 'objektif', name: 'Yeni objektif', price: 850, desc: 'Senin seçtiğin bir objektif.' },
  { id: 'yinyin', name: 'Yin Yin konseri', price: 800, desc: "Şubat 2027'de iki kişilik Yin Yin konseri: Haarlem, Antwerp ya da Groningen — şehri sen seç." },
  { id: 'kayakekip', name: 'Kayak ekipmanı', price: 750, desc: 'Senin seçtiğin kayak ekipmanı.' },
  { id: 'pikap', name: 'Pikap ve plak avı', price: 500, desc: "Audio-Technica AT-LP3XBTWH pikap ve VinylFarm.EU'da bir plak avı günü." },
  { id: 'haftasonu', name: 'Hafta sonu gezisi', price: 480, desc: "Kassel, Brugge, Lüksemburg'da yürüyüş ya da senin seçtiğin bir hafta sonu." },
  { id: 'karsu', name: 'Karsu konseri', price: 450, desc: "30 Nisan 2027'de Eindhoven Muziekgebouw'da iki kişilik Karsu konseri." },
  { id: 'atolye', name: 'Fotoğraf atölyesi', price: 400, desc: "Amsterdam Photo Club ya da Travelmarks Fotodagen'de bir günlük seyahat fotoğrafçılığı atölyesi." },
  { id: 'theragun', name: 'Theragun Sense', price: 360, desc: 'Therabody Theragun Sense masaj cihazı.' },
  { id: 'urban', name: 'Urban Shopper hediyesi', price: 330, desc: "Strijp-S'teki Urban Shopper'dan bir saat ya da senin seçtiğin bir hediye." },
  { id: 'resim', name: 'Resim seti', price: 310, desc: 'Akrilik boya, tuval ve şövale — Amsterdam ya da Van Bleiswijck seti.' },
  { id: 'kurs', name: 'Online fotoğraf kursu', price: 290, desc: "Udemy ya da Skillshare'de senin seçtiğin bir seyahat fotoğrafçılığı kursu." },
  { id: 'rocky', name: 'Rocky Horror film gecesi', price: 260, desc: 'The Rocky Horror Picture Show ile şarkılı, danslı bir film gecesi.' },
]

// --- State: facts only, as #175 stores them -------------------------------

export type GiftEvent = { kind: 'buy' | 'return'; gift: GiftId; paid: number }
export interface Progress {
  best: Partial<Record<GameId, number>> // 0..100, missing = never played
  jackpot: boolean
  log: GiftEvent[]
}

// Three sample states to judge the page empty, mid-way and near the end.
export const SAMPLES: Record<'yeni' | 'orta' | 'son', { label: string; progress: Progress }> = {
  yeni: { label: 'İlk açılış', progress: { best: {}, jackpot: false, log: [] } },
  orta: {
    label: 'Yarı yolda',
    progress: {
      best: { milyoner: 58.3, nerede: 100, hafiza: 95, wordle: 100, sarki: 85, piyano: 62.4, kadraj: 88.7, surus: 81, yuruyus: 91.2, slot: 33 },
      jackpot: false,
      log: [
        { kind: 'buy', gift: 'theragun', paid: 360 },
        { kind: 'return', gift: 'theragun', paid: 360 },
        { kind: 'buy', gift: 'rocky', paid: 260 },
      ],
    },
  },
  son: {
    label: 'Neredeyse bitti',
    progress: {
      best: { milyoner: 100, nerede: 100, hafiza: 100, wordle: 95, sarki: 95, piyano: 96.1, kadraj: 97.4, surus: 94, yuruyus: 100, kayak: 92.5, slot: 100 },
      jackpot: true,
      log: [
        { kind: 'buy', gift: 'karsu', paid: 450 },
        { kind: 'buy', gift: 'resim', paid: 310 },
      ],
    },
  },
}

// --- Derived values: Points, Balance, Small prizes, never stored -----------

export const PRIZE_BAR = 95

export function pointsOf(g: Game, best?: number) {
  if (g.luck || best == null) return 0
  return Math.floor(best) // 1% of Best score = 1 Point, rounded down (#176)
}

export function earned(p: Progress) {
  return GAMES.reduce((sum, g) => sum + pointsOf(g, p.best[g.id]), 0)
}

/** Gift id -> price paid, for every Gift held now */
export function held(p: Progress) {
  const out = new Map<GiftId, number>()
  for (const e of p.log) e.kind === 'buy' ? out.set(e.gift, e.paid) : out.delete(e.gift)
  return out
}

export function spent(p: Progress) {
  // A held Gift costs its price; a returned one costs the half that never came back
  return p.log.reduce((sum, e) => sum + (e.kind === 'buy' ? e.paid : -e.paid / 2), 0)
}

export function balance(p: Progress) {
  return earned(p) - spent(p)
}

export function prizeWon(g: Game, p: Progress) {
  if (g.luck) return p.jackpot
  return (p.best[g.id] ?? 0) >= PRIZE_BAR
}

export const MAX_POINTS = 1000

export function fmt(n: number) {
  return Math.round(n).toLocaleString('tr-TR')
}

export function pct(n?: number) {
  if (n == null) return '—'
  return `%${Math.floor(n)}`
}
