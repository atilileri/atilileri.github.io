// PROTOTYPE — throwaway. Ticket #148: five ways to draw a word's parts in a Lesson.
// One data file read by the page and by the Mermaid render script, so both draw the same facts.
// Every `origin` line comes from nl.wiktionary (fetched 2026-09-16) and links its page.
// A `resemblance` claims no shared origin, so it needs no source (the Bridge rule in CONTEXT.md).

export type Role = "stem" | "stem2" | "link" | "affix";

export type Part = {
  nl: string;
  role: Role;
  tr: string;
  en: string;
  base?: string; // dictionary form, when the word spells the part differently (grot ← groot)
  children?: Part[]; // a part that is itself built from parts
};

export type Origin = { part: string; tr: string; source: string };

export type Word = {
  id: string;
  nl: string;
  article: "de" | "het";
  situation: "transparent" | "drifting" | "opaque" | "control";
  parts: Part[];
  literal: { tr: string; en: string };
  meaning: { tr: string; en: string };
  drift?: string; // why the literal sum is not the meaning
  origins: Origin[];
  cousins?: string; // Germanic relatives, as the source lists them
  resemblance?: string;
  spelling?: string; // a spelling rule that changes a part inside the word
};

const wikt = (w: string) => `https://nl.wiktionary.org/wiki/${encodeURIComponent(w)}`;

export const situationLabel = {
  transparent: "Şeffaf — her parça bugün de bir sözcük",
  drifting: "Kayan — parçaların toplamı başka bir şey anlatıyor",
  opaque: "Kapalı — bir parçanın kökenine bakmak gerekiyor",
  control: "Kontrol — parçalanmayan sözcük",
};

