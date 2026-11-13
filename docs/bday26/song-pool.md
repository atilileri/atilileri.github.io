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

| Group | Song | Artist |
|---|---|---|
| Yin Yin | One Inch Punch | Yin Yin |
| Yin Yin | Pingpxng | Yin Yin |
| Yin Yin | Takahashi Timing | Yin Yin |
| Karsu | Jest Oldu | Karsu |
| Karsu | Bırak Beni Böyle | Karsu |
| Karsu | İtiraf | Karsu |
| Rocky Horror | Time Warp | The Rocky Horror Show |
| Rocky Horror | Sweet Transvestite | The Rocky Horror Show |
| 90s Turkish pop | Şımarık | Tarkan |
| 90s Turkish pop | Aya Benzer | Mustafa Sandal |
| 90s Turkish pop | Her Gece | Mirkelam |
| 90s Turkish pop | Abone | Yonca Evcimik |
| 90s Turkish pop | Zalim | Levent Yüksel |
| 90s Turkish pop | Yaparım Bilirsin | Kenan Doğulu |
| World hits | Take On Me | a-ha |
| World hits | Dancing Queen | ABBA |
| World hits | My Heart Will Go On | Céline Dion |
| World hits | Shape of You | Ed Sheeran |
| World hits | Seven Nation Army | The White Stripes |
| World hits | Billie Jean | Michael Jackson |

**Backups**: Alpaca Mountain (Yin Yin), Science Fiction/Double Feature (Rocky Horror).

Sources for the artist picks: [Shazam: Yin Yin](https://shazam.com/artist/yin-yin/412459589),
[Karsu](https://wiki.krisyotam.com/content/wikipedia_en_all_nopic_2026-03/Karsu),
[lyricsweb: Karsu](https://lyricsweb.com/artist/karsu).

## Who writes the notes

The agent types the notes of each song in the piano prototype's song format; Atıl checks each by
ear and approves it. If a hook is not recognisable on a piano, the agent swaps in a song from the
same group and marks the swap for Atıl's check.
