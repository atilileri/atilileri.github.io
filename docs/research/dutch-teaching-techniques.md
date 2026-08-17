# Teaching techniques for the Dutch journey

**Question:** Which teaching techniques are worth building into agent-run Dutch sessions, and which survive contact with this system's constraints — an **agent** teaching in **text and web artifacts**, in **Turkish and English**, to an **adult** with strong existing language-learning ability (native TR, highly proficient EN), aiming at a **specific exam** (Dutch inburgering), **in public**?

**Ticket:** [#78](https://github.com/atilileri/atilileri.github.io/issues/78), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

**Date:** 2026-08-16

---

## TL;DR verdict

**Teach the bridge in English, not Turkish.** This is the strongest and most consequential finding here, and it is not the answer the "always use the L1" folk wisdom gives. Every current model of third-language acquisition — the Typological Primacy Model, the L2 Status Factor, the Linguistic Proximity Model, the Scalpel Model — predicts that the *English* system, not the Turkish one, is what a Turkish/English bilingual will recruit when acquiring Dutch, and they predict it for different reasons that all converge on the same answer here. There is even a near-exact empirical match: [Hopp (2019)](https://journals.sagepub.com/doi/10.1177/1367006917752523) tested Turkish-heritage bilinguals acquiring a Germanic L3 and found **selective transfer from the Germanic L2, not from Turkish**. Dutch and English are West Germanic siblings; Turkish is agglutinative, verb-final, articleless and genderless. English is the language that already contains the categories Dutch will demand.

But that is a claim about *what the learner's brain will do*, not about *what language the page should be written in*. The two get conflated constantly. §1.5 separates them: **explanation, contrast and rule-statement in English; affective, metacognitive and "why does this feel weird" framing in Turkish; translation equivalents glossed bilingually where they differ.** The one place Turkish earns priority is precisely where Turkish *disagrees* with both Dutch and English — because that is where the learner's most automatic intuitions will silently mislead them.

**Second-strongest finding: what `teach` says about interleaving is probably wrong for vocabulary.** `teach` (`.agents/skills/teach/SKILL.md:34-45`) lists retrieval practice, spacing and interleaving as a package of "desirable difficulty". The first two are as strong as educational psychology gets. Interleaving is not — and the largest meta-analysis of it, [Brunmair & Richter (2019)](https://www.semanticscholar.org/paper/Similarity-matters:-A-meta-analysis-of-interleaved-Brunmair-Richter), found that for **word materials, blocking beat interleaving (g = −0.39)**. See §3.3.

**Third: the user's own report — that a word's *story* is what makes it stick — is better evidenced than the technique it superficially resembles.** Narrative encoding has one of the largest effects in the classic memory literature ([Bower & Clark, 1969](https://link.springer.com/content/pdf/10.3758/BF03332778.pdf): 93% vs 13% delayed recall). The *keyword mnemonic*, by contrast, is rated **low utility** by [Dunlosky et al. (2013)](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266) and in at least one study produces *worse* long-term retention than plain rote rehearsal. Story ≠ keyword mnemonic. Build the former; treat the latter as a garnish. See §4.

**Fourth, and it unblocks [#80](https://github.com/atilileri/atilileri.github.io/issues/80)'s asynchronous path:** the systematic review of corrective-feedback timing found that **when delayed feedback arrived a day or more later, studies consistently found no difference from immediate feedback** ([Fu & Li, 2022 / PMC9995700](https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/)). The bus-stop answering path is not a compromise on learning quality. It is, on current evidence, roughly free. See §6.

---

## 0. How to read this — evidence grading and verification

Two independent gradings are used, and they are not the same thing.

**Evidence strength** — how much the research literature actually supports the technique:

| Grade | Meaning |
| --- | --- |
| **A** | Multiple meta-analyses or a large meta-analysis with consistent effects; recommended by independent review panels. Bet on it. |
| **B** | One good meta-analysis, or consistent experimental evidence with known boundary conditions. Use it, respect the boundaries. |
| **C** | Mixed, contested, or the effect is real but small / narrow / short-lived. Use with care and do not build architecture on it. |
| **D** | Popular and intuitive, but the evidence is weak, null, or points the other way. Flag it; do not build it. |

**Verification** — whether I opened the source myself, matching the convention in `docs/research/agent-vs-model-harness-skills.md`:

- **Opened directly** — I fetched and read the page.
- **Indexed-not-verified** — the claim comes from a search index's summary of the abstract, because the publisher returned 402/403 to my fetcher (Sage, Wiley, Ovid, ResearchGate all did) or the file was a PDF my fetcher could not decode into text (Purdue, ERIC, Würzburg — no `pdftotext` or `pypdf` on this machine). The numbers below marked this way are abstract-level and should be re-checked against the paper before anything load-bearing is built on the exact figure. The *direction* of these findings is corroborated across multiple independent index summaries; the *decimals* are not.

Full accounting in [§8 Sources](#8-sources).

Only **two** substantive sources were opened directly (Hopp 2019; Fu & Li on feedback timing) plus the Poort & Rodd cognate database. That is a real limitation of this pass, and I would rather say so than dress up index snippets as reading.

---

## 1. The L1-vs-strong-L2 question

This is the ticket's hardest question and the one that directly drives [#84](https://github.com/atilileri/atilileri.github.io/issues/84), so it gets the space.

### 1.1 The typological facts that set up the whole problem

The learner profile is not a generic "bilingual learning a third language". It is an unusually clean natural experiment:

- **Dutch and English are West Germanic siblings.** Same branch, same family. Shared V2-ish word order history, shared article system, shared perfect-tense auxiliary construction, shared modal verbs, shared phrasal-verb/separable-verb morphology, enormous shared lexicon. Poort & Rodd's controlled database — the one source here I opened directly — is built precisely on this: they validated **58 identical cognates, 76 non-identical cognates, 72 identical interlingual homographs (false friends), and 78 translation equivalents** with bilingual similarity ratings ([Poort & Rodd, 2019, *Journal of Cognition*](https://journalofcognition.org/articles/10.5334/joc.67)). Note that this is a *stimulus set for experiments*, deliberately filtered to 3–8 letters and frequency-thresholded — it is **not** an estimate of total Dutch–English cognate overlap. Broader overlap figures circulating online (80–95% Germanic-origin core vocabulary) are indexed-not-verified and should not be quoted as a measurement.
- **Turkish is unrelated and typologically distant.** Turkic, not Indo-European. Agglutinative rather than fusional; head-final and predominantly SOV; **no articles**; **no grammatical gender**; **no** *de/het* common/neuter split; case marking by suffix where Dutch uses prepositions and word order.

The consequence is sharp. Almost every Dutch structure the exam will test — definite/indefinite articles, *de* vs *het*, verb-second main clauses with verb-final subordinates, perfect with *hebben*/*zijn*, separable verbs, modal stacking — has a **recognisable English analogue and no Turkish analogue at all**. English is not merely the more convenient explanatory language. It is the language that already contains the *categories*.

### 1.2 What the L3-acquisition models predict — four models, one answer

L3 acquisition has its own theoretical literature distinct from L2 acquisition, precisely because the "which prior language transfers?" question only arises with three. Four models dominate, and they disagree with each other — which makes it notable that on *this* learner profile they converge.

**Typological Primacy Model (TPM; Rothman 2011, 2015).** Transfer at the initial state is **holistic** and comes from whichever prior language is structurally closest to the L3, regardless of acquisition order. The parser decides which language that is via an implicational hierarchy — **lexicon → phonology/phonotactics → functional morphology → syntax** — with lexical similarity as the first trigger. *Prediction here:* the Dutch lexicon is transparently English-like, so the parser flags English almost immediately and transfers the English grammar wholesale. **English.** ([Rothman 2011, *Second Language Research*](https://journals.sagepub.com/doi/10.1177/0267658310386439); [Rothman 2015, *BLC*](https://www.cambridge.org/core/journals/bilingualism-language-and-cognition/article/abs/linguistic-and-cognitive-motivations-for-the-typological-primacy-model-tpm-of-third-language-l3-transfer-timing-of-acquisition-and-proficiency-considered/56606CE09ED7FEA6DA3F2437C6D31B94) — indexed-not-verified.)

**L2 Status Factor (Bardel & Falk 2007, 2011).** The L2 is privileged as a transfer source *because it is an L2* — both non-native languages are learned and stored in declarative memory and share a metalinguistic learning mode, so the L2 "blocks" the L1. *Prediction here:* **English**, and for an entirely different reason — not because English resembles Dutch, but because English is the other consciously-learned language. ([Falk & Bardel 2011, *Second Language Research*](https://journals.sagepub.com/doi/10.1177/0267658310386647) — indexed-not-verified.)

**Linguistic Proximity Model (Westergaard et al. 2017)** and **Scalpel Model (Slabakova 2017).** Reject holistic transfer. Both prior grammars stay co-activated, and influence happens **property by property**, with the structurally closer source winning each property individually. *Prediction here:* mostly English, property by property, with Turkish available where a Turkish property happens to match (a genuinely rare case for Dutch). Crucially these models predict that **Turkish will not be uniformly silent** — it can still surface on specific properties, and typically as *interference*. ([Westergaard et al. 2017](https://journals.sagepub.com/doi/abs/10.1177/1367006916648859); [Slabakova 2017](https://journals.sagepub.com/doi/10.1177/1367006916655413) — indexed-not-verified.)

So: TPM says English because Dutch *looks like* English. L2 Status says English because English is the other L2. LPM/Scalpel say English on nearly every property that matters. **Four models, four mechanisms, one answer.** When rival theories that were built to contradict each other agree on your case, that is about as strong as a theoretical prediction gets.

### 1.3 The empirical near-match — and it is a very near match

The best single piece of evidence is not a general result; it is almost this learner. **[Hopp (2019), *International Journal of Bilingualism*](https://journals.sagepub.com/doi/10.1177/1367006917752523)** — *opened directly* — tested 31 Turkish-German heritage bilinguals and 31 German monolinguals (grades 3–4) acquiring English as L3, using a sentence-repetition task and a picture-story retelling task on properties that differ across all three languages. Result: **the two groups performed indistinguishably, and both showed selective transfer from German** — the Germanic language — not from Turkish. Hopp's framing: language dominance and proficiency matter more than acquisition order; even heritage speakers transfer from the more developed Germanic system rather than from the native language.

The configuration is Turkish + Germanic → Germanic, exactly ours (with Dutch and English swapping roles). Convergent, indexed-not-verified evidence points the same way: studies of article acquisition in L3 English by Turkish–German bilinguals report **absence of negative CLI from Turkish and positive CLI from the Germanic L2** — which is the single most relevant grammatical domain we have, since Turkish has no articles and Dutch does.

**Caveats, stated honestly.** (a) Hopp's participants are children and heritage speakers; our learner is an adult with a fully dominant Turkish L1 and instructed English. The dominance story therefore *does not* transfer cleanly — for our learner, Turkish is dominant and English is the instructed language, which is the L2-Status configuration rather than the dominance configuration. Both still predict English, but by different routes. (b) These are studies of **spontaneous transfer**, i.e. what the mind does unbidden. They are only indirect evidence about **what language a lesson should be written in**. §1.5 is where that gap gets closed.

### 1.4 What the instruction-language literature actually says — and what it does not

The pedagogical literature that gets cited in "should I use the L1?" arguments is the **glossing** literature, and it does not answer our question.

The largest synthesis — [Kim, Lee & Lee (2024), *Language Teaching Research*](https://journals.sagepub.com/doi/10.1177/1362168820981394), 78 effect sizes from 26 studies, N = 2,189 — found **L1 glosses outperformed L2 glosses overall (Hedges' g = .33)**, but critically that the advantage **showed up mainly on immediate vocabulary post-tests, not on delayed post-tests or on reading comprehension**. Earlier work is mixed in an instructive way: Laufer & Shmueli (1997) found L1 glosses better short- and long-term, while Laufer & Hill (2000) found *no* difference for Israeli students and an **L2-explanation advantage for Hong Kong students** — i.e. the effect moves with population and proficiency. (Indexed-not-verified.)

**The mismatch matters and I want to be explicit about it.** In every one of those studies, "L2 gloss" means *a gloss written in the target language being learned* — a monolingual definition in the language you are struggling with. That is a comprehensibility handicap. Our choice is completely different: **Turkish (L1) versus English (a strong, comfortable, non-target L2)**. Nothing in the gloss literature tests that. The measured L1 advantage is best read as *"comprehensible beats incomprehensible"*, and English is entirely comprehensible to this learner. **Grade C for direct applicability**; the finding is real but off-target. Anyone citing "research says use the L1" at this decision is over-reading it.

The relevant *positive* fact from the pedagogical side is the **bilingual advantage in L3 learning**: bilinguals reliably outperform monolinguals on metalinguistic tasks and in L3 acquisition, with metalinguistic awareness and learning strategies as the mediating mechanisms ([Cenoz 2003, *IJB*](https://journals.sagepub.com/doi/abs/10.1177/13670069030070010501) — indexed-not-verified; Cenoz's own caveat is that results are **more mixed for immigrant learners whose home language differs from the school language**, which is closer to our learner's situation than the clean cases). **Grade B.** Practical consequence: this learner can be taught *metalinguistically* — explicit contrast, named categories, "here is the rule and here is where it breaks" — in a way you could not assume for a naive learner. That is a licence to use techniques (§2.3, §4.3) that would be too abstract for a beginner.

### 1.5 Recommendation for #84 — a role split, not a language winner

The question "Turkish or English?" is malformed. There are at least four distinct jobs a language does in a lesson, and they do not have the same answer.

| Job in the lesson | Language | Why |
| --- | --- | --- |
| **Grammatical explanation, rule statement, terminology** | **English** | English already has the categories (articles, gender-ish determiners, perfect auxiliaries, V2, separable verbs). Explaining *de/het* in Turkish requires first inventing the concept of an article; in English it is one sentence. All four L3 models say the English system is what is being recruited anyway (§1.2). |
| **Dutch↔English contrast: cognates, false friends, near-misses** | **English** | This is the highest-leverage material in the whole curriculum (§4.2) and it is *definitionally* English-mediated. |
| **Where Turkish silently misleads** | **Turkish** | The property-by-property models (§1.2) say Turkish is not silent, and unrelatedness means its interference is *invisible* rather than absent — an articleless, genderless, verb-final intuition does not announce itself. Naming it explicitly in Turkish ("Türkçede artikel yok, bu yüzden *het* atlamak doğal geliyor — ama sınavda puan kaybettirir") converts an unconscious habit into a noticeable one (§2.3). |
| **Mission, motivation, metacognition, encouragement, the story frame** | **Turkish** | No evidence-based reason from the transfer literature; the reason is affective and it is the learner's own preference. The gloss meta-analysis's L1 advantage, whatever its true mechanism, at least does not argue against it. |

Two further concrete recommendations:

- **Translation equivalents should be glossed in both** where TR and EN diverge in sense. `gezellig` is not `cosy` and is not `samimi`; two imperfect anchors triangulate better than one. This costs almost nothing in a text artifact.
- **Do not make bilingualism a global toggle.** The above table is a per-*element* decision, not a per-*document* one. A build that ships an "English version" and a "Turkish version" of each lesson would get the worst of both and double the maintenance. One document, two languages, each doing its own job. This is the concrete thing #84 should lock.

**Publicness note.** A stranger reading this repo is far more likely to read English than Turkish. English-dominant explanation is also the choice that makes learning-in-public actually work as a public artifact — a happy alignment, not an argument, but worth naming since #74 locks publicness.

---

## 2. Second-language acquisition

### 2.1 Comprehensible input (Krashen) — **Grade C/D as a doctrine, A as a truism**

*What it is.* Acquisition is driven by understanding messages slightly beyond current level ("i+1"); conscious learning is a separate, largely useless "monitor".

*Evidence.* The **strong** version is in poor shape. Reviews converge on three charges: Krashen never operationalised "comprehensible input" or "i+1", so the hypothesis is effectively **untestable**; the acquisition/learning distinction cannot be measured because there is no way to tell which system produced a given utterance; and Krashen's supporting evidence is largely reinterpretation of phenomena rather than experiment. Recent work adds that language learning is not passive absorption but an active, interactive process ([Frontiers in Psychology, 2025, neuro-ecological critique](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1636777/full); [critical review, JEHD 2015](http://jehd.thebrpi.org/journals/jehd/Vol_4_No_4_December_2015/16.pdf) — both indexed-not-verified). The **weak** version — "learners need a lot of understandable target-language material" — is not seriously disputed and is downstream-supported by the extensive-reading results in §2.5.

*Operationalising it.* Keep the practice ("every session should contain real, mostly-understandable Dutch text at a level the learner can follow with effort"), **drop the doctrine** ("input is sufficient; explicit teaching is wasted"). The doctrine is actively harmful here: it would forbid exactly the explicit contrastive teaching that §1.5 and §2.3 recommend, and that this metalinguistically-sophisticated adult is best positioned to exploit.

*🚩 Flag.* "Just get comprehensible input" is the most popular under-evidenced claim in the entire language-learning space. It is worth stating in the skill that this system deliberately does not follow it.

### 2.2 Output / pushed output (Swain) — **Grade C, but structurally important**

*What it is.* Producing language forces syntactic processing that comprehension can skip, makes learners notice gaps in their own knowledge, and lets them test hypotheses.

*Evidence.* Genuinely mixed. Swain's originating observation — immersion students with years of rich input still had persistently non-target-like production — is a solid existence proof that input alone is insufficient. Beyond that, "comprehensible output" is no better operationalised than "comprehensible input", non-interactive output tasks produce mixed or minimal gains, and pushed output can raise anxiety. Some studies find accuracy (not fluency) gains from pushed output. (Indexed-not-verified across several review sources.)

*Operationalising it.* The relevant point for this system is not the hypothesis but its **overlap with retrieval practice (§3.1, Grade A)**. Producing Dutch *is* effortful retrieval, and retrieval practice has far better evidence than output theory does. So: make the learner produce, and justify it by the retrieval literature rather than by Swain. Text output is fully available to an agent; the writing (*schrijven*) exam component is directly served.

*Async survivability:* ✅ excellent. A production prompt is a question; the answer can arrive hours later (§6).

### 2.3 Noticing (Schmidt) — **Grade B, and unusually well matched to this system**

*What it is.* Input becomes intake only when a feature is consciously registered. Attention is the gate.

*Evidence.* The strong claim (noticing is *necessary* and *sufficient*) is not established — **Schmidt himself conceded his foundational study showed neither**. Critics note the attention–awareness link was assumed rather than demonstrated. But the graded version holds up: Leow's crossword studies found **higher awareness → more learning, noticing-without-generalisation → less, and no learning where instances were not noticed at all**. (Indexed-not-verified.)

*Why it matters more here than usual.* Noticing is exactly what a Turkish speaker will fail to do for Dutch features with no Turkish counterpart. You cannot notice the absence of a category you do not have. This is the direct pedagogical payoff of §1.1: the *de/het* distinction, the article system, V2 order, and *hebben*/*zijn* selection are all invisible-by-default to a Turkish intuition and all trivially visible from English.

*Operationalising it.* **Input enhancement** is text-native and therefore free in this system: bold/colour/underline the target feature in a reading passage, then ask what changed. **Contrastive noticing prompts** — "this Dutch sentence puts the verb where English would not; where does Turkish put it?" — do the work of §1.5's third row. A text-and-web artifact is arguably a *better* noticing vehicle than a classroom, because typographic salience is precise and permanent.

*Async survivability:* ✅ good; the artifact does the enhancing, the noticing question can be answered later.

### 2.4 Task-based language teaching — **Grade B, with the effect size disputed downward**

*What it is.* Organise instruction around meaningful tasks with a non-linguistic outcome (fill in the form, book the appointment, argue the case), rather than around a grammar syllabus.

*Evidence.* [Bryfonski & McKay (2019), *Language Teaching Research*](https://journals.sagepub.com/doi/abs/10.1177/1362168817744389) meta-analysed 52 studies and reported a **large overall effect (d = 0.93)**. That headline number has since taken sustained methodological fire: [Xuan, Cheung & Liu (2025)](https://journals.sagepub.com/doi/abs/10.1177/13621688221131127) charge loose inclusion criteria, oversimplified effect-size calculation and neglected moderators, and a re-analysis lands on a **more modest g = 0.61**; [Boers & Faez (2023)](https://journals.sagepub.com/doi/10.1177/13621688231167573) question whether relative-effectiveness meta-analysis of TBLT programmes is even yet possible. (All indexed-not-verified.) A real, moderate, contested effect.

*Operationalising it.* This is the **single best fit to the mission**. The inburgering exam is itself task-shaped — it tests functioning in Dutch society (KNM, and the practical language components), not grammar-table recall. And it dovetails perfectly with #74's invocation lock: `/<skill> i want to do a lesson about last superbowl` means the *task's dressing* is user-supplied while the *task's linguistic target* comes from the plan. TBLT gives that lock its theoretical justification — the theme is the task context, the syllabus item is the task's language demand.

*Async survivability:* ⚠️ partial. Multi-turn negotiated tasks need a live session; a single-shot task ("write the email to the gemeente") survives async fine.

### 2.5 Extensive reading — **Grade B, one of the better-evidenced whole-programme interventions**

*What it is.* Large volumes of easy, self-selected, pleasurable reading at or below current level. Not intensive study of hard text.

*Evidence.* [Nakanishi (2015), *TESOL Quarterly*](https://onlinelibrary.wiley.com/doi/abs/10.1002/tesq.157) — 34 studies, 43 effect sizes, N = 3,942 — reports **d = 0.46 for group contrasts and d = 0.71 for pre–post contrasts**. A 2025 *Educational Psychology Review* meta-analysis revisits the question ([link](https://link.springer.com/article/10.1007/s10648-025-10068-6)). (Indexed-not-verified.) Meaningful caveats: pre–post contrasts overstate, programmes are long, and self-selection is doing work.

*Operationalising it.* This is the most **repo-native** technique in the document. A generated Dutch text at a controlled level, published as a page, costs the agent almost nothing and accumulates into a graded-reader library over time — which is exactly the "invest in the system; there is runway" posture #74 locks. Two design notes: (a) at A2/B1 the constraint is that texts must be *easy*, which for a beginner means the agent is writing the readers, not sourcing them; (b) copyright pressure (a named unknown on #74) is entirely sidestepped by generated text.

*Async survivability:* ✅ excellent — reading needs no feedback loop at all.

---

## 3. Memory and retention — and what `teach` gets wrong

`teach` (`.agents/skills/teach/SKILL.md:34-45`) states the fluency-vs-storage-strength distinction and then prescribes retrieval practice, spacing and interleaving as one bundle of "desirable difficulty". The distinction is right and well-sourced. The bundle is not uniform in quality, and one of the three is probably backwards for our material.

### 3.1 Retrieval practice (the testing effect) — **Grade A. Strongest thing in this document.**

*What it is.* Trying to recall from memory is a *learning* event, not just a measurement event, and beats re-studying the same material for the same time.

*Evidence.* [Rowland (2014), *Psychological Bulletin*](https://pubmed.ncbi.nlm.nih.gov/25150680/): **159 studies, g = 0.50, 81% of comparisons favouring retrieval over restudy**. [Dunlosky et al. (2013)](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266) rate practice testing **high utility** — one of only two techniques out of ten to earn that grade. Moderators worth building around: **recall tests beat recognition tests**; effects are larger for **more complex material**; and **feedback matters a great deal — intermediate testing with feedback g ≈ 0.73 vs without feedback g ≈ 0.39**. (Indexed-not-verified for the numbers; the direction is corroborated across sources.)

*Operationalising it.* Every Item should be answerable by **production, not selection**. This has a hard consequence for the build: an agent's laziest generated artifact is a multiple-choice quiz, and multiple choice is *recognition* — the weaker half of Rowland's moderator. (This compounds a known upstream defect: [#76](https://github.com/atilileri/atilileri.github.io/issues/76) found `teach`'s quiz answers always land in slot A. A recall-first design routes around the bug entirely rather than patching it.) Prefer: type the Dutch word, produce the sentence, fill the blank with no options shown.

*Async survivability:* ✅ excellent — with one caveat. Feedback nearly doubles the effect, and #80's path defers feedback. §6 argues that is fine.

### 3.2 Spacing / distributed practice — **Grade A, but the popular implementation is wrong**

*What it is.* Study sessions separated in time beat the same total time massed together.

*Evidence.* [Cepeda et al. (2006), *Psychological Bulletin*](https://augmentingcognition.com/assets/Cepeda2006.pdf) — **839 assessments across 317 experiments in 184 articles**. Rated **high utility** by Dunlosky et al. Within L2 specifically, [Kim & Webb (2022), *Language Learning*](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479) — 98 effect sizes from 48 experiments, N = 3,411 — confirms it for vocabulary, grammar/morphology and pronunciation. (Indexed-not-verified; the Wiley and Ovid pages both returned 402 to my fetcher, so I could not read Kim & Webb's per-contrast effect sizes and deliberately do not quote numbers for them.)

**Two things `teach` does not say, and both change the design:**

**(a) The optimal gap is a *function of when you need the material*, not a constant.** [Cepeda et al. (2008), *Psychological Science*, "temporal ridgeline of optimal retention"](https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf): the best inter-study interval grows with the retention interval — roughly **20% of the target delay for delays of a few weeks, falling to ~5% at a one-year delay**. This is directly actionable and #74 makes it more so: **there is no deadline set**. A scheduler tuned for "exam in six weeks" and one tuned for "exam eventually" should not produce the same intervals. Whatever the scheduling ticket decides, the *exam date* (or its absence) must be an input to it, not an afterthought.

**(b) Expanding intervals — the thing every flashcard app does — are not supported for long-term retention.** [Karpicke & Roediger (2007), *JEP:LMC*](https://learninglab.psych.purdue.edu/downloads/2007/2007_Karpicke_Roediger_JEPLMC.pdf): expanding retrieval won at **10 minutes**, but **equally spaced retrieval won at 2 days**, because what actually matters is making the *first* retrieval hard by delaying it — which expanding schedules specifically avoid. Kim & Webb also examine equal vs expanding in the L2 case. (Indexed-not-verified.) 🚩 **Flag:** "expanding intervals" is folk wisdom inherited from SM-2/Leitner, and it is at best unproven and at worst optimised for the wrong horizon.

*Operationalising it, against #79's constraint.* [#79](https://github.com/atilileri/atilileri.github.io/issues/79) established that Cards are **derived and never stored**, so **scheduling can only be per-Item**. That is a real loss relative to Anki (where a reversed card can be scheduled independently of its forward twin) — but it is a much smaller loss than it looks, for three reasons:

1. The spacing effect in Cepeda is about **re-encounter with the material**, not about per-direction difficulty tracking. Per-Item spacing captures the mechanism.
2. The evidence *against* expanding intervals (above) removes most of the motivation for fine-grained per-card adaptivity. If equal spacing is the safer default, a simple per-Item date is nearly as good as an elaborate per-card model — and dramatically easier to keep in a git-committed, human-readable, public file.
3. Direction asymmetry is better handled at **generation** time than at **scheduling** time: when an Item comes due, the agent chooses which direction to test (see §3.5 on retrieval direction). One due-date, a decision about direction on the day.

**Practical recommendation for the scheduling ticket:** per-Item `last_seen` + `next_due`, roughly equal intervals, interval length parameterised by the horizon, with the *direction* chosen at session time rather than stored. Do not port SM-2.

*Async survivability:* ✅ excellent. Spacing is the one technique that positively *benefits* from the learner answering on a bus at an unpredictable hour.

### 3.3 Interleaving — **Grade C overall, and probably Grade D for vocabulary. `teach` is wrong here.**

*What it is.* Mix problem/item types within a practice session instead of blocking them by type.

*Evidence.* [Brunmair & Richter (2019), *Psychological Bulletin*, "Similarity matters"](https://www.semanticscholar.org/paper/Similarity-matters:-A-meta-analysis-of-interleaved-Brunmair-Richter) — 59 studies, 238 effect sizes, 158 samples — found a moderate overall effect (**g = 0.42**) that **decomposes catastrophically by material type**:

| Material | Effect |
| --- | --- |
| Paintings / visual category learning | **g = 0.67** (interleaving wins big) |
| Mathematical tasks | **g = 0.34** (interleaving wins slightly) |
| Expository texts, tastes | non-significant |
| **Words** | **g = −0.39** (**blocking wins**) |

Dunlosky et al. rate interleaved practice only **moderate utility**. (Indexed-not-verified; I could not decode the Würzburg PDF or open the Ovid abstract — this is the single most decision-relevant number in the document that I could not verify directly, and it should be checked before it is treated as settled.)

*🚩 What `teach` gets wrong.* `teach` bundles interleaving with retrieval practice and spacing as co-equal "desirable difficulties", qualifying it only with "*for skills practice only*". That qualifier is doing far less work than it needs to. The honest statement of the evidence is: **interleaving's benefit is concentrated in inductive category learning where the discriminations are confusable, and it appears to be actively harmful for word learning.** The mechanism explains the pattern — interleaving works by forcing *discrimination between similar categories*, which is precisely what a list of unrelated vocabulary items does not require. Copying `teach`'s wording into the Dutch skill would import a real error.

*Where interleaving still earns its place here.* Follow the mechanism, not the slogan. Interleave where Dutch presents **genuinely confusable categories**:
- **de vs het** — the canonical case. Two confusable classes distinguished by no reliable surface rule; this is a category-induction problem and should look like Brunmair & Richter's paintings, not like their word lists.
- ***hebben* vs *zijn*** perfect auxiliary selection.
- **Separable vs inseparable verb prefixes.**
- **Word-order contexts** (main vs subordinate clause).

Do **not** interleave plain vocabulary items across unrelated topics on the theory that difficulty is always desirable. Block those by theme.

*Async survivability:* ✅ good.

### 3.4 Desirable difficulty / learning vs performance — **Grade A as a principle, and a design warning**

*What it is.* [Soderstrom & Bjork (2015), *Perspectives on Psychological Science*](https://journals.sagepub.com/doi/abs/10.1177/1745691615569000): **performance is an unreliable index of learning**, manipulations can move the two in opposite directions, and difficulties that depress performance often improve retention. (Indexed-not-verified.)

*What this means for a system built in public.* Two uncomfortable consequences that should be locked as design principles:

1. **Any progress display is a performance metric, and performance can move opposite to learning.** #74 lists progress display as unspecified. A public streak/score dashboard is exactly the kind of instrument that rewards easy sessions. If progress is shown, it should report *delayed* retention (things recalled after a gap), never in-session accuracy.
2. **The learner's feeling of a session going well is not evidence.** This is the same point as §5, arriving from the memory side, and it is the reason the assessment section has to be more than "ask how it went".

`teach`'s fluency-vs-storage-strength framing is a correct and useful statement of this — credit where due; that part it gets right.

### 3.5 Elaborative encoding, generation, and retrieval direction — **Grade B**

*What it is.* Processing meaning, connections and "why" rather than form alone. Includes elaborative interrogation (answer "why is this true?"), self-explanation, and the generation effect.

*Evidence.* Dunlosky et al. rate **elaborative interrogation and self-explanation moderate utility** — a real effect, less robust than testing and spacing. (Indexed-not-verified.) The bridge to §4 is that "story" is a species of elaborative encoding, and the story evidence is stronger than the generic elaboration evidence.

*Retrieval direction — the one place per-Item scheduling needs care.* Webb (2009, *RELC Journal*) and follow-ups: **receptive practice (L2→L1) produces receptive knowledge; productive practice (L1→L2) produces productive knowledge** — practice matches its test. But **forward/productive (L1→L2) translation is generally superior for overall vocabulary knowledge**, including orthographic and syntactic knowledge, at the cost of being harder and yielding fewer successes early. (Indexed-not-verified.)

*Operationalising it.* Since #79 forbids per-direction scheduling, make direction a **session-time policy** on the Item's maturity: newly-introduced Items get receptive (Dutch→English/Turkish) tests to build a foothold; established Items get productive (→Dutch) tests. Since the exam has both a writing and a speaking component, **productive should be the eventual default for anything on the exam-critical list**. This policy is a function of state the Item already carries — no extra schema needed.

---

## 4. Mnemonic, etymological and story-based encoding

The ticket asks for this to be weighted heavily because the user reports that a word's *story* is what makes it stick. The evidence splits sharply, and the split is good news: **the thing the user describes is well-evidenced; the technique it is usually confused with is not.**

### 4.1 The keyword method — **Grade D. 🚩 Popular, intuitive, and poorly evidenced for durable learning.**

*What it is.* Link an L2 word to an acoustically similar L1/known word ("keyword"), then form a vivid interactive image joining the keyword and the meaning. Dutch *kaas* → "cause" → imagine a cheese arguing for a cause.

*Evidence against.* [Dunlosky et al. (2013)](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266) rate the **keyword mnemonic LOW utility**, grouped with highlighting and rereading. Worse: **Wang & Thomas (1995)** found keyword-method learners performed **worse than a rote-repetition control after a two-day delay** — long-term forgetting was *greater* for keyword users. The classic pattern is a large immediate cued-recall advantage that inverts after a delay. Notably, in that work **provision of pictures of the keyword and referent during study improved long-term retention** — meaning the rescue condition is precisely the one [#81](https://github.com/atilileri/atilileri.github.io/issues/81) has ruled unavailable. (Indexed-not-verified.)

*The LLM-mnemonic literature adds a second warning.* [Balepur et al. (2024), EMNLP, "A SMART Mnemonic Sounds like 'Glue Tonic'"](https://aclanthology.org/2024.emnlp-main.786/) collected 2,684 preferences from 45 students and found that **expressed preferences (what students rate as helpful) disagree with observed preferences (what actually improves learning)**, and that a **human language expert wrote better mnemonics than both their fine-tuned model and GPT-4**. (Indexed-not-verified.) Two implications for us: LLM-generated keyword mnemonics are not a solved problem, and *the learner's judgement that a mnemonic is good is not evidence that it works* — the same illusion as §3.4 and §5.

*Verdict.* Do not architect around it. It is a legitimate emergency tool for a small number of stubborn, arbitrary, high-value items (irregular verbs, *de/het* assignments with no pattern), used sparingly and always **backed by retrieval practice on the actual word**, never on the mnemonic. And it is **precisely the technique that #81's no-images ruling most weakens**, since the imagery is the mechanism. Say this out loud in the skill so nobody re-adds it later thinking it was an oversight.

### 4.2 Cognate exploitation and false friends — **Grade B, and the highest-leverage material available**

*What it is.* Systematically mine the Dutch–English shared lexicon; systematically inoculate against the shared-form/different-meaning traps.

*Evidence.* Cognate facilitation is one of the most robust findings in bilingual lexical processing: **cognates are recognised and learned faster than matched non-cognates**. The genuinely counterintuitive finding is about false friends: some experimental work reports **no disadvantage — or even faster learning — for false cognates in word-*form* learning**, because L1 form overlap facilitates encoding the form regardless of meaning ([*Cognition*, 2020, "False friends or real friends?"](https://www.sciencedirect.com/science/article/abs/pii/S0010027720302961)). The cost shows up in **processing**, not acquisition: adult bilinguals show reliably **slower reaction times to false friends**, and a task mixing cognates and false friends produces longer RTs for *both* types relative to controls ([*JECP*, 2011](https://pubmed.ncbi.nlm.nih.gov/21507422/)). (Both indexed-not-verified.)

*Operationalising it.* The [Poort & Rodd (2019) database](https://journalofcognition.org/articles/10.5334/joc.67) — *opened directly*, validated with bilingual similarity ratings, **openly available at [osf.io/tcdxb](http://osf.io/tcdxb/)** — is a ready-made, high-trust source of Dutch–English cognates and interlingual homographs. It is small and experiment-filtered (3–8 letters, frequency-thresholded), so it is a **seed for a curated Glossary, not a curriculum**. But it is real, primary, and free, which is more than most of this document can offer the build.

Design consequence from the RT finding: **teach cognates and false friends in the same lesson, deliberately.** The mixed-list interference is a *feature* here — it is §3.3's category-discrimination case, the one situation where interleaving genuinely helps. Presenting *bellen* (to phone, not to bellow) next to a true cognate forces the discrimination that the pure-cognate list lets the learner skip. Two corollaries: never let a cognate list stand alone, and expect the learner to *feel* worse on mixed lists (§3.4 again).

### 4.3 Etymological elaboration — **Grade C. Real, small, and probably not working the way it feels like it works.**

*What it is.* Teach the origin/motivation of a word or idiom so its meaning is non-arbitrary. Boers and colleagues' programme within Cognitive Linguistics.

*Evidence.* Boers, Demecheleer & Eyckmans showed etymological elaboration improves comprehension and retention of figurative idioms, and — the finding that most complicates the pretty story — **it worked just as well for etymologically opaque idioms as for transparent ones**. Boers & Lindstromberg separately found a mnemonic effect of **alliteration** in fixed expressions, and that drawing attention to sound patterns adds to it. ([Boers & Lindstromberg 2008](https://www.academia.edu/28747379/); [Boers, Demecheleer & Eyckmans, "Etymological elaboration as a strategy for learning idioms"](https://benjamins.com/catalog/lllt.10.07boe) — indexed-not-verified. Boers' own later critical assessment in *Language Teaching* is the source I most wanted and could not open: ResearchGate returned 403 and Cambridge is paywalled. **Indexed-not-verified, and I would treat his self-critique as the thing to check first.**)

**The honest reading, and it is the answer to the ticket's actual question.** "Does teaching etymology aid retention or merely feel good?" — the opaque/transparent null is the tell. If the *accuracy* of the etymology were the mechanism, opaque idioms (where the story is genuinely reconstructive) should benefit less. They did not. That points at the mechanism being **elaboration, dual coding and depth of processing** — the story creates a rich, imageable, connected memory trace — rather than the historical truth of the etymology. Which means:

- Etymology **does** aid retention, modestly. It is not merely feel-good. **Grade C, real effect.**
- It aids retention **because it is a story**, not because it is *true*. The historical accuracy is doing less work than it appears to.
- Most of the evidence base is **idioms and figurative phraseology, mostly comprehension, mostly short-term**, in a research programme with its own advocates as its principal investigators. Do not over-extrapolate to core A2 vocabulary.
- 🚩 There is a real hazard for an agent: an LLM asked for an etymology will confabulate a plausible one. Given that plausibility rather than accuracy appears to carry the mnemonic load, **the learner will not detect the error, and the false etymology will still work** — which is exactly why it is dangerous in a **public** repo where a stranger reads it as fact. Recommendation: etymology must be **sourced or flagged**. Either cite (etymologiebank.nl, Wiktionary, the WNT) or label it explicitly as a memory aid rather than a historical claim. This is a publicness obligation, not a pedagogical one.

### 4.4 Story-based / narrative encoding — **Grade B–A, and this is the one to build on**

*What it is.* Bind items into a coherent narrative rather than a list.

*Evidence.* [Bower & Clark (1969)](https://link.springer.com/content/pdf/10.3758/BF03332778.pdf) is the classic: participants learned 12 serial lists of 10 nouns either by normal study or by weaving each list into a story. Immediate recall was ceiling for both (99.9% vs 99.1%). **Delayed recall: median 93% for narrative vs 13% for yoked controls** — a ~7× advantage. The authors attribute it to thematic organisation reducing inter-list interference and guiding reconstructive recall. (Indexed-not-verified, but this is a heavily replicated textbook finding.)

*Caveats, stated plainly.* This is **L1 noun-list serial recall**, not L2 form–meaning mapping. Story chaining binds *items to each other*; L2 vocabulary learning needs *form bound to meaning*. The transfer is plausible and mechanistically sensible but is not the same experiment. Note also the structural parallel to §4.1's failure mode: keyword mnemonics also look great immediately and decay. The reason to trust narrative more is that Bower & Clark's advantage **is a delayed-recall advantage** — it appears where the keyword method's disappears.

*Why this vindicates the user's self-report.* The user says a word's *story* makes it stick. That is not the keyword method (Grade D), and it is not really etymology-as-history (Grade C). It is **narrative/elaborative encoding (Grade B–A)**, and it happens to be the single technique in this document that a text-generating agent is *best in the world at producing*. This is the strongest technique/system fit here.

*Operationalising it — and how it composes with #74's invocation lock.* This is where `/<skill> i want to do a lesson about last superbowl` stops being a gimmick and becomes the pedagogy. The user-supplied theme is **the narrative frame that binds the session's Items** — which is precisely Bower & Clark's manipulation, generated on demand. Concretely:
- Each session's Items get woven into **one coherent Dutch text on the user's theme**, not presented as a list. This simultaneously satisfies §2.5 (extensive reading) and §4.4 with one artifact.
- Each Item's record carries a **short story field** — where it was met, what it was doing, what it collided with. Cheap in text, and it makes the Glossary readable as prose rather than as a table, which serves the publicness lock.
- **Personal and episodic hooks beat generic ones.** The learner's own life supplies context an LLM cannot invent.
- **Alliteration and sound patterning are free and evidenced** (Boers & Lindstromberg) — an agent generating example sentences can prefer alliterative ones at zero cost.
- ⚠️ **But do not let the story replace the retrieval.** §4.1's lesson generalises: elaboration at encoding does not substitute for effortful retrieval later. Story is how the Item is *introduced*; retrieval practice is how it is *kept*.

---

## 5. Assessment — knowing the learner is genuinely above exam level

#74 locks the goal as "deliberately a little above exam level, so the pass is comfortable". That is a claim requiring measurement, and §3.4 has already established that the obvious measurement is the wrong one.

**Exam target (indexed-not-verified — defer to [#77](https://github.com/atilileri/atilileri.github.io/issues/77)).** Under *Wet inburgering 2021* the standard route is **B1** (Staatsexamen NT2 components) with an **A2** route available in defined circumstances; components are reading, listening, writing, speaking, plus **KNM** (Knowledge of Dutch Society), with MAP and PVT on the B1 route. I could not verify this against DUO/inburgeren.nl — the official URL I tried returned a 404 page. Treat the level as unconfirmed here; the sources ticket owns it.

### 5.1 Self-assessment is not enough — **Grade A for the negative finding**

[Li & Zhang (2021), *Language Testing*](https://journals.sagepub.com/doi/abs/10.1177/0265532220932481) meta-analysed 67 studies and found an average correlation of **r = .466** between self-assessment and objectively measured performance — moderate, and much lower than Ross's earlier r = .633. Moderated by criterion type, training and instrument. The Dunning-Kruger pattern applies: **low-proficiency learners overestimate, high-proficiency learners underestimate**. (Indexed-not-verified.)

r ≈ .47 explains about 22% of variance. **"I feel ready" is not an exam readiness signal.** And note the direction of the bias for *this* learner: someone with strong language-learning ability and high English proficiency is in the population that **under**estimates — which means the risk is not overconfidence about the exam so much as miscalibration in both directions and no reliable internal signal.

### 5.2 Delayed judgements of learning — **Grade B, cheap, and the single best assessment trick available to this system**

*What it is.* Ask the learner to predict "will I recall this later?" — but **not immediately after study**. [Nelson & Dunlosky (1991), *Psychological Science*](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1991.tb00147.x) found that JOLs made after even a short delay, **cued by the stimulus alone**, become dramatically more accurate at predicting later recall — the *delayed-JOL effect*. The mechanism: a delayed judgement is forced to consult **retrieval fluency** (a valid cue) rather than short-term availability (an invalid one). Later work suggests the gain is mostly in **relative** accuracy/resolution, with absolute calibration sometimes getting *worse*. (Indexed-not-verified.)

*Why this fits perfectly.* The two design requirements are (a) a delay between study and judgement and (b) a cue-only prompt. **#80's asynchronous path gives us (a) for free** — an answer arriving hours later on a bus is a delayed judgement by construction. And (b) is one line in a generated artifact.

*Operationalising it.* Never ask "did that make sense?" at the end of a lesson — that is an immediate JOL and it is close to worthless. Instead, at the *start* of the next session (or in the async prompt), show the Dutch word alone and ask **"will you still know this in a week?"** — then record both the prediction and the eventual outcome. The gap between them is the calibration metric, and it is far more informative than either alone.

### 5.3 What "above exam level" should actually mean

Compose the evidence into four operational criteria. Deliberately none of them is "the learner feels ready":

1. **Delayed, unaided, productive recall.** Not in-session accuracy (§3.4: performance ≠ learning), not recognition (§3.1: recall > recognition), not receptive (§3.5: practice matches test, and the exam has *schrijven* and *spreken*). The metric is: **what can be produced cold, from a cue alone, after a gap of a week or more.**
2. **Above-level material, scored at level.** The "comfortable pass" goal means the *practice* should be harder than the exam while the *criterion* stays the exam's. If the exam is B1, drill B1+ and count a pass at B1 performance on B1+ material.
3. **Task completion, not item accuracy.** §2.4: the exam is task-shaped. "Can write a complaint to the gemeente that a Dutch reader would act on" is a better criterion than "knows 800 words".
4. **Calibration tracked as a first-class metric.** Predicted-vs-actual on delayed JOLs (§5.2). A learner who is *well-calibrated* and predicts a pass is trustworthy; one who has never been measured is not, regardless of confidence.

*🚩 Assessment techniques to avoid.* Multiple-choice self-quizzes (recognition inflates apparent knowledge, §3.1). End-of-lesson "how did that go?" (immediate JOL, §5.2). Streaks and session counts (effort proxies, not learning; and §3.4 says they can move opposite to learning). Cumulative "words learned" counters — with no delayed-retention gate they measure *exposure*, and published in a public repo they measure it *to strangers*, which creates an incentive to inflate.

**A note the publicness lock forces.** Every metric here becomes public. That is mostly good — it is a commitment device — but it selects for metrics that are honest under observation. Delayed productive recall and calibration error both look *worse* than a streak counter and are both far more meaningful. Choose them deliberately, and say in the artifact why the boring-looking number is the real one.

---

## 6. The constraint filter — which techniques survive this system

The four constraints that actually bite are #74's **text-and-web** and **agent-run** locks, #81's **no images**, and #80's **asynchronous, detached, reconciled-later** answer path.

| Technique | § | Grade | Text-only | Async-survivable | Verdict |
| --- | --- | --- | --- | --- | --- |
| Retrieval practice (production) | 3.1 | **A** | ✅ | ✅ feedback deferred, see below | **Build. Core loop.** |
| Spacing (per-Item, equal intervals) | 3.2 | **A** | ✅ | ✅ benefits from it | **Build. Core loop.** |
| Narrative / story encoding | 4.4 | **B–A** | ✅ agent's home turf | ✅ | **Build. Differentiator.** |
| Extensive reading (generated readers) | 2.5 | **B** | ✅ | ✅ no feedback needed | **Build. Cheap, compounding.** |
| Cognates + false friends, taught together | 4.2 | **B** | ✅ + free primary dataset | ✅ | **Build. Highest leverage.** |
| English-mediated contrastive explanation | 1 | **B** | ✅ | ✅ | **Build. See #84.** |
| Noticing / input enhancement | 2.3 | **B** | ✅ typography is native | ✅ | **Build.** |
| Task-based lessons | 2.4 | **B** | ✅ | ⚠️ single-shot yes, negotiated no | **Build, single-shot form.** |
| Interleaving — *confusable categories only* | 3.3 | **C** | ✅ | ✅ | **Build narrowly** (de/het, hebben/zijn). |
| Elaborative interrogation / self-explanation | 3.5 | **B** | ✅ | ⚠️ needs a reader for the explanation | Build; agent grades later. |
| Etymological elaboration | 4.3 | **C** | ✅ | ✅ | Use, **sourced or flagged**. |
| Delayed JOL calibration | 5.2 | **B** | ✅ | ✅ **async is the delay** | **Build. Free win.** |
| Keyword mnemonic | 4.1 | **D** | ⚠️ imagery blocked by #81 | ✅ | 🚩 Sparing, last resort. |
| Comprehensible-input doctrine | 2.1 | **D** | — | — | 🚩 Reject the doctrine. |
| Expanding intervals (SM-2 style) | 3.2 | **D** | — | — | 🚩 Do not port. |
| Multiple-choice quizzing | 3.1 | **C** | ✅ | ✅ | 🚩 Recognition; avoid as the default. |
| Listening / speaking practice | — | — | ❌ | ❌ | Out of reach; see #74's open item. |

### The asynchronous-feedback question, settled

#80 establishes that answers arrive detached and are reconciled later, so **no technique in this system gets immediate automated feedback away from the computer**. Two findings say this costs less than expected:

- **Directly opened, and the key result:** the systematic review of corrective-feedback timing ([PMC9995700](https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/)) covering 20 studies (2006–2021) found no simple model of optimal timing. Half the studies favoured immediate feedback, seven found no significant difference, three favoured delayed. Text-based communication modes tended to favour immediate; CALL and video environments showed **no significant differences**. And decisively for us: **when delayed feedback came 1+ days later, studies consistently found no differences.** The authors are explicit that the evidence base is weak (20 studies, inconsistent designs, no unified framework).
- [Li (2010), *Language Learning*](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-9922.2010.00561.x) meta-analysed corrective feedback (33 studies) at **d = 0.64**, maintained over time, and found that **implicit feedback outlasted explicit feedback on long-delayed post-tests** — a point for a reconciling agent that responds with a reformulated example rather than a red X. (Indexed-not-verified.)

**Conclusion:** the bus-stop path is not a degraded mode. Do not design the system around the feedback latency. Do design around the *one* thing latency genuinely costs — Rowland's feedback moderator (§3.1) roughly doubles the testing effect, so **feedback must actually arrive**, even if a day late. A reconciliation that silently drops answers is the failure mode to guard against, not the delay itself.

---

## 7. What this means for the downstream tickets

**For [#84](https://github.com/atilileri/atilileri.github.io/issues/84) (bilingual content):**
- Lock **English as the language of explanation, grammar terminology and Dutch↔English contrast**; **Turkish for Turkish-specific interference warnings and for mission/motivation/metacognition**; **both** for translation equivalents where the senses diverge.
- Lock it as a **per-element rule, not a per-document toggle**. No parallel TR and EN editions.
- The justification is §1.2–1.3 (four L3 models converge; Hopp 2019 is the near-exact empirical match), **not** the gloss meta-analysis — which tests a different question (§1.4) and is routinely misapplied here.

**For [#82](https://github.com/atilileri/atilileri.github.io/issues/82) (content form) and the scheduling fog:**
- Per-Item scheduling (#79's constraint) is **adequate**, and §3.2 explains why: the spacing mechanism is re-encounter, and the evidence against expanding intervals removes most of the case for per-card adaptivity.
- Prefer roughly **equal intervals** over expanding; parameterise interval length by **horizon** (Cepeda's ridgeline), which means the exam date — or its declared absence — is a scheduler input.
- Handle direction as a **session-time policy** on Item maturity, not as stored per-card state.
- Items want a **story field** and a **JOL prediction/outcome pair**. Both are cheap text; both are load-bearing (§4.4, §5.2).

**For [#87](https://github.com/atilileri/atilileri.github.io/issues/87) (card/artifact form):**
- **Production over selection.** Recall beats recognition (§3.1), and it routes around `teach`'s slot-A quiz bug (#76) rather than patching it.
- #81's no-images ruling costs the **keyword method** specifically (its mechanism is imagery, and the one condition that rescued its long-term retention was pictures) — but the keyword method is Grade D anyway, so the loss is small. Narrative encoding, the technique we actually want, is pure text.

**For the skill itself:**
- Do **not** copy `teach`'s §"Fluency vs Storage Strength" list verbatim. The framing is right; the interleaving line is wrong for vocabulary (§3.3) and would import a real error.
- Write in an **etymology-sourcing rule**: cite it or flag it as a memory aid (§4.3). Public repo, confabulating model, mnemonics that work whether or not they are true — that combination needs a guardrail.

---

## 8. Sources

### Opened directly

- [Hopp (2019) — Cross-linguistic influence in child L3 acquisition of grammar: Turkish-German and German learners of English, *International Journal of Bilingualism*](https://journals.sagepub.com/doi/10.1177/1367006917752523) — 31 Turkish-German heritage bilinguals vs 31 German monolinguals; both groups showed selective transfer from German, not Turkish. §1.3.
- [Poort & Rodd (2019) — A Database of Dutch–English Cognates, Interlingual Homographs and Translation Equivalents, *Journal of Cognition*](https://journalofcognition.org/articles/10.5334/joc.67) — 58 identical cognates, 76 non-identical cognates, 72 identical interlingual homographs, 78 translation equivalents; bilingual similarity ratings; data at [osf.io/tcdxb](http://osf.io/tcdxb/). §1.1, §4.2.
- [Optimal timing of treatment for errors in second language learning — a systematic review of corrective feedback timing, PMC9995700](https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/) — 20 studies 2006–2021; no simple optimal-timing model; **1+ day delays consistently showed no differences**; authors flag the evidence base as weak. §6.

### Indexed-not-verified

Publisher returned 402/403, or the file was a PDF my fetcher could not decode (no `pdftotext`/`pypdf` available). Claims below come from search-index summaries of abstracts. Direction is corroborated across independent summaries; **exact figures should be re-checked before anything is built on them.**

*L3 acquisition and the L1/L2 question*
- [Rothman (2011) — L3 syntactic transfer selectivity and typological determinacy: the Typological Primacy Model, *Second Language Research*](https://journals.sagepub.com/doi/10.1177/0267658310386439); [Rothman (2015), *BLC*](https://www.cambridge.org/core/journals/bilingualism-language-and-cognition/article/abs/linguistic-and-cognitive-motivations-for-the-typological-primacy-model-tpm-of-third-language-l3-transfer-timing-of-acquisition-and-proficiency-considered/56606CE09ED7FEA6DA3F2437C6D31B94) — holistic transfer from the structurally closest prior language; lexicon → phonology → morphology → syntax hierarchy.
- [Falk & Bardel (2011) — Object pronouns in German L3 syntax: evidence for the L2 status factor, *Second Language Research*](https://journals.sagepub.com/doi/10.1177/0267658310386647) — 44 L3 German learners; L2 privileged over L1.
- [Westergaard et al. (2017) — the Linguistic Proximity Model, *IJB*](https://journals.sagepub.com/doi/abs/10.1177/1367006916648859); [Slabakova (2017) — The scalpel model, *IJB*](https://journals.sagepub.com/doi/10.1177/1367006916655413) — property-by-property CLI from both prior grammars.
- [Cenoz (2003) — The additive effect of bilingualism on third language acquisition: a review, *IJB*](https://journals.sagepub.com/doi/abs/10.1177/13670069030070010501) — metalinguistic awareness as mediator; mixed for immigrant learners.
- [Kim, Lee & Lee (2024) — The relative effects of L1 and L2 glosses on L2 learning: a meta-analysis, *Language Teaching Research*](https://journals.sagepub.com/doi/10.1177/1362168820981394) — 78 effect sizes, 26 studies, N = 2,189; L1 glosses g = .33 overall, mainly on immediate post-tests.

*SLA*
- [Beyond comprehensible input: a neuro-ecological critique of Krashen's hypothesis, *Frontiers in Psychology* (2025)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1636777/full); [A Critical Review of Krashen's Input Hypothesis, *JEHD* (2015)](http://jehd.thebrpi.org/journals/jehd/Vol_4_No_4_December_2015/16.pdf).
- [Schmidt (2010) — Attention, awareness, and individual differences in language learning](https://nflrc.hawaii.edu/PDFs/SCHMIDT%20Attention,%20awareness,%20and%20individual%20differences.pdf) — Schmidt's own concession that noticing was shown neither necessary nor sufficient.
- [Bryfonski & McKay (2019) — TBLT implementation and evaluation: a meta-analysis, *LTR*](https://journals.sagepub.com/doi/abs/10.1177/1362168817744389) (52 studies, d = 0.93); [Xuan, Cheung & Liu (2025) technical comment](https://journals.sagepub.com/doi/abs/10.1177/13621688221131127) (re-analysis g = 0.61); [Boers & Faez (2023)](https://journals.sagepub.com/doi/10.1177/13621688231167573).
- [Nakanishi (2015) — A meta-analysis of extensive reading research, *TESOL Quarterly*](https://onlinelibrary.wiley.com/doi/abs/10.1002/tesq.157) — 34 studies, N = 3,942, d = 0.46 / 0.71. Also [Educational Psychology Review (2025)](https://link.springer.com/article/10.1007/s10648-025-10068-6).
- [Li (2010) — The effectiveness of corrective feedback in SLA: a meta-analysis, *Language Learning*](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-9922.2010.00561.x) — 33 studies, d = 0.64; implicit feedback more durable.

*Memory and retention*
- [Rowland (2014) — The effect of testing versus restudy on retention: a meta-analytic review, *Psychological Bulletin*](https://pubmed.ncbi.nlm.nih.gov/25150680/) — 159 studies, g = 0.50, 81% favouring retrieval; feedback moderator 0.73 vs 0.39. (PubMed demanded cookies; PDF undecodable.)
- [Dunlosky et al. (2013) — Improving students' learning with effective learning techniques, *PSPI*](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266) — practice testing and distributed practice **high** utility; elaborative interrogation, self-explanation, interleaving **moderate**; **keyword mnemonic low**.
- [Cepeda et al. (2006) — Distributed practice in verbal recall tasks, *Psychological Bulletin*](https://augmentingcognition.com/assets/Cepeda2006.pdf) — 839 assessments, 317 experiments, 184 articles. [Cepeda et al. (2008) — Spacing effects in learning: a temporal ridgeline of optimal retention, *Psychological Science*](https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf) — optimal gap ≈ 20% of a few-weeks delay, ≈ 5% at one year.
- [Kim & Webb (2022) — The effects of spaced practice on second language learning: a meta-analysis, *Language Learning*](https://onlinelibrary.wiley.com/doi/abs/10.1111/lang.12479) — 98 effect sizes, 48 experiments, N = 3,411. **Wiley returned 402; per-contrast effect sizes deliberately not quoted.**
- [Karpicke & Roediger (2007) — Expanding retrieval practice promotes short-term retention, but equally spaced retrieval enhances long-term retention, *JEP:LMC*](https://learninglab.psych.purdue.edu/downloads/2007/2007_Karpicke_Roediger_JEPLMC.pdf).
- [Brunmair & Richter (2019) — Similarity matters: a meta-analysis of interleaved learning and its moderators, *Psychological Bulletin*](https://www.semanticscholar.org/paper/Similarity-matters:-A-meta-analysis-of-interleaved-Brunmair-Richter) — 59 studies, 238 effect sizes; overall g = 0.42; paintings 0.67, maths 0.34, **words −0.39**. **Highest-stakes unverified number in this document** — the Würzburg PDF would not decode and Ovid returned 402.
- [Soderstrom & Bjork (2015) — Learning versus performance: an integrative review, *Perspectives on Psychological Science*](https://journals.sagepub.com/doi/abs/10.1177/1745691615569000).
- Webb (2009) — The effects of receptive and productive learning of word pairs on vocabulary knowledge, *RELC Journal*; [ResearchGate record](https://www.researchgate.net/publication/249769008) — forward (L1→L2) translation superior for overall vocabulary knowledge; practice matches test.

*Mnemonics, cognates, etymology, story*
- Wang & Thomas (1995) — Effect of keywords on long-term retention: help or hindrance? / Learning by the keyword mnemonic: looking for long-term benefits; [summary](https://memory-key.com/research/Wang95), [UCF record](https://stars.library.ucf.edu/facultybib1990/1773/) — keyword users **worse than rote controls after 2 days**; pictures of keyword + referent rescued long-term retention.
- [Balepur et al. (2024) — A SMART Mnemonic Sounds like "Glue Tonic", EMNLP](https://aclanthology.org/2024.emnlp-main.786/) — 2,684 preferences from 45 students; expressed ≠ observed preferences; human expert beat both SMART and GPT-4.
- [False friends or real friends? False cognates show advantage in word form learning, *Cognition* (2020)](https://www.sciencedirect.com/science/article/abs/pii/S0010027720302961); [Word recognition in child L2 learners: evidence from cognates and false friends, *JECP* (2011)](https://pubmed.ncbi.nlm.nih.gov/21507422/) — form-learning advantage but processing-time cost; mixed lists slow both types.
- [Boers, Demecheleer & Eyckmans — Etymological elaboration as a strategy for learning idioms](https://benjamins.com/catalog/lllt.10.07boe); [Boers & Lindstromberg (2008) — Cognitive Linguistic Approaches to Teaching Vocabulary and Phraseology](https://www.academia.edu/28747379/); Boers — *Cognitive Linguistic approaches to teaching vocabulary: assessment and integration*, [*Language Teaching*](https://www.cambridge.org/core/journals/language-teaching/article/abs/cognitive-linguistic-approaches-to-teaching-vocabulary-assessment-and-integration/8FE3DBF7EF0D713B72FD87C6B6D174D8) — **ResearchGate 403, Cambridge paywalled; Boers' own self-critique is the first thing to re-check.**
- [Bower & Clark (1969) — Narrative stories as mediators for serial learning, *Psychonomic Science*](https://link.springer.com/content/pdf/10.3758/BF03332778.pdf) — 93% vs 13% delayed recall.

*Assessment*
- [Li & Zhang (2021) — A meta-analysis of self-assessment and language performance, *Language Testing*](https://journals.sagepub.com/doi/abs/10.1177/0265532220932481) — 67 studies, r = .466.
- [Nelson & Dunlosky (1991) — The "delayed-JOL effect", *Psychological Science*](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1991.tb00147.x); [Dunlosky & Nelson follow-ups on calibration vs resolution](https://link.springer.com/article/10.3758/BF03195916).
- Inburgering exam structure and level: [inburgering.org overview](https://inburgering.org/exam-info/overview-of-dutch-integration-exams) — **third-party, not official.** The DUO/inburgeren.nl URL I tried returned 404. Defer to [#77](https://github.com/atilileri/atilileri.github.io/issues/77).
