// PROTOTYPE — throwaway. Ticket #90: one Superbowl-themed Session, end to end.
//
// Everything here is HAND-WRITTEN. Nothing generated it, and no skill exists yet.
// PLAN.md and the Item inventory do not exist in the repo, so this file invents a
// slice of both and marks every invented number. Delete with the route.
//
// Dutch facts are grounded on nos.nl 2026-02-09, "Defensief sterke Seahawks winnen
// Super Bowl" (a Named target in AUTOMATION.md). The Dutch prose is written here, not
// copied — adr/0010, published Dutch is unmarked.

export type Role = "stem" | "stem2" | "link" | "affix";
export type Part = { nl: string; tr: string; en: string; role: Role; base?: string };
export type Split = {
  parts: Part[];
  literal: string;
  drift?: string;
  spelling?: string;
  origins?: { part: string; tr: string; source?: string; reasoned?: boolean }[];
};
export type Item = {
  id: string;
  nl: string;
  article?: string;
  tr: string;
  en: string;
  bridge?: string;
  bridgeSource?: string;
  hook?: string;
  trap?: { dir: "en" | "tr"; tr: string };
  split?: Split;
  ipa?: string;
  // scheduling state — the only two fields #100 stores, per Direction
  rec?: { rung: number; last: string };
  pro?: { rung: number; last: string };
  bornIn?: string;
  picture?: { file: string; style: string; alt: string; owner: string };
};

// ─────────────────────────────────────────────────────────────────────────────
// The Horizon and the ladder (#100, adr/0005). Rung 5 is flat, never derived.
// ─────────────────────────────────────────────────────────────────────────────

export const HORIZON = "2027-03-31";
export const ladder = [
  { rung: 1, formula: "H / 64", why: "The first ask is deliberately hard. Anki would start at 1 day." },
  { rung: 2, formula: "H / 32", why: "" },
  { rung: 3, formula: "H / 16", why: "" },
  { rung: 4, formula: "H / 8", why: "The ramp stops here." },
  { rung: 5, formula: "180 days, flat", why: "Mastered. A confirmation, not an attempt to learn — so it ignores the Horizon." },
];

export const gapsAt = (daysToHorizon: number) => [
  Math.round(daysToHorizon / 64),
  Math.round(daysToHorizon / 32),
  Math.round(daysToHorizon / 16),
  Math.round(daysToHorizon / 8),
  180,
];

// ─────────────────────────────────────────────────────────────────────────────
// The Plan slice — INVENTED. docs/dutch/PLAN.md does not exist.
// The Objective is a whole Taalprofielen descriptor, never pre-cut (#85).
// ─────────────────────────────────────────────────────────────────────────────

export const objective = {
  id: "LEB1-3a",
  skill: "lezen",
  tier: "exam" as const,
  status: "active" as const,
  nl: "Kan belangrijke feitelijke informatie begrijpen in korte verslagen en artikelen.",
  tr: "Kısa haberlerde ve makalelerde önemli olgusal bilgiyi anlayabilir.",
  source: "Taalprofielen 2015, p. 1492 of docs/dutch/sources/taalprofielen-2015.txt",
  examples: [
    "het 'wie-wat-waar' in krantenartikelen over een overval, een ongeluk, een rel",
    "biografische informatie over een kunstenaar, schrijver, sportman/vrouw in een tijdschrift of op een website",
  ],
  angles: [
    { n: 1, spent: "2026-09-20", label: "Lexicon: the words a match report cannot do without", kind: "lexicon" },
    { n: 2, spent: "2026-09-24", label: "The same words in a traffic report and a weather report", kind: "theme" },
    { n: 3, spent: "2026-10-05", label: "The same words in a Groot Eindhoven item", kind: "theme" },
    { n: 4, spent: "2026-10-27", label: "The lead sentence: what a Dutch report puts first", kind: "difficulty" },
    { n: 5, spent: "2026-11-19", label: "Past tense in a report: perfectum for the news, imperfectum for the story", kind: "difficulty" },
  ],
  sessions: ["2026-09-20-superbowl", "2026-09-24-file-a2", "2026-10-05-groot-eindhoven", "2026-10-27-nos-kort", "2026-11-19-superbowl-terug"],
};