export const words: Word[] = [
  {
    id: "telwoorden",
    nl: "telwoorden",
    article: "het",
    situation: "transparent",
    parts: [
      { nl: "tel", role: "stem", tr: "say-", en: "count" },
      { nl: "woord", role: "stem2", tr: "sözcük", en: "word" },
      { nl: "-en", role: "affix", tr: "-ler", en: "-s" },
    ],
    literal: { tr: "sayma sözcükleri", en: "count words" },
    meaning: { tr: "sayı sözcükleri: een, twee, drie…", en: "numerals" },
    origins: [
      { part: "telwoord", tr: "tel + woord birleşimi.", source: wikt("telwoord") },
      { part: "tel", tr: "`tellen` fiilinden; ‘hesaplamak’ anlamıyla ilk kez 901 yılında görülür.", source: wikt("tellen") },
      { part: "woord", tr: "Miras sözcük: Orta Felemenkçe `wort`, Ön-Cermence `*wurdan`.", source: wikt("woord") },
    ],
    cousins: "woord ↔ İngilizce `word`, Almanca `Wort`",
  },
  {
    id: "troonrede",
    nl: "troonrede",
    article: "de",
    situation: "transparent",
    parts: [
      { nl: "troon", role: "stem", tr: "taht", en: "throne" },
      { nl: "rede", role: "stem2", tr: "konuşma", en: "speech" },
    ],
    literal: { tr: "taht konuşması", en: "throne speech" },
    meaning: { tr: "Kralın Prinsjesdag'da okuduğu, hükümetin yeni yıl planını anlatan konuşma", en: "the King's Speech on Prinsjesdag" },
    origins: [
      { part: "troonrede", tr: "troon + rede birleşimi.", source: wikt("troonrede") },
      { part: "troon", tr: "Fransızca ya da Latinceden ödünç; ‘hükümdarın tören koltuğu’ anlamıyla ilk kez 1240'ta.", source: wikt("troon") },
      { part: "rede", tr: "‘söylenen şey’ anlamıyla ilk kez 1350'de.", source: wikt("rede") },
    ],
    resemblance: "troon, İngilizce `throne` sözcüğüne benzer.",
  },
  {
    id: "miljoenennota",
    nl: "miljoenennota",
    article: "de",
    situation: "transparent",
    parts: [
      { nl: "miljoen", role: "stem", tr: "milyon", en: "million" },
      { nl: "-en-", role: "link", tr: "bağlayıcı ses", en: "linking sound" },
      { nl: "nota", role: "stem2", tr: "not, yazılı belge", en: "note, memorandum" },
    ],
    literal: { tr: "milyonların notu", en: "the millions note" },
    meaning: { tr: "hükümetin gelecek yılın bütçesini açıkladığı belge", en: "the budget memorandum" },
    origins: [
      { part: "miljoenennota", tr: "miljoen + nota birleşimi, araya `-en-` girer.", source: wikt("miljoenennota") },
      { part: "miljoen", tr: "Fransızcadan ödünç, ilk kez 1510'da. Kökü İtalyanca `milione`: `mille` ‘bin’ + büyütme eki `-one`, yani ‘büyük bin’. Kesin değerini 17. yüzyılda kazanır.", source: wikt("miljoen") },
      { part: "nota", tr: "Latinceden ödünç; ‘not, kayıt’ anlamıyla ilk kez 1525'te.", source: wikt("nota") },
    ],
    resemblance: "nota, Türkçe `nota` (resmî yazı) ve İngilizce `note` sözcüklerine benzer.",
  },
  {
    id: "voorbeelden",
    nl: "voorbeelden",
    article: "het",
    situation: "drifting",
    parts: [
      { nl: "voor", role: "stem", tr: "ön", en: "fore" },
      { nl: "beeld", role: "stem2", tr: "resim, imge", en: "image" },
      { nl: "-en", role: "affix", tr: "-ler", en: "-s" },
    ],
    literal: { tr: "önde duran resimler", en: "fore-images" },
    meaning: { tr: "örnekler", en: "examples" },
    drift: "1526'da `voorbeeld`, ‘taklit edilmek için önüne konan resim’ demekti. Önüne konup kopyalanan şey → örnek.",
    origins: [
      { part: "voorbeeld", tr: "voor + beeld birleşimi; ‘taklit edilecek resim’ anlamıyla ilk kez 1526'da.", source: wikt("voorbeeld") },
      { part: "voor", tr: "Orta Felemenkçe `vore`, Ön-Cermence `*furi-`.", source: wikt("voor") },
      { part: "beeld", tr: "Miras sözcük: Orta Felemenkçe `beelde`, Eski Felemenkçe `bilithi`; ‘resim’ anlamıyla ilk kez 901'de.", source: wikt("beeld") },
    ],
    cousins: "voor ↔ İngilizce `for`, Almanca `für`",
  },
  {
    id: "rijksbegroting",
    nl: "rijksbegroting",
    article: "de",
    situation: "opaque",
    parts: [
      { nl: "rijk", role: "stem", tr: "devlet", en: "state" },
      { nl: "-s-", role: "link", tr: "bağlayıcı ses", en: "linking sound" },
      {
        nl: "begroting", role: "stem2", tr: "bütçe", en: "budget",
        children: [
          { nl: "be-", role: "affix", tr: "fiil yapan ön ek", en: "verb prefix" },
          { nl: "grot", base: "groot", role: "stem2", tr: "büyük", en: "great" },
          { nl: "-ing", role: "affix", tr: "-me (isim yapar)", en: "-ing" },
        ],
      },
    ],
    literal: { tr: "devletin büyüklüğünü biçmesi", en: "the state's sizing-up" },
    meaning: { tr: "devlet bütçesi", en: "the national budget" },
    drift: "`begroten` ‘büyüklüğünü biçmek’, yani tahmin etmek. Tahmin edilen harcama → bütçe.",
    origins: [
      { part: "rijksbegroting", tr: "rijk + begroting birleşimi, araya `-s-` girer.", source: wikt("rijksbegroting") },
      { part: "rijk", tr: "‘devlet’ anlamıyla Keltçeden ödünç, ilk kez 901'de.", source: wikt("rijk") },
      { part: "begroting", tr: "`begroten` fiilinden, `-ing` ile isim olur.", source: wikt("begroting") },
      { part: "begroten", tr: "`groot` ya da `groten` sözcüğünden, `be-` ön eki ile türetilir.", source: wikt("begroten") },
      { part: "groot", tr: "Orta Felemenkçe `groot`, Ön-Cermence `*grautaz`.", source: wikt("groot") },
    ],
    cousins: "groot ↔ İngilizce `great`, Almanca `groß`",
    spelling: "`groot` burada `grot` yazılır: `be-gro-ting` hecelerinde `o` açık hecede kalır ve uzun ünlü tek harfle yazılır.",
  },
  {
    id: "gordijn",
    nl: "gordijn",
    article: "het",
    situation: "control",
    parts: [{ nl: "gordijn", role: "stem", tr: "perde", en: "curtain" }],
    literal: { tr: "—", en: "—" },
    meaning: { tr: "perde", en: "curtain" },
    origins: [
      { part: "gordijn", tr: "Fransızcadan ödünç, ilk kez 1285'te. Orta Felemenkçe `gardîne` ← Eski Fransızca `curtine` ← Geç Latince `cortina`.", source: wikt("gordijn") },
    ],
    resemblance: "gordijn, İngilizce `curtain` sözcüğüne benzer.",
  },
];
