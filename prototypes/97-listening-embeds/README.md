# Prototype 97 — can a Session embed its listening material?

**Question**: #97 Q16a/Q16b — "can we embed the materials? both video and audio?"

**Answer: yes, on all three routes, and the time range is a real control on two of them.**

Run it:

```sh
npm run dev
# then open http://localhost:4321/prototype/listening-embed?variant=A
```

`?variant=A|B|C`, or the arrow keys, or the bar at the bottom.

## The three routes

| | Route | Material used | Time range | Who can play it |
| --- | --- | --- | --- | --- |
| A | YouTube `<iframe>` | `MGX-sQLgdt8`, judged by #141 | `?start=&end=` — exact | Anyone |
| B | `<audio>` on the podcast's own URL | Een Beetje Nederlands #87 | `#t=start,end` — start exact | Anyone |
| C | Drive `/preview` `<iframe>` | DUO 2023 Luisteren I, opgave 1 | none | The learner only |

No route copies a file. In each one the bytes stay on the source's server.

## Measured, not assumed

**All four podcast hosts allow hot-linking.** One `HEAD` each, with `Referer:
https://atilileri.github.io/`. Every one answered `HTTP 200`, `content-type: audio/mpeg`,
`accept-ranges: bytes`: `anchor.fm`/Cloudfront, `podcast.npo.nl`, `traffic.omny.fm`,
`feeds.soundcloud.com`. Only SoundCloud sends `access-control-allow-origin: *`, which matters
for a waveform and never for plain playback.

**The audio really loads, and the fragment really seeks.** `PROTOTYPE-97-probe.mjs` reads the
element after `loadedmetadata`:

```
{"duration":1043.893424,"networkState":1,"readyState":4,"currentTime":260,"error":null}
```

1043.9 s is 17:23, which matches the feed exactly. `currentTime` is 260, so the browser honoured
`#t=260,430` and opened at 4:20 with no script.

**`preload="none"` shows an empty player** — `0:00 / 0:00`, no duration, no scrubber position.
`preload="metadata"` shows `4:20 / 17:23`. Use metadata.

**A hidden section still loads its iframe.** Variant C's Drive iframe fired a 401 while variant B
was on screen. A real page must mount one Clip, not three.

**The Drive preview shows a sign-in wall** to anybody who is not authorised — a grey box with a
Google logo, which is what the screenshots show. It plays for the learner.

## Not decided here

Which route wins per Body, and what the Session records, stays on #97.