export const planNeighbours = [
  { id: "LEB1-1a", skill: "lezen", tier: "exam", status: "done", nl: "Kan persoonlijke brieven, e-mails en vormen van sociale media voldoende begrijpen om met vrienden te corresponderen." },
  { id: "LEB1-3a", skill: "lezen", tier: "exam", status: "active", nl: "Kan belangrijke feitelijke informatie begrijpen in korte verslagen en artikelen." },
  { id: "LEB1-2a", skill: "lezen", tier: "exam", status: "next", nl: "Kan relevante informatie vinden en begrijpen in brochures en korte officiële documenten." },
  { id: "LUB1-2a", skill: "luisteren", tier: "exam", status: "next", nl: "Kan de hoofdpunten begrijpen van radio- en tv-programma's over actuele zaken." },
  { id: "SPB1-1a", skill: "spreken", tier: "exam", status: "unsupported", nl: "Kan een eenvoudig gesprek voeren over vertrouwde onderwerpen. — nothing here judges an accent (adr/0008)." },
  { id: "KNM-4", skill: "knm", tier: "knm", status: "next", nl: "Werk en inkomen — de acht syllabusthema's, zonder ERK-niveau." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Items — Session 1's ten. The new-Item budget is ten (#82 via the Tekst rule).
// ─────────────────────────────────────────────────────────────────────────────

export const sessionOneItems: Item[] = [
  {
    id: "wedstrijd",
    nl: "wedstrijd",
    article: "de",
    tr: "maç, yarışma",
    en: "match, contest",
    bornIn: "2026-09-20-superbowl",
    ipa: "/ˈʋɛtstrɛit/",
    split: {
      parts: [
        { nl: "wed", tr: "bahis", en: "wager", role: "stem", base: "wedden" },
        { nl: "strijd", tr: "mücadele", en: "struggle", role: "stem2" },
      ],
      literal: "bahis mücadelesi",
      drift:
        "Eskiden bir yarışmaya bahis (`wedden`) tutulurdu. Sözcük bahsi bıraktı, mücadeleyi tuttu — bugün sadece `maç` demek.",
      origins: [
        { part: "wed", tr: "`wedden` 'bahse girmek' fiilinden; aynı kök İngilizce `wed` 'evlenmek' — söz vermek.", source: "https://etymologiebank.nl/trefwoord/wedstrijd" },
      ],
    },
    hook: "`wedstrijd` içinde `strijd` var — `stres` gibi okunuyor. Maçın son dakikası: tribün stresten ayağa kalkıyor. `Wed-strijd` = stresli mücadele.",
    picture: { file: "s1-wedstrijd.webp", style: "sketch-note", alt: "Hook: wedstrijd — a packed stand rising on its feet in the last minute", owner: "hook" },
  },
  {
    id: "ploeg",
    nl: "ploeg",
    article: "de",
    tr: "takım",
    en: "team",
    bornIn: "2026-09-20-superbowl",
    ipa: "/plux/",
    trap: {
      dir: "en",
      tr: "`de ploeg` İngilizce `plough` (saban) ile birebir aynı sözcük — ve Hollandacada **ikisi de** doğru: tarladaki saban da `de ploeg`, sahadaki takım da. Spor haberinde `ploeg` gördüğünde saban arama; `het team` ile eş anlamlı.",
    },
    hook: "Bir takımın on bir oyuncusu, bir uzatma kablosundaki on bir `plug` gibi — biri çıkarsa hepsinin akımı kesilir. `Ploeg` ≈ `plug`.",
    picture: { file: "s1-ploeg.webp", style: "sketch-note", alt: "Hook: ploeg — eleven plugs in one extension lead, one pulled out", owner: "hook" },
  },
  {
    id: "winnen",
    nl: "winnen",
    tr: "kazanmak",
    en: "to win",
    bornIn: "2026-09-20-superbowl",
    ipa: "/ˈʋɪnə(n)/",
    bridge:
      "Hollandaca `winnen` ile İngilizce `win` aynı Cermen kökünden gelir. Aynı aileden: `gewonnen` — `won`.",
    bridgeSource: "https://www.etymonline.com/word/win",
  },
  {
    id: "verliezen",
    nl: "verliezen",
    tr: "kaybetmek",
    en: "to lose",
    bornIn: "2026-09-20-superbowl",
    ipa: "/vərˈlizə(n)/",
    bridge:
      "Hollandaca `verliezen` ile İngilizce `lose` aynı kökten. Bağlantıyı en net gösteren İngilizce sözcük `forlorn` 'terk edilmiş' — Hollandaca `verloren` 'kaybedilmiş' ile birebir aynı yapı: `ver-` = `for-`.",
    bridgeSource: "https://www.etymonline.com/word/forlorn",
  },
  {
    id: "verslaan",
    nl: "verslaan",
    tr: "yenmek",
    en: "to defeat",
    bornIn: "2026-09-20-superbowl",
    ipa: "/vərˈslan/",
    split: {
      parts: [
        { nl: "ver-", tr: "bitirecek şekilde (ön ek)", en: "completive prefix", role: "affix" },
        { nl: "slaan", tr: "vurmak", en: "to hit", role: "stem2" },
      ],
      literal: "vura vura bitirmek",
      drift:
        "`ver-` burada 'tamamen, sonuna kadar' anlamı katıyor. `slaan` 'vurmak' + `ver-` = rakibi bitirmek, yani yenmek.",
      origins: [
        { part: "ver-", tr: "İngilizce `for-` ön ekinin kardeşi: `forget`, `forbid`. İkisi de 'öteye, bitirerek' anlamı taşır.", source: "https://etymologiebank.nl/trefwoord/ver1" },
      ],
    },
    picture: { file: "s1-verslaan.webp", style: "scientific", alt: "Split: verslaan — ver- + slaan, a final punch, yenmek", owner: "split" },
  },
  {
    id: "uitslag",
    nl: "uitslag",
    article: "de",
    tr: "sonuç, skor",
    en: "result, score",
    bornIn: "2026-09-20-superbowl",
    ipa: "/ˈœytslɑx/",
    split: {
      parts: [
        { nl: "uit", tr: "dışarı", en: "out", role: "stem" },
        { nl: "slag", tr: "vuruş", en: "stroke, blow", role: "stem2" },
      ],
      literal: "dışa vuruş",
      drift:
        "İçeride olan bir şeyin dışarı vurması. Maç biter, skor tabelaya **dışa vurur** — `de uitslag`.",
      origins: [
        { part: "slag", tr: "`slaan` 'vurmak' fiilinden; İngilizce `slay` ve `slaughter` ile aynı kök.", source: "https://etymologiebank.nl/trefwoord/slag1" },
      ],
    },
    trap: {
      dir: "tr",
      tr: "`de uitslag` yalnız 'skor' değil. Aynı sözcük **deri döküntüsü** (`huiduitslag`) ve **seçim sonucu** (`de uitslag van de verkiezingen`) demek. Türkçede 'sonuç' dediğin her yere `uitslag` koyarsan yanılırsın: bir cümlenin mantıksal sonucu `het gevolg`, bir çabanın karşılığı `het resultaat`.",
    },
    picture: { file: "s1-uitslag.webp", style: "scientific", alt: "Trap: uitslag — a scoreboard, a ballot box and a rash, all labelled uitslag", owner: "trap" },
  },
  {
    id: "helft",
    nl: "helft",
    article: "de",
    tr: "yarı, devre",
    en: "half",
    bornIn: "2026-09-20-superbowl",
    ipa: "/hɛlft/",
    bridge:
      "Hollandaca `helft` ile İngilizce `half` aynı sözcük. Sesli harf değişmiş, `-t` eklenmiş; anlam aynı kalmış.",
    bridgeSource: "https://www.etymonline.com/word/half",
    trap: {
      dir: "en",
      tr: "İngilizcede `half` hem sıfat hem isim. Hollandacada **ikiye ayrılır**: sıfat `half` (`een half uur` = yarım saat), isim `de helft` (`de helft van het publiek` = seyircinin yarısı). Maçın devresi de isimdir: `de tweede helft`.",
    },
    picture: { file: "s1-helft.webp", style: "scientific", alt: "Trap: half splits into the adjective half and the noun de helft", owner: "trap" },
  },
  {
    id: "aanval",
    nl: "aanval",
    article: "de",
    tr: "hücum, saldırı",
    en: "attack, offence",
    bornIn: "2026-09-20-superbowl",
    ipa: "/ˈanvɑl/",
    split: {
      parts: [
        { nl: "aan", tr: "üzerine", en: "on, at", role: "stem" },
        { nl: "val", tr: "düşüş", en: "fall", role: "stem2", base: "vallen" },
      ],
      literal: "üzerine düşme",
      drift: "Rakibin üzerine düşmek — hücum etmek.",
      origins: [
        { part: "val", tr: "`vallen` 'düşmek' fiilinden; İngilizce `fall` ile aynı sözcük.", source: "https://etymologiebank.nl/trefwoord/aanval" },
      ],
    },
    picture: { file: "s1-aanval.webp", style: "scientific", alt: "Split: aanval — aan + val, uzerine + dusus, hucum", owner: "split" },
  },
  {
    id: "verdediging",
    nl: "verdediging",
    article: "de",
    tr: "savunma",
    en: "defence",
    bornIn: "2026-09-20-superbowl",
    ipa: "/vərˈdedəɣɪŋ/",
    // NO SPLIT — deliberately. ver- + dedig- + -ing: `dedig-` is not a Dutch word today,
    // so the word does not split into two or more MEANINGFUL parts (SPLIT.md).
    hook: "`verdediging` içinde iki kez `de` var: `ver-DE-DIG-ing`. Savunma hattı da iki sıradır — önde dörtlü, arkada üçlü. İki `de`, iki sıra.",
    picture: { file: "s1-verdediging.webp", style: "sketch-note", alt: "Hook: verdediging — two rows of defenders standing on a painted DE", owner: "hook" },
  },
  {
    id: "scheidsrechter",
    nl: "scheidsrechter",
    article: "de",
    tr: "hakem",
    en: "referee",
    bornIn: "2026-09-20-superbowl",
    ipa: "/ˈsxɛitsˌrɛxtər/",
    split: {
      parts: [
        { nl: "scheid", tr: "ayırmak", en: "to separate", role: "stem", base: "scheiden" },
        { nl: "-s-", tr: "bağlayıcı ses", en: "linking sound", role: "link" },
        { nl: "rechter", tr: "yargıç", en: "judge", role: "stem2" },
      ],
      literal: "ayıran yargıç",
      spelling:
        "`scheiden` fiilinin kökü `scheid`. Araya bağlayıcı `-s-` girer, sonra `rechter` gelir: `scheid` + `-s-` + `rechter`.",
      origins: [
        { part: "rechter", tr: "`recht` 'hukuk, doğru' + `-er`. Mahkemedeki yargıç da `de rechter` — aynı sözcük.", source: "https://etymologiebank.nl/trefwoord/scheidsrechter" },
      ],
    },
    picture: { file: "s1-scheidsrechter.webp", style: "sketch-note", alt: "scheidsrechter — a judge in a courtroom robe separating two players", owner: "item" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Items born later — the mid-journey Session's new words, and the Tekst's.
// ─────────────────────────────────────────────────────────────────────────────

export const sessionTwelveNewItems: Item[] = [
  {
    id: "toeschouwer",
    nl: "toeschouwer",
    article: "de",
    tr: "seyirci",
    en: "spectator",
    bornIn: "2026-11-19-superbowl-terug",
    ipa: "/ˈtusxʌuər/",
    split: {
      parts: [
        { nl: "toe", tr: "-e doğru", en: "toward", role: "affix" },
        { nl: "schouw", tr: "bakmak", en: "to look", role: "stem2", base: "schouwen" },
        { nl: "-er", tr: "kişi yapar", en: "-er (agent)", role: "affix" },
      ],
      literal: "bakan kişi",
      origins: [
        { part: "schouwen", tr: "'bakmak, gözden geçirmek'. İngilizce `show` ile aynı kök: önce 'bakmak', sonra 'gösterilen şey'.", source: "https://etymologiebank.nl/trefwoord/schouwen" },
      ],
    },
    picture: { file: "s12-toeschouwer.webp", style: "x", alt: "Split: toeschouwer — toe + schouw + -er, one spectator shading their eyes", owner: "item" },
  },
  {
    id: "optreden",
    nl: "optreden",
    article: "het",
    tr: "gösteri, sahne performansı",
    en: "performance",
    bornIn: "2026-11-19-superbowl-terug",
    ipa: "/ˈɔptredə(n)/",
    split: {
      parts: [
        { nl: "op", tr: "yukarı, üstüne", en: "up, onto", role: "affix" },
        { nl: "treden", tr: "adım atmak", en: "to step", role: "stem2" },
      ],
      literal: "yukarı adım atma",
      drift: "Sahneye adım atmak → sahne almak → gösteri. `optreden` hem fiil hem isim, ve fiil hâlinde ayrılabilir: `hij treedt op`.",
    },
    trap: {
      dir: "en",
      tr: "İngilizce `performance` her yerde işe yarar; Hollandacada değil. Sahnedeki gösteri `het optreden`, ama bir makinenin performansı `de prestatie`, bir sporcununki de `de prestatie`.",
    },
    picture: { file: "s12-optreden.webp", style: "x", alt: "Split: optreden — op + treden, a singer stepping up onto a stage", owner: "item" },
  },
  {
    id: "pauze",
    nl: "pauze",
    article: "de",
    tr: "ara, devre arası",
    en: "break, half-time",
    bornIn: "2026-11-19-superbowl-terug",
    ipa: "/ˈpʌuzə/",
    bridge:
      "Hollandaca `pauze`, Türkçe `paso`/`pas` değil ama Türkçedeki `pause` (İng.) ile aynı Latince `pausa` kökünden. Türkçeye `pas` değil `paydos` girmiş; İngilizce `pause` ile eşle.",
    bridgeSource: "https://www.etymonline.com/word/pause",
  },
  {
    id: "titel",
    nl: "titel",
    article: "de",
    tr: "şampiyonluk, unvan",
    en: "title",
    bornIn: "2026-11-19-superbowl-terug",
    ipa: "/ˈtitəl/",
    bridge: "Hollandaca `titel`, Türkçe `titr` ve İngilizce `title` — üçü de Latince `titulus`.",
    bridgeSource: "https://www.etymonline.com/word/title",
  },
  {
    id: "record",
    nl: "record",
    article: "het",
    tr: "rekor",
    en: "record",
    bornIn: "2026-11-19-superbowl-terug",
    ipa: "/rəˈkɔr/",
    bridge: "Türkçe `rekor` doğrudan bu sözcük. Yazılışı aynı, ama Hollandacada sondaki `-d` neredeyse hiç duyulmaz: `rekoor`.",
    bridgeSource: "https://www.etymonline.com/word/record",
    trap: {
      dir: "tr",
      tr: "Türkçede 'rekor' sadece sporda kırılır. Hollandacada `het record` aynı şeydir, ama **`de recorder`** kaydedicidir ve `opnemen` kaydetmektir. `Ik heb het record opgenomen` demek 'rekoru kaydettim' değil, 'rekoru banda aldım'dır.",
    },
    picture: { file: "s12-record.webp", style: "x", alt: "Trap: het record is a record broken; opnemen is to record onto tape", owner: "item" },
  },
  {
    id: "verlenging",
    nl: "verlenging",
    article: "de",
    tr: "uzatma",
    en: "extra time, overtime",
    bornIn: "2026-11-19-superbowl-terug",
    ipa: "/vərˈlɛŋɪŋ/",
    split: {
      parts: [
        { nl: "ver-", tr: "yapmak (fiil yapan ön ek)", en: "verb prefix", role: "affix" },
        { nl: "leng", tr: "uzun", en: "long", role: "stem2", base: "lang" },
        { nl: "-ing", tr: "-me (isim yapar)", en: "-ing (noun)", role: "affix" },
      ],
      literal: "uzun-laştır-ma",
      spelling:
        "`lang` burada `leng` yazılır: `lang` → `lengen` → `verlengen`. Sesli harf değişir, çünkü fiil eski bir `-jan` ekiyle kurulmuş.",
      origins: [
        { part: "lang", tr: "İngilizce `long` ile aynı sözcük; `verlengen` de İngilizce `lengthen` ile aynı yapı.", source: "https://etymologiebank.nl/trefwoord/verlengen" },
      ],
    },
    picture: { file: "s12-verlenging.webp", style: "x", alt: "Split: verlenging — ver- + leng + -ing, a stretched band and a clock at 90", owner: "item" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// The synthetic mid-journey inventory — INVENTED. 12 Sessions of Items,
// shown as the slice that matters: what is due on 2026-11-19 and what is not.
// ─────────────────────────────────────────────────────────────────────────────

export const inventorySlice: {
  id: string; nl: string; tr: string; rec: number; pro: number; recLast: string; proLast: string; born: string;
}[] = [
  { id: "wedstrijd", nl: "de wedstrijd", tr: "maç", rec: 4, pro: 3, recLast: "2026-11-05", proLast: "2026-11-11", born: "2026-09-20" },
  { id: "ploeg", nl: "de ploeg", tr: "takım", rec: 4, pro: 2, recLast: "2026-11-03", proLast: "2026-11-16", born: "2026-09-20" },
  { id: "winnen", nl: "winnen", tr: "kazanmak", rec: 5, pro: 4, recLast: "2026-10-12", proLast: "2026-11-03", born: "2026-09-20" },
  { id: "verliezen", nl: "verliezen", tr: "kaybetmek", rec: 5, pro: 3, recLast: "2026-10-12", proLast: "2026-11-12", born: "2026-09-20" },
  { id: "verslaan", nl: "verslaan", tr: "yenmek", rec: 3, pro: 1, recLast: "2026-11-12", proLast: "2026-11-17", born: "2026-09-20" },
  { id: "uitslag", nl: "de uitslag", tr: "sonuç", rec: 4, pro: 2, recLast: "2026-11-04", proLast: "2026-11-14", born: "2026-09-20" },
  { id: "helft", nl: "de helft", tr: "yarı", rec: 4, pro: 3, recLast: "2026-11-02", proLast: "2026-11-12", born: "2026-09-20" },
  { id: "aanval", nl: "de aanval", tr: "hücum", rec: 3, pro: 2, recLast: "2026-11-13", proLast: "2026-11-15", born: "2026-09-20" },
  { id: "verdediging", nl: "de verdediging", tr: "savunma", rec: 2, pro: 1, recLast: "2026-11-14", proLast: "2026-11-16", born: "2026-09-20" },
  { id: "scheidsrechter", nl: "de scheidsrechter", tr: "hakem", rec: 3, pro: 1, recLast: "2026-11-13", proLast: "2026-11-17", born: "2026-09-20" },
  { id: "file", nl: "de file", tr: "trafik kuyruğu", rec: 4, pro: 4, recLast: "2026-11-05", proLast: "2026-11-06", born: "2026-09-24" },
  { id: "vertraging", nl: "de vertraging", tr: "gecikme", rec: 3, pro: 2, recLast: "2026-11-12", proLast: "2026-11-16", born: "2026-09-24" },
  { id: "gemeente", nl: "de gemeente", tr: "belediye", rec: 4, pro: 3, recLast: "2026-11-04", proLast: "2026-11-12", born: "2026-10-05" },
  { id: "buurt", nl: "de buurt", tr: "mahalle", rec: 5, pro: 4, recLast: "2026-09-28", proLast: "2026-11-04", born: "2026-10-05" },
  { id: "bericht", nl: "het bericht", tr: "haber, mesaj", rec: 3, pro: 3, recLast: "2026-11-12", proLast: "2026-11-13", born: "2026-10-27" },
  { id: "volgens", nl: "volgens", tr: "-e göre", rec: 2, pro: 2, recLast: "2026-11-13", proLast: "2026-11-16", born: "2026-10-27" },
  { id: "gebeuren", nl: "gebeuren", tr: "olmak, gerçekleşmek", rec: 2, pro: 1, recLast: "2026-11-16", proLast: "2026-11-17", born: "2026-10-27" },
  { id: "ruim", nl: "ruim", tr: "aşkın, -den fazla", rec: 1, pro: 1, recLast: "2026-11-17", proLast: "2026-11-18", born: "2026-11-09" },
];

export const inventoryTotals = { items: 63, directions: 126, sessions: 11, mastered: 9, newestSession: "2026-11-09-nos-kort-2" };

// ─────────────────────────────────────────────────────────────────────────────
// Session 1 — 2026-09-20. Planned and unanswered. The empty-inventory case.
// ─────────────────────────────────────────────────────────────────────────────

export const sessionOne = {
  id: "2026-09-20-superbowl",
  date: "2026-09-20",
  url: "/nederlands/session/2026-09-20-superbowl/",
  status: "planned" as const,
  theme: "last superbowl",
  themeSource: "typed by the learner — priority 1 of 3",
  objective: "LEB1-3a",
  angle: 1,
  lesson: { slug: "wie-wat-waar-in-een-wedstrijdverslag", title: "Bir maç haberinde: kim, ne, nerede" },
  tekst: null,
  invocation: "/docent i want to do a lesson about last superbowl",
  intro:
    "Bu ilk oturum. Envanter boş, yani tekrar edilecek hiçbir sözcük yok — bugün on sözcüğün hepsi yeni. " +
    "Hedef `LEB1-3a`: kısa haberlerde önemli olgusal bilgiyi anlamak. Tema son Super Bowl, ama öğrendiğimiz " +
    "on sözcüğün sekizi her maç haberinde, dördü her trafik ve hava durumu haberinde de var.",
  preflight: [
    { step: "Profile", out: "docs/dutch/PROFILE.md okundu — 99 satır. ASML, Eindhoven, padel, Amerikan futbolu geçmişi." },
    { step: "Scenarios", out: "docs/dutch/SCENARIOS.md okundu — 5 Scenario, hiçbiri kullanılmamış." },
    { step: "Plan", out: "docs/dutch/PLAN.md — YOK. Bu prototipte elle yazıldı. Gerçek Docent burada durur ve Plan ister." },
    { step: "Intake queue", out: "`docent:intake` etiketli açık issue: 0. Sunacak bir şey yok." },
    { step: "Course queue", out: "Drive'da yeni NT2 kaydı: 0. Önceki oturumdan beri ders yok." },
    { step: "Theme", out: "Öncelik 1: kullanıcının yazdığı tema — `last superbowl`. Intake ve Scenario'ya bakılmadı." },
    { step: "Objective", out: "Plan'daki ilk `active` hedef: `LEB1-3a` (lezen, tier `exam`). Angle 1 seçildi: sözcük dağarcığı." },
    { step: "Review queue", out: "Vadesi gelen Direction: 0 / 0. Envanter boş. Ladder hiç çalışmadı." },
    { step: "Source", out: "nos.nl bir Named target. `Defensief sterke Seahawks winnen Super Bowl`, 2026-02-09, fetch + Readability. Dil kontrolü: geçti." },
    { step: "Budget", out: "Yeni Item: 10 / 10. Picture: 10 (5 kendiliğinden + 5 teklif). Trap: 3 / Lesson." },
  ],
  prompts: [
    { id: "P1", type: "item", item: "wedstrijd", dir: "recognition", ask: "`de wedstrijd` ne demek?" },
    { id: "P2", type: "item", item: "wedstrijd", dir: "production", ask: "'maç' Hollandaca nasıl yazılır? (artikeliyle)" },
    { picture: { file: "s12-verslagen.webp", alt: "slaan/sloeg/geslagen over verslaan/versloeg/verslagen; verslagd crossed out" }, id: "P3", type: "item", item: "uitslag", dir: "recognition", ask: "`de uitslag was 29-13` — `uitslag` ne demek?" },
    { picture: { file: "s12-scheids-s.webp", alt: "scheid + -s- + rechter, the linking -s- circled: niet vergeten" }, id: "P4", type: "item", item: "uitslag", dir: "production", ask: "'Seçim sonucu' Hollandaca nasıl söylenir?" },
    { picture: { file: "s12-er-gebeurd.webp", alt: "Wat is gebeurd? crossed out; Wat is er gebeurd? ticked — er is verplicht" }, id: "P5", type: "item", item: "helft", dir: "recognition", ask: "`in de tweede helft` ne demek?" },
    { picture: { file: "s12-uitslag-fout.webp", alt: "het resultaat crossed out, de uitslag ticked, a ballot box" }, id: "P6", type: "item", item: "helft", dir: "production", ask: "'Seyircinin yarısı' Hollandaca nasıl söylenir?" },
    { picture: { file: "s12-ruim-fout.webp", alt: "ruim splits: een ruime kamer, and ruim 125 miljoen before a number" }, id: "P7", type: "item", item: "scheidsrechter", dir: "recognition", ask: "`de scheidsrechter` kimdir — ve sözcüğün iki parçası ne?" },
    { id: "P8", type: "item", item: "verslaan", dir: "production", ask: "'Seattle, New England'i yendi' — `verslaan` ile kur." },
    { id: "P9", type: "item", item: "ploeg", dir: "recognition", ask: "`de ploeg speelde goed` — burada `ploeg` ne demek?" },
    { id: "P10", type: "item", item: "aanval", dir: "recognition", ask: "`de aanval` ve `de verdediging` — hangisi hücum?" },
    { id: "P11", type: "item", item: "winnen", dir: "production", ask: "'Kazandılar' Hollandaca nasıl söylenir? (voltooid verleden tijd)" },
    { id: "P12", type: "open", objective: "LEB1-3a", ask: "Aşağıdaki Hollandaca cümlede kim, ne ve nerede? Türkçe iki cümleyle yaz.\n\n`De Seattle Seahawks wonnen zondag in Santa Clara de zestigste Super Bowl.`" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Session 12 — 2026-11-19. Answered, with Verdicts. The mid-journey case.
// ─────────────────────────────────────────────────────────────────────────────

export const sessionTwelve = {
  id: "2026-11-19-superbowl-terug",
  date: "2026-11-19",
  url: "/nederlands/session/2026-11-19-superbowl-terug/",
  status: "complete" as const,
  theme: "last superbowl",
  themeSource: "typed by the learner — the same Theme, two months on",
  objective: "LEB1-3a",
  angle: 5,
  lesson: { slug: "de-tijd-in-een-nieuwsbericht", title: "Haberde zaman: perfectum mu, imperfectum mu?" },
  tekst: { slug: "de-seahawks-winnen-de-super-bowl", title: "De Seahawks winnen de Super Bowl" },
  invocation: "/docent i want to do a lesson about last superbowl",
  intro:
    "Aynı temayı iki ay sonra ikinci kez yazdın. Bu kez envanter dolu: 63 Item, 126 Direction, bugün 11 tanesi " +
    "vadesinde. Yeni Item bütçesinin altısını kullandık. Hedef hâlâ `LEB1-3a`, ama Angle 5: haber dilinde zaman. " +
    "Tekst bu oturumun yan ürünü — Objective bir *lezen* hedefi olduğu için.",
  preflight: [
    { step: "Profile", out: "Okundu. Değişiklik teklifi yok." },
    { step: "Scenarios", out: "Okundu. `padel-app` en son 2026-11-12'de kullanıldı." },
    { step: "Plan", out: "`LEB1-3a` hâlâ `active` — 5. oturum. Angle 1-4 harcanmış." },
    { step: "Intake queue", out: "1 açık issue: #212, `docent:intake` — padel grubundan bir ekran görüntüsü. **Teklif edildi, sen 'sonra' dedin. Issue açık kaldı.**" },
    { step: "Course queue", out: "Drive'da 2 yeni NT2 kaydı (11-16, 11-19). Ayrık script başlatıldı, oturum beklemedi." },
    { step: "Theme", out: "Öncelik 1: yazdığın tema. Intake teklifi reddedildiği için Scenario'ya hiç bakılmadı." },
    { step: "Review queue", out: "Vadesi gelen Direction: 11 / 126. Horizon 2027-03-31, kalan 132 gün. Ladder: 2 / 4 / 8 / 17 / 180 gün." },
    { step: "Source", out: "Aynı nos.nl haberi. Bu kez Tekst'in dayanağı — kopya değil, Provenance." },
    { step: "Budget", out: "Yeni Item: 6 / 10. Picture: 7 çizildi (3 kendiliğinden + 4 teklif). Trap: 2 / 3." },
  ],
  answered: [
    { id: "P1", type: "item", item: "verdediging", dir: "recognition", ask: "`de verdediging` ne demek?", answer: "savunma", verdict: "correct", rungFrom: 2, rungTo: 3, note: "" },
    { id: "P2", type: "item", item: "verdediging", dir: "production", ask: "'Savunma çok iyiydi' — Hollandaca kur.", answer: "De verdediging was heel goed", verdict: "correct", rungFrom: 1, rungTo: 2, note: "" },
    { id: "P3", type: "item", item: "verslaan", dir: "production", ask: "'Seattle, New England'i yendi' — `verslaan` ile, voltooid verleden tijd.", answer: "Seattle heeft New England verslagd", verdict: "close", rungFrom: 1, rungTo: 1, note: "Neredeyse. Deelwoord `verslagen`, `verslagd` değil — `slaan` güçlü fiil. Doğrusu: `Seattle heeft New England verslagen`. Yazım hatası olduğu için Rung düşmedi." },
    { id: "P4", type: "item", item: "scheidsrechter", dir: "production", ask: "'Hakem' Hollandaca nasıl yazılır?", answer: "de scheidrechter", verdict: "close", rungFrom: 1, rungTo: 1, note: "Bağlayıcı `-s-` düştü: `scheid` + **`-s-`** + `rechter`. Split'i tekrar okudum senin için." },
    { id: "P5", type: "item", item: "gebeuren", dir: "production", ask: "'Ne oldu?' Hollandaca nasıl sorulur?", answer: "Wat is gebeurd?", verdict: "close", rungFrom: 1, rungTo: 1, note: "`er` eksik: `Wat is er gebeurd?` — Hollandaca bu soruyu `er` olmadan kurmaz." },
    { id: "P6", type: "item", item: "uitslag", dir: "production", ask: "'Seçim sonucu' Hollandaca nasıl söylenir?", answer: "het resultaat van de verkiezingen", verdict: "incorrect", rungFrom: 2, rungTo: 1, note: "Trap tam buydu. Seçimde `de uitslag` kullanılır: `de uitslag van de verkiezingen`. `het resultaat` bir çabanın karşılığıdır." },
    { id: "P7", type: "item", item: "ruim", dir: "recognition", ask: "`ruim 125 miljoen mensen` — `ruim` ne demek?", answer: "geniş", verdict: "incorrect", rungFrom: 1, rungTo: 1, note: "`ruim` sıfat olarak 'geniş' demek — orada haklısın. Ama sayıdan önce gelince '**-den fazla**' olur: `ruim 125 miljoen` = 125 milyondan fazla. Rung zaten 1'deydi, daha aşağı inmez." },
    { id: "P8", type: "item", item: "helft", dir: "recognition", ask: "`de helft van het publiek` ne demek?", answer: "seyircinin yarısı", verdict: "correct", rungFrom: 4, rungTo: 5, note: "Bu Direction artık Mastered. 180 günde bir geri gelecek." },
    { id: "P9", type: "item", item: "aanval", dir: "production", ask: "'Hücum iyi çalışmadı' — Hollandaca kur.", answer: "De aanval werkte niet goed", verdict: "correct", rungFrom: 2, rungTo: 3, note: "" },
    { id: "P10", type: "item", item: "volgens", dir: "recognition", ask: "`volgens de NOS` ne demek?", answer: "NOS'a göre", verdict: "correct", rungFrom: 2, rungTo: 3, note: "" },
    { id: "P11", type: "item", item: "wedstrijd", dir: "production", ask: "'Maç iki saat sürdü' — Hollandaca kur.", answer: "De wedstrijd duurde twee uur", verdict: "correct", rungFrom: 3, rungTo: 4, note: "" },
    { id: "P12", type: "item", item: "optreden", dir: "recognition", ask: "`het optreden in de pauze` ne demek?", answer: "aradaki gösteri", verdict: "correct", rungFrom: 0, rungTo: 1, note: "Yeni Item — ilk doğru cevap Rung 1'e koydu. İlk tekrar 2 gün sonra." },
    {
      picture: undefined as { file: string; alt: string } | undefined,
      id: "P13", type: "open", objective: "LEB1-3a",
      ask: "Tekst'i oku, sonra şu soruyu Türkçe üç cümleyle cevapla: haber, Seattle'ın bu galibiyetini neden 'ikinci' diye anıyor ve önceki iki final ne olmuştu?",
      answer:
        "Seattle bu şampiyonluğu ikinci kez kazandı. On iki yıl önce ilk kez kazanmıştı. Bir yıl sonra tekrar finale çıktı ama kaybetti, ve o maç da Patriots'a karşıydı.",
      verdict: null,
      note:
        "Üçü de doğru, ve üçünü de metinden çıkarmışsın — `wie-wat-waar` tam olarak bu. İki not: 'kazanmıştı' için " +
        "Hollandacada `had gewonnen` kullanırsın (voltooid verleden tijd), ve haberin kendisi bunu `wonnen ze voor " +
        "het eerst` diye sade geçmiş zamanla veriyor. Angle 5'in konusu tam da bu ayrım.",
    },
  ],
  rungMoves: { up: 6, flat: 4, down: 1, mastered: 1 },
};

// ─────────────────────────────────────────────────────────────────────────────
// The Tekst — Session 12's by-product. Delft: one Dutch text plus its word list.
// Agent-written Dutch, unmarked (adr/0010). Facts from nos.nl 2026-02-09.
// ─────────────────────────────────────────────────────────────────────────────

export const tekst = {
  slug: "de-seahawks-winnen-de-super-bowl",
  url: "/nederlands/tekst/de-seahawks-winnen-de-super-bowl/",
  title: "De Seahawks winnen de Super Bowl",
  provenance: "Feiten: nos.nl, 9 februari 2026 — 'Defensief sterke Seahawks winnen Super Bowl'. De tekst is hier geschreven.",
  wordlist: [
    { nl: "de wedstrijd", tr: "maç", known: true },
    { nl: "de ploeg", tr: "takım", known: true },
    { nl: "winnen", tr: "kazanmak", known: true },
    { nl: "verliezen", tr: "kaybetmek", known: true },
    { nl: "de helft", tr: "yarı, devre", known: true },
    { nl: "de verdediging", tr: "savunma", known: true },
    { nl: "de uitslag", tr: "sonuç, skor", known: true },
    { nl: "de titel", tr: "şampiyonluk", known: false },
    { nl: "het record", tr: "rekor", known: false },
    { nl: "de pauze", tr: "ara, devre arası", known: false },
    { nl: "het optreden", tr: "gösteri", known: false },
    { nl: "de toeschouwer", tr: "seyirci", known: false },
    { nl: "de verlenging", tr: "uzatma", known: false },
  ],
  body: [
    "Op zondag 8 februari 2026 speelden de Seattle Seahawks tegen de New England Patriots. De wedstrijd was in het Levi's Stadium in Santa Clara, in Californië. Het was de zestigste Super Bowl, de finale van het American football in de Verenigde Staten.",
    "De Seahawks wonnen met 29-13. Er kwam geen verlenging: de uitslag stond lang voor het einde al vast. Het was de tweede titel van de ploeg. Twaalf jaar geleden wonnen ze voor het eerst. Een jaar later stonden ze er weer, en toen verloren ze — ook tegen de Patriots.",
    "De verdediging van Seattle speelde sterk. De jonge quarterback van New England kreeg bijna geen ruimte en ging zes keer tegen de grond. Kenneth Walker werd gekozen tot beste speler van de wedstrijd. Hij is de eerste running back die deze prijs wint in achtentwintig jaar.",
    "Ook de kicker Jason Myers had een goede avond. Hij schoot vijf keer raak en zette daarmee een record neer. In de pauze, tussen de eerste en de tweede helft, was er een groot optreden van de zanger Bad Bunny, met Lady Gaga en Ricky Martin als verrassing. In de Verenigde Staten keken ruim 125 miljoen toeschouwers naar de wedstrijd.",
  ],
  gist:
    "Seattle Seahawks, 8 Şubat 2026'da Santa Clara'da oynanan altmışıncı Super Bowl'u New England Patriots'a karşı 29-13 kazandı. Bu, takımın ikinci şampiyonluğu; ilkini on iki yıl önce almıştı. Maçın en iyi oyuncusu Kenneth Walker seçildi ve devre arasında Bad Bunny sahne aldı.",
  questions: [
    "Maç ne zaman, nerede ve hangi iki takım arasında oynandı?",
    "Skor kaç kaçtı, ve maçta uzatma oynandı mı?",
    "Seattle bu finali daha önce kaç kez kazanmış, kaç kez kaybetmişti?",
    "Kenneth Walker neden seçildi, ve bu neden özel?",
    "Devre arasında ne oldu, ve kaç kişi maçı izledi?",
  ],
  note: "Bir Tekst en fazla on yeni sözcük getirir — bir oturumun yeni Item bütçesi. Burada altısı yeni, yedisi zaten envanterde.",
  picture: { file: "tekst-header.webp", style: "editorial", alt: "Tekst header — a stadium scoreboard reading 29-13 under a night sky", owner: "tekst" },
};

// ─────────────────────────────────────────────────────────────────────────────
// The Lesson — Session 1's. Turkish prose, quoting Dutch and English (adr/0002).
// ─────────────────────────────────────────────────────────────────────────────

export const lesson = {
  slug: "wie-wat-waar-in-een-wedstrijdverslag",
  url: "/nederlands/lesson/wie-wat-waar-in-een-wedstrijdverslag/",
  title: "Bir maç haberinde: kim, ne, nerede",
  lead:
    "Hollandaca bir haber, en önemli bilgiyi ilk cümleye koyar. O cümleyi çözebilirsen haberin yarısını almışsın demektir. Bugün bunu bir maç haberinde yapacağız.",
  provenance: "nos.nl, 9 Şubat 2026 — 'Defensief sterke Seahawks winnen Super Bowl'. Sözcükler oradan; cümleler burada yazıldı.",
  objectiveLine:
    "Hedef `LEB1-3a`: *Kan belangrijke feitelijke informatie begrijpen in korte verslagen en artikelen.* Taalprofielen bu hedefin örnekleri arasında tam olarak şunu sayıyor: *het 'wie-wat-waar' in krantenartikelen*.",
  sections: [
    {
      h: "Haberin ilk cümlesi",
      picture: { file: "s1-woordvolgorde.webp", style: "instructional", alt: "Five numbered slots: WIE, WERKWOORD (locked), WANNEER, WAAR, WAT", owner: "lesson" },
      body: [
        "Hollandaca haber cümlesi şu sırayı sever: **kim — ne yaptı — ne zaman — nerede — neyi**. Türkçeden en çok ayrıldığı yer burası: Türkçede fiil sona gider, Hollandacada çekimli fiil **ikinci** sıraya oturur ve orada kalır.",
        "`De Seattle Seahawks wonnen zondag in Santa Clara de zestigste Super Bowl.`",
        "Parçalara ayıralım: `De Seattle Seahawks` (kim) · `wonnen` (ne yaptı — ikinci sırada) · `zondag` (ne zaman) · `in Santa Clara` (nerede) · `de zestigste Super Bowl` (neyi). Zaman her zaman yerden **önce** gelir. Bu kural haber dilinde neredeyse hiç bozulmaz, ve sınavda da böyle çıkar.",
        "Şimdi aynı kalıbı bir trafik haberinde gör: `De politie sloot dinsdag op de A2 twee rijstroken af.` Aynı sıra, bambaşka konu. Bugünkü on sözcüğün dördü o cümlede de işine yarar.",
      ],
    },
    {
      picture: undefined as { file: string; style: string; alt: string; owner: string } | undefined,
      h: "Maçın kendisi",
      body: [
        "Bir maç haberi üç şeyi söyler: kim oynadı, kim kazandı, skor ne. Üçü için üç sözcük ailesi var — ve hepsi spor dışında da çalışır.",
      ],
      items: ["wedstrijd", "ploeg", "winnen", "verliezen", "verslaan", "uitslag"],
    },
    {
      h: "Sahanın içi",
      body: [
        "Bundan sonrası maçın içi: kim hücum ediyor, kim savunuyor, kim düdük çalıyor, devre ne zaman bitiyor.",
      ],
      items: ["helft", "aanval", "verdediging", "scheidsrechter"],
    },
  ],
  traps: ["helft", "uitslag", "ploeg"],
  metataal: [
    { term: "voltooid deelwoord", tr: "geçmiş zaman ortacı — `gewonnen`, `verslagen`. Türkçede '-mış' ortacına en yakın şey.", newHere: true },
    { term: "scheidbaar werkwoord", tr: "ayrılabilir fiil — `aanvallen` → `hij valt aan`. Ön ek cümlenin sonuna kaçar.", newHere: true },
  ],
  close:
    "Bu on sözcüğün sekizi her maç haberinde var. Dördü — `de uitslag`, `de helft`, `winnen`, `verliezen` — spor sayfasının dışında da, belediye haberinde ve seçim haberinde de karşına çıkacak. İkisi — `de aanval` ve `de scheidsrechter` — bu temaya bağlı kalır. Bu, temanın nereye kadar taşıdığını gösteren dürüst çizgi.",
  picture: { file: "lesson-header.webp", style: "editorial", alt: "Lesson header — a Dutch news page with the lead sentence broken into who, what, where", owner: "lesson" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Findings — the reason the prototype exists.
// ─────────────────────────────────────────────────────────────────────────────

export const findings = [
  {
    tag: "size",
    claim: "Session 1 is too big and the mid-journey Session is about right.",
    body:
      "Session 1 carries ten brand-new Items, twelve Prompts and a full Lesson, with nothing to review. Every word on the page is unknown. Session 12 carries six new Items, thirteen Prompts and a Tekst, and eleven of its Prompts are words the learner has already met. The second reads in about ten minutes; the first does not. **The Pictures make it worse**: the same Lesson measures 6,152 px without them and 9,642 px with them at 900 px wide — ten Pictures add 57% to the scroll, and #131 allows ten.",
  },
  {
    tag: "theme",
    claim: "The theme stops working at exactly two words, and the Profile says why.",
    body:
      "`de aanval` and `de scheidsrechter` belong to the theme and go no further. The other eight appear in a traffic report and a council notice. But the harder limit is in the Profile: the learner played American football for thirteen years and now neither plays nor watches it. The theme is rich in vocabulary and dead in motivation — and no Scenario in the library needs it.",
  },
  {
    tag: "empty",
    claim: "The unprompted Picture order is mostly inapplicable to a first Session.",
    body:
      "#131 orders the five unprompted Pictures: an Item answered wrong, an Item with no Bridge, then a header. Session 1 has no wrong answers, because nothing was ever asked. Rule 1 fires zero times, so the whole budget falls through to rules 2 and 3.",
  },
  {
    tag: "plan",
    claim: "Docent cannot run at all without PLAN.md, so authoring it is the first build task.",
    body:
      "The preflight's third step reads the Plan. There is no Plan, so every number in this prototype's Plan slice and inventory is invented. This is a **sequencing** find, not a gap: the map rules artifacts out of scope, so the Plan belongs to the build after `/to-spec` — it just has to come first, before any other artifact. Authoring is mechanical (**122 Objectives**, ids intact in the landed Taalprofielen text); placement is a separate Assess pass (#85), and #123's `unmapped` Scenario sentences convert in the same step.",
  },
  {
    tag: "trilingual",
    claim: "The Lesson reads, and the second bridge does not crowd it.",
    body:
      "The ticket asked whether a trilingual page clutters. There is no trilingual page (#132). What there is: Turkish prose that quotes Dutch, and English appearing only inside a Bridge. On this Lesson English shows up four times in ten Items, always as one quoted word. It reads.",
  },
  {
    tag: "traps",
    claim: "The three-Trap cap bites on the first Lesson.",
    body:
      "Four of the ten Items have a real Trap: `de helft`, `de uitslag`, `de ploeg` and `verslaan` (which also means 'to report on'). Three is the cap, so `verslaan`'s second meaning goes into the prose instead. That is the cap working — but it means a Lesson's Trap count is a selection, and nothing records what was dropped.",
  },
  {
    tag: "split",
    claim: "The rule that a Split needs two meaningful parts is doing real work.",
    body:
      "`de verdediging` looks splittable — `ver-` + `dedig-` + `-ing` — and is not, because `dedig-` is not a Dutch word. It gets no Split and a Hook instead. Five of the sixteen Items in this prototype carry a Split; three were refused.",
  },
  {
    tag: "pictures",
    claim: "Twenty Pictures drew on the first attempt, and one of them was wrong in a way only a reader catches.",
    body:
      "19 of 20 drew correct Dutch first time. `s12-er-gebeurd` wrote `verpliht` for `verplicht`; #147's one retry fixed it, spent by naming the spelling letter by letter. So the read-and-retry rule works — but it is a *reading* rule, and Docent must actually look at twenty images to apply it. At about 100 seconds each, drawing a two-Session pair took 35 minutes of wall clock.",
  },
  {
    tag: "picture-blind",
    claim: "The retry rule only checks the Dutch, so a Hook whose scene is drawn wrong still ships.",
    body:
      "`s1-verdediging` was asked for two rows of defenders standing on two painted `DE` marks — the whole Hook. It drew one `DE` and one row. The Dutch was perfect, so the rule never fired. The same gap let `KIM` ship where Turkish needs `KİM`: #147 checks Dutch strings only, and a Turkish caption can be wrong without costing a retry.",
  },
  {
    tag: "ascii",
    claim: "Dodging the Turkish capitalisation bug puts broken Turkish in the picture instead.",
    body:
      "#147 found that `--language tr` applies Turkish capitalisation to Dutch words. The defence used here was to ASCII-fold the Turkish in the instruction — `uzerine`, `dusus`, `hucum`, `yargic`. The text rule then reproduced that ASCII letter for letter, so four images carry Turkish missing its diacritics. The rule that protects Dutch freezes whatever it is given.",
  },
  {
    tag: "translate",
    claim: "Without a standing rule, the generator translates Dutch into the output language.",
    body:
      "The first `lesson-header` drew the Dutch word `zondag` as the Turkish label `ZAMAN`, and buried the picture under two paragraphs of invented Turkish prose. #147's text rules did not cover this. One appended sentence — never translate a quoted string, add no prose of your own — fixed it and every image after it.",
  },
  {
    tag: "kwart",
    claim: "The theme needs Dutch sports words the curriculum did not teach, and the first draft got one wrong.",
    body:
      "This prototype's own Tekst first read `de uitslag stond al na de derde helft vast`. A Dutch football match has two `helften`; American football has four `kwarten`, and `de derde helft` is Dutch idiom for the drinks afterwards. The sentence was rewritten. `de helft` was taught in Session 1 precisely because it generalises — and the theme is the one place it does not.",
  },
  {
    tag: "answer",
    claim: "Thirteen Prompts is a long form on a phone, and the answer link is the reason.",
    body:
      "The whole Session goes back as one prefilled issue. Thirteen typed answers in one GitHub issue body is a lot of thumb. The `<AnswerForm>` keeps a draft in the browser, which helps, but the Session is still all-or-nothing: there is no half-submit.",
  },
];
