# Songs — piano Game and name-the-song

The songs of the piano Game and the name-the-song pool, decided in
[Grilling: which songs go into the piano Game and name-the-song?](https://github.com/atilileri/atilileri.github.io/issues/187).

## Sound

- Both Games play typed-in notes on a free sampled piano (Salamander or FluidR3 through smplr);
  the site shows its credit line. No recordings, no streaming service
  ([Research: how can a static site play the songs: synthesised notes or clips?](https://github.com/atilileri/atilileri.github.io/issues/186)).
- A few bars of copyrighted melodies are accepted; the worst case is a takedown.
- She plays on the laptop speakers; the +30 ms latency offset stays.
- Sound starts only after her first key press or click.

## Piano Game

| Level | Song | Notes |
|---|---|---|
| Kolay | İyi ki doğdun (Happy Birthday) | public domain in the EU |
| Orta | Hadi Bakalım — Sezen Aksu (1991) | chorus melody |
| Zor | Türk Marşı — Mozart | public domain |

Start values from [Prototype: how does the piano Game feel?](https://github.com/atilileri/atilileri.github.io/issues/180):
60% tempo, fall speed 190 / 240 / 300 px/s. Atıl re-checks them on these songs during the build.
Each song repeats to about 90 s.

## Name-the-song

- **Draw**: each Round draws 10 songs at random from the 20 below; nothing is tracked.
- **Choices**: the right title plus 3 wrong titles drawn from the same pool, shuffled.
- **Titles**: the original title as is; the text around it stays Turkish.
- **What plays**: the best-known hook, about 4 bars (~8 s) — not always the literal first notes.
  Replays are free.
- **No overlap**: the three piano songs never appear here.
- **No reveal**: the result screen links to no recording.

The second pool (2026-11-19). Atıl listened to the first pool on the test page, approved nine hooks
and dropped the other eleven. **Approved** means he heard the hook and it passed; **new** means a
candidate that still waits for his ear. A second listen approved ten of the new songs, notes
unchanged; Time Warp still waits. The notes and their sources sit beside each song in
`src/lib/bday26/songs.ts`.

| Group | Song | Artist | Status |
|---|---|---|---|
| Yin Yin | One Inch Punch | Yin Yin | approved |
| Rocky Horror | Time Warp | The Rocky Horror Show | new (re-sourced) |
| 90s Turkish pop | Şımarık | Tarkan | approved |
| 90s Turkish pop | Jest Oldu | Mustafa Sandal | approved |
| 90s Turkish pop | Her Gece | Mirkelam | approved |
| 90s Turkish pop | Zalim | Levent Yüksel | approved |
| 90s Turkish pop | Yaparım Bilirsin | Kenan Doğulu | approved |
| World hits | Take On Me | a-ha | approved |
| World hits | Shape of You | Ed Sheeran | approved |
| World hits | Seven Nation Army | The White Stripes | approved |
| World hits | The Final Countdown | Europe | approved |
| World hits | Sweet Dreams (Are Made of This) | Eurythmics | approved |
| World hits | Careless Whisper | George Michael | approved |
| World hits | Smoke on the Water | Deep Purple | approved |
| World hits | Axel F | Harold Faltermeyer | approved |
| World hits | Barbie Girl | Aqua | approved |
| World hits | Lambada | Kaoma | approved |
| World hits | Hit the Road Jack | Ray Charles | approved |
| World hits | Another One Bites the Dust | Queen | approved |
| World hits | Popcorn | Hot Butter | approved |

**Groups rebalanced** to 1/1/5/13. No reliable melody source turned up for more Yin Yin, for any
Karsu song, or for new 90s Turkish pop, so those groups shrank and world hits filled the gap. Jest
Oldu is Mustafa Sandal's song (Karsu covers it), so it moved to 90s Turkish pop and the Karsu group
is gone. Dropped after the listening: Pingpxng, Takahashi Timing, Bırak Beni Böyle, İtiraf, Sweet
Transvestite, Aya Benzer, Abone, Dancing Queen, My Heart Will Go On, Billie Jean, and the first
take of Time Warp.

Sources for the artist picks: [Shazam: Yin Yin](https://shazam.com/artist/yin-yin/412459589),
[Karsu](https://wiki.krisyotam.com/content/wikipedia_en_all_nopic_2026-03/Karsu),
[lyricsweb: Karsu](https://lyricsweb.com/artist/karsu).

## Who writes the notes

The agent types the notes of each song in the piano prototype's song format; Atıl checks each by
ear and approves it. If a hook is not recognisable on a piano, the agent swaps in a song from the
same group and marks the swap for Atıl's check.
