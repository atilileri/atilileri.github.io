# Dutch source material and the inburgering exam spec

**Question:** What does the Dutch citizenship / inburgering exam *actually* demand today — components, CEFR levels, published syllabi, official practice material — and what source material exists to generate lessons, vocabulary and a curriculum from? Split the material into what can be fetched into a **public** repo and what must be bought.

**Ticket:** [#77](https://github.com/atilileri/atilileri.github.io/issues/77), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74). Blocks [#85](https://github.com/atilileri/atilileri.github.io/issues/85) and [#89](https://github.com/atilileri/atilileri.github.io/issues/89).

**Date:** 2026-08-17

---

## TL;DR verdict

**Build for B1, and treat A2 as a floor you will pass on the way past it.** The A2-vs-B1 question has a two-part answer, and both parts point the same direction:

1. **If the user is inburgeringsplichtig under the Wet inburgering 2021** (i.e. the integration obligation started on or after 1 January 2022), the default is the **B1-route**, and the exam is taken **at B1** — the four language exams *are* the Staatsexamen NT2 Programma I. A2 is only reachable as a **downgrade**, and only after "minimaal 600 uur cursus", recorded in the PIP ([DUO, Leerroutes](https://duo.nl/zakelijk/inburgering-ketenpartners/wet-inburgering-2021/leerbaarheidstoets-en-leerroutes/leerroutes.jsp) — opened directly).
2. **If the goal is purely naturalisation**, the current statutory floor is **A2** — "U moet het inburgeringsexamen halen op taalniveau A2. Of het staatsexamen Nederlands als tweede taal (Nt2) op niveau B1 of B2" ([inburgeren.nl, Naturaliseren](https://www.inburgeren.nl/u-gaat-inburgeren/naturaliseren.jsp) — opened directly). **But that floor is being raised.** The IND's own February 2026 implementation assessment of the draft Rijkswet op het Nederlanderschap states flatly: *"Het betreft een verhoging van het voor naturalisatie vereiste taalniveau van ten minste A2 naar ten minste B1"*, and elsewhere *"In Europees Nederland betreft het vereiste taalniveau op het moment van schrijven A2. Er zijn plannen om dit niveau te verhogen naar B1"* ([IND, Uitvoeringstoets wetsvoorstel RWN, februari 2026](https://ind.nl/nl/documenten/03-2026/uitvoeringstoets-wetsvoorstel-rijkswet-op-het-nederlanderschap-rwn-februari-2026.pdf) — opened directly, text extracted locally). The same bill lengthens the general naturalisation term from five to ten years.

So **the NOW page's B1 claim is correct as a planning target**, and it is correct for two independent reasons: it is the actual Wi2021 bar, and it is the level the naturalisation bar is moving to. Anyone building an A2-shaped system today is building for a target with a published expiry date.

**"A little above exam level" therefore means B2 — concretely, Staatsexamen NT2 Programma II.** Not vaguely "B1+". The Dutch system has an off-the-shelf, officially examined, one-step-up target: Programma I is B1, Programma II is B2, both are real diplomas, and both are examined on the *same four skills with the same machinery* ([staatsexamensnt2.nl, Hoe ziet het examen eruit](https://www.staatsexamensnt2.nl/voorbereiden/hoe-ziet-het-examen-eruit) — opened directly). Aim sessions at B2 receptive (lezen/luisteren) and B1+ productive (schrijven/spreken), and the B1 exam becomes comfortable rather than a squeeze. See §6.

**On material, the single best find is [Taalprofielen 2015](https://slo.nl/publish/pages/2890/taalprofielen-2015.pdf) (SLO).** It is the official Dutch rendering of the CEFR can-do descriptors, broken out per skill (Lezen, Luisteren, Gesprekken voeren, Spreken, Schrijven) and per level A1–C2, built on the Taalunie's accredited CEFR translation — **and it carries an explicit, unusually generous reuse grant**: *"Mits de bron wordt vermeld, is het toegestaan zonder voorafgaande toestemming van de uitgever deze uitgave geheel of gedeeltelijk te kopiëren en/of verspreiden en om afgeleid materiaal te maken dat op deze uitgave is gebaseerd."* (opened directly; text extracted locally from the PDF). That is a curriculum spine, licence-clean for a public repo, for free. It is what [#85](https://github.com/atilileri/atilileri.github.io/issues/85) should be built on.

**The shopping list leads with three items** (§9): the **Van Dale Pocketwoordenboek NT2** (€23,99 — the *only* dictionary permitted in the exam room), **Nederlands in actie** (€50,50 — the A2→B1 Coutinho volume that covers exactly the route being targeted), and **Nederlands op niveau** (€50,00 — B1→B2, i.e. the "a little above" tier). Everything else is optional.

**Two licence traps to carry into [#89](https://github.com/atilileri/atilileri.github.io/issues/89):** the best free Dutch frequency list and the best free Dutch treebank are both **CC BY-SA 4.0**, which is *viral* — derived vocabulary Items committed to this public repo would inherit ShareAlike. See §8.3. There is a clean alternative for wordlists (OpenTaal, BSD / CC BY 3.0) but not for frequency ranking.

---

## 0. How to read this — verification convention

Matching `docs/research/dutch-teaching-techniques.md` and `docs/research/agent-vs-model-harness-skills.md`:

- **Opened directly** — I fetched the page (or fetched the PDF and extracted its text on this machine) and read the claim in it.
- **Indexed-not-verified** — the claim comes from a search index's summary, because the page 403'd/404'd, or was a PDF I could not decode. Treat the *direction* as corroborated and the *specifics* as needing a re-check.

A note on this machine's limits, since it shaped what could be verified: there is **no `pdftotext` and no `pypdf`**, and `pip` is absent, so PDFs cannot be decoded by the normal route. I worked around it with a hand-rolled zlib+regex extractor over the PDF content streams, which succeeded on the IND uitvoeringstoets and on Taalprofielen 2015 (both marked *opened directly*) and **failed** on the Taalunie Basisboekenlijst, whose fonts use a subset encoding the extractor cannot map. That one is marked *indexed-not-verified* and its contents are **not** relied on below.

A note on the sibling agent's warning: `inburgering.org` is indeed third-party and is **not cited here**. Nor are `dutchexams.com`, `dutchexam.online` or `nt2taalmenu.nl`, all of which surfaced high in search and none of which are official. Every exam claim in Part One comes from `inburgeren.nl`, `duo.nl`, `rijksoverheid.nl`, `ind.nl`, `staatsexamensnt2.nl`, `cvte.nl` or `officielebekendmakingen.nl`. Two DUO URLs 404'd on me too (`inburgeren.nl/en/exam/parts/`, `inburgeren.nl/examen-doen/inhoud-examens.jsp` via one fetcher path, and the `duo.nl/zakelijk/.../naturalisatie-of-ander-type-verblijfsvergunning.jsp` deep link); in each case I found the live equivalent rather than leaning on a summary.

---

# Part One — the exam

## 1. First, disambiguate: there is no single "the inburgering exam"

The most common way to get this wrong is to treat "inburgeringsexamen" as one fixed object. It is not. Which components you sit, and at what level, depends on **when your integration obligation started** — and separately, **what you are trying to achieve** (a diploma, permanent residence, or naturalisation).

**By start date** ([inburgeren.nl, Welke examens](https://www.inburgeren.nl/examen-doen/) — opened directly):

| Obligation started | Components |
| --- | --- |
| 1 Jan 2013 – 1 Jan 2015 | Lezen, Luisteren, Schrijven, Spreken, **KNM** |
| 1 Jan 2015 – 1 Oct 2017 | + **ONA** (Oriëntatie op de Nederlandse Arbeidsmarkt) |
| On/after 1 Oct 2017 | + **PVT** (Participatieverklaringstraject) |
| On/after 1 Jan 2022 (**Wi2021**) | Lezen, Luisteren, Schrijven, Spreken, **KNM**, **PVT**, and **MAP** in place of ONA |

The Wi2013 page states all of it is at "taalniveau A2 of hoger". The Wi2021 structure is set out separately ([DUO, Examen doen onder de Wi2021](https://duo.nl/zakelijk/inburgering-ketenpartners/wet-inburgering-2021/examens-wi2021/examen-doen-wi2021.jsp) — opened directly): O-route and B1-route both take the four language exams plus KNM plus PVT; **the B1-route adds the MAP**; the Z-route takes no compulsory exams at all and ends in a final conversation with an *inburgeringscertificaat* rather than a diploma.

**ONA is dying, not dead.** The same DUO page notes that ONA course provision is shrinking and that municipalities may substitute the MAP where ONA is no longer available, "particularly for individuals pursuing A2-level diplomas before naturalisation" (opened directly). So **ONA still exists** for people under the old regime — it has a portfolio of eight *resultaatkaarten* plus either a final interview or a 64-hour course, and it costs **€40** ([inburgeren.nl, Kennisexamens](https://www.inburgeren.nl/examen-doen/inhoud-kennisexamens.jsp) — opened directly) — but it is not part of the Wi2021 exam set. **MAP replaces it**, in two halves (arbeidsmarkt and participatie), with at least 40 of its hours required to be "gericht op de praktische inzet van de inburgeringsplichtige op de arbeidsmarkt" ([Regeling inburgering 2021, art. 3.1](https://zoek.officielebekendmakingen.nl/stcrt-2021-38863.html) — opened directly).

**KNM is not a language exam and has no CEFR level.** It is 45 minutes on a computer across themed blocks ("Bijvoorbeeld 'wonen' of 'werk en inkomen'") ([inburgeren.nl, Kennisexamens](https://www.inburgeren.nl/examen-doen/inhoud-kennisexamens.jsp) — opened directly). **Its content changed on 1 July**, per DUO's own news item of 3 April 2025: *"Het examen voor Kennis van de Nederlandse Maatschappij verandert. De inhoud wordt anders"*, with old practice material valid only for sittings before that date ([DUO news item](https://www.inburgeren.nl/nieuwsberichten/artikel.jsp?cid=tcm%3A94-221387-16) — opened directly). **Any KNM content generated by this system must be dated and re-checked**, and any KNM practice material older than mid-2025 is stale.

## 2. Components and levels — the current, real list

Confirming the ticket's list item by item. **All six named forms still exist**, but not all in the same regime:

| Component | Exists today? | Level | Notes |
| --- | --- | --- | --- |
| **Lezen** | Yes | A2 (Wi2013 / naturalisation floor) or **B1** (Wi2021 B1-route) or B2 (onderwijsroute) | A2 version 65 min; B1 version 110 min; B2 100 min |
| **Luisteren** | Yes | idem | A2 45 min; B1/B2 90 min |
| **Schrijven** | Yes | idem | A2 40 min, **pen and paper**, four tasks; B1/B2 100 min |
| **Spreken** | Yes | idem | A2 35 min ("U bekijkt filmpjes en u beantwoordt vragen"); B1/B2 ~25–30 min |
| **KNM** | Yes | **no CEFR level** | 45 min; content changed 1 July; themed |
| **ONA** | Yes, but **legacy only** | n/a | Wi2013 regime; portfolio + eindgesprek or 64-hour course; €40 |
| **MAP** | Yes — **the Wi2021 replacement** | n/a | Two halves; ≥40 hours labour-market-facing |
| **PVT** | Yes | n/a | Not an exam in the testing sense; a declaration trajectory |

Sources for the durations and skill descriptions: [inburgeren.nl, Taalexamens A2/B1/B2](https://www.inburgeren.nl/examen-doen/inhoud-taalexamens-a2-b1-b2.jsp) and [staatsexamensnt2.nl, Hoe ziet het examen eruit](https://www.staatsexamensnt2.nl/voorbereiden/hoe-ziet-het-examen-eruit) — both opened directly.

**A detail worth planning around:** at A2, Schrijven is **on paper**; at B1/B2 all four parts are computer-based. And in the B1/B2 Schrijven and Lezen exams a dictionary is permitted, but **only one specific dictionary** — see §9.1.

## 3. A2 or B1 — the decision-relevant answer, stated precisely

Three distinct bars, often conflated:

**(a) The Wi2021 inburgering diploma — B1.** The default learning route is the B1-route: "gericht op doorstroom naar werk" at B1. A2 is available *only* inside the B1-route, *only* after "minimaal 600 uur cursus", and must be recorded in the PIP ([DUO, Leerroutes](https://duo.nl/zakelijk/inburgering-ketenpartners/wet-inburgering-2021/leerbaarheidstoets-en-leerroutes/leerroutes.jsp) — opened directly). The onderwijsroute runs B1 or B2; the Z-route targets A1 and examines nothing ([Rijksoverheid, Wet inburgering 2021](https://www.rijksoverheid.nl/themas/migratie-en-reizen/inburgeren-in-nederland/nieuwe-wet-inburgering) — opened directly). So under Wi2021, **A2 is a concession granted after failure to progress, not a target you aim at.**

**(b) The naturalisation bar today — A2.** "U moet het inburgeringsexamen halen op taalniveau A2. Of het staatsexamen Nederlands als tweede taal (Nt2) op niveau B1 of B2" ([inburgeren.nl, Naturaliseren](https://www.inburgeren.nl/u-gaat-inburgeren/naturaliseren.jsp) — opened directly; the [English page](https://www.inburgeren.nl/en/integration-in-the-netherlands/naturalisation.jsp) says the same, opened directly). The IND's own framing agrees: for naturalisation you must "first pass the civic integration examination", also called the naturalisation test ([IND](https://ind.nl/en/living-in-the-netherlands-with-a-residence-permit/civic-integration-for-more-secure-residence-permit-and-naturalisation) — opened directly, though that page states no CEFR level itself and defers to inburgeren.nl).

**(c) The naturalisation bar as legislated for — B1.** This is the part that decides the question. From the IND's February 2026 uitvoeringstoets on the draft Rijkswet op het Nederlanderschap (opened directly; extracted locally):

> "een voorgestelde verhoging van het taalniveau dat in Europees Nederland als voorwaarde voor naturalisatie geldt. Dit voorstel staat in een concept Besluit naturalisatietoets. **Het betreft een verhoging van het voor naturalisatie vereiste taalniveau van ten minste A2 naar ten minste B1.**"

and, in a footnote to the requirements table:

> "In Europees Nederland betreft het vereiste taalniveau op het moment van schrijven A2. Er zijn plannen om dit niveau te verhogen naar B1."

The same document confirms the general naturalisation term goes from "vijf jaar" to "tien jaar", flags that **no transitional right is offered to permit-holders who have not yet naturalised**, and anticipates a rush of applications between announcement and entry into force. It models cohorts for **2027, 2028 and 2029**, which is the closest thing to a timetable in the document — it does **not** state an entry-into-force date, and I did not find one.

**Verdict.** The map's lock — "a little above exam level" — resolves to: **plan the whole system against B1 as the exam level**, because (a) makes it the real bar under the current regime and (c) makes it the bar the naturalisation route is heading for regardless. Building for A2 is the only choice that can be *wrong*; building for B1 is right under every scenario, and cannot be made wrong by the bill passing.

A practical corollary the user may not have considered: the four Wi2021 B1 language exams **are** the Staatsexamen NT2 Programma I. Passing Programma I therefore satisfies both (b) and (c) at once, is a stand-alone recognised diploma, and — unlike the A2 inburgeringsexamen — carries onward value.

## 4. Official syllabi, eindtermen and can-do statements

**For KNM there is a published, legally binding eindtermen list.** It is **Bijlage 2 of the Regeling inburgering 2021**, "Eindtermen kennis van de Nederlandse maatschappij", referenced by art. 3.2, and it is structured as *Cruciale Praktijksituaties* → *Cruciale Handelingen (CH's)* → *Cruciale kennis en indicatoren voor succesvol handelen*, across **eight themes**: Werk en inkomen; Omgangsvormen, waarden en normen; Wonen; Gezondheid en gezondheidszorg; Geschiedenis en geografie; Instanties; Staatsinrichting en rechtsstaat; Onderwijs en opvoeding ([Staatscourant 2021, 38863](https://zoek.officielebekendmakingen.nl/stcrt-2021-38863.html) — opened directly). This is the KNM syllabus. **It is a Dutch government regulation and therefore carries no copyright** (Auteurswet art. 11: "Er bestaat geen auteursrecht op wetten, besluiten en verordeningen, door de openbare macht uitgevaardigd…" — [wetboek-online](http://www.wetboek-online.nl/wet/Auteurswet/11.html), *indexed-not-verified* for the exact statutory wording; the substance is uncontroversial). It can be committed to a public repo verbatim.

**For the four language skills there is no exam-specific syllabus — the CEFR *is* the syllabus.** CvTE states that the Staatsexamen Nt2 "uses the structure and descriptions of the Common European Framework of Reference for Languages", with Programma I = B1 and Programma II = B2 ([CvTE, Staatsexamen Nt2](https://www.cvte.nl/onze-toetsen-en-examens/staatsexamen-nt2) — *indexed-not-verified*; corroborated by [staatsexamensnt2.nl](https://www.staatsexamensnt2.nl/voorbereiden/hoe-ziet-het-examen-eruit), opened directly, for the Programma I/II split). The practical consequence is that the can-do statements you want are the **Dutch CEFR descriptors**, and those are published twice over:

- **[Taalprofielen 2015](https://slo.nl/publish/pages/2890/taalprofielen-2015.pdf)** (SLO; Fasoglio, De Jong, Trimbos, Tuin, Beeker) — the revised 2015 edition of the 2004 original, rebuilt onto "de geaccrediteerde Nederlandse vertaling van het Common European Framework … door de Nederlandse Taalunie" and using "de 'can do'-descriptoren zoals opgenomen in de vertaling van de Taalunie". Its table of contents is exactly the shape a curriculum wants: **Lezen, Luisteren, Gesprekken voeren, Spreken, Schrijven**, each broken into **A1, A2, B1, B2, C1, C2** with page-level anchors. (Opened directly; extracted locally.) Licence in §8.
- **The Taalunie's own accredited Dutch CEFR translation** — [Gemeenschappelijk Europees Referentiekader](https://taalunie.org/feeds/download/gemeenschappelijk-europees-referentiekader-9-5dca8.pdf/CEFR_vertaling/original) (*indexed-not-verified* — located via search, not decoded).

**What does not exist, as far as I can establish: an official word list.** I found no DUO- or CvTE-published vocabulary list for either the A2 inburgeringsexamen or the Staatsexamen NT2. What official material *does* fix the lexical target is oblique but real: the only dictionary allowed in the B1/B2 Lezen and Schrijven exams is the Van Dale Pocketwoordenboek NT2 ([staatsexamensnt2.nl](https://www.staatsexamensnt2.nl/voorbereiden/hoe-ziet-het-examen-eruit) — opened directly), whose headword count (~15,000, plus 2,300 expressions) is therefore a defensible upper bound on what the exam can fairly ask you to look up. Every "official A2/B1 word list" circulating online that I checked traced back to a commercial publisher or a third-party site, not to DUO. **Treat any claim of an official word list as false until someone produces the DUO URL.**

## 5. Official practice exams — where they are, and whether they download

Both bodies publish free practice material, and the download story differs between them.

**A2 (inburgeringsexamen), from DUO** — [inburgeren.nl/examen-doen/oefenen.jsp](https://www.inburgeren.nl/examen-doen/oefenen.jsp) (opened directly):

- **Schrijven** — three **downloadable PDFs**: "Oefenexamen A2 Schrijven 1" (54 kb), "2" (213 kb), "3" (186 kb).
- **Spreken** — 3, online only (and noted as broken in Safari).
- **Luisteren** — 3, online only.
- **Lezen** — 4, online only.
- **KNM** — 2, online only. *(Remember §1: KNM content changed 1 July — check the sitting date against the practice version.)*

So at A2 only the writing papers are genuinely downloadable; the rest are interactive and must be sat in the browser.

**B1 and B2 (Staatsexamen NT2), from CvTE** — the practice environment is at [oefenexamensnt2.nl](https://oefenexamensnt2.nl) / `nt2-oefenomgeving.facet.onl`, and it is the richer resource. CvTE's own announcement is explicit that these are **complete real past papers, and they do download**: public exams are available for all skills for both Programma I (B1) and Programma II (B2) for **2021, 2022 and 2023**, and *"U kunt de openbare examens online oefenen of downloaden en printen"* ([CvTE, Nieuwe openbare examens, 15 Jan 2024](https://www.staatsexamensnt2.nl/actueel/nieuws/2024/01/15/nieuwe-openbare-examens) — opened directly). Separate loose Spreken and Schrijven tasks are also published, with the warning that they can turn up in live exams.

I could not load `oefenexamensnt2.nl` itself (the server returned a malformed HTTP header to my fetcher), so **the exact file list is indexed-not-verified**; the *existence and downloadability* of the 2021–2023 public exams is opened-directly from CvTE's announcement. This is the single most valuable free exam asset found, and it belongs in [#89](https://github.com/atilileri/atilileri.github.io/issues/89) as a **link, not a commit** — see §8.4.

## 6. What "a little above exam level" means, concretely

Given §3, the exam level is **B1**. "A little above" has an unusually clean answer here because the Dutch system already ships the next rung as a product:

| | Target | Why |
| --- | --- | --- |
| **Exam level** | B1 = Staatsexamen NT2 **Programma I** | The Wi2021 bar and the legislated naturalisation bar |
| **Session level ("a little above")** | B2 = Staatsexamen NT2 **Programma II** | Same four skills, same format, same publisher, one rung up |

Operationally I would split it rather than uniformly overshooting, because the four skills do not cost the same to raise:

- **Lezen and Luisteren → aim B2.** Receptive skills are where a text-and-web agent system is strongest and where over-shooting is cheapest — this is exactly the extensive-reading lever [#78](https://github.com/atilileri/atilileri.github.io/issues/78) already recommended. B2 reading input makes B1 reading papers feel slow.
- **Schrijven → aim B1+, drifting to B2.** Writing is producible and correctable in text, so the agent can actually assess it. This is the skill where "a little above" is most affordable.
- **Spreken → aim B1, honestly.** See §7; the system cannot currently reach it.
- **Vocabulary → size the target off the exam dictionary, not off a folk number.** ~15,000 headwords is the ceiling of what is lookup-able in-exam; a B1 productive core is far smaller. A frequency-ranked list (§8.3) is the right instrument, and it maps directly onto [#79](https://github.com/atilileri/atilileri.github.io/issues/79)'s **Item** form.

Concretely for [#85](https://github.com/atilileri/atilileri.github.io/issues/85): **build the curriculum spine from Taalprofielen 2015's B1 descriptors, and use its B2 descriptors as the stretch tier.** They are in one document, in one vocabulary, at both levels, and are free to copy and derive from.

## 7. Consequences for the map's open questions

The map lists "Listening and speaking" as not-yet-specified, pending exactly this research. Reporting back:

- **Luisteren is real and examined for 90 minutes at B1.** It cannot be dropped. But it is partly reachable: the CvTE public exams for 2021–2023 include Luisteren, and open-licensed Dutch speech corpora exist (§8.5). A text-first system can at minimum *schedule and track* listening against external audio it links rather than hosts.
- **Spreken is real, ~25–30 minutes, and is the genuine blind spot.** It is a computer-delivered exam where you respond to prompts, so the *format* is mechanisable, but nothing in this system can currently evaluate a spoken response. Given [#81](https://github.com/atilileri/atilileri.github.io/issues/81)'s finding that this machine has no media generation capability at all, I would rule **spreken out of scope for the generated content** and handle it as an explicitly-named gap the plan points at external resources for. Do not design content forms that pretend to cover it.
- **Copyright and licensing** — the map flagged that "all public" plus "bring textbooks into the repo" may collide. It does collide, and §8 is the resolution: nothing from the shopping list gets committed, and two of the most attractive free datasets carry ShareAlike.

---

# Part Two — learning material

## 8. Fetchable now

**Do not bulk-download or commit any of these yet — landing them is [#89](https://github.com/atilileri/atilileri.github.io/issues/89)'s job.** This section records what exists, where, and under what licence, so #89 can act without re-deciding.

### 8.1 The spine — official, free, and licence-clean

| Item | URL | Licence | Verification | Why it earns space |
| --- | --- | --- | --- | --- |
| **Taalprofielen 2015** (SLO) — CEFR can-do descriptors per skill × level A1–C2, in Dutch | [slo.nl](https://slo.nl/publish/pages/2890/taalprofielen-2015.pdf) | **Explicit grant**: copy, distribute *and make derivative material*, no prior permission, **source must be cited** | Opened directly (extracted locally) | The curriculum spine for #85. Best single find on this ticket. |
| **Eindtermen KNM** — Bijlage 2, Regeling inburgering 2021, 8 themes | [officielebekendmakingen.nl](https://zoek.officielebekendmakingen.nl/stcrt-2021-38863.html) | **No copyright** (Auteurswet art. 11) | Opened directly | The KNM syllabus, verbatim, commit-safe |
| Taalunie accredited Dutch CEFR translation | [taalunie.org](https://taalunie.org/feeds/download/gemeenschappelijk-europees-referentiekader-9-5dca8.pdf/CEFR_vertaling/original) | Not stated on the download | Indexed-not-verified | The source Taalprofielen 2015 is built on; check terms before committing |
| Taalunie **Basisboekenlijst NT2/NVT 2018** — curated method/reader list by Peter Schoenaerts | [taalunie.org](https://taalunie.org/feeds/download/basisboekenlijst-nt2-nvt-2018-5dd3f.pdf/Basisboekenlijst%20NT2-NVT%202018/original) | © Peter Schoenaerts / Taalunie | **Indexed-not-verified** — PDF font encoding defeated my extractor; only the preface decoded | A second opinion on §9's shopping list. Worth a human eye. |

### 8.2 Cognates and false friends — the #78 lever

[#78](https://github.com/atilileri/atilileri.github.io/issues/78) called "cognates + false friends taught together" the highest-leverage vocabulary technique, and asked whether the free cognate database it found covers Dutch/English. **Confirmed: it does — that is precisely and only what it covers.**

**Poort & Rodd (2019), "A Database of Dutch–English Cognates, Interlingual Homographs and Translation Equivalents"**, *Journal of Cognition* — [journalofcognition.org](https://journalofcognition.org/articles/10.5334/joc.67), data at [osf.io/tcdxb](https://osf.io/tcdxb/). Contents: **58 identical cognates, 76 non-identical cognates, 72 interlingual homographs (false friends), 78 translation equivalents**, each with bilingual ratings for meaning, spelling and pronunciation similarity. **Article licence: CC BY 4.0** (opened directly). The OSF data page did not render for my fetcher, so **the data-file licence specifically is indexed-not-verified** — #89 must check it on OSF before committing, since OSF lets depositors set their own terms independently of the article.

The caveat from #78 stands and is worth restating for #89: this is a **stimulus set for psycholinguistics experiments**, deliberately filtered (3–8 letters, frequency-thresholded), totalling **284 items**. It is a gold-standard seed and a validation set. It is **not** a Dutch–English cognate inventory, and must not be presented as one.

### 8.3 Frequency and word lists — and the ShareAlike trap

[#79](https://github.com/atilileri/atilileri.github.io/issues/79) established that a frequency list maps straight onto its **Item** form. Three candidates, and they trade off badly:

| Item | URL | Licence | Verification |
| --- | --- | --- | --- |
| **hermitdave/FrequencyWords** — OpenSubtitles-derived, `nl_50k.txt` and full | [github.com/hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords); file at [`content/2018/nl/nl_50k.txt`](https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/nl/nl_50k.txt) | code MIT, **content CC BY-SA 4.0** | Opened directly — file exists, format `word count`, head is `ik 10006772 / je 9001167 / het 7081845 / de 6792979 …` |
| **OpenTaal** Dutch word lists | [opentaal.org](https://www.opentaal.org/) | **BSD (revised) or CC BY 3.0, user's choice** — "Een gebruiker kan een van beide licenties kiezen" | Opened directly ([licences page](https://www.opentaal.org/licenties)) |
| **SUBTLEX-NL** (Keuleers, Brysbaert & New 2010) — 44M subtitle words, the psycholinguistic standard | [crr.ugent.be/subtlex-nl](http://crr.ugent.be/subtlex-nl); paper [Behavior Research Methods 42:643](https://link.springer.com/article/10.3758/BRM.42.3.643) | "freely available **for research purposes**" — no open licence stated | Indexed-not-verified (the UGent download page 404'd on my fetcher) |

**The trap.** The only list with real frequency ranking that is unambiguously redistributable is **CC BY-SA 4.0**, which is *viral*: vocabulary Items derived from it and committed to this **public** repo would arguably inherit ShareAlike, which propagates into the lesson content built on them. OpenTaal is licence-clean but is a spelling wordlist, not a frequency ranking. SUBTLEX-NL's "for research purposes" is not an open licence at all and is the weakest option for a public repo despite being the best data.

**Recommendation for #89:** either (a) accept CC BY-SA on a clearly-fenced `data/` directory and attribute prominently, keeping generated lessons at arm's length, or (b) use frequency ranking as a *private ordering input* that is consulted but not committed, and commit only the OpenTaal-licensed lemma inventory. This is a real decision, not a formality, and it deserves its own ticket if #89 does not want to own it.

Also worth naming: the **CLARIN K-Centre "Wordlists" page** ([kdutch.ivdnt.org/wiki/Wordlists](https://kdutch.ivdnt.org/wiki/Wordlists)) is the institutional index of Dutch word lists — it 403'd my fetcher (*indexed-not-verified*) but is the right next place a human should look.

### 8.4 Official practice exams — link, do not commit

The DUO A2 Schrijven PDFs and the CvTE 2021–2023 public exams (§5) are **freely published but not openly licensed**. Nothing on either site grants redistribution. Republishing them from a public repo would be a straightforward copyright problem, and republishing DUO exam material specifically sits next to the *geheimhoudingsverklaring inburgeringsexamen* that is Bijlage 3 of the same Regeling. **#89 should record URLs and let the learner fetch them; it must not mirror the files.**

### 8.5 Corpora, text and audio

| Item | URL | Licence | Verification | Note |
| --- | --- | --- | --- | --- |
| **Tatoeba** — sentence pairs incl. nl↔en, with audio | [tatoeba.org/downloads](https://tatoeba.org/en/downloads) | **CC BY 2.0 FR**, part CC0 1.0; audio per-contributor | Opened directly | Attribution-only. The cleanest large source of aligned nl/en sentences. High value for #79 Items. |
| **UD_Dutch-Alpino** treebank | [universaldependencies.org](https://universaldependencies.org/treebanks/nl_alpino/index.html) | **CC BY-SA 4.0** | Opened directly — 13,603 sentences / 208,613 tokens | Same ShareAlike trap as §8.3 |
| **UD_Dutch-LassySmall** | [universaldependencies.org](https://universaldependencies.org/nl/index.html) | Not checked | Indexed-not-verified | The second of the two Dutch UD treebanks |
| **Open Dutch WordNet** | [github.com/cltl/OpenDutchWordnet](https://github.com/cltl/OpenDutchWordnet) | LICENSE.md in repo; type not stated on the landing page | Indexed-not-verified | Synsets + relations, WordNet-LMF XML. Check the licence file first. |
| **Mozilla Common Voice** (Dutch subset) | [commonvoice.mozilla.org/en/datasets](https://commonvoice.mozilla.org/en/datasets) | **CC0** | Indexed-not-verified (the datasets page did not render for me; CC0 corroborated across Mozilla Foundation and HuggingFace mirrors) | The only *public-domain* Dutch audio at scale. Relevant to §7's luisteren gap. |
| **OPUS / OpenSubtitles** nl-en parallel corpus | [opus.nlpl.eu](https://opus.nlpl.eu/) | Varies per sub-corpus | Indexed-not-verified — all three URL forms I tried 404'd | Named for completeness; #89 should find the current URL scheme |
| **DBNL** — Digitale Bibliotheek voor de Nederlandse Letteren, incl. a "Collectie publiek domein" | [dbnl.org](https://www.dbnl.org/) | Mixed; a public-domain sub-collection is explicitly separated | Opened directly (homepage; terms page not read) | Literary Dutch, mostly far above B1 — of limited use for a B1 learner |

### 8.6 Free-to-read graded input (not licensed for reuse)

Useful to *read*, not to commit:

- **Wablieft** ([wablieft.be](https://www.wablieft.be/)) — Belgian "centrum voor duidelijke taal", news in deliberately simple Dutch, "Geen moeilijke woorden, vaktaal of beeldspraak". Free online paper plus paid subscription tiers; no reuse statement (opened directly). Genuinely the closest thing to a free graded-reader stream, and the best free answer to #78's extensive-reading recommendation. Caveat: **Belgian Dutch**, so some lexis will diverge from the Netherlands exam.
- **Oefenen.nl** — free lesson platform DUO itself points learners to from the practice page (indexed-not-verified).
- **NPO / NOS output**, `lezenenschrijven.nl`, `hetbegintmettaal.nl` — all named by DUO's own practice page as further resources (opened directly, on [inburgeren.nl/examen-doen/oefenen.jsp](https://www.inburgeren.nl/examen-doen/oefenen.jsp)).

## 9. Shopping list

Prices are **as displayed on the seller's page on 2026-08-17** and are in **EUR unless stated**. Where I could not open the seller page the price is marked and should be re-checked before ordering. Note that Coutinho's NT2 catalogue now redirects to **nt2.nl** (Boom's NT2 shop) — old `coutinho.nl` product URLs 301 there, which is why the links below are nt2.nl.

### 9.1 Buy these three

| # | Title | Author(s) | ISBN | Price | Verification | Why it earns its cost |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Van Dale Pocketwoordenboek Nederlands als tweede taal (NT2)** | Verburg, Stumpel, De Groot | 9789460776700 | **€23,99** | Opened directly ([nt2.nl](https://www.nt2.nl/en/product/100-17558_Van-Dale-pocketwoordenboek-Nederlands-als-tweede-taal-NT2)) | **The only dictionary allowed in the exam room** for B1/B2 Lezen and Schrijven ([staatsexamensnt2.nl](https://www.staatsexamensnt2.nl/voorbereiden/hoe-ziet-het-examen-eruit) — opened directly). Practising with the exact book you will sit the exam with is a free marginal gain. ~15,000 headwords, 2,300 expressions. Buy first. |
| 2 | **Nederlands in actie** (A2 → B1) | Berna de Boer, Margaret van der Kamp, Simone Pentermann | 9789046908426 | **€50,50** | Opened directly ([nt2.nl](https://www.nt2.nl/en/product/100-17429_Nederlands-in-actie)) | Aug 2022; 319 pp; 8 thematic chapters each covering all four skills. This is *exactly* the B1-route span (§3a), for "hoogopgeleide anderstaligen" — which is the user's profile. The single highest-value course purchase. |
| 3 | **Nederlands op niveau** (B1 → B2) | Berna de Boer, Ronald Ohlsen | 9789046904411 | **€50,00** | Opened directly ([nt2.nl](https://www.nt2.nl/nl/100-17453_Nederlands-op-niveau)) | This *is* the "a little above exam level" tier from §6, in book form. Buy it when #2 is ~two-thirds done, not before. |

### 9.2 Strong optional

| Title | Author(s) | ISBN | Price | Verification | Why |
| --- | --- | --- | --- | --- | --- |
| **Dutch: A Comprehensive Grammar**, 3rd ed. (2017) | Bruce Donaldson | 9781138658493 (pbk) | **USD 108.99, listed at USD 87.19** | **Indexed-not-verified** — Routledge 403'd my fetcher; price from search index. Re-check before ordering, and price-compare: this is the one item here where the list price is high enough that a used copy is worth hunting. | The reference grammar **written in English for English speakers**, 440 pp. Directly serves [#78](https://github.com/atilileri/atilileri.github.io/issues/78)'s English-bridge finding in a way no Dutch-medium grammar can. A reference, not a course — buy it to look things up in, and to give the agent a citable structure. |
| **Nederlands in gang, herziene editie** (0 → A2), 4e druk, June 2026 | De Boer, Van der Kamp, Pentermann | 9789024473250 | **€51,50** | Opened directly ([nt2.nl](https://www.nt2.nl/nl/product/100-20506_Nederlands-in-gang-herziene-editie-proeflicentie)) | Only if starting from zero. **Buy this ISBN, not 9789046905609** — that one is now labelled "oude editie" on nt2.nl at €50,00, i.e. you would pay near-identical money for the superseded book. |
| **Het schrijfexamen B1 doe je zo!** | Maaike Gerritsen | 9789046908983 | **€31,95** | Opened directly ([nt2.nl B1 exam catalogue](https://www.nt2.nl/en/examens/staatsexamen_nt2_programma_1_niveau_b1)) | Schrijven is the skill this system can actually coach (§6) and the one with a 100-minute paper. Targeted, cheap, and directly on the exam. |
| **Lezen op B1 – herziene editie** | Joke Olie | 9789024468690 | **€33,95** | Opened directly (same catalogue) | Skill-targeted B1 reading drill. Pairs with the extensive-reading habit rather than replacing it. |
| **Luisteren op B1 – herziene editie** | Sarah Hettema, Marjan Meijboom | 9789024473748 | **€33,25** | Opened directly (same catalogue) | The luisteren gap (§7) is the one this repo's system genuinely cannot fill. This is the cheapest way to plug it with audio you own. |
| **Leeslicht** graded readers (A2/B1, ~1F) | various — Eenvoudig Communiceren | per title | **€14,50 – €16,50** each (e.g. *Middernachtbibliotheek* €16,50, *De Camino* €16,50, *Een Midzomernachtdroom* €14,50) | Opened directly ([eenvoudigcommuniceren.nl](http://eenvoudigcommuniceren.nl/categorie/leeslicht)) | **79 titles** at A2/B1: easy-Dutch retellings of known bestsellers. This is the direct instrument for [#78](https://github.com/atilileri/atilileri.github.io/issues/78)'s extensive-reading recommendation — "cheap and compounding" is literally the price point. Buy **three or four**, not one; extensive reading needs volume, and the per-unit cost is under a cinema ticket. Highest learning-value-per-euro on this list. |

### 9.3 Named but do not buy yet

Located and priced, but I would not spend on these until #2 and #3 are underway. Recorded so the user does not have to re-find them. All from the same nt2.nl B1 catalogue page (opened directly), prices as listed:

- **De sprong – herziene editie** — Beersmans & Tersteeg — 9789024457656 — €51,95
- **Vooruit! – herziene editie** — Berntsen, Borgesius, Posthumus Meyjes — 9789024458349 — €51,95
- **In zicht** — Tersteeg & Duenk — 9789058756152 — €51,95
- **LINK A2 > B1** — VU NT2 — 9789058753854 — €59,75
- **Tweede ronde – tekstboek** — Wesdijk & Blom — 9789089534941 — €92,50 *(most expensive item found; hard to justify against #2)*
- **TaalCompleet KNM** — 9789490807825 — €35,50 — *caution: KNM content changed 1 July (§1); verify the printing post-dates the change before buying*
- **De Finale: voorbereiding op het Staatsexamen NT2 II (B1–B2)** — indexed-not-verified, price not established — relevant only once aiming at Programma II

These are alternatives to, not complements of, *Nederlands in actie*. Buying two competing B1 methods is the classic way to waste money on this shelf.

## 10. Traps and things deliberately not recommended

- **Third-party "official" exam sites.** `inburgering.org`, `dutchexams.com`, `dutchexam.online`, `nt2taalmenu.nl` all rank highly and none are DUO or CvTE. The sibling agent's finding stands; nothing from them is cited here.
- **Claimed "official word lists".** None found from DUO or CvTE (§4). Every one I traced led to a commercial product.
- **KNM material predating July.** The exam content changed (§1). Any KNM item this system generates should carry a date, and any bought KNM book should be checked for printing date.
- **`coutinho.nl` product links.** They 301 to nt2.nl. Use the nt2.nl URLs above; bookmarks to coutinho.nl will rot.
- **"Nederlands in gang" ISBN 9789046905609.** Superseded, still sold, near-identical price. §9.2.
- **Belgian-Dutch input.** Wablieft is excellent free graded input but is Flemish. Fine for extensive reading; do not mine it for exam vocabulary without a filter.
- **Mirroring DUO/CvTE exam PDFs into this repo.** Free to use ≠ free to republish (§8.4).

---

## 11. Sources

### Opened directly

*Exam structure, levels, and the naturalisation bar*
- [inburgeren.nl — Welke examens](https://www.inburgeren.nl/examen-doen/) — component sets by obligation start date; "taalniveau A2 of hoger" under Wi2013.
- [inburgeren.nl — Taalexamens A2/B1/B2](https://www.inburgeren.nl/examen-doen/inhoud-taalexamens-a2-b1-b2.jsp) — durations and format per skill per level; A2 Schrijven on paper.
- [inburgeren.nl — Kennisexamens](https://www.inburgeren.nl/examen-doen/inhoud-kennisexamens.jsp) — KNM 45 min; ONA portfolio of 8 resultaatkaarten, €40; MAP's two halves.
- [inburgeren.nl — Naturaliseren](https://www.inburgeren.nl/u-gaat-inburgeren/naturaliseren.jsp) and [Naturalisation (EN)](https://www.inburgeren.nl/en/integration-in-the-netherlands/naturalisation.jsp) — **A2, or Staatsexamen NT2 B1/B2**.
- [DUO — Leerroutes](https://duo.nl/zakelijk/inburgering-ketenpartners/wet-inburgering-2021/leerbaarheidstoets-en-leerroutes/leerroutes.jsp) — three routes; **A2 downgrade only in the B1-route, only after ≥600 hours, recorded in the PIP**.
- [DUO — Examen doen onder de Wi2021](https://duo.nl/zakelijk/inburgering-ketenpartners/wet-inburgering-2021/examens-wi2021/examen-doen-wi2021.jsp) — per-route component sets; MAP added to the B1-route; ONA provision declining.
- [Rijksoverheid — Wet inburgering 2021](https://www.rijksoverheid.nl/themas/migratie-en-reizen/inburgeren-in-nederland/nieuwe-wet-inburgering) — routes, KNM/MAP/PVT, applies from 1 Jan 2022.
- [IND — Civic integration for more secure residence permit and naturalisation](https://ind.nl/en/living-in-the-netherlands-with-a-residence-permit/civic-integration-for-more-secure-residence-permit-and-naturalisation) — "you must first pass the civic integration examination"; states no CEFR level itself.
- [IND — Uitvoeringstoets voorstel Rijkswet op het Nederlanderschap, februari 2026 (PDF)](https://ind.nl/nl/documenten/03-2026/uitvoeringstoets-wetsvoorstel-rijkswet-op-het-nederlanderschap-rwn-februari-2026.pdf) — **PDF fetched and text extracted locally.** "verhoging van het voor naturalisatie vereiste taalniveau van ten minste A2 naar ten minste B1"; "op het moment van schrijven A2 … plannen om dit niveau te verhogen naar B1"; general term vijf jaar → tien jaar; no transitional right; cohorts modelled 2027–2029.
- [Staatscourant 2021, 38863 — Regeling inburgering 2021](https://zoek.officielebekendmakingen.nl/stcrt-2021-38863.html) — Bijlage 2 eindtermen KNM, eight themes, CPS/CH structure; art. 3.1 MAP ≥40 hours.
- [staatsexamensnt2.nl — Hoe ziet het examen eruit](https://www.staatsexamensnt2.nl/voorbereiden/hoe-ziet-het-examen-eruit) — four computer-based parts; Programma I/II durations; **Van Dale Pocketwoordenboek NT2 the only permitted dictionary**, Lezen and Schrijven only.
- [staatsexamensnt2.nl — Voorbereiden](https://www.staatsexamensnt2.nl/voorbereiden) — index of preparation resources.
- [CvTE — Nieuwe openbare examens (15 Jan 2024)](https://www.staatsexamensnt2.nl/actueel/nieuws/2024/01/15/nieuwe-openbare-examens) — **2021, 2022, 2023 public exams, all skills, Programma I and II; "online oefenen of downloaden en printen"**.
- [inburgeren.nl — Oefenen](https://www.inburgeren.nl/examen-doen/oefenen.jsp) — the A2 practice inventory; three downloadable Schrijven PDFs; the rest online-only.
- [DUO news — Vanaf 1 juli ander examen KNM (3 April 2025)](https://www.inburgeren.nl/nieuwsberichten/artikel.jsp?cid=tcm%3A94-221387-16) — "Het examen voor Kennis van de Nederlandse Maatschappij verandert. De inhoud wordt anders."

*Material and licences*
- [Taalprofielen 2015 (SLO, PDF)](https://slo.nl/publish/pages/2890/taalprofielen-2015.pdf) — **PDF fetched and text extracted locally.** Fasoglio, De Jong, Trimbos, Tuin, Beeker; built on the Taalunie's accredited CEFR translation; TOC covers Lezen / Luisteren / Gesprekken voeren / Spreken / Schrijven × A1–C2; **explicit copy + distribute + derive grant subject to source attribution**.
- [Poort & Rodd (2019), *Journal of Cognition*](https://journalofcognition.org/articles/10.5334/joc.67) — Dutch–English cognates / interlingual homographs / translation equivalents; 58 / 76 / 72 / 78; data at [osf.io/tcdxb](https://osf.io/tcdxb/); **article CC BY 4.0**.
- [OpenTaal — licenties](https://www.opentaal.org/licenties) — "beschikbaar onder de volgende licenties … Een gebruiker kan een van beide licenties kiezen": **BSD (herziene versie)** or **CC BY 3.0**.
- [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) — code MIT, **content CC BY-SA 4.0**; [`nl_50k.txt`](https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/nl/nl_50k.txt) verified to exist, format `word count`.
- [Tatoeba — Downloads](https://tatoeba.org/en/downloads) — sentence pairs, links, audio; **CC BY 2.0 FR**, part CC0 1.0; audio licensed per contributor.
- [UD_Dutch-Alpino](https://universaldependencies.org/treebanks/nl_alpino/index.html) — **CC BY-SA 4.0**; 13,603 sentences / 208,613 tokens. [UD Dutch index](https://universaldependencies.org/nl/index.html) — two Dutch treebanks.
- [Wablieft](https://www.wablieft.be/) — Belgian clear-language news; "Geen moeilijke woorden, vaktaal of beeldspraak"; free online paper plus paid tiers; no reuse statement.
- [DBNL](https://www.dbnl.org/) — has a separated "Collectie publiek domein"; terms page not read.
- [nt2.nl — Van Dale Pocketwoordenboek NT2](https://www.nt2.nl/en/product/100-17558_Van-Dale-pocketwoordenboek-Nederlands-als-tweede-taal-NT2) — ISBN 9789460776700, **€23,99**.
- [nt2.nl — Nederlands in actie](https://www.nt2.nl/en/product/100-17429_Nederlands-in-actie) — 9789046908426, **€50,50**, Aug 2022, A2–B1, 319 pp.
- [nt2.nl — Nederlands op niveau](https://www.nt2.nl/nl/100-17453_Nederlands-op-niveau) — 9789046904411, **€50,00**, June 2015, B1–B2.
- [nt2.nl — Nederlands in gang, herziene editie](https://www.nt2.nl/nl/product/100-20506_Nederlands-in-gang-herziene-editie-proeflicentie) — 9789024473250, **€51,50**, 4e druk, June 2026, 0–A2.
- [nt2.nl — Nederlands in gang, oude editie](https://www.nt2.nl/en/product/100-17454_Nederlands-in-gang) — 9789046905609, €50,00, Aug 2017. **Superseded.**
- [nt2.nl — Staatsexamen NT2 Programma I (B1) catalogue](https://www.nt2.nl/en/examens/staatsexamen_nt2_programma_1_niveau_b1) — the §9.2/§9.3 titles, ISBNs and prices.
- [eenvoudigcommuniceren.nl — Leeslicht](http://eenvoudigcommuniceren.nl/categorie/leeslicht) — 79 titles, A2/B1 (~1F), **€14,50–€16,50**.
- [Open Dutch WordNet](https://github.com/cltl/OpenDutchWordnet) — contents and citation confirmed; **licence type not stated on the landing page**.

### Indexed-not-verified

Page returned 403/404, did not render, or was a PDF my extractor could not decode. Direction corroborated; specifics need re-checking.

- [CvTE — Staatsexamen Nt2](https://www.cvte.nl/onze-toetsen-en-examens/staatsexamen-nt2) — CEFR-based; Programma I = B1, Programma II = B2. (Corroborated directly by staatsexamensnt2.nl for the level split.)
- [oefenexamensnt2.nl](https://oefenexamensnt2.nl) / `nt2-oefenomgeving.facet.onl` — the practice environment. **Server returned a malformed HTTP header to my fetcher.** Its existence and the downloadability of the 2021–2023 public exams are opened-directly from CvTE's announcement; the exact file inventory is not.
- [Taalunie — Basisboekenlijst NT2/NVT 2018 (PDF)](https://taalunie.org/feeds/download/basisboekenlijst-nt2-nvt-2018-5dd3f.pdf/Basisboekenlijst%20NT2-NVT%202018/original) — only the preface decoded (© Peter Schoenaerts, Taalunie/Muntpunt, alphabetical by category, asterisks mark titles for children). **Body not read; nothing from it relied on.**
- [Taalunie — Gemeenschappelijk Europees Referentiekader, Dutch translation (PDF)](https://taalunie.org/feeds/download/gemeenschappelijk-europees-referentiekader-9-5dca8.pdf/CEFR_vertaling/original) — located, not decoded.
- [CLARIN K-Centre — Wordlists](https://kdutch.ivdnt.org/wiki/Wordlists) — 403.
- [SUBTLEX-NL](http://crr.ugent.be/subtlex-nl) — download page 404'd; the [paper](https://link.springer.com/article/10.3758/BRM.42.3.643) (Keuleers, Brysbaert & New, *BRM* 42:643–650, 2010) reports 44M subtitle words and "freely available for research purposes".
- [OPUS](https://opus.nlpl.eu/) — three URL forms for the OpenSubtitles nl-en corpus all 404'd; the corpus exists, the current URL scheme was not established.
- [Mozilla Common Voice — datasets](https://commonvoice.mozilla.org/en/datasets) — page did not render; **CC0** corroborated across the [Common Voice 18 release note](https://www.mozillafoundation.org/en/blog/common-voice-18-dataset-release/) and HuggingFace mirrors. Dutch is included; **validated hours for Dutch specifically not established.**
- [osf.io/tcdxb](https://osf.io/tcdxb/) — did not render; **the data-file licence for the Poort & Rodd database is unconfirmed** and must be checked before committing anything derived from it.
- [Auteurswet art. 11](http://www.wetboek-online.nl/wet/Auteurswet/11.html) — wetten.overheid.nl 404'd on two URL forms; the statutory text ("Er bestaat geen auteursrecht op wetten, besluiten en verordeningen, door de openbare macht uitgevaardigd…") is from a search index of mirror sites.
- [Routledge — Dutch: A Comprehensive Grammar, 3rd ed.](https://www.routledge.com/Dutch-A-Comprehensive-Grammar/Donaldson/p/book/9781138658493) — 403. ISBN 9781138658493 (pbk, 440 pp, 14 March 2017) and **USD 108.99 / 87.19** from the search index. **Re-check the price before ordering.**
- [Oefenen.nl](https://oefenen.nl) — named by DUO's practice page as a free lesson resource; not itself opened.
