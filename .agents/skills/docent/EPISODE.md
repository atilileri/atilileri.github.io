# The Episode

Every Session listens to one **Episode**: the latest *NOS Journaal in Makkelijke Taal* video, a short daily news broadcast in slow, simple Dutch. It brings words and understanding; it moves no `luisteren` Objective.

## Find it

The channel page needs a consent cookie, and the `@handle` URL redirects to a dead path, so use the channel id:

```sh
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
curl -sL -A "$UA" -b "SOCS=CAI" "https://www.youtube.com/channel/UCch2JvY2ZSwcjf5gb93HGQw/videos" \
  | grep -oE '"videoId":"[A-Za-z0-9_-]{11}"' | head -1
curl -sL -A "$UA" -b "SOCS=CAI" "https://www.youtube.com/watch?v=<id>" \
  | grep -oE '<meta name="title" content="[^"]+"|"publishDate":"[^"]+"'
```

The first video id is the newest. The watch page gives its title and date.

## Read it

1. Add the video to the Oracle's `scratch` notebook: `notebooklm --quiet source add "https://www.youtube.com/watch?v=<id>" -n <scratch> --json`. Google transcribes it.
2. Read it with `source fulltext <source-id> -n <scratch> -o <file>`, or `source search` for one passage ([ORACLE.md](ORACLE.md)).
3. Delete the source from `scratch` when the Session ends.

**Without the Oracle**, read the watch page's own text — its title and description — and build the Prompts from that. Name the loss in `limits`.

## What the Session makes from it

- **The link**, in the Session record's `episode` field: the title, the date and the URL ([SITE.md](SITE.md)).
- **Its new words as Items**, inside the Session's ten-word budget. Write each Item in its dictionary form from your own knowledge of Dutch.
- **Three Turkish `open` Prompts** about it, bound to the Session's Objective.

**Pitch the task, never the material.** The video cannot change, so the task does: a gist question when it runs above the learner's level, a detail question when it runs below. Ask about the gist, the sequence or a fact said more than once — never about one number or name said once, because the transcript is a machine's.

**Episode text never becomes a quoted Dutch sentence in a Lesson, Tekst or Prompt.** A machine transcript gets about one word in twenty-five wrong. Quote at most a single word from it, and write every Dutch sentence yourself.
