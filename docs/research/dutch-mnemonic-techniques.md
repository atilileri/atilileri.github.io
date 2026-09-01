# The five named mnemonic techniques

**Question:** What are Dual-Coding Theory, the Keyword Method, the Major Memory System, the Link Word / Story Method and the Method of Loci — *mechanically* — and what does the evidence actually say about each? Which of them survive a system that can produce **text but not rendered images** ([#81](https://github.com/atilileri/atilileri.github.io/issues/81)), teaches an **adult, metalinguistically sophisticated** learner, and aims at **B1/B2 Dutch** ([#77](https://github.com/atilileri/atilileri.github.io/issues/77))?

**Ticket:** [#120](https://github.com/atilileri/atilileri.github.io/issues/120), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74). Builds on and re-tests [#78](https://github.com/atilileri/atilileri.github.io/issues/78).

**Date:** 2026-09-01

---

## TL;DR verdict

**The pivotal question resolves, and it resolves in this system's favour: the picture does not have to be rendered, and on the current evidence it does not have to be *visual* at all.**

Three independent recent findings converge, and they are the strongest material in this document:

1. **Aphantasics — people who cannot voluntarily generate mental imagery — benefit from interactive-imagery instructions *as much as* controls**, and neither self-reported vividness nor objective imagery skill predicts who benefits ([Thomas, Ayuno, Kluger & Caplan, 2023, *Memory & Cognition*](https://pubmed.ncbi.nlm.nih.gov/35948821/) — *opened directly*).
2. **The picture-superiority effect survives in aphantasia**, which dual-coding theory says should be impossible ([Yan, Roberts & Bainbridge, 2026, *Neuropsychologia*](https://doi.org/10.1016/j.neuropsychologia.2026.109391) — *opened directly*).
3. **Distinctiveness, not dual coding, explains picture superiority** — the effect is *eliminated* when plain words are made physically distinctive and pictures are made plain ([Higdon, Neath, Surprenant & Ensor, 2025, *QJEP*](https://doi.org/10.1177/17470218241235520) — *opened directly*).

The operative variable is **elaborative, interactive, distinctive encoding**. "Form a mental image" is an unusually effective *instruction* for producing that; the visual format is not the mechanism. A written scene sentence is a legitimate delivery of that instruction. **#81's no-images ruling costs far less than #78 assumed.**

**But the same evidence deflates the techniques themselves.** Once "it's the imagery" is off the table, four of the five are competing for the same slot — elaborative encoding — against retrieval practice and spacing, which are Grade A. Specifically:

- **Dual-Coding Theory is Grade C as a theory and Grade D as a build instruction.** It is under active, successful attack by exactly the studies above. Do not build architecture on it; the practices it motivates survive on other grounds.
- **The keyword method's #78 verdict was too harsh and I am revising it: Grade C, not Grade D** — with a named winning condition. Dunlosky's own words say the low rating is about **generalisability**, not efficacy, and [Miyatsu & McDaniel (2019)](https://pubmed.ncbi.nlm.nih.gov/31077068/) — *opened directly* — found that at a **one-week delay the keyword+retrieval combination beat keyword alone, and without keyword encoding there was no retrieval-practice effect at all** under sparse practice. Keyword is not a rival to retrieval practice; it is an **encoding stage that makes sparse retrieval practice work**. That is precisely this system's situation.
- **The Method of Loci is the best-evidenced of the five (Grade B) and the worst-fitting.** It is a *serial-order* technique with a high setup cost, and vocabulary is not a serially ordered list.
- **The Major System does not belong in this map at all — Grade D *for this use*.** It solves digit memorisation. Nothing in Staatsexamen NT2 requires memorising digits, and the real Dutch number difficulty is the **inversion property** (`vierentachtig` = 84, not 48) which the Major System does nothing whatsoever for.
- **The Link/Story method is where #78 landed and I do not overturn it, but I do narrow it.** Its canonical evidence is a *serial recall* study, not a vocabulary study, and the "absurd" prescription is **actively wrong for flashcards**: the bizarreness effect appears only in **mixed lists under free recall**, and vocabulary testing is cued recall in a uniform list.

**Pop-culture carriers: no direct evidence exists, and the indirect evidence is split.** Familiarity helps (the memory palace must be a *familiar* building — that is the same claim), but pre-supplied material forfeits the generation effect, which is one of the better-evidenced things in this whole area. Recommended shape: **the agent supplies the frame, the learner supplies or accepts the scene.** Quoting scripts in a public repo is governed by Dutch `citaatrecht` (Art. 15a Auteurswet) and is **conditionally permitted, not free** — handed to [#94](https://github.com/atilileri/atilileri.github.io/issues/94).

---

## 0. How to read this — evidence grading and verification

Grades carried unchanged from [`docs/research/dutch-teaching-techniques.md`](https://github.com/atilileri/atilileri.github.io/blob/research/dutch-teaching-techniques/docs/research/dutch-teaching-techniques.md) (#78):

| Grade | Meaning |
| --- | --- |
| **A** | Multiple meta-analyses or a large meta-analysis with consistent effects; recommended by independent review panels. Bet on it. |
| **B** | One good meta-analysis, or consistent experimental evidence with known boundary conditions. Use it, respect the boundaries. |
| **C** | Mixed, contested, or the effect is real but small / narrow / short-lived. Use with care and do not build architecture on it. |
| **D** | Popular and intuitive, but the evidence is weak, null, or points the other way. Flag it; do not build it. |

**Verification**, same convention:

- **Opened directly** — I fetched and read the source text (page body, or a verbatim abstract returned by an API).
- **Indexed-not-verified** — the claim comes from a search index's summary, because the publisher refused my fetcher or the file was a PDF I cannot decode.

### What this pass could and could not open

An improvement on #78 worth recording, because it changes the trust level of this document: **the Europe PMC REST API is reachable from this machine and returns verbatim abstracts.**

```
curl -sG https://www.ebi.ac.uk/europepmc/webservices/rest/search \
  --data-urlencode 'query=EXT_ID:31077068' \
  --data-urlencode 'resultType=core&format=json'
```

That is how the Dunlosky, Miyatsu & McDaniel, Thomas et al., Twomey & Kroneisen, Yan et al. and Higdon et al. abstracts below were read — as publisher-authored text, not index paraphrase. **Any future research ticket in this repo should try this route first.** It does not reach full text, and it only covers the biomedical/psychology indexes, but for this literature that is most of it.

Still blocked, and I say so rather than inferring:

- **PDFs remain undecodable.** There is no `pdftotext`, `pypdf`, `fitz` or `mutool` on this machine, and `pip` is not on `PATH` so I could not install one. Every PDF I fetched came back as binary. This cost me **Patton (1987)**, **Clark & Paivio (1991)**, **Atkinson & Raugh (1975)**, and the Umeå aphantasia/MoL thesis.
- **403 Forbidden:** ScienceDirect, Taylor & Francis, Wiley PDF endpoints.
- **Cookie/consent walls:** PubMed's HTML pages (the API route above is what rescued those), Europe PMC's own web UI (a SPA).
- **Springer** bounces `link.springer.com/article/...` through an identity provider that loops; I could not read **Bower & Clark (1969)** or the 2013 bizarreness paper in the original.

**Two numbers are the ones I would re-check first**, and both are *indexed-not-verified* and load-bearing: the **Wang & Thomas delayed-recall reversal** (§2.4), which is the only real evidence in this document for rendered images, and the **Atkinson & Raugh percentages** (§2.2), which are the keyword method's headline result. A third, the Donoghue & Hattie ability moderator (§2.6), *was* opened directly — but it rests on 28 cases with an SE of 0.10, so treat it as a flag rather than a measurement.

Full accounting in [§9 Sources](#9-sources).

---

## 1. Dual-Coding Theory — **Grade C as a theory, Grade D as a build instruction. 🚩**

### 1.1 The mechanism, stated precisely

Paivio's claim is architectural, not pedagogical. Cognition runs two functionally independent but interconnected representational systems: a **verbal system** (`logogens`, sequentially organised, handles language) and a **nonverbal/imagery system** (`imagens`, synchronously organised, handles perceptual and image-like representation). Three kinds of processing connect them: *representational* (a stimulus activates its own system), *associative* (activation spreads within a system), and **referential** (activation crosses between systems — a word evokes an image, an image evokes a name).

The memory prediction follows from the last one. Material that gets **referentially processed** lays down **two retrieval routes instead of one**, and either route can support recall. This is why concrete words beat abstract words (concrete words readily evoke images; abstract ones do not), and — on the theory — why pictures beat words.

**Correct application:** ensure the material is processed in both codes *and connected*. **Common wrong application:** "add a picture." Decoration is not referential processing; an unintegrated image is a second stimulus, not a second code — and, on the cognitive-load side, it is a competitor for attention.

### 1.2 The evidence — and it is currently losing

This is the part of the ticket where the answer moved most, and it moved against the theory.

Dual coding's two flagship phenomena are the **picture-superiority effect** (pictures recalled better than words) and the **concreteness effect** (concrete words recalled better than abstract ones). Both are robust findings. **Neither is now well explained by dual coding.**

- **[Higdon, Neath, Surprenant & Ensor (2025), *Quarterly Journal of Experimental Psychology*](https://doi.org/10.1177/17470218241235520)** — *opened directly*. The authors manipulated **physical distinctiveness** rather than code count: half the words shown in varying fonts, sizes, colours and capitalisation; half the pictures shown in plain black-and-white. Result, in their words: *"the picture-superiority effect was eliminated when comparing the black-and-white pictures to distinctive words."* Extended to associative recognition and free recall. Their conclusion is blunt — *"we argue that dual-coding theory is no longer a viable explanation of the picture-superiority effect."*

- **[Yan, Roberts & Bainbridge (2026), *Neuropsychologia*](https://doi.org/10.1016/j.neuropsychologia.2026.109391)** — *opened directly*. Aphantasics *"cannot voluntarily generate mental imagery and thus should not benefit from a secondary visual memory code."* They tested exactly that. *"Contrary to what dual-coding theory would predict, aphantasic individuals showed a robust picture superiority benefit in memory."* The authors say the theory's *"core assumption — that conscious access to image codes is required for enhanced picture recall — is flawed"*, and offer **distinctiveness** as the alternative.

- **Dunlosky et al. (2013)** rated **"imagery use for text learning" LOW utility** — the same rating band as the keyword mnemonic, and a fact that gets lost when dual coding is cited in education. *Opened directly*, verbatim: *"Summarization and imagery use for text learning have been shown to help some students on some criterion tasks, yet the conditions under which these techniques produce benefits are limited."*

- **The pro-picture number that does exist is Mayer's multimedia principle** — students learn better from words plus graphics than words alone, **median d = 1.35** in Mayer (2021). *Indexed-not-verified*, and it needs two caveats before anyone quotes it at this map. First, more recent meta-analytic work reports **substantially smaller effects (g ≈ 0.39)**. Second and more important, **the multimedia principle is about explanatory diagrams for causal/expository material** — how a pump works, how lightning forms — where the picture carries *information the text cannot cheaply carry*. It is not a finding about decorating a vocabulary item.

### 1.3 Does the claim survive when the "visual" channel is a written description?

**This is the ticket's core question for this technique, and the honest answer is that the question partly dissolves.**

The evidence base *does* distinguish supplied pictures from instructed imagery — they are separate literatures with separate results — and the distinction cuts the way this project needs:

| | Supplied picture | Instructed/described imagery |
| --- | --- | --- |
| **Vocabulary mnemonics** | Helps long-term retention in Wang & Thomas Exp. 2 (§2.4) — the one clear win for rendering | The entire classical keyword literature, including Atkinson & Raugh, used **verbal instruction only** and produced the field's largest effects (§2.2) |
| **Paired-associate memory** | — | **Works even for people who cannot form images at all** (Thomas et al. 2023) |
| **Expository text** | Multimedia principle, real but domain-bound | "Imagery use for text learning" — Dunlosky **low utility** |

So: **the dual-coding *claim* — that a second, specifically visual code is doing the work — is what is failing.** The *practice* it motivated (elaborate the material into a concrete, interactive, distinctive scene) is fine, and is fine in text. It just needs a different justification: **distinctiveness and elaborative processing**, which are older, broader, and not under attack.

**🚩 Flag for the skill.** Do not write "dual coding" into the Dutch skill as a rationale. It is the single most-cited mnemonic idea in the education-influencer layer of the internet, it is currently being dismantled in the journals, and citing it would import an error the way #78 found `teach` imported one on interleaving. Write **"concrete, interactive, distinctive scenes"** and cite distinctiveness.

**What it costs the learner:** nothing structural — this is a framing, not a procedure.

**Does it need a rendered image? No.** On the 2025–2026 evidence, arguably not even a *mental* one.

---

## 2. The Keyword Method — **Grade C. Revised up from #78's Grade D.**

### 2.1 The mechanism, stated precisely

Two stages, and both are obligatory:

1. **Acoustic link.** Map the unfamiliar L2 word to a **keyword** in a known language that sounds like some salient part of it. `Dutch: haring` → English `herring`; `Dutch: kaas` → English `case`. The keyword need not mean anything related — its only job is to be phonologically retrievable from the L2 form.
2. **Imagery link.** Bind the keyword to the **translation** with an **interactive** image — the two referents must *do something to each other*, not merely co-occur. A *case* stuffed with *cheese*, not a case beside some cheese.

Retrieval then runs the chain backwards: hear `kaas` → recall `case` → recall the scene → recall `cheese`.

**Correct application:** interactive, concrete, and both links checked — a keyword the learner cannot retrieve from the L2 sound is a broken chain, and this is the most common failure. **Common wrong applications:** (a) a keyword that is merely *semantically* related rather than acoustically derivable; (b) a non-interactive image (side-by-side placement gives little benefit); (c) using it on **abstract** words, where no referent can be imaged; (d) treating it as a substitute for retrieval practice rather than a preparation for it (§2.5, and this is the big one).

### 2.2 The evidence for

The founding result is large. [Atkinson & Raugh (1975), *JEP:HLM* 104(2), 126–133](https://eric.ed.gov/?id=EJ113586) taught Russian vocabulary and reported **72% correct for the keyword group versus 46% for controls** on the critical test (*indexed-not-verified* — ERIC's record and the Stanford technical-report mirror are both PDFs I could not decode; the percentages are corroborated across independent index summaries but I have not seen the table). A companion Stanford Spanish experiment is widely reported at **88% versus 28% for free study** (*indexed-not-verified*, and the gap is large enough that I would want the original before quoting it anywhere load-bearing).

**Note what those studies did *not* do: they did not show anybody a picture.** The imagery was produced by verbal instruction. Every headline keyword-method number in the literature is a number for a *described* mnemonic.

[Donoghue & Hattie (2021), *Frontiers in Education*](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.581216/full) — *opened directly* — re-ran Dunlosky's ten techniques as an actual meta-analysis (242 studies, 1,619 effect sizes, 169,179 participants) and put **mnemonics at d = 0.50** and **imagery use at d = 0.56**, against distributed practice 0.85 and practice testing 0.74. Their own caveat is fair: Dunlosky's cut scores are *"arbitrary (but not capricious)"*, and mnemonics at 0.50 sits close to the moderate band.

### 2.3 The evidence against, read properly

**Dunlosky et al. (2013)'s actual sentence**, *opened directly* via the Europe PMC API, is this:

> *"The keyword mnemonic is difficult to implement in some contexts, and it appears to benefit students for a limited number of materials and for short retention intervals."*

Three charges, and they are not the same charge:

1. **Implementation difficulty** — a cost claim, not an efficacy claim.
2. **Limited materials** — it works on concrete, imageable nouns and poorly on abstractions and function words. True and important (§2.6).
3. **Short retention intervals** — the only efficacy charge, and the contested one.

Note also the framing of the whole monograph: the ratings assess *"whether their benefits generalize across four categories of variables"*. **The low rating is a generalisability verdict.** It is a rating of the technique as *a thing to tell all students to do about all material*. Our case is one motivated adult, a curated word list, and an agent that can do the implementation work. Reading Dunlosky's rating as "the keyword method does not work" is over-reading it, and #78 did.

### 2.4 The retention charge — where it comes from and how strong it is

The sharpest version is **Wang & Thomas (1995)**, and #78 cited it correctly: keyword users scored **worse than a rote-repetition control after a two-day delay**, despite winning at immediate test. Their Experiment 1 tested self-generated keywords and found generation *"did not attenuate forgetting"*; Experiment 2 found that **supplying pictures of the keyword and the translation referent during study *did* improve long-term retention**. (*Indexed-not-verified* — UCF's repository record and the EBSCO PDF are both undecodable here; this is one of the two numbers I flagged in §0.)

That second finding is the **strongest single argument in this whole document for rendered images**, and I want to state it without softening: there is at least one experiment in which imagining the scene failed at delay and *seeing* it did not. It is one study, from 1995, that I could not open.

The counterweight is real, though. **Donoghue & Hattie found no decay across retention intervals** across the whole ten-technique corpus — *opened directly*, verbatim: *"less than a day (d = 0.58, SE = 0.025, N = 1,073), > 1 day and < 1 week (d = 0.59, SE = 0.057, N = 204), > 1 week and < 1 month (d = 0.56, SE = 0.058, N = 228), < 1 month and less than 6 months (d = 0.51, SE = 0.082, N = 64)."* That is a flat line. It is aggregated over all ten techniques rather than keyword-specific, so it does not refute Wang & Thomas directly — but it does say the "mnemonics fade" story is not a general property of this literature.

### 2.5 Where the keyword method *wins* — and this is the finding that changes the verdict

**[Miyatsu & McDaniel (2019), *Memory & Cognition*](https://pubmed.ncbi.nlm.nih.gov/31077068/) — *opened directly*, abstract verbatim from the Europe PMC API.** This paper is a direct answer to the ticket's re-test question and #78 did not have it.

Their setup is deliberately austere and it happens to be ours: **retrieval practice limited to twice per item.** Findings:

- **Experiment 1 (48-hour delay):** *"there was no testing effect with retrieval practice alone, but the keyword-retrieval combination did not promote better retention than keyword alone."*
- **Experiments 2 and 3 (one-week delay):** *"the keyword-retrieval combination was better than keyword alone, but in the absence of keyword encoding there was no retrieval practice effect."*
- With **four** rounds of retrieval practice, a testing effect emerged, but only *"marginally significant."*
- Mechanism check, by asking participants how they reached each answer: *"Keyword-mediated retrieval, which was observed sometimes even in no-keyword instructed conditions, was shown to be more effective than unmediated retrieval."*

Read that second bullet again. **Under sparse retrieval practice, retrieval practice did not work without keyword encoding.** #78's Grade A recommendation — build everything on retrieval practice — inherits a boundary condition it did not know about: *retrieval practice needs something worth retrieving*. The authors' own framing is that the keyword mnemonic **"catalyzes"** retrieval practice, and their closing line generalises it: *"incorporating effective encoding techniques prior to retrieval practice could augment the effectiveness of retrieval practice, at least for vocabulary learning."*

**The strongest honest case for:** a two-stage encoding that makes an arbitrary form–meaning pair non-arbitrary, with the field's largest single-technique effects on concrete L2 vocabulary, and a demonstrated catalytic role in exactly the low-practice-count regime this system will run in.

**The strongest honest case against:** at least one experiment shows it *losing to rote* at a two-day delay; it is rated low utility by the field's standard review panel; it applies to a narrow slice of the lexicon; and its benefit may be largest for the learners least like ours (§2.6).

**Verdict: Grade C**, up from #78's D. Not a headline technique. A **conditional encoding stage** for a defined subset of Items, justified by Miyatsu & McDaniel rather than by Atkinson & Raugh.

### 2.6 What it costs the learner — and the ability moderator that should worry us

Encoding time is the honest objection. Generating a keyword that is both phonologically derivable and imageable, then building an interactive scene, is **substantially slower per item than reading a translation pair**. I could not find a clean per-item seconds figure in any source I could open; the literature reports total study time rather than per-item encoding cost, and I am not going to invent a number. Training cost is lower than it looks — the method is explainable in one paragraph — but the literature notes that many studies under-trained it (*"Hall (1988) only spent a total of three hours over a span of four weeks"* — *indexed-not-verified*).

**The moderator that matters more.** Donoghue & Hattie, *opened directly*, verbatim: *"the mean effect on High ability students was -0.11 (SE = 0.10, N = 28) for Low ability students was 0.47, SE = 0.15, N = 58."*

**Across these ten techniques, the pooled effect for high-ability learners is negative.** This learner is a metalinguistically sophisticated adult with a strong L2 already — precisely the profile that moderator flags. That is 28 cases and an SE of 0.10, so the interval spans zero; it is a warning, not a refutation. But it is the single most uncomfortable number here, it points the same way as #78's finding that this learner can be taught *explicitly* in ways a naive learner cannot, and it argues that **strategy scaffolding should be offered rather than imposed.**

**Does it need a rendered image?** **No** — every canonical result used verbal instruction. **One dissent:** Wang & Thomas Exp. 2, where supplied pictures rescued delayed retention and imagining did not.

---

## 3. The Major Memory System — **Grade C in general, Grade D for this map. Recommend: cut.**

### 3.1 The mechanism, stated precisely

A **phonetic substitution code**. Each digit maps to a set of consonant *sounds* (spelling is irrelevant): 0 = s/z, 1 = t/d, 2 = n, 3 = m, 4 = r, 5 = l, 6 = sh/ch/j/soft-g, 7 = k/hard-g, 8 = f/v, 9 = p/b. Vowels, plus `w`, `h`, `y`, are free filler and carry no value.

To encode a number, convert its digits to consonants and pad with vowels until a concrete noun falls out: `34` → m, r → **mower**. `92` → p, n → **pen**. The resulting images are then stored by some *other* technique — usually the Method of Loci or the Link method. **The Major System is a codec, not a storage method.** That is the most commonly missed thing about it.

**Correct application:** a pre-memorised, over-learned peg list (typically 00–99) so that conversion is instant recall, not computation. **Common wrong application:** converting on the fly. Which is exactly the failure mode the evidence found.

### 3.2 The evidence

Thin, old, and pointing at a specific failure. **Patton (1987), "Testing the limits of the phonetic mnemonic system", *Applied Cognitive Psychology*** (*indexed-not-verified* — Wiley returned 403 on the abstract page and its PDF endpoint is undecodable here; the paper is not in Europe PMC): the phonetic-mnemonic group recalled two-, four- and six-digit numbers significantly better than controls, consistent with Morris & Greer (1984) — **but subjects trained in the method recalled *significantly fewer* numbers than controls when they had to construct their own keywords for each number.**

That is the whole story in one sentence. **The code pays only when it is already over-learned; while you are still building it, it is a net loss.** It is the §2.6 encoding-cost objection in its most extreme form.

**What it costs the learner:** by far the highest of the five. A usable 00–99 peg list is a hundred over-learned associations *before the technique produces its first benefit* — training that competes directly with learning Dutch.

### 3.3 Does it belong in Dutch vocabulary work at all? **No.**

The ticket asks what number content a B1/B2 Dutch exam learner actually faces. Per [#77](https://github.com/atilileri/atilileri.github.io/issues/77) the target is **Staatsexamen NT2 Programma I (B1)**, stretch **Programma II (B2)**. DUO's own page (*opened directly*) says only: *"Beide programma's bestaan uit 4 examenonderdelen: Lezen, Luisteren, Spreken en Schrijven."* Reading, Listening, Speaking, Writing. Third-party descriptions of the components (*indexed-not-verified*) describe comprehension and production tasks over everyday, work and study situations — brochures, adverts, articles, manuals, forms, short letters.

**Nothing in that requires memorising a digit string.** Numbers appear as *content* — prices, times, dates, quantities, addresses — inside comprehension and production tasks. The skill being tested is **understanding and producing a number in Dutch under time pressure**, not retaining an arbitrary sequence overnight.

And the actual difficulty is one the Major System cannot touch. Dutch has the **inversion property**: the spoken decade–unit order is the reverse of the written digits. `84` is *vierentachtig*, "four-and-eighty". This is a well-documented processing cost, not folk complaint — inversion-language speakers show inversion-specific difficulties in basic number processing, and Dutch-speaking children make significantly more transposition errors (hearing 46, writing 64) than French-speaking children (*indexed-not-verified*; the underlying studies are on PMC and I did not open them, since the direction was not in dispute and the claim is background rather than load-bearing).

The learner's problem is a **parsing and production** problem: hear *vierentachtig*, output 84, fast. The Major System encodes digits **you already have** into images. It solves a problem this learner does not have, and does not solve the one they do.

**Recommendation: cut the Major System from the map.** If number fluency needs work, it is a **drilling** problem — timed recognition and production of numbers in context, which is ordinary retrieval practice on Items whose "answer" is a numeral. That composes with everything else and costs nothing.

**Does it need a rendered image?** Moot. (It would not — the peg words are words.)

---

## 4. Link Word / Story Mnemonics — **Grade B for what it was tested on; Grade C transferred to vocabulary.**

### 4.1 The mechanism, stated precisely

Take a list of items in order. Convert each to a concrete image. Then **chain** them: either pairwise (Link — item 1 interacts with item 2, item 2 with item 3) or as **one continuous narrative** passing through all of them in order (Story). Recall works by re-running the story and reading items off it.

**Correct application:** the narrative must be *continuous* and each transition must be *causal or interactive* — the story has to actually require the next item. **Common wrong applications:** (a) a list of disconnected vivid scenes, which is not a chain and loses the ordering benefit; (b) chasing bizarreness (§4.3); (c) applying it to **paired associates** and expecting the serial-recall numbers.

### 4.2 The evidence

The canonical study is **Bower & Clark (1969), "Narrative stories as mediators for serial learning", *Psychonomic Science***, reporting **93% versus 13% recall** for narrative versus control. #78 already carries it. I could **not** open it on this pass — Springer bounces its article pages through an identity provider that loops, and the PDF is undecodable — so it remains *indexed-not-verified*, as it was in #78.

**Two boundary conditions that #78 did not state and that matter for the build:**

1. **It is a *serial learning* study.** The task was recalling **lists of unrelated concrete nouns in order**. The 93/13 gap is a gap in *ordered list recall*. **L2 vocabulary is not an ordered list** — it is a set of paired associates tested individually, in a shuffled order, months apart. The technique's headline evidence does not transfer as directly as the headline number suggests.
2. **The modern vocabulary-specific evidence is weak.** I searched for a contemporary narrative-chaining vocabulary experiment or meta-analysis and found conference and thesis work rather than a strong replication base. Nothing I would grade above C on that transfer.

This does **not** overturn #78's recommendation. Elaborative narrative encoding is a good bet and is pure text. But #78's framing — "narrative encoding: 93% vs 13%" set against the keyword method — compared a **serial-recall number** with a **paired-associate technique**, and those are not the same measurement. **The honest statement is: story-based elaboration is well evidenced *as elaboration* (Grade B) and thinly evidenced *as a vocabulary method* (Grade C).**

### 4.3 🚩 The "vivid, absurd" prescription is wrong for this build

The ticket's own wording — *"one vivid, absurd, continuous narrative"* — encodes a piece of folk wisdom the literature has already qualified.

The **bizarreness effect** is real but tightly bounded. Einstein & McDaniel's review established that it appears *"when mixed lists are used and retention is assessed with a free-recall test"*, and that higher recall for bizarre over common images is *"consistently found when bizarreness is varied as a within-subject (mixed-list) variable"* (*indexed-not-verified* — Springer and Taylor & Francis both refused me; corroborated across several independent index summaries). The mechanism is **distinctiveness**: the odd item must sit in a context of normal items to stand out.

Both boundary conditions fail for a Dutch vocabulary deck:

- **Vocabulary testing is cued recall, not free recall.** The cue is supplied. There is nothing for distinctiveness-driven *search* advantage to do.
- **A deck where every item is absurd is a pure list, not a mixed one.** Universal bizarreness is self-cancelling — if everything is strange, nothing is distinctive.

Note how neatly this converges with §1.2: distinctiveness is emerging as the explanation for picture superiority *and* is the established explanation for the bizarreness effect. The same principle, and the same warning — **distinctiveness is relative, so it cannot be applied to every card.**

**Recommendation:** prescribe **concrete, interactive and specific**, not **absurd**. If absurdity is used, use it **sparingly and deliberately**, on items that are resisting — which turns it into a repair tool for leeches rather than a house style. That is a cheap, checkable rule for the skill.

**What it costs the learner:** moderate. Composing a coherent scene is slower than reading a gloss and faster than building a keyword chain, since there is no phonological constraint to satisfy.

**Does it need a rendered image? No** — Bower & Clark's stories were composed and held verbally by the participants. This is the most text-native of the five.

---

## 5. Method of Loci — **Grade B. The best-evidenced of the five, and the worst-fitting.**

### 5.1 The mechanism, stated precisely

1. Choose a **familiar** physical space — a home, a commute, a building you can walk mentally without effort.
2. Fix an **ordered route** through it with distinct **loci** (stations) in a fixed sequence.
3. **Over-learn the route** until you can traverse it in either direction without hesitation. This is setup, done once, before any content.
4. To memorise a list, place an image of each item at the next locus, interacting with what is there.
5. Recall by walking the route.

**Correct application:** loci are *familiar and pre-existing*; the route is stable and reusable; placements are interactive. **Common wrong applications:** (a) inventing an imaginary palace, which forfeits the familiarity that supplies the free ordering structure; (b) reusing a route for new content before the old content has decayed, which produces interference; (c) using it for material that has no natural sequence.

### 5.2 The evidence — good, and honestly reported as shakier than its reputation

Two meta-analyses, and they are the most rigorous evidence anywhere in this document.

**[Twomey & Kroneisen (2021), *QJEP*](https://journals.sagepub.com/doi/abs/10.1177/1747021821993457)** — abstract *opened directly* via the Europe PMC API, verbatim: **13 randomised controlled trials**, *"a medium effect size (g = 0.65, 95% confidence interval [CI] = [0.45, 0.85]; I² = 45.5%)"*, and the effect *"remained at similar levels in further analyses adjusting for publication bias, the impact of removing each study, setting, control conditions, outliers, and number of loci method sessions."* Their own caveat: *"High risk of experimental bias was indicated, however, as the vast majority of studies did not report procedures to minimise biases relating to random sequence generation and allocation concealment."*

**[Ondřej (2025), *British Journal of Psychology*](https://pmc.ncbi.nlm.nih.gov/articles/PMC12514325/)** — *opened directly* on PMC, and much larger: **83 eligible studies, 68 in the main analyses.** The abstract's headline is *"strong evidence for a large effect on immediate serial recall compared with rehearsal (d = 0.88, 95% CI [0.47, 1.25])"*. But the young-adult subgroup analysis — 13 experiments, 936 participants — lands much lower: *"moderate evidence was found for a small effect (d = 0.42, 95% CI [0.00, 0.80])"*, whose interval touches zero, alongside *"very strong evidence for moderate heterogeneity, very strong evidence for publication bias."*

**I am flagging that spread deliberately rather than picking the flattering number.** The abstract-level 0.88 and the young-adult 0.42 are different comparisons in the same paper, and a citation of either alone is misleading. **GRADE quality ratings across this review's outcomes are "very low" to "low."**

The one delayed-retention data point in the review is not encouraging for our use: *"Hill et al. (1991) found effects of d = 0.84 at 1-hour delay and d = 0.48 at 3-day delays."* **The benefit halves in three days.** For an exam with no deadline (#74) and a spacing schedule measured in weeks, that decay curve is the wrong shape.

The review also notes that **written or computer-assisted presentation can *reduce* MoL's effectiveness relative to oral presentation** — a direct, if minor, hit on a text-artifact system.

### 5.3 Why it nonetheless does not fit this map

- **It is a serial-order technique.** Its measured outcome, across both meta-analyses, is *serial recall*. Dutch vocabulary is not serially ordered, and §5.2's own note — *"mixed outcomes in recognition tasks; superior recall in serial tasks"* — says the benefit is where the ordering is.
- **Setup cost is front-loaded and large.** The review's own words: *"Creating memory palaces is time-intensive"* and *"achieving rapid encoding requires considerable practice."*
- **Interference across reuse** is the standard practitioner complaint, and a spaced-repetition inventory that grows to thousands of Items would need palaces at a rate nobody sustains.
- **Neither meta-analysis addresses second-language vocabulary at all.** Ondřej's review does not cover it. Applying either effect size to Dutch words is extrapolation.

**Where it *would* earn its place:** genuinely ordered material where order is the exam demand. In Dutch that is a real but small set — the order of elements in a subordinate clause, the fixed sequence of a formal letter, the steps of an *inburgering* procedure. Worth naming as an option; not worth building infrastructure for.

**What it costs the learner:** the highest ongoing cost of the four imagery techniques and the second-highest setup cost after the Major System.

**Does it need a rendered image?** **No** — and it is the clearest case of the five. The palace is *by construction* a remembered space, not a depicted one. No MoL study supplies pictures of loci; supplying them would defeat the familiarity that makes the technique work. And per Thomas et al. (2023), even the *mental* image may not be the operative part.

---

## 6. The three questions, answered directly

### 6.1 Re-test of the keyword-method verdict — **#78 was too harsh; revise D → C**

Full argument in §2. Compressed:

| #78's claim | Status after this pass |
| --- | --- |
| "Dunlosky rated it low utility" | **True, and now verified verbatim** — but the rating is explicitly a *generalisability* verdict, and its three stated reasons are implementation difficulty, narrow materials, and short intervals. Only the third is an efficacy claim. |
| "Worse than rote after two days" | **True as reported** (Wang & Thomas 1995), still *indexed-not-verified*, and now sitting against Donoghue & Hattie's flat retention-interval line (*opened directly*). |
| "Grade D — do not build it" | **Overturned to Grade C, conditional.** Miyatsu & McDaniel (2019) is the missing evidence: at a one-week delay, keyword+retrieval beat keyword alone, and **with sparse practice there was no retrieval-practice effect at all without keyword encoding.** |
| "#81's no-images ruling costs the keyword method specifically — imagery is its mechanism" | **Overturned.** Every canonical keyword result used verbal instruction, and Thomas et al. (2023) shows imagery instructions work for people who form no images. The ruling costs it almost nothing. |

**Under what conditions does it win?** Concrete, imageable content words; a phonologically transparent keyword; interactive binding; **and few retrieval opportunities per item**, which is when its catalytic role appears. It loses on abstract vocabulary, function words, and grammar; it loses when practice is already plentiful (the encoding cost buys nothing extra); and on Donoghue & Hattie's ability moderator it may lose for exactly this learner.

**Is the low rating about the technique, learner-generated vs supplied keywords, retention interval, or training cost?** Mostly the **first, second and fourth**, not primarily the third. Dunlosky's own sentence names implementation and materials before intervals. On generated-vs-supplied specifically, the picture is mixed: for easy-to-generate keywords it made little difference whether the experimenter supplied them; for struggling learners, **supplied** keywords worked better than self-generated ones (*indexed-not-verified* — the Hogrefe *Experimental Psychology* 2004 paper is paywalled). That is a useful design fact: **an agent supplying candidate keywords is not obviously a degraded mode**, and for a capable adult, offering a keyword to accept, reject or replace keeps the generation effect available without paying its full cost.

### 6.2 Dual-coding without rendered images — **the claim survives; the theory does not**

Answered at length in §1.3. What the evidence supports, stated as narrowly as I can defend:

- ✅ **Elaborating a word into a concrete, interactive, specific scene improves retention.** Grade B, and it holds whether the scene is imagined or described.
- ✅ **Verbal instructions to form an interactive image are an effective way to produce that elaboration** — Grade B, *opened directly* (Thomas et al. 2023), and the effect does **not** depend on the learner's imagery ability.
- ✅ **Distinctiveness is doing much of the work** attributed to imagery. Grade B and strengthening (Higdon et al. 2025; Yan et al. 2026, both *opened directly*).
- ⚠️ **Adding a picture helps for expository/causal material** — Mayer's multimedia principle, *indexed-not-verified*, effect size disputed downward from d = 1.35 to g ≈ 0.39, and **out of scope for vocabulary items**.
- ❌ **"A separate visual code creates a redundant memory trace" is not supported** as an explanation, and is the specific claim the 2025–2026 aphantasia and distinctiveness work is dismantling.

**Consequence for the map: #81's text-first lock is not a compromise. On the mechanism evidence it is close to free.** The scene sentence is the artifact, exactly as #81 argued from the user's own example, and now there is a mechanism story behind it rather than a resource constraint.

### 6.3 Do the five compete or compose?

They are not five members of one category, and treating them as a menu is the mistake to avoid.

| Technique | What it actually is | Composes with |
| --- | --- | --- |
| **Dual coding** | A *theory* offered as a rationale for the others | Nothing — it is not a procedure. Under attack (§1.2). |
| **Keyword** | An **encoding** procedure for one form–meaning pair | Retrieval practice (**catalytically** — Miyatsu & McDaniel); Story, which can carry the keyword scene; Loci, which can store the result |
| **Major System** | A **codec**, digits → images. Not a storage method | Loci or Link, which store what it produces. **Nothing else in this map.** |
| **Link / Story** | A **structuring** procedure for a sequence | Keyword (the story *is* the interactive scene); Loci (rival structure — use one) |
| **Loci** | A **storage and ordering** structure | Keyword and Major System as suppliers; competes with Story |

**Only one genuine conflict:** Story and Loci both impose sequence, and using both on the same material is redundant.

**The important composition is the one outside the five.** Keyword is an encoding stage; retrieval practice and spacing are Grade A rehearsal schedules; and §2.5 shows the first can be a precondition for the second under sparse practice. **The Item's story/keyword field is not decoration on the scheduler — under this system's practice budget it may be what makes the scheduler work.** That elevates #78's "Items want a story field" from a nice-to-have to a load-bearing recommendation.

---

## 7. Pop-culture material as the mnemonic carrier

The user's second ask: do TV-show memes, quotes and scripts work better as the vivid scene than a freshly invented one?

### 7.1 Direct evidence: none that I could find

I searched for experimental comparisons of pre-existing media material against freshly generated scenes as mnemonic carriers and found nothing. **I am not going to construct a number from adjacent literatures and present it as an answer.** What follows is the indirect evidence, labelled as such, and it points both ways.

### 7.2 What argues for it

- **Prior knowledge improves encoding, and this is well established.** Familiar stimuli are less demanding on working memory, and prior knowledge benefits both item and source memory (*indexed-not-verified*). A pre-loaded scene arrives with its characters, setting and causal logic already in memory; only the *binding* is new.
- **The Method of Loci is the same claim, already validated.** MoL's entire requirement is that the space be **familiar** — a pre-existing, over-learned structure supplying free scaffolding. A TV show the learner knows well is structurally the same asset: a stable, richly detailed, over-learned world. **This is the strongest argument available, and it is an argument by analogy to a Grade B technique, not direct evidence.**
- **Setup cost is already paid.** Unlike a memory palace, the learner does not have to build it.

### 7.3 What argues against it

- **The generation effect.** Self-generated material is remembered better than material that is merely read, and it is one of the more robust findings in this area — it is the mechanism McDaniel and colleagues invoke to explain the bizarreness effect's list-type dependence (§4.3, *indexed-not-verified*). Handing the learner a finished pop-culture scene **spends** the generation effect to save encoding time. That is a real trade, not a free win.
- **Distinctiveness again.** If every Item is dressed in the same show, the show stops being distinctive and becomes the uniform background (§4.3). **A single-sitcom deck is the mixed-list failure repeated at deck scale.**
- **Interference.** A show's characters recur; a hundred Items anchored to the same dozen characters invites exactly the cue-overload the MoL reuse problem describes.

### 7.4 Recommendation

**Frame supplied, scene owned.** The agent proposes the carrier — and #74's invocation lock already produces one, since `/<skill> i want to do a lesson about last superbowl` *is* a user-supplied carrier — while the specific binding is generated in the moment and offered for the learner to accept, reject or rewrite. That keeps the familiarity benefit and most of the generation effect, and it matches §6.1's finding that supplied-vs-generated keywords are closer than folk wisdom assumes.

**Vary the carrier across Items.** Do not standardise on one show. Distinctiveness is relative.

### 7.5 Licensing — hand to [#94](https://github.com/atilileri/atilileri.github.io/issues/94)

Everything on this map is public (#74), so quoting scripts is a publishing act, not a private study aid.

The governing rule for a Netherlands-based public repo is the Dutch **citaatrecht**, Article 15a Auteurswet. Per [Auteursrechten.nl](https://auteursrechten.nl/en/faq-2/what-does-the-right-to-quote-entail-and-when-can-i-use-it/) — *opened directly* — four conditions must hold **simultaneously**:

1. **Purpose** — *"they must be used as an announcement, as an assessment, in a scientific thesis or for a similar purpose. They should not be for decorative purposes only."*
2. **Proportionality** — no more than necessary for that purpose.
3. **Attribution** — source **and** creator named.
4. **Prior publication** — *"the citation must refer to an already published source."*

It covers text, images and audio/video fragments. It is **narrower than US fair use** — a closed list of purposes rather than a balancing test.

**The uncomfortable bit, stated plainly and handed onward:** a quote used as a *memory hook* is arguably decorative rather than expository, which is the one condition most likely to fail. Condition 3 also has a build consequence — **attribution would have to be structural**, a field on the Item, not something a generating agent remembers to add. **#94 should decide this; I am flagging the risk, not clearing it.** The safe default that needs no ruling is **allusion without reproduction**: *reference* the scene, do not quote the script.

---

## 8. What this means for the downstream tickets

1. **Do not write "dual coding" into the Dutch skill.** Write *concrete, interactive, distinctive*, and cite distinctiveness. Same class of error as the interleaving line #78 caught in `teach` (§1.3).
2. **#81's text-first lock stands, and is now stronger than it was.** It was argued from resource constraints; it is now also supported by mechanism evidence. The scene sentence is the artifact (§6.2).
3. **The Item's story/keyword field is load-bearing, not decorative.** Miyatsu & McDaniel says that under sparse retrieval practice, encoding quality gates the testing effect (§2.5, §6.3).
4. **Ban "absurd" as a house style.** Prescribe concrete and interactive; reserve bizarreness for stuck Items (§4.3).
5. **Cut the Major System from the map.** Replace with timed number recognition/production Items targeting the **inversion property**, which is the actual difficulty (§3.3).
6. **Keep the Method of Loci as an option for genuinely ordered material only** — subordinate word order, letter structure, procedural sequences. Do not build infrastructure for it (§5.3).
7. **Offer strategies; do not impose them.** The ability moderator (§2.6) says techniques of this class may do nothing, or slightly worse than nothing, for a high-ability learner. That argues for an *opt-in* mnemonic field rather than a mandatory one — and, given #74's publicness lock, for recording which Items got one so the question can eventually be answered from this learner's own data.
8. **#94 inherits the citaatrecht question**, including the structural consequence that attribution would need its own Item field (§7.5).
9. **Future research tickets: try the Europe PMC REST API first** (§0). It is the difference between quoting an abstract and quoting a search engine's summary of one.

---

## 9. Sources

### Opened directly

- [Dunlosky, Rawson, Marsh, Nathan & Willingham (2013) — Improving Students' Learning With Effective Learning Techniques, *Psychological Science in the Public Interest*](https://pubmed.ncbi.nlm.nih.gov/26173288/) — abstract read verbatim via the Europe PMC API. Keyword mnemonic **and** imagery use for text learning both rated **low utility**; the stated reasons for keyword are implementation difficulty, limited materials, and short retention intervals; the ratings are explicitly generalisability judgements. §1.2, §2.3, §6.1.
- [Miyatsu & McDaniel (2019) — Adding the keyword mnemonic to retrieval practice: A potent combination for foreign language vocabulary learning?, *Memory & Cognition*](https://pubmed.ncbi.nlm.nih.gov/31077068/) — abstract verbatim via Europe PMC API. Three experiments; at one week keyword+retrieval > keyword alone; **no retrieval-practice effect without keyword encoding** under sparse practice; keyword-mediated retrieval more effective than unmediated. §2.5, §6.1, §6.3.
- [Thomas, Ayuno, Kluger & Caplan (2023) — The relationship between interactive-imagery instructions and association memory, *Memory & Cognition*](https://pubmed.ncbi.nlm.nih.gov/35948821/) — abstract verbatim via Europe PMC API. Neither reported vividness nor objective imagery skill explains the benefit; **aphantasics benefit as much as controls**. §1.3, §5.3, §6.2. **The single most decision-relevant source in this document.**
- [Yan, Roberts & Bainbridge (2026) — Challenging dual-coding theory: Picture superiority effects persist in aphantasia, *Neuropsychologia*](https://doi.org/10.1016/j.neuropsychologia.2026.109391) — abstract verbatim via Europe PMC API; [2025 preprint](https://doi.org/10.31234/osf.io/zn3sq_v1). §1.2, §6.2.
- [Higdon, Neath, Surprenant & Ensor (2025) — Distinctiveness, not dual coding, explains the picture-superiority effect, *QJEP*](https://doi.org/10.1177/17470218241235520) — abstract verbatim via Europe PMC API. Effect eliminated when words are made distinctive and pictures plain. §1.2, §6.2.
- [Twomey & Kroneisen (2021) — The effectiveness of the loci method as a mnemonic device: Meta-analysis, *QJEP*](https://journals.sagepub.com/doi/abs/10.1177/1747021821993457) — abstract verbatim via Europe PMC API (**the Sage page itself was not opened**; #78 could not open Sage either). 13 RCTs, g = 0.65 [0.45, 0.85], I² = 45.5%; robust to publication-bias adjustment; high risk of experimental bias. §5.2.
- [Ondřej (2025) — The method of loci in the context of psychological research: A systematic review and meta-analysis, *British Journal of Psychology*](https://pmc.ncbi.nlm.nih.gov/articles/PMC12514325/) — full text on PMC. 83 studies / 68 analysed; abstract-level d = 0.88 [0.47, 1.25] vs rehearsal; young-adult subgroup d = 0.42 [0.00, 0.80] with very strong publication-bias evidence; GRADE **very low** to **low**; Hill et al. decay 0.84 → 0.48 over three days; MoL less effective under written/computer presentation. §5.2, §5.3.
- [Donoghue & Hattie (2021) — A Meta-Analysis of Ten Learning Techniques, *Frontiers in Education*](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2021.581216/full) — 242 studies, 1,619 effect sizes, N = 169,179. Mnemonics d = 0.50 (107 cases); imagery use d = 0.56 (135 cases); flat retention-interval line; **high-ability mean effect −0.11 (SE 0.10, N = 28) vs low-ability 0.47 (SE 0.15, N = 58)**. §1.2, §2.2, §2.4, §2.6.
- [SmartPhone (2023): Exploring Keyword Mnemonic with Auto-generated Verbal and Visual Cues, arXiv:2305.10436](https://ar5iv.labs.arxiv.org/html/2305.10436) — read via ar5iv HTML (the arXiv PDF was undecodable). N = 72 on 36 German words, four conditions; **generated visual cues gave no statistically significant improvement over verbal cues alone**, though rated more favourably. Preprint, small cells (~18/condition) — treat as supporting, not decisive. §1.3, §6.2.
- [WordCraft: Scaffolding the Keyword Method for L2 Vocabulary Learning with Multimodal LLMs, arXiv:2602.00762](https://ar5iv.labs.arxiv.org/html/2602.00762) — read via ar5iv HTML. Study 1 N = 48, Study 2 N = 20; delayed (7-day) advantage over flashcards; **self-generated cues showed a modest immediate advantage that grew at delay** (generation effect). Preprint; the visual-vs-textual comparison is qualitative, not a controlled contrast — cited for the generation-effect result, not for an image claim. §7.3.
- [DUO — Hoe het Staatsexamen Nt2 werkt](https://www.duo.nl/particulier/staatsexamen-nt2/hoe-het-staatsexamen-nt2-werkt.jsp) — official. Four components only: Lezen, Luisteren, Spreken, Schrijven. No digit-memorisation component. §3.3.
- [Auteursrechten.nl — What does the right to quote entail?](https://auteursrechten.nl/en/faq-2/what-does-the-right-to-quote-entail-and-when-can-i-use-it/) — the four cumulative conditions of Art. 15a Auteurswet, quoted verbatim. §7.5.

### Indexed-not-verified

Publisher refused the fetcher, or the source was a PDF this machine cannot decode (no `pdftotext`/`pypdf`/`fitz`/`mutool`; `pip` unavailable). Claims below come from search-index summaries. Direction is corroborated across independent summaries; **exact figures should be re-checked.**

*Keyword method*
- [Atkinson & Raugh (1975) — An application of the mnemonic keyword method to the acquisition of a Russian vocabulary, *JEP: Human Learning and Memory* 104(2), 126–133](https://eric.ed.gov/?id=EJ113586); [Stanford technical report ED096841](https://eric.ed.gov/?id=ED096841) — **72% vs 46%** on the critical test. Both ERIC records resolve to PDFs; the Stanford `stacks.stanford.edu` mirror 404'd. The companion Spanish result (**88% vs 28%**) is second-hand and should not be quoted without the original.
- Wang & Thomas (1995) — *Effect of keywords on long-term retention: help or hindrance?* / *Learning by the keyword mnemonic: looking for long-term benefits*; [memory-key summary](https://memory-key.com/research/Wang95), [UCF record](https://stars.library.ucf.edu/facultybib1990/1773/) — keyword users **worse than rote controls after 2 days**; self-generated keywords did not attenuate forgetting; **supplied pictures of keyword + referent improved long-term retention**. Carried over unverified from #78; **the strongest pro-rendering evidence in this document and still unopened.** §2.4.
- [The Importance of the Keyword-Generation Method in Keyword Mnemonics, *Experimental Psychology* (2004)](https://econtent.hogrefe.com/doi/10.1027/1618-3169.51.2.125) — generated vs supplied keywords; little difference for easy-to-generate items. Hogrefe paywalled. §6.1.
- [Miyatsu & McDaniel-adjacent: Effects of repeated retrieval on keyword mediator use, *Memory* (2020)](https://www.tandfonline.com/doi/full/10.1080/09658211.2020.1797094) — **Taylor & Francis returned 403.** Listed because its topic (shifting from mediated to direct retrieval) bears directly on §2.5, and I could not read it.

*Dual coding, imagery, distinctiveness*
- [Clark & Paivio (1991) — Dual coding theory and education, *Educational Psychology Review*](https://link.springer.com/article/10.1007/BF01320076); [Paivio (1991) — Dual coding theory: Retrospect and current status, *Canadian Journal of Psychology* 45(3), 255–287](https://psycnet.apa.org/record/1992-07881-001) — the mechanism description in §1.1 is assembled from these plus corroborating summaries; **neither original was opened** (Springer identity-provider loop; PDF undecodable).
- Mayer (2021) — multimedia principle, **median d = 1.35**; earlier median 1.50; a more recent meta-analysis reports **g ≈ 0.39**. See [Mayer's principles summary (UNH)](https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf) (PDF, undecodable) and [a 2025 meta-analysis of Mayer's research](https://www.sciencedirect.com/science/article/pii/S1747938X25000673) (**ScienceDirect 403**). §1.2.

*Bizarreness and distinctiveness*
- Einstein & McDaniel (1987) review, and [McDaniel & Einstein (1995) — The bizarreness effect: it's not surprising, it's complex](https://pubmed.ncbi.nlm.nih.gov/7738508/); [The bizarreness effect: evidence for the critical influence of retrieval processes, *Memory & Cognition* (2013)](https://link.springer.com/article/10.3758/s13421-013-0335-4) — effect appears **only in mixed lists under free recall**. Springer bounced through its identity provider. §4.3.

*Major System*
- [Patton (1987) — Testing the limits of the phonetic mnemonic system, *Applied Cognitive Psychology*](https://onlinelibrary.wiley.com/doi/pdf/10.1002/acp.2350010405) — **Wiley returned 403.** Trained group beat controls on given digit strings but recalled **significantly fewer** when constructing their own keywords; consistent with Morris & Greer (1984). §3.2.
- [Mnemonic major system (Wikipedia)](https://en.wikipedia.org/wiki/Mnemonic_major_system) — used only for the digit→consonant mapping in §3.1, which is not a contested fact. Tertiary source, flagged as such.

*Story / link*
- [Bower & Clark (1969) — Narrative stories as mediators for serial learning, *Psychonomic Science*](https://link.springer.com/content/pdf/10.3758/BF03332778.pdf) — **93% vs 13%**. Carried from #78 and **still not opened** (Springer loop; PDF undecodable). Note the task is **serial learning of unrelated nouns**, which is the boundary condition §4.2 adds.

*Numbers in Dutch*
- [Multiple number-naming associations: how the inversion property affects adults' two-digit number processing, PMC10960323](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10960323/); [Sixty-four or four-and-sixty? PMC3990049](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3990049/) — inversion-specific processing costs; Dutch-speaking children make significantly more transposition errors than French-speaking children. Listed as background; not opened, because the direction is not in dispute and nothing load-bearing rests on the figures. §3.3.
- [Staatsexamen NT2 component descriptions (nt2.nl, LOI)](https://www.nt2.nl/en/actueel-item/80-4430_Staatsexamen-NT2-programma-I-niveau-B1) — third-party, not official; the official DUO page (opened) confirms only the four components. Defer to #77. §3.3.

*Pop-culture carrier*
- [The influence of prior knowledge on the formation of detailed and durable memories, *JML* (2021)](https://www.sciencedirect.com/science/article/abs/pii/S0749596X21000474) (**ScienceDirect 403**); [Familiarity enhances mnemonic precision but impairs mnemonic accuracy in visual working memory, *PB&R* (2023)](https://link.springer.com/article/10.3758/s13423-023-02250-0) (Springer loop) — prior-knowledge benefits, with a precision/accuracy trade-off worth noting. **No source found that tests pop-culture material as a mnemonic carrier directly.** §7.
