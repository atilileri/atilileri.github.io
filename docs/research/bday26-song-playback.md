# Playing the songs on a static site: synthesised notes or clips?

**Question:** How can the public, server-less birthday games site at `/20261209/` play songs for the piano Game and for name-the-song? Where can melody data come from, and may it be published? May short clips of real recordings (Yin Yin, Karsu, The Rocky Horror Show and others) be hosted in a public repo, and what official previews or embeds exist instead? What works in Chrome on Windows?

**Ticket:** [#186](https://github.com/atilileri/atilileri.github.io/issues/186), part of map [#171](https://github.com/atilileri/atilileri.github.io/issues/171). Builds on [#174](https://github.com/atilileri/atilileri.github.io/issues/174) (Game rules) and [#180](https://github.com/atilileri/atilileri.github.io/issues/180) (piano verdict). Feeds the song grilling [#187](https://github.com/atilileri/atilileri.github.io/issues/187).

**Date:** 2026-11-13

**This note decides nothing.** It does not pick songs. Legal points are a reading of the primary texts, not legal advice.

---

## TL;DR

1. **Every official preview or embed route is ruled out for name-the-song, by its own terms.** Spotify's Developer Policy says "Do not create a game, including trivia quizzes." Apple allows previews "only to promote store content and not for entertainment purposes", next to a buy badge. YouTube always shows the video title before playback and on pause, and forbids hiding or covering the player. §3.
2. **Deezer is the only preview API that technically works from a static page, and it is fragile.** Search works through JSONP (no CORS header on the API). But each preview URL is signed and **expired about 15 minutes after the API call** (measured), so URLs cannot be stored in the repo. Its terms allow only "strictly private use within a family scope", non-commercial. Games are not mentioned, and the terms say other uses need approval. §3.3.
3. **Hosting clips of commercial recordings in the public repo is not allowed under EU/NL law.** No length counts as "too short to matter". The CJEU held that a sample "even if very short" is a reproduction (*Pelham*, a 2-second sample). The Dutch quotation right covers announcements, reviews, polemics and scholarly work, and a quiz is none of these. "Fair use" is a US doctrine. §2.
4. **Synthesised melodies carry less risk, but they are not free either.** A transcription is a reproduction of the composition (Auteurswet art. 13: "iedere geheele of gedeeltelijke bewerking of nabootsing"). Putting it on a public site makes it available. It avoids the recording rights (label, performers) that a clip also touches. All three candidate artists' songs are under copyright. §1.2.
5. **The browser part is easy.** The prototype's Web Audio synth already works. For a nicer piano, sampled CC-BY sounds (FluidR3 GM, Salamander Grand Piano) load from a static host through `smplr` or `Tone.Sampler`. MIDI parses with `@tonejs/midi` (MIT). §1.3.
6. **Chrome:** no sound plays before her first click or key press. An `AudioContext` made earlier starts "suspended" and needs `resume()`. The hub click into a Game counts as that gesture. Latency: use `latencyHint: "interactive"` (the default) and keep the prototype's +30 ms offset. Bluetooth headphones would break the timing. §4.

**Recommendations, per Game (detail in §5):**

- **Piano:** synthesised notes from hand-entered melody data (as in the prototype), optionally with a sampled CC-BY piano. No clips: she needs the note on the hit, which only a synth gives.
- **Name-the-song:** the same synthesised first notes, played as a short melody, with no recordings. It is the only route that keeps the title hidden and breaks no platform's terms. Deezer previews are a technical fallback with real breakage and terms risk.

---

## 1. Synthesised notes

### 1.1 Where the melody data can come from

| Source | What you get | Licence situation |
|---|---|---|
| **Own transcription** (Atıl types the first notes by ear or from a score into the song format the prototype already uses) | Exactly the notes wanted; a few bars per song | The data is ours, but the **melody is still the composer's work** (§1.2) |
| **MIDI files found online** (fan sites, karaoke MIDIs) | Full arrangement, many tracks; the melody track must be picked out | Often of unknown origin. Adds the arranger's possible rights to the composer's. Usually no licence given |
| **MuseScore.com user scores** | Sheet music, exportable as MIDI/MusicXML | Its terms page refused automated fetches (HTTP 403), so not verified here. Treat as "personal use, no redistribution" until read |
| **Official sheet music** (bought PDF) | An accurate melody | Buying it licenses the copy, not publishing a derivative online |
| **Public-domain melodies** (the prototype's placeholders) | Free to use | Not the songs wanted |

For a few opening bars, **own transcription is the smallest and cleanest route**. It needs no file format beyond the prototype's `SONGS` array, and it adds no third party's rights. A MIDI file only helps as a reference to read the notes from.

Tooling, if a MIDI file is used as the reference: `@tonejs/midi` (MIT) turns a `.mid` into JSON, with tracks and notes that have `midi`, `time` (seconds), `duration` (seconds) and `velocity`. It loads in the browser with `Midi.fromUrl()`. ([Tonejs/Midi](https://github.com/Tonejs/Midi))

### 1.2 Is publishing a melody allowed?

- The Dutch Auteurswet counts as reproduction "in het algemeen iedere geheele of gedeeltelijke bewerking of nabootsing in gewijzigden vorm" ([Auteurswet art. 13](https://wetten.overheid.nl/BWBR0001886), version in force from 01-01-2026). A note-for-note melody, even a synthesised one, is a partial imitation of the composition.
- The private-use exception covers copies "uitsluitend … tot eigen oefening, studie of gebruik" and "zonder direct of indirect commercieel oogmerk" (art. 16b). A public website goes beyond own use, so it does not cover the site. That is an inference from the text.
- The quotation right covers quoting "in een aankondiging, beoordeling, polemiek of wetenschappelijke verhandeling", used in line with "de regels van het maatschappelijk verkeer" (art. 15a). A guessing game is none of these, so it does not fit. Inference.
- The collecting society licenses exist: BumaStemra's "using music online" covers "background music on websites", and its audiovisual licence names "games" ([BumaStemra licences](https://bumastemra.nl/en/licenses-for-music-use/)). Neither page names a tariff for a tiny private site.
- **Practical reading:** a few synthesised bars on an unlisted, `noindex` page is a technical infringement of the composition with no exception that fits. It involves **one** rights layer (composer/publisher). A recording clip involves **three**: composer, record label, performers. A takedown on GitHub goes this way: when a notice targets part of a repo, GitHub gives "approximately 1 business day to delete or modify the content", and disables the repo if nothing changes ([GitHub DMCA takedown policy](https://docs.github.com/en/site-policy/content-removal-policies/dmca-takedown-policy)). The worst realistic case is removing the song files. The risk call is Atıl's.

### 1.3 Browser tools and how they sound

| Tool | Sound | Assets | Licence |
|---|---|---|---|
| **Raw Web Audio** (what the [#180 prototype](https://github.com/atilileri/atilileri.github.io/tree/prototype/180-piano) uses: oscillators with harmonics, a low-pass sweep and a decaying gain envelope) | A bright "electric piano". Fine for a game, clearly not a real piano | None; zero download | n/a |
| **Tone.js** `Synth` / `PolySynth` / `Sampler` | The synths are similar to raw Web Audio. `Sampler` plays recorded piano notes | Sampler needs sample files | MIT |
| **smplr** `SplendidGrandPiano`, `Soundfont`, `Sampler` | A real sampled piano. Soundfont gives the General MIDI instruments | Loads from `smpldsnds.github.io` / gleitz soundfonts. `notesToLoad` limits the download, and CacheStorage caching needs HTTPS. The default hosts rate-limit | Library MIT; the README names no licence for the sample sets ([smplr](https://github.com/danigb/smplr)) |
| **gleitz midi-js-soundfonts** (prerendered GM instruments) | FluidR3 is lighter; MusyngKite sounds better and is heavier | Static `.js`/`.mp3` per instrument, e.g. `gleitz.github.io/midi-js-soundfonts/FluidR3_GM/<instrument>-mp3.js` | FluidR3_GM "Creative Commons Attribution 3.0"; MusyngKite and FatBoy "Attribution Share-Alike 3.0" ([repo](https://github.com/gleitz/midi-js-soundfonts)) |
| **Salamander Grand Piano** (Yamaha C5, 16 velocity layers) | The best free piano | Full set 394+ MB, so self-host only the few notes the songs use, as compressed files | CC-BY 3.0, Alexander Holm ([sfzinstruments](https://sfzinstruments.github.io/pianos/salamander)) |

**What sounds acceptable with no server:** all of these. Samples are plain static files, and GitHub Pages serves them like any image. The melody of a pop song played on a sampled piano is recognisable. Whether a melody alone gives *enough* clue for name-the-song depends on the song: Yin Yin tracks are largely instrumental grooves, so their hook may be a bass or synth line rather than a sung melody. That is a song-choice question for #187.

CC-BY sounds need a credit line on the site (for example in a small "Sesler" footer).

---

## 2. Hosting clips of commercial recordings in the repo

- **The myth:** "a few seconds" or "under 30 seconds" is fine. **No such threshold exists in EU or Dutch law.**
- **Pelham (CJEU, C-476/17, 29 July 2019; a 2-second Kraftwerk sample).** The phonogram producer's right "allows him to prevent another person from taking a sound sample, even if very short", "unless that sample is included in the phonogram in a modified form unrecognisable to the ear". On quotation, the concept "does not extend to a situation in which it is not possible to identify the work concerned". Member States may not add exceptions beyond those in Article 5 of Directive 2001/29. (Ruling points 1, 3 and 4 as given by the [EU Fundamental Rights Agency case page](https://fra.europa.eu/el/caselaw-reference/cjeu-case-c-47617-judgement). The full judgment on EUR-Lex/curia could not be fetched from here.) A name-the-song clip has to be *recognisable*, so the "unrecognisable" exception can never apply.
- **The Dutch quotation right (art. 15a)** is limited to announcements, reviews, polemics and scholarly treatises (§1.2), so a quiz does not fit. **"Fair use"** is US law and has no counterpart here.
- **Three rights layers** sit on a commercial recording: the composition (composer/publisher, art. 13 Auteurswet), the recording (label) and the performance (performers). The last two are neighbouring rights under the Wet op de naburige rechten. Its page on wetten.overheid.nl returned 404 from here; Pelham confirms the producer's right at EU level.
- **A public repo makes it worse.** The audio file would be downloadable from the repo itself as well as from the site.

**Verdict:** self-hosted clips are out. The only clean audio would be recordings we own: Atıl humming or playing the melody himself. That is still a reproduction of the composition (§1.2), but it touches none of the recording rights.

---

## 3. Official previews and embeds

### 3.1 Spotify: closed on two fronts

- **Policy:** "Do not create a game, including trivia quizzes." (Developer Policy III.2.) Previews "may only be used to promote the underlying content" (V.2.2) and never "as a standalone service or product" (V.2.4). "There shall be no playback of Spotify Content without showing relevant cover art and metadata" (II.5), and that metadata is the title. ([Spotify Developer Policy](https://developer.spotify.com/policy))
- **API:** apps registered on or after 27 Nov 2024 lost access to "30-second preview URLs, in multi-get responses (SimpleTrack object)", along with other endpoints ([Spotify, Changes to the Web API](https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)).
- **The embed** shows the track name by design (II.5). Out.

### 3.2 Apple (iTunes Search API): works technically, ruled out by its terms

- **Technically fine (measured 2026-11-13):** `itunes.apple.com/search?term=karsu&entity=song&country=NL` returns `access-control-allow-origin: *`, and each result has a `previewUrl` on `audio-ssl.itunes.apple.com`. The `.m4a` is **30.0 s**, ~264 kbps AAC. It is also served with `access-control-allow-origin: *` and `cache-control: public, max-age=31536000`, so it can feed `<audio>` or `decodeAudioData`. No API key is needed. Rate limit "approximately 20 calls per minute".
- **The terms rule it out:** Promo Content is for use "only to promote store content and not for entertainment purposes". It must not be "used for independent entertainment value apart from its promotional purpose". It needs the attribution "provided courtesy of iTunes" and must sit "proximate to a 'Download on iTunes'" badge that links to the purchase page. Previews must be "streamed only, and not downloaded, saved, cached". ([Apple Search API](https://performance-partners.apple.com/search-api)) A guessing game is entertainment, and the buy badge would name the song.
- **URL stability:** Apple documents none. The tested URL carries a one-year cache header and no signature, but nothing promises it lasts.

### 3.3 Deezer: works with effort, fragile, terms unclear

- **API from a static page (measured):** `api.deezer.com/search` returns `access-control-allow-headers/methods` but **no `access-control-allow-origin`**, so a browser `fetch` is blocked. `?output=jsonp&callback=cb` works (returned `cb({"data":[…`). No key is needed for search.
- **Preview files:** 30 s MP3 at 128 kbps on `cdnt-preview.dzcdn.net`, served with `access-control-allow-origin: *`. **Each URL is signed** (`hdnea=exp=…~hmac=…`). An API call at 12:00 UTC returned URLs expiring at **12:15 UTC**. A URL with the token removed or altered returns **403**. So the site must call the API at play time, and the repo can hold only Deezer track IDs.
- **Terms:** use is "strictly limited for a non-commercial purpose", and content use is "limited to a strictly private use within a family scope". Games and quizzes are not mentioned. Using the services "for any other purposes than those mentioned herein" needs prior approval. ([Deezer API Terms of Use](https://developers.deezer.com/termsofuse)) A private birthday game is close to "family scope", but it is not clearly covered.
- **Unknown:** Deezer's track docs page needs a login, so the preview's start point is not documented here.

### 3.4 Previews do not start at the first notes

Neither Apple nor Deezer documents **which** 30 s of the song the preview covers. Name-the-song wants "the first notes", so each preview must be listened to before it is used. *Inference, not sourced:* store previews often pick a section past the intro.

### 3.5 YouTube embeds: start time yes, hidden title no

- **Can start at a time:** `start` begins playback "at the given number of seconds"; `end` stops it (counted from the start of the video). `controls=0` hides the controls. ([YouTube player parameters](https://developers.google.com/youtube/player_parameters))
- **Cannot hide the title:** `showinfo` was removed in 2018. Since then "the channel avatar and video title will always display before playback begins", and also on pause and at the end. `modestbranding` "is deprecated and has no effect". (Same page.)
- **Cannot cover or hide the player:** "You must not display overlays, frames, or other visual elements in front of any part of a YouTube embedded player". The minimum viewport is 200×200 px ([Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)). It is also forbidden to "separate, isolate, or modify the audio or video components" (III.I.7), to play from a "background player" not displayed on the page (III.I.9), or to "modify, build upon, or block any portion" of the player (III.I.6) ([YouTube API Developer Policies](https://developers.google.com/youtube/terms/developer-policies)).
- **Verdict:** usable for a "reveal" after she answers (show the official video then), never for the question itself.

---

## 4. Chrome on Windows: autoplay and latency

### 4.1 Autoplay

- "Muted autoplay is always allowed". Sound needs the user to have "interacted with the domain", or a high Media Engagement Index. "If an `AudioContext` is created before the document receives a user gesture, it will be created in the 'suspended' state", and "you will need to call `resume()` after the user gesture." ([Chrome autoplay policy](https://developer.chrome.com/blog/autoplay))
- Gestures that count (HTML standard "activation triggering input events"): `keydown` (not Esc, and not a browser-reserved shortcut), `mousedown`, `pointerdown` (mouse), `pointerup` (non-mouse) and `touchend` ([HTML Standard, user activation](https://html.spec.whatwg.org/multipage/interaction.html#user-activation-processing-model)).
- **For the site:** navigating from the hub into a Game by clicking a tile is a gesture *on the page she clicked*. A full page load into a new Game route starts without activation in that document. Chrome lets sound play when she "has interacted with the domain", which is per domain rather than per document, so later pages may be allowed. But the safe build is still **a "Başla" button (or the first key press) that creates or `resume()`s the `AudioContext`**. The prototype already starts on a key press. `HTMLMediaElement.play()` returns a promise that rejects when blocked, so handle it.

### 4.2 Latency for the piano

- `latencyHint: "interactive"` is the default: "the lowest possible latency that doesn't cause glitches", meant for audio that must "coincide with visual cues such as a video or game action" ([MDN AudioContext()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext)). The browser "may or may not" honour it; read `baseLatency` to see what it chose.
- `outputLatency` is the time from handing a buffer to the OS until the device plays it, and it "varies depending on the platform and the available hardware" ([MDN outputLatency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency)).
- **For the build:** log `baseLatency + outputLatency` once on her laptop. The #180 tuning (+30 ms offset, ±170 ms window) leaves wide margin on wired speakers. *Inference, no primary source:* Bluetooth headphones commonly add 100–200 ms, which would push a hit's sound late and eat most of that window. So play on the laptop speakers or wired headphones, or re-tune the offset on the night.
- Sampled sounds must be **decoded before the song starts** (`await piano.ready` in smplr, or `decodeAudioData` up front). Otherwise the first hits stutter.

---

## 5. Options table

| # | Option | Works from a static page? | Title hidden? | Legal / terms | Breakage | Fits |
|---|---|---|---|---|---|---|
| A | **Web Audio synth + own transcription** (the prototype today) | Yes, zero assets | Yes | Composition only (§1.2); no exception fits, small realistic risk | None | Piano ✔, Name-the-song ✔ |
| B | **Sampled CC-BY piano (smplr / Tone.Sampler / FluidR3 / Salamander) + own transcription** | Yes; a few hundred KB to a few MB of samples | Yes | Same as A, plus a CC-BY credit; Share-Alike if MusyngKite is used | Third-party CDN rate limits; self-host the samples to avoid them | Piano ✔, Name-the-song ✔ |
| C | **MIDI file from the web, parsed with @tonejs/midi** | Yes | Yes | Same as A, plus an unknown arranger; not needed for a few bars | None | Only a source for A/B |
| D | **Self-hosted clips of the recordings** in the repo | Yes | Yes | **Not allowed**: composition + label + performers; no short-excerpt exception (*Pelham*, art. 15a) | DMCA takedown | ✘ |
| E | **Atıl plays or hums the openings himself, recorded** | Yes | Yes | Composition only, like A | None | Name-the-song ✔ (charming, but more work) |
| F | **Spotify preview / embed** | Previews closed to new apps | No | **Bans games and trivia quizzes**; must show metadata | n/a | ✘ |
| G | **iTunes Search API preview** | Yes (CORS `*`, measured) | Only if the terms are broken | **Promotion only, "not for entertainment"**; buy badge and attribution required | Unsigned URLs, but stability undocumented | ✘ by terms |
| H | **Deezer API preview** | Yes, via JSONP at play time | Yes, if the page shows no metadata | Non-commercial, "private use within a family scope"; games unmentioned, other uses need approval | **URLs expire in ~15 min** (measured); the API could change; the preview segment may not be the opening | Name-the-song: fallback only |
| I | **YouTube embed** | Yes, with `start`/`end` | **No**: title shown before playback and on pause; no overlays allowed | Not allowed to hide, cover or audio-isolate | n/a | Reveal after the answer only |

### Recommendation per Game

- **Piano with falling notes → A, with B as an upgrade.** She hears a note only when she hits it (#180), so the sound must be generated per note. Recordings cannot do that. A sampled CC-BY piano (FluidR3 or a few self-hosted Salamander notes) is a cheap quality step. Melody data: own transcription into the prototype's `SONGS` format, then repeated to ~90 s as #180 says.
- **Name-the-song → A/B, the same engine.** Play the first few bars of each song's hook on the same synth or sampled piano. It keeps the title hidden, needs no network, and breaks no platform's terms. Optional extras: E (Atıl's own recordings) for songs whose hook is not a melody, and I (YouTube) as a "here is the song" reveal after each answer.
- **Not recommended:** D, F and G. H only if #187 decides that real recordings matter more than robustness, accepting a play-time API dependency and unclear terms.

---

## Open questions for Atıl (for #187)

1. **Risk appetite on the composition:** A/B/E still publish a few bars of copyrighted melodies on a public site (§1.2). Is that acceptable for an unlisted birthday page, given that the realistic worst case is a GitHub takedown of the song files?
2. **Is a melody enough of a clue?** Instrumental Yin Yin tracks may hinge on a bass or synth riff. Choose songs whose first notes are recognisable when played on a piano.
3. **Does the reveal matter?** If she should hear the real song after answering, a YouTube embed shown *after* the answer is allowed. It needs internet on the night.
4. **Her audio on the night:** laptop speakers or wired headphones, or Bluetooth (§4.2)?
