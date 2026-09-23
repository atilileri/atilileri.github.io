// PROTOTYPE — throwaway. Ticket #153: does a diagram teach a grammar rule better than a Turkish paragraph?
// Four structurally different rules. The teaching content is held once here so only the DRAWING differs
// between variants A–E — otherwise the prototype compares prose quality, not form.

export type RuleId = "dehet" | "scheidbaar" | "v2" | "getallen";

export type Rule = {
  id: RuleId;
  /** what the rule is called, in Turkish */
  title: string;
  /** the structural shape the rule has — the reason this rule is in the set */
  shape: string;
  /** one sentence: the rule itself */
  kernel: string;
  /** the Turkish paragraph — variant A's whole deliverable, written to win */
  prose: string[];
  /** worked examples every variant shows under its drawing */
  examples: { nl: string; tr: string; note?: string }[];
  /** the trap, in the #84 sense: a silent wrongness a TR or EN speaker walks into */
  trap?: string;
};

export const rules: Rule[] = [
  {
    id: "dehet",
    title: "de mi, het mi?",
    shape: "Sınıflandırma — dallanan bir karar",
    kernel: "Hollandacada belirli tanımlık ikidir: `de` ve `het`. Hangisi olduğu sözcüğün türüne bağlıdır.",
    prose: [
      "Hollandacada Türkçede olmayan bir şey var: her adın bir **tanımlığı** var, ve tanımlık iki tane. Belirli tanımlık ya `de` ya `het`. Yanlışını seçince cümle anlaşılır ama yabancı durur, ve sıfatın yazımı da bozulur.",
      "İlk iyi haber: **çoğullar her zaman `de`**. `het huis` → `de huizen`. İstisnası yok. İkinci iyi haber: **küçültme eki `-je` alan her sözcük `het`**. `het huisje`, `het biertje`, `het meisje`. Bu da istisnasız.",
      "Tekil ve küçültmesiz sözcüklerde sayı `de`'den yana: sözlüğün yaklaşık **dörtte üçü `de`**. Yani bilmiyorsan `de` de, çoğu zaman tutar.",
      "`het` olanlar bir avuç tanınabilir kümede toplanır: `-ment`, `-isme`, `-sel` ile bitenler (`het argument`, `het toerisme`); ad olarak kullanılan mastarlar (`het eten`, `het zwemmen`); diller ve renkler (`het Nederlands`, `het rood`); ve `ge-` ile kurulan toplu adlar (`het gebouw`, `het gebergte`).",
      "Geri kalanı ezberdir — ve ezber sözcükle birlikte olur. Bir adı **hiçbir zaman yalın öğrenme**: `huis` değil, `het huis`.",
    ],
    examples: [
      { nl: "de man", tr: "adam", note: "tekil, kümelerin dışında → `de`" },
      { nl: "het huis", tr: "ev", note: "ezber: `het`" },
      { nl: "de huizen", tr: "evler", note: "çoğul → her zaman `de`" },
      { nl: "het huisje", tr: "evcik", note: "`-je` → her zaman `het`" },
      { nl: "het toerisme", tr: "turizm", note: "`-isme` → `het`" },
      { nl: "het zwemmen", tr: "yüzme", note: "ad olmuş mastar → `het`" },
    ],
    trap:
      "Türkçede tanımlık yok, bu yüzden Türkçe konuşan kişi tanımlığı **düşürür**: `ik zie huis`. Kulağa eksik değil, yanlış gelir — ve söyleyen çoğu zaman fark etmez.",
  },
  {
    id: "scheidbaar",
    title: "Ayrılabilen eylemler",
    shape: "Hareket — bir parça yer değiştirir",
    kernel:
      "`opbellen` gibi eylemlerin önündeki parça, çekimli cümlede eylemden kopar ve cümlenin **sonuna** gider.",
    prose: [
      "Hollandacada birçok eylem bir **ön parça** taşır: `opbellen` (telefon etmek), `aankomen` (varmak), `meenemen` (yanında götürmek). Sözlükte parçalar bitişiktir.",
      "Cümlede ise bitişik kalmazlar. Eylem çekimlenince ön parça kopar, ikinci yuvada yalnız eylem kalır, ve **kopan parça cümlenin sonuna gider**: `Ik **bel** mijn moeder **op**.` Arada ne varsa — nesne, zaman, yer — hepsi ikisinin arasında durur.",
      "Parça ne kadar uzaklaşırsa uzaklaşsın anlamı taşımaya devam eder: `Ik **neem** mijn broer morgen naar het station **mee**.` Sondaki `mee` olmadan cümle başka bir şey söyler.",
      "Parça iki durumda geri yapışır: yan cümlede (`... dat ik mijn moeder **opbel**`) ve mastar ile (`Ik wil mijn moeder **opbellen**`).",
      "Hangi eylemlerin ayrıldığını **vurgu** söyler: ayrılabilen eylemde vurgu ön parçadadır (**ÓP**bellen). Vurgu gövdedeyse eylem ayrılmaz (`onderNEmen`).",
    ],
    examples: [
      { nl: "Ik bel mijn moeder op.", tr: "Annemi arıyorum.", note: "`op` sona gitti" },
      { nl: "Hij komt om acht uur aan.", tr: "Saat sekizde varıyor.", note: "`aan` sona gitti" },
      { nl: "Ik neem mijn broer morgen mee.", tr: "Kardeşimi yarın yanımda götürüyorum.", note: "araya üç öge girdi" },
      { nl: "... dat ik mijn moeder opbel.", tr: "... annemi aradığımı", note: "yan cümle: yapıştı" },
      { nl: "Ik wil mijn moeder opbellen.", tr: "Annemi aramak istiyorum.", note: "mastar: yapıştı" },
    ],
    trap:
      "Türkçede de eylem sona gider, bu yüzden bu kural tanıdık **hissettirir** — ama Türkçede giden eylemin kendisidir, burada giden yalnızca ön parçadır. Cümlenin ortasında hâlâ çekimli bir eylem durmak zorunda.",
  },
  {
    id: "v2",
    title: "Çekimli eylem ikinci yuvada",
    shape: "Yuvalar — sabit yerleri olan bir çerçeve",
    kernel:
      "Düz cümlede **çekimli eylem her zaman ikinci yuvadadır**. Birinci yuvaya ne koyarsan koy, bu değişmez.",
    prose: [
      "Hollandaca cümlenin tek katı kuralı budur: düz bir cümlede **çekimli eylem ikinci sıradadır**. Birinci sıra serbesttir — özne, zaman, yer, hatta bir yan cümle koyabilirsin — ama ikinci sıra eylemindir.",
      "`Ik lees elke dag de krant.` Birinci yuvada `ik`, ikinci yuvada `lees`.",
      "Cümleyi zamanla başlatırsan yuva sayısı değişmez, yalnızca özne eylemin **arkasına** geçer: `Elke dag **lees ik** de krant.` Buna *inversie* denir; yanlış yapılan yer neredeyse hep burasıdır.",
      "Yuva, sözcük değil **öge** sayar: `De man met de hoed **loopt** naar huis` cümlesinde birinci yuva beş sözcüktür, ama tek ögedir.",
      "Soru cümlesi ve emir bu kuralın dışındadır: orada eylem birinci yuvadadır (`**Lees** jij de krant?`). Yan cümlede ise eylem **sona** gider (`... omdat ik de krant **lees**`).",
    ],
    examples: [
      { nl: "Ik lees elke dag de krant.", tr: "Her gün gazete okurum.", note: "1: `ik` · 2: `lees`" },
      { nl: "Elke dag lees ik de krant.", tr: "Her gün gazete okurum.", note: "1: `elke dag` · 2: `lees` · özne arkaya" },
      { nl: "De krant lees ik elke dag.", tr: "Gazeteyi her gün okurum.", note: "1: nesne · 2: `lees`" },
      { nl: "De man met de hoed loopt naar huis.", tr: "Şapkalı adam eve yürüyor.", note: "birinci yuva beş sözcük, tek öge" },
      { nl: "Lees jij de krant?", tr: "Gazete okuyor musun?", note: "soru: eylem birinci yuvada" },
    ],
    trap:
      "Türkçede cümlenin başını istediğin gibi doldurup özne–eylem sırasını koruyabilirsin. Burada koruyamazsın: `Elke dag ik lees...` bozuktur, ama anlaşılır olduğu için kimse düzeltmez.",
  },
  {
    id: "getallen",
    title: "vierentachtig — sayılar ters okunur",
    shape: "Tersine çevirme — küçük, ve bilinen bir tuzak",
    kernel: "İki basamaklı sayılarda **birler basamağı önce** söylenir: 84 = `vier-en-tachtig` (dört-ve-seksen).",
    prose: [
      "21'den 99'a kadar Hollandaca sayıyı Türkçenin tersine söyler: **önce birler, sonra `en`, sonra onlar** — hepsi tek sözcük, bitişik.",
      "84 = `vier` (dört) + `en` (ve) + `tachtig` (seksen) = **`vierentachtig`**. Türkçe `seksen dört` der; Hollandaca `dört ve seksen` der.",
      "Bu kural yalnızca son iki basamak içindir. Yüzler ve binler soldan sağa, beklediğin gibi okunur: `driehonderd**vierentachtig**` = 384.",
      "Sesli ile biten birler basamağı `en`'den önce çift nokta alır: `tweeënveertig` (42), `drieënzestig` (63). Yazım kuralıdır, okunuş değişmez.",
      "Bu kural sınavda değil, hayatta vurur: telefon numarası, fiyat, randevu saati. Duyduğun ilk sayı son basamaktır — kaleme sondan başla.",
    ],
    examples: [
      { nl: "vierentachtig", tr: "84", note: "`vier` + `en` + `tachtig`" },
      { nl: "eenentwintig", tr: "21", note: "`een` + `en` + `twintig`" },
      { nl: "tweeënveertig", tr: "42", note: "sesli → çift nokta" },
      { nl: "zesennegentig", tr: "96", note: "`zes` + `en` + `negentig`" },
      { nl: "driehonderdvierentachtig", tr: "384", note: "yüzler soldan, son iki basamak ters" },
    ],
    trap:
      "Türkçe konuşan kişi `84` duyunca ilk sesi onlar sanır ve `48` yazar. Rakam doğru, sıra yanlış — ve yazan kişi hatayı görmez.",
  },
];

export const ruleById = Object.fromEntries(rules.map((r) => [r.id, r])) as Record<RuleId, Rule>;
